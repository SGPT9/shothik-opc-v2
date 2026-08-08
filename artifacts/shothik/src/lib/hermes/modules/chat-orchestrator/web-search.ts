/**
 * Live Web Search step for Web Search chat mode.
 *
 * When chatMode is "web-search", the chat orchestrator performs a real
 * web search BEFORE the provider call so replies cite live, verifiable
 * sources instead of the model's training knowledge.
 *
 * Implementation: Google Search grounding via the Gemini API
 * (tools: [{ google_search: {} }]) in a single non-streaming
 * generateContent call. The grounded response carries:
 *   - a synthesized, up-to-date research summary (candidate text)
 *   - groundingChunks: the actual web sources (title + URL) consulted
 *   - webSearchQueries: the queries the search backend executed
 *
 * The result is injected into the turn context as a "Live web search
 * results" message pair; the system prompt is then adjusted so the
 * model cites only these retrieved sources. On any failure (no key,
 * network error, empty grounding) the orchestrator falls back to a
 * knowledge-only answer that is clearly flagged as such.
 */

import logger from "@/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LiveWebSearchSource {
  /** Source title (usually the domain or page title) */
  title: string;
  /** Resolvable URL for the source */
  url: string;
}

export type LiveWebSearchResult =
  | {
      ok: true;
      /** Synthesized, search-grounded summary of the query */
      summary: string;
      /** The actual web sources the summary is grounded in */
      sources: LiveWebSearchSource[];
      /** Search queries executed by the search backend */
      queries: string[];
    }
  | {
      ok: false;
      /** Machine-readable failure reason */
      errorCode:
        | "search_not_configured"
        | "search_request_failed"
        | "search_no_results"
        | "search_aborted";
      error: string;
    };

export interface PerformLiveWebSearchInput {
  /** The user's question / topic to search for */
  query: string;
  /** Abort propagation from the HTTP request */
  signal?: AbortSignal;
  /** Override the API key (defaults to Gemini env keys) */
  apiKey?: string;
  /** Override the model used for the grounded search call */
  model?: string;
  /** Timeout for the search call in ms (default 20s) */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Search step
// ---------------------------------------------------------------------------

const DEFAULT_SEARCH_MODEL = "gemini-flash-latest";
const DEFAULT_TIMEOUT_MS = 20_000;
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function resolveSearchApiKey(): string | undefined {
  return (
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    undefined
  );
}

interface GroundedGenerateContentResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: { title?: string; uri?: string };
      }>;
      webSearchQueries?: string[];
    };
  }>;
}

/**
 * Perform a live web search for the given query.
 *
 * Never throws — all failures are returned as `{ ok: false }` so the
 * chat orchestrator can gracefully fall back to a knowledge-only answer.
 */
export async function performLiveWebSearch(
  input: PerformLiveWebSearchInput,
): Promise<LiveWebSearchResult> {
  const apiKey = input.apiKey ?? resolveSearchApiKey();
  if (!apiKey) {
    return {
      ok: false,
      errorCode: "search_not_configured",
      error: "No Gemini API key available for live web search",
    };
  }

  const model = input.model ?? DEFAULT_SEARCH_MODEL;
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
  const onOuterAbort = () => timeoutController.abort();
  input.signal?.addEventListener("abort", onOuterAbort, { once: true });

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Search the web and report current, factual findings for the following question. Include concrete facts, figures, names, and dates from the sources you find.\n\nQuestion: ${input.query}`,
                },
              ],
            },
          ],
          tools: [{ google_search: {} }],
        }),
        signal: timeoutController.signal,
      },
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "unknown");
      logger.warn("[chat-web-search] Search request failed", {
        status: response.status,
        error: errText.slice(0, 300),
      });
      return {
        ok: false,
        errorCode: "search_request_failed",
        error: `Search backend returned ${response.status}`,
      };
    }

    const data = (await response.json()) as GroundedGenerateContentResponse;
    const candidate = data.candidates?.[0];
    const summary = (candidate?.content?.parts ?? [])
      .map((p) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim();
    const grounding = candidate?.groundingMetadata;
    const sources: LiveWebSearchSource[] = (grounding?.groundingChunks ?? [])
      .map((chunk) => ({
        title: chunk.web?.title?.trim() || "",
        url: chunk.web?.uri?.trim() || "",
      }))
      .filter((s) => s.url.length > 0);

    if (!summary || sources.length === 0) {
      return {
        ok: false,
        errorCode: "search_no_results",
        error: "Search returned no grounded results",
      };
    }

    return {
      ok: true,
      summary,
      sources,
      queries: (grounding?.webSearchQueries ?? []).filter(
        (q): q is string => typeof q === "string",
      ),
    };
  } catch (err) {
    const aborted =
      input.signal?.aborted ||
      (err instanceof Error && err.name === "AbortError");
    if (!aborted) {
      logger.warn("[chat-web-search] Search request errored", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return {
      ok: false,
      errorCode: aborted ? "search_aborted" : "search_request_failed",
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
    input.signal?.removeEventListener("abort", onOuterAbort);
  }
}

// ---------------------------------------------------------------------------
// Context injection
// ---------------------------------------------------------------------------

/**
 * Format a successful live search result as a context message the
 * orchestrator injects before the conversation history.
 */
export function buildWebSearchContextMessage(
  query: string,
  result: Extract<LiveWebSearchResult, { ok: true }>,
): string {
  const sourceList = result.sources
    .map((s, i) => `[${i + 1}] ${s.title || s.url} — ${s.url}`)
    .join("\n");
  const queries =
    result.queries.length > 0
      ? `\nSearch queries executed: ${result.queries.join("; ")}`
      : "";

  return `Live web search results retrieved just now for: "${query}"${queries}

--- Retrieved findings ---
${result.summary}

--- Retrieved sources ---
${sourceList}

Use ONLY these retrieved findings and sources as your external evidence for this reply. Cite sources inline by name and list them (with their links) under a "Sources" heading at the end.`;
}
