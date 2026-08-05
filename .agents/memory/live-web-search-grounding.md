---
name: Live web search via Gemini grounding
description: How to get real live web sources in this project without a search API key
---

**Rule:** For live web search, use Gemini's Google Search grounding (`tools: [{ google_search: {} }]` on a non-streaming `generateContent` call with `gemini-flash-latest`). It returns a grounded summary plus `groundingMetadata.groundingChunks` (real source titles + URLs) and `webSearchQueries`.

**Why:** DuckDuckGo HTML/lite scraping gets rate-limited (anomaly page) after a couple of requests from this environment, and no dedicated search API key exists. The existing GEMINI_API_KEY works with grounding on `gemini-flash-latest`.

**How to apply:** Web Search chat mode's search step lives in the chat-orchestrator's web-search module; reuse it (or the same pattern) for any other feature needing live sources. Always return failures as values (not throws) so callers can fall back to knowledge-only answers that are clearly flagged.

Also: the shothik package's vitest suites cannot import the orchestrator index directly — its import chain pulls `pg`/insforge config. Keep testable logic in dependency-free modules (e.g. `prompts.ts`, `web-search.ts`).
