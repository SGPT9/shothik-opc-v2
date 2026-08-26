import logger from "@/lib/logger";

export interface SpanRecord {
  spanId: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  attributes?: Record<string, unknown>;
}

export interface SessionCostReport {
  traceId: string;
  sessionId: string;
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  ttftMs: number;
  totalDurationMs: number;
  estimatedCostUsd: number;
  billedRevenueUsd: number;
  grossMarginPct: number;
}

export class SessionTelemetryEngine {
  private spans: Map<string, SpanRecord[]> = new Map();

  /**
   * Generates a trace ID adhering to W3C Trace Context
   */
  public generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  public startSpan(traceId: string, name: string, attributes?: Record<string, unknown>): SpanRecord {
    const span: SpanRecord = {
      spanId: `span_${Math.random().toString(36).slice(2, 8)}`,
      name,
      startTime: Date.now(),
      attributes,
    };

    const list = this.spans.get(traceId) || [];
    list.push(span);
    this.spans.set(traceId, list);
    return span;
  }

  public endSpan(traceId: string, spanId: string, extraAttributes?: Record<string, unknown>): SpanRecord | undefined {
    const list = this.spans.get(traceId);
    if (!list) return undefined;

    const span = list.find((s) => s.spanId === spanId);
    if (span) {
      span.endTime = Date.now();
      span.durationMs = span.endTime - span.startTime;
      if (extraAttributes) {
        span.attributes = { ...span.attributes, ...extraAttributes };
      }
    }
    return span;
  }

  /**
   * Compute Unit Economics & Cost Attribution per session
   */
  public computeCostAttribution(params: {
    traceId: string;
    sessionId: string;
    userId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    requestStartTime: number;
    firstTokenTime: number;
    completionTime: number;
    billedRevenueUsd?: number;
  }): SessionCostReport {
    const ttftMs = Math.max(0, params.firstTokenTime - params.requestStartTime);
    const totalDurationMs = Math.max(0, params.completionTime - params.requestStartTime);

    // Pricing per 1M tokens based on model tier
    let inputRatePer1M = 0.15;
    let outputRatePer1M = 0.60;

    if (params.model.includes("deepseek-r1") || params.model.includes("gemini-1.5-pro")) {
      inputRatePer1M = 2.50;
      outputRatePer1M = 10.00;
    }

    const inputCost = (params.inputTokens / 1_000_000) * inputRatePer1M;
    const outputCost = (params.outputTokens / 1_000_000) * outputRatePer1M;
    const estimatedCostUsd = Math.round((inputCost + outputCost) * 100000) / 100000;

    // Default micro-billing unit: $0.005 per turn if not provided
    const billedRevenueUsd = params.billedRevenueUsd ?? 0.005;
    const grossMarginPct =
      billedRevenueUsd > 0
        ? Math.round(((billedRevenueUsd - estimatedCostUsd) / billedRevenueUsd) * 1000) / 10
        : 0;

    const report: SessionCostReport = {
      traceId: params.traceId,
      sessionId: params.sessionId,
      userId: params.userId,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      ttftMs,
      totalDurationMs,
      estimatedCostUsd,
      billedRevenueUsd,
      grossMarginPct,
    };

    logger.info("[session-telemetry] Computed session cost report", {
      traceId: report.traceId,
      ttftMs: report.ttftMs,
      costUsd: report.estimatedCostUsd,
      marginPct: report.grossMarginPct,
    });

    return report;
  }
}

export const defaultTelemetryEngine = new SessionTelemetryEngine();
