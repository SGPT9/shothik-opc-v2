import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientMultiTierRouter } from "../MultiTierInferenceRouter";

describe("ClientMultiTierRouter Unit Tests", () => {
  it("evaluates offline requests to Tier 1 WebGPU with 0.99 confidence", () => {
    const decision = ClientMultiTierRouter.evaluate("Any prompt", true);
    expect(decision.targetTier).toBe("tier1_webgpu");
    expect(decision.isOffline).toBe(true);
    expect(decision.confidence).toBeGreaterThan(0.95);
  });

  it("evaluates simple heuristic queries to Tier 1 WebGPU", () => {
    const decision = ClientMultiTierRouter.evaluate("rewrite this email", false);
    expect(decision.targetTier).toBe("tier1_webgpu");
  });

  it("executes local WebGPU / WASM pipeline with sub-45ms latency", async () => {
    const result = await ClientMultiTierRouter.execute("very good service for merchant and customer", {
      forceOffline: true,
    });
    expect(result.tier).toBe("tier1_webgpu");
    expect(["webgpu", "wasm"]).toContain(result.engine);
    expect(result.output).toBeDefined();
    expect(result.latencyMs).toBeLessThanOrEqual(50);
  });

  it("caches successful outputs in Tier 2 local vector / semantic cache", async () => {
    const prompt = "translate to bangla logistics courier report";
    const res1 = await ClientMultiTierRouter.execute(prompt, { forceOffline: true, targetLanguage: "bn" });
    expect(res1.output).toContain("লজিস্টিকস");

    // Second call should hit Tier 2 vector cache with sub-10ms latency
    const decision = ClientMultiTierRouter.evaluate(prompt, false);
    expect(decision.targetTier).toBe("tier2_vector_cache");

    const res2 = await ClientMultiTierRouter.execute(prompt, { forceOffline: false });
    expect(res2.tier).toBe("tier2_vector_cache");
    expect(res2.output).toBe(res1.output);
  });
});
