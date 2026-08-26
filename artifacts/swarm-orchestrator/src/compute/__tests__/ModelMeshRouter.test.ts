import { describe, it, expect } from "vitest";
import { modelMeshRouter } from "../ModelMeshRouter.js";

describe("ModelMeshRouter (5-Tier Intelligent Cascade)", () => {
  it("routes short navigation commands to Tier 0 (WASM)", () => {
    const decision = modelMeshRouter.routePrompt("open slides");
    expect(decision.tier).toBe("Tier 0 (WASM)");
    expect(decision.estimatedCostBdt).toBe(0.0);
    expect(decision.latencyBudgetMs).toBeLessThanOrEqual(10);
  });

  it("routes standard conversational queries to Tier 1 (VPS 7B)", () => {
    const decision = modelMeshRouter.routePrompt("এই প্রোডাক্টের প্রাইস কত?");
    expect(decision.tier).toBe("Tier 1 (VPS 7B)");
    expect(decision.recommendedModel).toBe("qwen2:7b");
    expect(decision.estimatedCostBdt).toBeLessThan(0.01);
  });

  it("routes overnight tasks to Tier 3 (Batch GPU)", () => {
    const decision = modelMeshRouter.routePrompt("Scrape all competitor prices and generate full catalog", {
      isOvernight: true,
    });
    expect(decision.tier).toBe("Tier 3 (Batch GPU)");
    expect(decision.estimatedCostBdt).toBe(0.001);
  });

  it("routes complex legal and financial prompts to Tier 4 (Frontier MoE)", () => {
    const decision = modelMeshRouter.routePrompt(
      "Calculate allowable investment ceiling and tax rebate according to NBR Income Tax Act 2023 Section 78"
    );
    expect(decision.tier).toBe("Tier 4 (Frontier MoE)");
    expect(decision.estimatedCostBdt).toBe(0.04);
    expect(decision.latencyBudgetMs).toBeGreaterThan(1000);
  });

  it("honors explicit forceTier override", () => {
    const decision = modelMeshRouter.routePrompt("hello", {
      forceTier: "Tier 4 (Frontier MoE)",
    });
    expect(decision.tier).toBe("Tier 4 (Frontier MoE)");
    expect(decision.reason).toBe("Explicit user override");
  });
});
