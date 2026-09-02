/**
 * ShothikGPT 12-Pillar Reference Architecture — Pillar 12: Evaluation & Observability Engine
 * 
 * Tracks production quality and platform analytics:
 *   Task Success Evaluation ➔ Citation Accuracy ➔ Trajectory Health ➔ Cost/Token Analytics
 */

export interface EvaluationMetric {
  sessionId: string;
  taskCompleted: boolean;
  groundednessScore: number; // 0.0 to 1.0
  citationAccuracyScore: number; // 0.0 to 1.0
  toolAccuracyScore: number; // 0.0 to 1.0
  totalTokensUsed: number;
  totalCostUsd: number;
  latencyMs: number;
  trajectoryClean: boolean;
}

export class EvaluationObservabilityEngine {
  private metrics: EvaluationMetric[] = [];

  public recordMetric(metric: EvaluationMetric): void {
    this.metrics.push(metric);
  }

  public getSummaryReport() {
    if (this.metrics.length === 0) {
      return {
        totalSessions: 0,
        successRatePercentage: 100,
        averageGroundedness: 1.0,
        averageCitationAccuracy: 1.0,
        totalCostUsd: 0,
        averageLatencyMs: 0,
      };
    }

    const total = this.metrics.length;
    const successes = this.metrics.filter((m) => m.taskCompleted).length;
    const sumGroundedness = this.metrics.reduce((acc, m) => acc + m.groundednessScore, 0);
    const sumCitations = this.metrics.reduce((acc, m) => acc + m.citationAccuracyScore, 0);
    const sumCost = this.metrics.reduce((acc, m) => acc + m.totalCostUsd, 0);
    const sumLatency = this.metrics.reduce((acc, m) => acc + m.latencyMs, 0);

    return {
      totalSessions: total,
      successRatePercentage: Math.round((successes / total) * 100),
      averageGroundedness: Number((sumGroundedness / total).toFixed(2)),
      averageCitationAccuracy: Number((sumCitations / total).toFixed(2)),
      totalCostUsd: Number(sumCost.toFixed(4)),
      averageLatencyMs: Math.round(sumLatency / total),
    };
  }
}
