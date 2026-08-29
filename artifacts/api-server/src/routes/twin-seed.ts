import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import {
  getLatestTwinSeed,
  getTwinSeed,
  migrateTwinSeeds,
  upsertTwinSeed,
} from "../lib/twin-seed-store";
import type { TwinSeedTask } from "@workspace/db";

/**
 * POST /api/twin/seed
 *
 * Generates real seed content for a Twin workspace from the originating chat
 * conversation: a company name suggestion, a one-line summary, a draft
 * business plan (markdown) and 5-7 tailored starter tasks.
 *
 * The client sends the conversation transcript directly (chat history is
 * mirrored client-side), so this endpoint works even when the upstream chat
 * store is unreachable.
 */

interface TranscriptMessage {
  role: string;
  content: string;
}

export interface TwinSeedResult {
  companyName: string;
  summary: string;
  businessPlan: string;
  tasks: string[];
}

const MAX_MESSAGES = 60;
const MAX_CHARS_PER_MESSAGE = 2000;
const MAX_TRANSCRIPT_CHARS = 24000;

function buildTranscript(messages: TranscriptMessage[]): string {
  const recent = messages.slice(-MAX_MESSAGES);
  const lines: string[] = [];
  let total = 0;
  // Walk from the end so the most recent context survives truncation.
  for (let i = recent.length - 1; i >= 0; i--) {
    const m = recent[i]!;
    const role = m.role === "assistant" ? "Assistant" : m.role === "user" ? "Founder" : m.role;
    const content = m.content.length > MAX_CHARS_PER_MESSAGE
      ? `${m.content.slice(0, MAX_CHARS_PER_MESSAGE)}…`
      : m.content;
    const line = `${role}: ${content}`;
    if (total + line.length > MAX_TRANSCRIPT_CHARS) break;
    total += line.length;
    lines.unshift(line);
  }
  return lines.join("\n\n");
}

const SYSTEM_INSTRUCTION = `You are an experienced startup cofounder and operator. You read a founder's chat conversation and produce practical, specific seed content for their new company workspace. You never produce generic filler — every output must be grounded in the specific idea, industry, and decisions discussed in the conversation. You return only the JSON object requested.`;

function buildPrompt(transcript: string): string {
  return `Read the following conversation between a founder and their AI assistant, then generate seed content for the founder's new company workspace.

Conversation transcript:
---
${transcript}
---

Return a single JSON object with exactly these fields:
{
  "companyName": string,   // A short, memorable company name suggestion fitting the specific idea discussed. If the founder already chose a name, use it.
  "summary": string,       // A one-line summary (max 140 chars) of what the company does, specific to this idea.
  "businessPlan": string,  // A draft business plan in markdown (400-700 words) with these sections: "## Problem", "## Solution", "## Target Customer", "## Business Model", "## Go-to-Market", "## Risks & Open Questions". Ground every section in the conversation; where the conversation is silent, make a clearly-labeled reasonable assumption.
  "tasks": string[]        // 5 to 7 concrete starter tasks tailored to this specific idea (not generic). Each a single actionable sentence, ordered by priority.
}

Rules:
- Everything must be specific to the idea in the transcript (industry, audience, product details mentioned).
- Do not invent facts that contradict the conversation.
- Output only the JSON object — no markdown fences, no commentary.`;
}

function getGeminiConfig(): { apiKey: string; baseUrl: string } | null {
  const apiKey =
    process.env["AI_INTEGRATIONS_GEMINI_API_KEY"] || process.env["GEMINI_API_KEY"];
  if (!apiKey) return null;
  const baseUrl =
    process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"] ||
    "https://generativelanguage.googleapis.com/v1beta";
  return { apiKey, baseUrl };
}

async function generateSeed(transcript: string): Promise<TwinSeedResult> {
  const config = getGeminiConfig();
  if (!config) {
    const err = new Error("LLM_NOT_CONFIGURED");
    err.name = "LLM_NOT_CONFIGURED";
    throw err;
  }

  const res = await fetch(
    `${config.baseUrl}/models/gemini-flash-latest:generateContent?key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(transcript) }] }],
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error(
      `Gemini returned no text content (finishReason: ${data.candidates?.[0]?.finishReason ?? "UNKNOWN"})`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Model returned invalid JSON");
  }

  const seed = parsed as Partial<TwinSeedResult>;
  if (
    typeof seed.companyName !== "string" ||
    !seed.companyName.trim() ||
    typeof seed.summary !== "string" ||
    !seed.summary.trim() ||
    typeof seed.businessPlan !== "string" ||
    !seed.businessPlan.trim() ||
    !Array.isArray(seed.tasks) ||
    seed.tasks.length < 3 ||
    !seed.tasks.every((t) => typeof t === "string" && t.trim())
  ) {
    throw new Error("Model returned an incomplete seed object");
  }

  return {
    companyName: seed.companyName.trim(),
    summary: seed.summary.trim(),
    businessPlan: seed.businessPlan.trim(),
    tasks: seed.tasks.map((t) => t.trim()).slice(0, 7),
  };
}

/**
 * Identity resolution, in order of trust:
 *
 * 1. Signed-in users: their Bearer token is VERIFIED against the upstream
 *    auth backend (`GET /api/user/profile`) and the identity becomes the
 *    stable upstream user id (`user:<id>`), so the same account sees its
 *    workspace from any browser or device. Verification results are cached
 *    briefly to avoid hammering the upstream.
 * 2. Guests: the stable `x-chat-device-id` the chat surface already uses
 *    (`device:<id>`), scoped to that browser until they sign in.
 *
 * When a request carries BOTH a verified user and a device id, seeds saved
 * while the caller was a guest on that device are migrated to the user.
 */
const UPSTREAM_ORIGIN = () => process.env["CHAT_API_ORIGIN"] ?? "https://shothik.work";

const TOKEN_CACHE_TTL_MS = 10 * 60_000;
const TOKEN_CACHE_NEGATIVE_TTL_MS = 60_000;
const tokenCache = new Map<string, { userId: string | null; expires: number }>();

async function verifyBearerToken(token: string): Promise<string | null> {
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) return cached.userId;
  let userId: string | null = null;
  try {
    const res = await fetch(`${UPSTREAM_ORIGIN()}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (res.ok) {
      const profile = (await res.json().catch(() => null)) as
        | { _id?: string; id?: string; email?: string }
        | null;
      const id = profile?._id || profile?.id || profile?.email;
      if (typeof id === "string" && id.trim()) userId = id.trim();
    }
    tokenCache.set(token, {
      userId,
      expires: Date.now() + (userId ? TOKEN_CACHE_TTL_MS : TOKEN_CACHE_NEGATIVE_TTL_MS),
    });
  } catch (error) {
    // Upstream unreachable: don't cache, fall back to guest identity below.
    logger.warn({ err: error }, "twin seed token verification unavailable");
  }
  return userId;
}

function getDeviceIdentity(req: Request): string | null {
  const deviceId = req.header("x-chat-device-id")?.trim();
  if (deviceId && deviceId.length >= 8 && deviceId.length <= 128) return `device:${deviceId}`;
  return null;
}

async function resolveIdentity(req: Request): Promise<string | null> {
  const deviceIdentity = getDeviceIdentity(req);
  const auth = req.header("authorization")?.trim();
  const token = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;
  if (token) {
    const userId = await verifyBearerToken(token);
    if (userId) {
      const userIdentity = `user:${userId}`;
      if (deviceIdentity) {
        // Associate this device's guest seeds with the signed-in account.
        try {
          await migrateTwinSeeds(deviceIdentity, userIdentity);
        } catch (error) {
          logger.warn({ err: error }, "twin seed guest migration failed");
        }
      }
      return userIdentity;
    }
  }
  return deviceIdentity;
}

/** Test hook. */
export function __resetTwinSeedIdentityCache(): void {
  tokenCache.clear();
}

/**
 * Strict first-party origin guard. Browsers send the Origin header on every
 * fetch POST (same-origin included), so this route REQUIRES it and accepts
 * only exact first-party hosts: this app's own host, localhost during
 * development, and the configured Replit dev/production domains. No broad
 * platform suffixes — an arbitrary *.replit.dev site is NOT trusted.
 * Non-browser clients that omit Origin are rejected outright.
 */
function isOriginAllowed(req: Request): boolean {
  const origin = req.header("origin");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).hostname;
  } catch {
    return false;
  }
  if (host === "localhost" || host === "127.0.0.1") return true;
  const reqHost = req.hostname;
  if (reqHost && host === reqHost) return true;
  const allowed = [
    process.env["REPLIT_DEV_DOMAIN"],
    ...(process.env["REPLIT_DOMAINS"]?.split(",") ?? []),
  ]
    .map((d) => d?.trim())
    .filter((d): d is string => Boolean(d));
  return allowed.some((d) => host === d);
}

/**
 * Sliding-window in-memory rate limiter. The api-server runs as a single
 * process, so in-memory state is authoritative here; the additional global
 * daily cap bounds worst-case Gemini spend even under distributed abuse.
 */
const RATE_LIMITS = {
  identity: { windowMs: 10 * 60_000, max: 6 },
  ip: { windowMs: 60 * 60_000, max: 30 },
  global: { windowMs: 24 * 60 * 60_000, max: 300 },
} as const;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const hits = (rateBuckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    rateBuckets.set(key, hits);
    return true;
  }
  hits.push(now);
  rateBuckets.set(key, hits);
  return false;
}

/** Test hook. */
export function __resetTwinSeedRateLimits(): void {
  rateBuckets.clear();
}

const router: IRouter = Router();

const MAX_TEXT_FIELD = 40_000;
const MAX_TASKS = 30;

function sanitizeConversationId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}

function sanitizeTasks(value: unknown): TwinSeedTask[] | null {
  if (!Array.isArray(value) || value.length > MAX_TASKS) return null;
  const tasks: TwinSeedTask[] = [];
  for (const t of value) {
    const task = t as { id?: unknown; title?: unknown; completed?: unknown };
    if (
      !task ||
      typeof task.title !== "string" ||
      !task.title.trim() ||
      task.title.length > 500
    ) {
      return null;
    }
    tasks.push({
      id: typeof task.id === "number" ? task.id : tasks.length + 1,
      title: task.title.trim(),
      completed: task.completed === true,
    });
  }
  return tasks;
}

/**
 * Origin guard for mutating requests (browsers always send Origin on
 * fetch POST/PUT). Same-origin GETs legitimately omit Origin, so reads only
 * reject an Origin that is present AND disallowed.
 */
function guardOrigin(req: Request, res: Response, requireOrigin: boolean): boolean {
  res.removeHeader("Access-Control-Allow-Origin");
  const origin = req.header("origin");
  if (!origin) {
    if (requireOrigin) {
      res.status(403).json({ error: "This origin is not allowed to use workspace generation." });
      return false;
    }
    return true;
  }
  if (!isOriginAllowed(req)) {
    res.status(403).json({ error: "This origin is not allowed to use workspace generation." });
    return false;
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  return true;
}

async function requireIdentity(req: Request, res: Response): Promise<string | null> {
  const identity = await resolveIdentity(req);
  if (!identity) {
    res.status(401).json({
      error: "Workspace access requires a chat identity (missing x-chat-device-id or session).",
    });
  }
  return identity;
}

/**
 * GET /api/twin/seed[?conversationId=…]
 * Returns the persisted seed for the caller: the given conversation's seed,
 * or the most recently updated one when no conversationId is provided.
 */
router.get(["/v1/twin/seed", "/twin/seed"], async (req: Request, res: Response) => {
  if (!guardOrigin(req, res, false)) return;
  const identity = await requireIdentity(req, res);
  if (!identity) return;

  const conversationId = sanitizeConversationId(req.query["conversationId"]);
  try {
    const seed = conversationId
      ? await getTwinSeed(identity, conversationId)
      : await getLatestTwinSeed(identity);
    if (!seed) {
      res.status(404).json({ error: "No saved workspace seed found." });
      return;
    }
    res.json({ data: seed });
  } catch (error) {
    logger.warn({ err: error }, "twin seed read failed");
    res.status(500).json({ error: "Could not load the saved workspace." });
  }
});

/**
 * PUT /api/v1/twin/seed or /api/twin/seed
 * Saves the caller's edits (company name, summary, plan, task list with
 * completion state) for a conversation.
 */
router.put(["/v1/twin/seed", "/twin/seed"], async (req: Request, res: Response) => {
  if (!guardOrigin(req, res, true)) return;
  const identity = await requireIdentity(req, res);
  if (!identity) return;

  if (isRateLimited(`save:${identity}`, 60_000, 30)) {
    res.status(429).json({ error: "Too many save requests. Please slow down." });
    return;
  }

  const body = req.body as {
    conversationId?: unknown;
    companyName?: unknown;
    summary?: unknown;
    businessPlan?: unknown;
    tasks?: unknown;
    revision?: unknown;
  };
  const conversationId = sanitizeConversationId(body?.conversationId);
  const tasks = sanitizeTasks(body?.tasks);
  const revision =
    typeof body?.revision === "number" && Number.isFinite(body.revision) && body.revision >= 0
      ? Math.floor(body.revision)
      : Date.now();
  if (
    !conversationId ||
    !tasks ||
    typeof body.companyName !== "string" ||
    !body.companyName.trim() ||
    body.companyName.length > 500 ||
    typeof body.summary !== "string" ||
    body.summary.length > 2000 ||
    typeof body.businessPlan !== "string" ||
    body.businessPlan.length > MAX_TEXT_FIELD
  ) {
    res.status(400).json({ error: "Invalid workspace payload." });
    return;
  }

  try {
    const saved = await upsertTwinSeed({
      identity,
      conversationId,
      companyName: body.companyName.trim(),
      summary: body.summary,
      businessPlan: body.businessPlan,
      tasks,
      revision,
    });
    res.json({ data: saved });
  } catch (error) {
    logger.warn({ err: error }, "twin seed save failed");
    res.status(500).json({ error: "Could not save the workspace." });
  }
});

router.post(["/v1/twin/seed", "/twin/seed"], async (req: Request, res: Response) => {
  // Scope CORS on this route to the exact allowlist: any permissive header a
  // global cors() middleware may have set is removed, and the origin is only
  // reflected back when it passed the strict check.
  res.removeHeader("Access-Control-Allow-Origin");
  if (!isOriginAllowed(req)) {
    res.status(403).json({ error: "This origin is not allowed to use workspace generation." });
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", req.header("origin")!);
  res.setHeader("Vary", "Origin");

  const identity = await resolveIdentity(req);
  if (!identity) {
    res.status(401).json({
      error: "Workspace generation requires a chat identity (missing x-chat-device-id or session).",
    });
    return;
  }

  const ip = req.ip ?? "unknown";
  if (
    isRateLimited(`id:${identity}`, RATE_LIMITS.identity.windowMs, RATE_LIMITS.identity.max) ||
    isRateLimited(`ip:${ip}`, RATE_LIMITS.ip.windowMs, RATE_LIMITS.ip.max) ||
    isRateLimited("global", RATE_LIMITS.global.windowMs, RATE_LIMITS.global.max)
  ) {
    res.status(429).json({
      error: "Too many workspace generation requests. Please wait a few minutes and try again.",
    });
    return;
  }

  const body = req.body as { conversationId?: unknown; messages?: unknown };

  const rawMessages = Array.isArray(body?.messages) ? body.messages : null;
  const messages: TranscriptMessage[] = (rawMessages ?? [])
    .filter(
      (m): m is TranscriptMessage =>
        !!m &&
        typeof (m as TranscriptMessage).role === "string" &&
        typeof (m as TranscriptMessage).content === "string" &&
        Boolean((m as TranscriptMessage).content.trim()),
    )
    .filter((m) => m.role === "user" || m.role === "assistant");

  if (!messages.length) {
    res.status(400).json({
      error: "No conversation messages were provided to generate the workspace from.",
    });
    return;
  }

  try {
    const seed = await generateSeed(buildTranscript(messages));
    // Persist server-side so the seed survives device switches and feeds the
    // full Twin dashboard. Persistence failure must not lose the generation,
    // but it is surfaced to the client (`persisted: false`) so it can warn
    // the user and retry the save via PUT /twin/seed.
    const conversationId = sanitizeConversationId(body?.conversationId);
    let persisted = false;
    if (conversationId) {
      try {
        await upsertTwinSeed({
          identity,
          conversationId,
          companyName: seed.companyName,
          summary: seed.summary,
          businessPlan: seed.businessPlan,
          tasks: seed.tasks.map((title, index) => ({
            id: index + 1,
            title,
            completed: false,
          })),
          revision: Date.now(),
        });
        persisted = true;
      } catch (persistError) {
        logger.warn({ err: persistError }, "twin seed persistence failed");
      }
    }
    res.json({ data: seed, persisted });
  } catch (error) {
    if ((error as Error).name === "LLM_NOT_CONFIGURED") {
      res.status(503).json({
        error:
          "Workspace generation is not configured: no AI provider key (GEMINI_API_KEY) is available on the server.",
      });
      return;
    }
    logger.warn({ err: error }, "twin seed generation failed");
    res.status(502).json({
      error: "Could not generate the workspace from your conversation. Please try again.",
    });
  }
});

export default router;
