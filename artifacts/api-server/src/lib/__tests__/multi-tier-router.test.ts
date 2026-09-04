import { describe, it, expect } from "vitest";
import { MultiTierInferenceRouter } from "../multi-tier-router.js";
import { RAGKnowledgeEngine } from "../rag-engine.js";

describe("MultiTierInferenceRouter Architecture", () => {
  const router = MultiTierInferenceRouter.getInstance();

  it("routes offline requests strictly to Tier 1 (WebGPU On-Device)", () => {
    const decision = router.evaluateRouting("Translate this text to Bangla", { offlineOnly: true });
    expect(decision.selectedTier).toBe("webgpu_on_device");
    expect(decision.estimatedLatencyMs).toBeLessThanOrEqual(20);
    expect(decision.costEstimateUsd).toBe(0.0);
  });

  it("routes short conversational greetings to Tier 1 with sub-20ms SLA", () => {
    const decision = router.evaluateRouting("hello world", { maxAcceptableLatencyMs: 30 });
    expect(decision.selectedTier).toBe("webgpu_on_device");
    expect(decision.estimatedLatencyMs).toBeLessThanOrEqual(20);
  });

  it("routes knowledge queries to Tier 2 (In-Memory Vector Cache) with fallback ladder", () => {
    const decision = router.evaluateRouting("What is theNilkhet print-on-demand economics model?");
    expect(decision.selectedTier).toBe("in_memory_vector_cache");
    expect(decision.fallbackTiers).toContain("frontier_models");
  });

  it("routes high-volume/spot requests to Tier 3 (Vast.ai Spot GPU)", () => {
    const decision = router.evaluateRouting("Heavy batch job", { preferSpotGpu: true });
    expect(decision.selectedTier).toBe("vastai_spot_gpu");
    expect(decision.costEstimateUsd).toBeLessThan(0.001);
  });

  it("routes complex reasoning tasks to Tier 4 (Frontier Models)", () => {
    const decision = router.evaluateRouting(
      "Analyze the macroeconomic impact of 10% NBR TDS withholding on cross-border SaaS disbursements with CRDT synchronization",
      { bypassCache: true }
    );
    expect(decision.selectedTier).toBe("frontier_models");
    expect(decision.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("executes Tier 2 Vector Cache hit when matching document exists in hot RAG memory", async () => {
    const rag = RAGKnowledgeEngine.getInstance();
    await rag.ingestDocument({
      userId: "usr_multi_tier_test",
      title: "Inference Router Spec",
      content: "The multi-tier inference router cascades from WebGPU to hot vector cache to Vast.ai and frontier models.",
      sourceType: "text",
    });

    const execution = await router.routeAndExecute(
      "multi-tier inference router cascades",
      "usr_multi_tier_test",
      { minVectorSimilarity: 0.1 }
    );

    expect(["in_memory_vector_cache", "webgpu_on_device"]).toContain(execution.tierUsed);
    expect(execution.output).toBeDefined();
    expect(execution.latencyMs).toBeGreaterThan(0);
  });
});
