import { describe, it, expect } from "vitest";
import { executeWithMultiTierFallback, GatewayError } from "@/lib/ai-gateway";

describe("3-Tier AI Gateway Multi-Provider Fallback Resiliency", { timeout: 15000 }, () => {
  it("should succeed on Tier 1 when primary provider is healthy", async () => {
    const tier1 = async () => "Response from Gemini 2.5 Flash (Tier 1)";
    const tier2 = async () => "Response from OpenRouter (Tier 2)";
    const tier3 = async () => "Response from Direct Provider (Tier 3)";

    const result = await executeWithMultiTierFallback([tier1, tier2, tier3], {
      tool: "paraphrase",
      skipCircuitBreaker: true,
    });

    expect(result.data).toBe("Response from Gemini 2.5 Flash (Tier 1)");
    expect(result.tierUsed).toBe(1);
  });

  it("should failover to Tier 2 when Tier 1 throws an error", async () => {
    const tier1 = async () => {
      throw new Error("Tier 1 rate limit or timeout");
    };
    const tier2 = async () => "Response from OpenRouter (Tier 2)";
    const tier3 = async () => "Response from Direct Provider (Tier 3)";

    const result = await executeWithMultiTierFallback([tier1, tier2, tier3], {
      tool: "grammar",
      skipCircuitBreaker: true,
    });

    expect(result.data).toBe("Response from OpenRouter (Tier 2)");
    expect(result.tierUsed).toBe(2);
  });

  it("should failover to Tier 3 when Tier 1 and Tier 2 both fail", async () => {
    const tier1 = async () => {
      throw new Error("Tier 1 unavailable");
    };
    const tier2 = async () => {
      throw new Error("Tier 2 gateway error");
    };
    const tier3 = async () => "Response from Direct Provider (Tier 3)";

    const result = await executeWithMultiTierFallback([tier1, tier2, tier3], {
      tool: "summarize",
      skipCircuitBreaker: true,
    });

    expect(result.data).toBe("Response from Direct Provider (Tier 3)");
    expect(result.tierUsed).toBe(3);
  });

  it("should throw GatewayError when all provider tiers fail", async () => {
    const tier1 = async () => {
      throw new Error("Tier 1 down");
    };
    const tier2 = async () => {
      throw new Error("Tier 2 down");
    };

    await expect(
      executeWithMultiTierFallback([tier1, tier2], {
        tool: "translator",
        skipCircuitBreaker: true,
      })
    ).rejects.toThrow();
  });
});
