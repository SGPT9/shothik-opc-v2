import { describe, it, expect, beforeEach } from "vitest";
import { SessionTelemetryEngine } from "../session-telemetry-engine";

describe("SessionTelemetryEngine (Distributed Traces & Unit Economics)", () => {
  let engine: SessionTelemetryEngine;

  beforeEach(() => {
    engine = new SessionTelemetryEngine();
  });

  it("creates and measures span lifecycles across a distributed trace", () => {
    const traceId = engine.generateTraceId();
    expect(traceId).toMatch(/^trace_\d+_[a-z0-9]+$/);

    const span = engine.startSpan(traceId, "hermes.resolve_context", {
      workspaceId: "ws_test_101",
    });

    expect(span.name).toBe("hermes.resolve_context");
    expect(span.startTime).toBeGreaterThan(0);

    const endedSpan = engine.endSpan(traceId, span.spanId, { chunksRetrieved: 4 });

    expect(endedSpan?.durationMs).toBeGreaterThanOrEqual(0);
    expect(endedSpan?.attributes?.chunksRetrieved).toBe(4);
  });

  it("calculates TTFT and gross margin economics for standard model turns", () => {
    const now = Date.now();
    const report = engine.computeCostAttribution({
      traceId: "trace_turn_101",
      sessionId: "session_abc",
      userId: "user_dev",
      model: "gemini-1.5-flash",
      inputTokens: 1200,
      outputTokens: 450,
      requestStartTime: now,
      firstTokenTime: now + 240, // 240ms TTFT
      completionTime: now + 1200,
      billedRevenueUsd: 0.005, // 50 cents BDT
    });

    expect(report.ttftMs).toBe(240);
    expect(report.totalDurationMs).toBe(1200);
    expect(report.estimatedCostUsd).toBeLessThan(0.001); // ultra-cheap Flash turn
    expect(report.grossMarginPct).toBeGreaterThan(65.0); // beats 65.2% target margin
  });

  it("calculates cost economics accurately for DeepThink reasoning models", () => {
    const now = Date.now();
    const report = engine.computeCostAttribution({
      traceId: "trace_turn_102",
      sessionId: "session_deep",
      userId: "user_pro",
      model: "deepseek-r1",
      inputTokens: 5000,
      outputTokens: 2500,
      requestStartTime: now,
      firstTokenTime: now + 850,
      completionTime: now + 4500,
      billedRevenueUsd: 0.10, // Premium turn
    });

    expect(report.ttftMs).toBe(850);
    expect(report.estimatedCostUsd).toBeCloseTo(0.0375, 4);
    expect(report.grossMarginPct).toBeCloseTo(62.5, 1);
  });
});
