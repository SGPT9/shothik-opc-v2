import { describe, it, expect } from "vitest";
import { ProductionSecurityGuards } from "../security-guards";
import { ProductionEvalHarness } from "../eval-harness";
import { ProductionObservabilityTracer } from "../observability-tracer";

describe("9-Layer Production AI Architecture", () => {
  it("Layer 4 Security: should pass valid input scans and block secret leakage on output scans", async () => {
    const inputResult = await ProductionSecurityGuards.scanInput({
      prompt: "Explain Next.js 16 App Router performance optimizations",
    });
    expect(inputResult.passed).toBe(true);

    const secretOutputResult = await ProductionSecurityGuards.scanOutput("Here is my secret mock_secret_key_1234567890");
    expect(secretOutputResult.passed).toBe(false);
    expect(secretOutputResult.guardTriggered).toBe("OUTPUT_GUARD");
  });

  it("Layer 5 Evaluation: should execute offline Golden Dataset evaluation run", async () => {
    const evalResult = await ProductionEvalHarness.runOfflineEvaluation([
      { id: "case_1", query: "What is Shothik?", expectedKeywords: ["AI"], minAccuracyScore: 0.9 },
    ]);
    expect(evalResult.overallAccuracyPercent).toBeGreaterThan(90);
    expect(evalResult.totalCases).toBe(1);
  });

  it("Layer 6 Observability: should record per-stage spans and compute total query cost", () => {
    const trace = ProductionObservabilityTracer.startTrace("trace_101", "usr_test");
    ProductionObservabilityTracer.addSpan(trace, {
      spanId: "span_rag",
      stageName: "RAG_RETRIEVAL",
      durationMs: 15,
      inputTokens: 120,
      outputTokens: 50,
      estimatedCostUsd: 0.0001,
    });

    expect(trace.totalTokens).toBe(170);
    expect(trace.totalDurationMs).toBe(15);
    expect(trace.spans.length).toBe(1);
  });
});
