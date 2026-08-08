import { afterEach, describe, expect, it, vi } from "vitest";

import {
  performLiveWebSearch,
  buildWebSearchContextMessage,
  type LiveWebSearchResult,
} from "@/lib/hermes/modules/chat-orchestrator/web-search";
import { buildSystemPromptForMode } from "@/lib/hermes/modules/chat-orchestrator/prompts";

function groundedResponse() {
  return {
    ok: true,
    json: async () => ({
      candidates: [
        {
          content: { parts: [{ text: "Live findings about the topic." }] },
          groundingMetadata: {
            groundingChunks: [
              { web: { title: "example.com", uri: "https://example.com/a" } },
              { web: { title: "news.org", uri: "https://news.org/b" } },
            ],
            webSearchQueries: ["topic latest 2026"],
          },
        },
      ],
    }),
  };
}

describe("performLiveWebSearch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns grounded summary and sources on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(groundedResponse());
    vi.stubGlobal("fetch", fetchMock);

    const result = await performLiveWebSearch({
      query: "what is new in AI?",
      apiKey: "test-key",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary).toContain("Live findings");
      expect(result.sources).toHaveLength(2);
      expect(result.sources[0].url).toBe("https://example.com/a");
      expect(result.queries).toEqual(["topic latest 2026"]);
    }

    // Search must use the google_search grounding tool
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.tools).toEqual([{ google_search: {} }]);
    expect(body.contents[0].parts[0].text).toContain("what is new in AI?");
  });

  it("fails gracefully when no API key is available", async () => {
    const prevA = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    const prevB = process.env.GEMINI_API_KEY;
    delete process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const result = await performLiveWebSearch({ query: "q" });
      expect(result).toMatchObject({
        ok: false,
        errorCode: "search_not_configured",
      });
    } finally {
      if (prevA !== undefined) process.env.AI_INTEGRATIONS_GEMINI_API_KEY = prevA;
      if (prevB !== undefined) process.env.GEMINI_API_KEY = prevB;
    }
  });

  it("fails gracefully on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => "down" }),
    );
    const result = await performLiveWebSearch({ query: "q", apiKey: "k" });
    expect(result).toMatchObject({ ok: false, errorCode: "search_request_failed" });
  });

  it("fails gracefully when grounding returns no sources", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "ungrounded text" }] } }],
        }),
      }),
    );
    const result = await performLiveWebSearch({ query: "q", apiKey: "k" });
    expect(result).toMatchObject({ ok: false, errorCode: "search_no_results" });
  });

  it("fails gracefully on network errors instead of throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    const result = await performLiveWebSearch({ query: "q", apiKey: "k" });
    expect(result).toMatchObject({ ok: false, errorCode: "search_request_failed" });
  });
});

describe("buildWebSearchContextMessage", () => {
  it("includes findings, numbered sources with links, and citation instruction", () => {
    const result: Extract<LiveWebSearchResult, { ok: true }> = {
      ok: true,
      summary: "Summary here.",
      sources: [{ title: "example.com", url: "https://example.com/a" }],
      queries: ["q1"],
    };
    const msg = buildWebSearchContextMessage("my question", result);
    expect(msg).toContain("my question");
    expect(msg).toContain("Summary here.");
    expect(msg).toContain("[1] example.com — https://example.com/a");
    expect(msg).toContain('"Sources" heading');
  });
});

describe("buildSystemPromptForMode web-search outcomes", () => {
  it("adds the live-search addendum when search succeeded", () => {
    const prompt = buildSystemPromptForMode("web-search", {
      webSearchOutcome: "live",
    });
    expect(prompt).toContain("LIVE SEARCH CONTEXT");
    expect(prompt).not.toContain("LIVE SEARCH UNAVAILABLE");
  });

  it("adds the knowledge-only addendum when search failed", () => {
    const prompt = buildSystemPromptForMode("web-search", {
      webSearchOutcome: "failed",
    });
    expect(prompt).toContain("LIVE SEARCH UNAVAILABLE");
  });

  it("leaves other modes unchanged", () => {
    expect(buildSystemPromptForMode("cofounder")).toContain("MODE: Cofounder");
    expect(buildSystemPromptForMode("cofounder")).not.toContain(
      "LIVE SEARCH",
    );
  });
});
