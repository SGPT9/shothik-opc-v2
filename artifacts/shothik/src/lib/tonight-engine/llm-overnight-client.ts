/**
 * Tonight Engine — Overnight LLM Client
 *
 * Execution priority:
 *   1. Self-hosted VPS  (TONIGHT_ENGINE_SELF_HOSTED_URL set + health-check passes)
 *      → runs Ornith-1.0-9B or any llama.cpp / Ollama / vLLM model — FREE, unlimited
 *   2. OpenRouter       (OPENROUTER_API_KEY set)
 *      → Gemini 2.5 Flash (default/quick/standard) or DeepSeek R1 (deep)
 *   3. DeepSeek V3 via OpenRouter — ultra-cheap fallback
 *   4. Dev synthetic stream — when no keys are set at all
 *
 * All backends expose the same OpenAI-compatible /chat/completions SSE endpoint,
 * so the streaming logic is shared.
 */

export type OvernightDepth = "quick" | "standard" | "deep";

export interface OvernightLLMOptions {
  depth?: OvernightDepth;
  maxTokens?: number;
  systemPrompt?: string;
  /** Override the model selection entirely (applies to whichever backend is active) */
  model?: string;
}

/** Resolved model info, exposed for logging / UI display */
export interface ResolvedModel {
  id: string;
  label: string;
  costTier: "free" | "ultra-cheap" | "cheap" | "standard";
  backend: "self-hosted" | "openrouter";
}

// ─── Model tables ─────────────────────────────────────────────────────────────

/** OpenRouter cloud models — depth-based selection */
const OPENROUTER_MODELS: Record<OvernightDepth, ResolvedModel> = {
  quick: {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    costTier: "cheap",
    backend: "openrouter",
  },
  standard: {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    costTier: "cheap",
    backend: "openrouter",
  },
  deep: {
    id: "deepseek/deepseek-r1",
    label: "DeepSeek R1",
    costTier: "standard",
    backend: "openrouter",
  },
};

const OPENROUTER_FALLBACK: ResolvedModel = {
  id: "deepseek/deepseek-chat",
  label: "DeepSeek V3",
  costTier: "ultra-cheap",
  backend: "openrouter",
};

const DEFAULT_SYSTEM_PROMPT = `You are a world-class research analyst and writing expert.
You produce thorough, well-structured, and factually grounded long-form responses.
When given a research task, you:
1. Break down the problem into clear sub-questions
2. Synthesise information from multiple perspectives  
3. Provide concrete findings with reasoning
4. Structure output with clear headings and bullet points
5. End with an executive summary suitable for morning review

Be comprehensive but concise. Prioritise depth over breadth.`;

// ─── Self-hosted VPS config ───────────────────────────────────────────────────

function getSelfHostedConfig(): { url: string; model: string; apiKey: string } | null {
  const url = process.env.TONIGHT_ENGINE_SELF_HOSTED_URL;
  if (!url) return null;

  const model =
    process.env.TONIGHT_ENGINE_SELF_HOSTED_MODEL ?? "ornith-1.0:9b";
  const apiKey =
    process.env.TONIGHT_ENGINE_SELF_HOSTED_API_KEY ?? "none"; // Ollama ignores key

  return { url: url.replace(/\/$/, ""), model, apiKey };
}

/**
 * Health-check the self-hosted endpoint.
 * Tries GET /health then falls back to listing models.
 * Returns true if the server responds within 3 seconds.
 */
async function selfHostedHealthCheck(baseUrl: string): Promise<boolean> {
  const timeout = AbortSignal.timeout(3_000);

  // Try /health first (llama.cpp server, vLLM)
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: timeout });
    if (res.ok) return true;
  } catch {
    // Continue to next check
  }

  // Try /v1/models (Ollama, OpenAI-compatible)
  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      signal: AbortSignal.timeout(3_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Model resolution ─────────────────────────────────────────────────────────

export async function resolveOvernightModel(
  opts: OvernightLLMOptions
): Promise<{ model: ResolvedModel; baseUrl: string; apiKey: string }> {
  const selfHosted = getSelfHostedConfig();

  // Priority 1: self-hosted VPS
  if (selfHosted) {
    const healthy = await selfHostedHealthCheck(selfHosted.url);
    if (healthy) {
      const modelId = opts.model ?? selfHosted.model;
      return {
        model: {
          id: modelId,
          label: `Self-hosted (${modelId})`,
          costTier: "free",
          backend: "self-hosted",
        },
        baseUrl: `${selfHosted.url}/v1`,
        apiKey: selfHosted.apiKey,
      };
    }
    // VPS unreachable — log warning, fall through to OpenRouter
    console.warn(
      `[tonight-engine] Self-hosted VPS unreachable at ${selfHosted.url} — falling back to OpenRouter`
    );
  }

  // Priority 2: OpenRouter
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openrouterBase = (
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1"
  ).replace(/\/$/, "");

  if (openrouterKey) {
    const model = opts.model
      ? { ...OPENROUTER_MODELS[opts.depth ?? "standard"], id: opts.model }
      : OPENROUTER_MODELS[opts.depth ?? "standard"];

    return { model, baseUrl: openrouterBase, apiKey: openrouterKey };
  }

  // No keys — dev mode
  return {
    model: {
      id: "dev-synthetic",
      label: "Dev Synthetic",
      costTier: "free",
      backend: "self-hosted",
    },
    baseUrl: "",
    apiKey: "",
  };
}

// ─── Core streaming function ──────────────────────────────────────────────────

/**
 * Stream tokens from the overnight LLM.
 * Automatically picks the best available backend (self-hosted → OpenRouter → fallback).
 */
export async function* streamOvernightLLM(
  prompt: string,
  opts: OvernightLLMOptions = {}
): AsyncIterable<string> {
  const maxTokens =
    opts.maxTokens ??
    Number(process.env.TONIGHT_ENGINE_MAX_TOKENS ?? "8192");
  const systemPrompt = opts.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;

  const { model, baseUrl, apiKey } = await resolveOvernightModel(opts);

  // Dev mode fallback
  if (!baseUrl || !apiKey || apiKey === "") {
    yield* _devFallbackStream(prompt, model);
    return;
  }

  const body = {
    model: model.id,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
    stream: true,
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // OpenRouter-specific headers (ignored by Ollama/llama.cpp)
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "https://shothik.work",
        "X-Title": "Shothik Tonight Engine",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network failure on primary backend — retry on OpenRouter fallback if self-hosted was primary
    if (model.backend === "self-hosted") {
      yield* streamOvernightLLM(prompt, {
        ...opts,
        model: OPENROUTER_FALLBACK.id,
      });
      return;
    }
    // Already on OpenRouter — try V3 fallback
    if (model.id !== OPENROUTER_FALLBACK.id) {
      yield* streamOvernightLLM(prompt, { ...opts, model: OPENROUTER_FALLBACK.id });
      return;
    }
    throw new Error(
      `Tonight Engine network error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    // Retry with OpenRouter fallback on error
    if (model.backend === "self-hosted" || model.id !== OPENROUTER_FALLBACK.id) {
      console.warn(
        `[tonight-engine] ${model.label} failed (HTTP ${response.status}) — retrying with fallback`
      );
      yield* streamOvernightLLM(prompt, { ...opts, model: OPENROUTER_FALLBACK.id });
      return;
    }
    throw new Error(`Tonight Engine LLM error ${response.status}: ${errText}`);
  }

  if (!response.body) throw new Error("Tonight Engine LLM: no response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed?.choices?.[0]?.delta?.content;
          if (typeof content === "string" && content.length > 0) {
            yield content;
          }
        } catch {
          // Malformed SSE line — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Dev synthetic stream ─────────────────────────────────────────────────────

async function* _devFallbackStream(
  prompt: string,
  model: ResolvedModel
): AsyncIterable<string> {
  const chunks = [
    `## Tonight Engine — Dev Mode\n\n`,
    `**Model:** ${model.label} *(${model.backend})*\n`,
    `**Prompt received:** "${prompt.slice(0, 100)}${prompt.length > 100 ? "…" : ""}"\n\n`,
    `### To enable real inference\n\n`,
    `**Option A — Self-hosted Ornith on VPS (free, unlimited):**\n`,
    "```bash\n",
    "# On your VPS:\n",
    "ollama pull hf.co/deepreinforce-ai/Ornith-1.0-9B-GGUF\n",
    "ollama serve\n",
    "```\n",
    "Then in `.env.local`:\n",
    "```\n",
    "TONIGHT_ENGINE_SELF_HOSTED_URL=http://your-vps-ip:11434\n",
    "TONIGHT_ENGINE_SELF_HOSTED_MODEL=ornith-1.0:9b\n",
    "```\n\n",
    `**Option B — OpenRouter (pay-per-token, Gemini 2.5 Flash ~$0.15/M):**\n`,
    "```\nOPENROUTER_API_KEY=sk-or-...\n```\n",
  ];

  for (const chunk of chunks) {
    yield chunk;
    await new Promise((r) => setTimeout(r, 25));
  }
}
