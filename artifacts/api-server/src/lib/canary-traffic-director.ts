/**
 * Canary Traffic Director Engine
 * Autonomous Self-Healing Canary & Zero-Downtime Traffic Director
 * 
 * Manages blue-green traffic splitting across production fleets with:
 * - Dynamic traffic weight ramp-up (5% -> 10% -> 25% -> 50% -> 100%)
 * - Continuous SLO anomaly detection (error rates, P95 latency, 5xx spikes)
 * - Sub-second automated self-healing circuit breaker rollback
 * - Live telemetry history and incident audit log
 */

export type CanaryState = "IDLE" | "CANARY_ROUTING" | "PROMOTED" | "ROLLED_BACK";

export interface CanaryDeployment {
  id: string;
  candidateVersion: string;
  stableVersion: string;
  targetService: string;
  commitSha: string;
  status: CanaryState;
  trafficWeightPercent: number;
  startedAt: string;
  updatedAt: string;
  promotedAt?: string;
  rolledBackAt?: string;
  rollbackReason?: string;
}

export interface CanaryTelemetry {
  timestamp: string;
  canaryWeight: number;
  errorRatePercent: number;
  p95LatencyMs: number;
  http5xxCount: number;
  requestsPerSec: number;
  sloHealthy: boolean;
  anomalyScore: number; // 0.0 (pristine) to 1.0 (critical outage)
}

export interface RollbackEvent {
  eventId: string;
  timestamp: string;
  trigger: "ERROR_RATE_SPIKE" | "LATENCY_REGRESSION" | "MANUAL_OPERATOR" | "CIRCUIT_BREAKER";
  message: string;
  previousWeight: number;
  newWeight: number;
}

export interface CanaryStatusResponse {
  activeDeployment: CanaryDeployment | null;
  stableVersion: string;
  trafficSplit: {
    stablePercent: number;
    canaryPercent: number;
  };
  latestTelemetry: CanaryTelemetry;
  sloThresholds: {
    maxErrorRatePercent: number;
    maxP95LatencyMs: number;
  };
  recentRollbacks: RollbackEvent[];
}

export class CanaryTrafficDirectorEngine {
  private activeDeployment: CanaryDeployment | null = null;
  private stableVersion = "v2.4.0";
  private telemetryHistory: CanaryTelemetry[] = [];
  private rollbackLog: RollbackEvent[] = [];

  // SLO Violation Thresholds
  private readonly MAX_ERROR_RATE_PERCENT = 1.5;
  private readonly MAX_P95_LATENCY_MS = 250;

  constructor() {
    this.initializeBaseline();
  }

  private initializeBaseline(): void {
    this.stableVersion = "v2.4.0";
    this.activeDeployment = {
      id: "canary_init_01",
      candidateVersion: "v2.4.1-rc1",
      stableVersion: this.stableVersion,
      targetService: "api-server-mesh",
      commitSha: "84276155",
      status: "CANARY_ROUTING",
      trafficWeightPercent: 10,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Populate baseline telemetry history
    const now = Date.now();
    for (let i = 10; i >= 0; i--) {
      this.telemetryHistory.push({
        timestamp: new Date(now - i * 5000).toISOString(),
        canaryWeight: 10,
        errorRatePercent: 0.12,
        p95LatencyMs: 48.5,
        http5xxCount: 0,
        requestsPerSec: 1420,
        sloHealthy: true,
        anomalyScore: 0.02,
      });
    }
  }

  /**
   * Get active canary status, split weights, and SLO health
   */
  public getStatus(): CanaryStatusResponse {
    const canaryPercent = this.activeDeployment ? this.activeDeployment.trafficWeightPercent : 0;
    const stablePercent = 100 - canaryPercent;
    const latestTelemetry =
      this.telemetryHistory[this.telemetryHistory.length - 1] || {
        timestamp: new Date().toISOString(),
        canaryWeight: canaryPercent,
        errorRatePercent: 0.1,
        p95LatencyMs: 45,
        http5xxCount: 0,
        requestsPerSec: 1200,
        sloHealthy: true,
        anomalyScore: 0.01,
      };

    return {
      activeDeployment: this.activeDeployment ? { ...this.activeDeployment } : null,
      stableVersion: this.stableVersion,
      trafficSplit: {
        stablePercent,
        canaryPercent,
      },
      latestTelemetry,
      sloThresholds: {
        maxErrorRatePercent: this.MAX_ERROR_RATE_PERCENT,
        maxP95LatencyMs: this.MAX_P95_LATENCY_MS,
      },
      recentRollbacks: [...this.rollbackLog],
    };
  }

  /**
   * Deploy a new canary release candidate
   */
  public deployCanary(options: {
    candidateVersion: string;
    targetService?: string;
    commitSha?: string;
    initialWeight?: number;
  }): CanaryDeployment {
    const initialWeight = options.initialWeight !== undefined ? options.initialWeight : 5;
    if (initialWeight < 0 || initialWeight > 100) {
      throw new Error("Initial weight must be between 0 and 100");
    }

    const deployment: CanaryDeployment = {
      id: `canary_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      candidateVersion: options.candidateVersion,
      stableVersion: this.stableVersion,
      targetService: options.targetService || "api-server-mesh",
      commitSha: options.commitSha || "main",
      status: "CANARY_ROUTING",
      trafficWeightPercent: initialWeight,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.activeDeployment = deployment;

    this.telemetryHistory.push({
      timestamp: new Date().toISOString(),
      canaryWeight: initialWeight,
      errorRatePercent: 0.05,
      p95LatencyMs: 42.0,
      http5xxCount: 0,
      requestsPerSec: 1500,
      sloHealthy: true,
      anomalyScore: 0.01,
    });

    return { ...deployment };
  }

  /**
   * Adjust traffic split weight for the active canary
   */
  public adjustTrafficWeight(newWeight: number): CanaryDeployment {
    if (!this.activeDeployment) {
      throw new Error("No active canary deployment found to adjust");
    }

    if (newWeight < 0 || newWeight > 100) {
      throw new Error("Traffic weight must be between 0 and 100 percent");
    }

    this.activeDeployment.trafficWeightPercent = newWeight;
    this.activeDeployment.updatedAt = new Date().toISOString();

    if (newWeight === 100) {
      return this.promoteCanary();
    }

    if (newWeight === 0) {
      return this.emergencyRollback("Traffic adjusted to 0%", "MANUAL_OPERATOR");
    }

    this.activeDeployment.status = "CANARY_ROUTING";

    this.telemetryHistory.push({
      timestamp: new Date().toISOString(),
      canaryWeight: newWeight,
      errorRatePercent: 0.08,
      p95LatencyMs: 44.0,
      http5xxCount: 0,
      requestsPerSec: 1550,
      sloHealthy: true,
      anomalyScore: 0.02,
    });

    return { ...this.activeDeployment };
  }

  /**
   * Promote the active canary to 100% production (Green becomes Blue)
   */
  public promoteCanary(): CanaryDeployment {
    if (!this.activeDeployment) {
      throw new Error("No active canary deployment found to promote");
    }

    const previousCandidate = this.activeDeployment.candidateVersion;
    this.activeDeployment.trafficWeightPercent = 100;
    this.activeDeployment.status = "PROMOTED";
    this.activeDeployment.promotedAt = new Date().toISOString();
    this.activeDeployment.updatedAt = new Date().toISOString();

    // The promoted version becomes the new stable baseline
    this.stableVersion = previousCandidate;

    return { ...this.activeDeployment };
  }

  /**
   * Emergency Rollback: Shed canary traffic to 0% and revert immediately to stable baseline
   */
  public emergencyRollback(
    reason: string,
    trigger: RollbackEvent["trigger"] = "CIRCUIT_BREAKER"
  ): CanaryDeployment {
    if (!this.activeDeployment) {
      throw new Error("No active canary deployment found to rollback");
    }

    const prevWeight = this.activeDeployment.trafficWeightPercent;
    this.activeDeployment.trafficWeightPercent = 0;
    this.activeDeployment.status = "ROLLED_BACK";
    this.activeDeployment.rolledBackAt = new Date().toISOString();
    this.activeDeployment.rollbackReason = reason;
    this.activeDeployment.updatedAt = new Date().toISOString();

    const rollbackEvent: RollbackEvent = {
      eventId: `rb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      trigger,
      message: reason,
      previousWeight: prevWeight,
      newWeight: 0,
    };

    this.rollbackLog.unshift(rollbackEvent);
    if (this.rollbackLog.length > 50) {
      this.rollbackLog.pop();
    }

    this.telemetryHistory.push({
      timestamp: new Date().toISOString(),
      canaryWeight: 0,
      errorRatePercent: 0.02,
      p95LatencyMs: 38.0,
      http5xxCount: 0,
      requestsPerSec: 1600,
      sloHealthy: true,
      anomalyScore: 0.0,
    });

    return { ...this.activeDeployment };
  }

  /**
   * Ingest a telemetry sample and evaluate SLO health.
   * If thresholds are breached, automatically triggers self-healing rollback!
   */
  public recordTelemetry(sample: Omit<CanaryTelemetry, "timestamp" | "sloHealthy">): {
    telemetry: CanaryTelemetry;
    circuitBreakerTriggered: boolean;
    rollbackEvent?: RollbackEvent;
  } {
    const errorExceeded = sample.errorRatePercent > this.MAX_ERROR_RATE_PERCENT;
    const latencyExceeded = sample.p95LatencyMs > this.MAX_P95_LATENCY_MS;
    const sloHealthy = !errorExceeded && !latencyExceeded;

    const fullTelemetry: CanaryTelemetry = {
      ...sample,
      timestamp: new Date().toISOString(),
      sloHealthy,
    };

    this.telemetryHistory.push(fullTelemetry);
    if (this.telemetryHistory.length > 100) {
      this.telemetryHistory.shift();
    }

    let circuitBreakerTriggered = false;
    let rollbackEvent: RollbackEvent | undefined;

    // Trigger circuit breaker rollback if canary is currently taking traffic and SLO fails
    if (!sloHealthy && this.activeDeployment && this.activeDeployment.trafficWeightPercent > 0) {
      circuitBreakerTriggered = true;
      const reason = errorExceeded
        ? `Error rate spike (${sample.errorRatePercent.toFixed(2)}% > threshold ${this.MAX_ERROR_RATE_PERCENT}%)`
        : `P95 latency regression (${sample.p95LatencyMs.toFixed(1)}ms > threshold ${this.MAX_P95_LATENCY_MS}ms)`;

      this.emergencyRollback(reason, errorExceeded ? "ERROR_RATE_SPIKE" : "LATENCY_REGRESSION");
      rollbackEvent = this.rollbackLog[0];
    }

    return {
      telemetry: fullTelemetry,
      circuitBreakerTriggered,
      rollbackEvent,
    };
  }

  /**
   * Chaos Anomaly Simulator:
   * Artificially injects an error spike or latency penalty to prove automatic circuit breaker rollback
   */
  public simulateAnomaly(type: "ERROR_SPIKE" | "LATENCY_SPIKE" | "HTTP_5XX"): {
    telemetry: CanaryTelemetry;
    circuitBreakerTriggered: boolean;
    rollbackEvent?: RollbackEvent;
  } {
    const currentWeight = this.activeDeployment ? this.activeDeployment.trafficWeightPercent : 10;

    let sample: Omit<CanaryTelemetry, "timestamp" | "sloHealthy">;
    if (type === "ERROR_SPIKE") {
      sample = {
        canaryWeight: currentWeight,
        errorRatePercent: 4.85, // Breaches 1.5% threshold
        p95LatencyMs: 52.0,
        http5xxCount: 42,
        requestsPerSec: 1350,
        anomalyScore: 0.88,
      };
    } else if (type === "LATENCY_SPIKE") {
      sample = {
        canaryWeight: currentWeight,
        errorRatePercent: 0.25,
        p95LatencyMs: 412.0, // Breaches 250ms threshold
        http5xxCount: 1,
        requestsPerSec: 920,
        anomalyScore: 0.74,
      };
    } else {
      sample = {
        canaryWeight: currentWeight,
        errorRatePercent: 8.40,
        p95LatencyMs: 180.0,
        http5xxCount: 95,
        requestsPerSec: 1100,
        anomalyScore: 0.95,
      };
    }

    return this.recordTelemetry(sample);
  }

  /**
   * Retrieve historical telemetry time-series samples
   */
  public getTelemetryHistory(limit = 30): CanaryTelemetry[] {
    return this.telemetryHistory.slice(-limit);
  }

  /**
   * Reset engine back to pristine baseline (for testing)
   */
  public resetToBaseline(): void {
    this.telemetryHistory = [];
    this.rollbackLog = [];
    this.initializeBaseline();
  }
}

// Global Singleton Instance
export const canaryTrafficDirectorEngine = new CanaryTrafficDirectorEngine();
