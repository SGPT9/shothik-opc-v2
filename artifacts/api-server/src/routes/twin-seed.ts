import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";

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
 * Identity: the chat surface identifies guests with a stable device id sent
 * as `x-chat-device-id` (authenticated users additionally carry session
 * cookies / an Authorization header for the upstream). The seed endpoint
 * requires at least one of these so anonymous external clients cannot burn
 * the server's Gemini quota.
 */
function getCallerIdentity(req: Request): string | null {
  const deviceId = req.header("x-chat-device-id")?.trim();
  if (deviceId && deviceId.length >= 8 && deviceId.length <= 128) return `device:${deviceId}`;
  const auth = req.header("authorization")?.trim();
  if (auth) return `auth:${auth.slice(0, 64)}`;
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  const sessionCookie = cookies?.["session"] || cookies?.["connect.sid"] || cookies?.["token"];
  if (sessionCookie) return `session:${sessionCookie.slice(0, 64)}`;
  return null;
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

router.post("/twin/seed", async (req: Request, res: Response) => {
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

  const identity = getCallerIdentity(req);
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
    res.json({ data: seed });
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
