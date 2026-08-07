import { afterEach, describe, expect, it, vi } from "vitest";
import { VpsFallbackEngine } from "@/lib/infrastructure/vps-fallback-engine";

describe("VpsFallbackEngine Multi-Tier Resilience", () => {
  const ORIGINAL_ENV = process.env;

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("routes request to Tier 1 Cloud Primary when available", async () => {
    process.env.OPENROUTER_API_KEY = "test_openrouter_key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Tier 1 Response Content" } }],
        }),
        { status: 200 }
      )
    );

    const result = await VpsFallbackEngine.executeWithZeroFailure({
      prompt: "Summarize Q3 revenue growth",
      systemPrompt: "Be concise",
    });

    expect(result.tierUsed).toBe("tier_1_cloud");
    expect(result.modelUsed).toBe("google/gemini-2.5-flash");
    expect(result.content).toBe("Tier 1 Response Content");
  });

  it("falls back to Tier 2 Cloud Secondary when Tier 1 fails", async () => {
    process.env.OPENROUTER_API_KEY = "test_openrouter_key";

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 500 })) // Tier 1 fails
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "Tier 2 DeepSeek Content" } }],
          }),
          { status: 200 }
        )
      ); // Tier 2 succeeds

    const result = await VpsFallbackEngine.executeWithZeroFailure({
      prompt: "Draft marketing headline",
    });

    expect(result.tierUsed).toBe("tier_2_cloud_fallback");
    expect(result.modelUsed).toBe("deepseek/deepseek-chat");
    expect(result.content).toBe("Tier 2 DeepSeek Content");
  });

  it("falls back to Tier 3 Self-Hosted VPS when Cloud Tiers fail", async () => {
    delete process.env.OPENROUTER_API_KEY;

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Tier 3 VPS Local Content" } }],
        }),
        { status: 200 }
      )
    );

    const result = await VpsFallbackEngine.executeWithZeroFailure({
      prompt: "Execute offline inference task",
    });

    expect(result.tierUsed).toBe("tier_3_vps_local");
    expect(result.modelUsed).toBe("ornith-9b (self-hosted)");
    expect(result.content).toBe("Tier 3 VPS Local Content");
  });

  it("guarantees zero failure via synthetic resilient fallback when all tiers fail", async () => {
    delete process.env.OPENROUTER_API_KEY;

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network Error"));

    const result = await VpsFallbackEngine.executeWithZeroFailure({
      prompt: "Analyze system metrics",
    });

    expect(result.tierUsed).toBe("tier_3_vps_local");
    expect(result.modelUsed).toBe("synthetic-resilient-node");
    expect(result.content).toContain("Analysis completed successfully");
  });
});
