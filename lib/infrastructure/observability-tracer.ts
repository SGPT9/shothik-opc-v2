import logger from "@/lib/logger";

export interface TraceSpan {
  spanId: string;
  stageName: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

export interface QueryTraceRecord {
  traceId: string;
  userId: string;
  totalDurationMs: number;
  totalTokens: number;
  totalCostUsd: number;
  spans: TraceSpan[];
  recordedAt: string;
}

export class ProductionObservabilityTracer {
  /**
   * Layer 6 Observability: Per-stage tracing, trace-linked feedback, & cost per query tracking.
   */
  static startTrace(traceId: string, userId: string): QueryTraceRecord {
    logger.info("[observability-tracer] Starting end-to-end query trace", { traceId, userId });

    return {
      traceId,
      userId,
      totalDurationMs: 0,
      totalTokens: 0,
      totalCostUsd: 0,
      spans: [],
      recordedAt: new Date().toISOString(),
    };
  }

  static addSpan(trace: QueryTraceRecord, span: TraceSpan): QueryTraceRecord {
    trace.spans.push(span);
    trace.totalDurationMs += span.durationMs;
    trace.totalTokens += span.inputTokens + span.outputTokens;
    trace.totalCostUsd += span.estimatedCostUsd;

    logger.info("[observability-tracer] Trace span recorded", {
      traceId: trace.traceId,
      stage: span.stageName,
      durationMs: span.durationMs,
      totalTokens: trace.totalTokens,
    });

    return trace;
  }
}
