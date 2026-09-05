import { Router, type Request, type Response } from "express";
import { canaryTrafficDirectorEngine } from "../lib/canary-traffic-director.js";

export const canaryDirectorRouter = Router();

/**
 * GET /api/v1/traffic/canary/status
 * Returns current canary deployment status, blue/green split, and SLO metrics
 */
canaryDirectorRouter.get("/v1/traffic/canary/status", (_req: Request, res: Response) => {
  try {
    const status = canaryTrafficDirectorEngine.getStatus();
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve canary traffic status",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/traffic/canary/deploy
 * Initiates a new canary release candidate
 */
canaryDirectorRouter.post("/v1/traffic/canary/deploy", (req: Request, res: Response) => {
  try {
    const { candidateVersion, targetService, commitSha, initialWeight } = req.body;

    if (!candidateVersion) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter 'candidateVersion'",
      });
    }

    const deployment = canaryTrafficDirectorEngine.deployCanary({
      candidateVersion,
      targetService,
      commitSha,
      initialWeight: initialWeight !== undefined ? Number(initialWeight) : undefined,
    });

    return res.status(201).json({
      success: true,
      deployment,
      message: `Canary candidate ${candidateVersion} launched with ${deployment.trafficWeightPercent}% traffic weight.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to deploy canary candidate",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/traffic/canary/adjust-weight
 * Adjusts the traffic split percentage (0-100%)
 */
canaryDirectorRouter.post("/v1/traffic/canary/adjust-weight", (req: Request, res: Response) => {
  try {
    const { weight } = req.body;

    if (weight === undefined || typeof weight !== "number") {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid parameter 'weight' (number between 0 and 100)",
      });
    }

    const deployment = canaryTrafficDirectorEngine.adjustTrafficWeight(weight);

    return res.status(200).json({
      success: true,
      deployment,
      message: `Traffic weight adjusted to ${weight}%.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to adjust canary traffic weight",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/traffic/canary/promote
 * Promotes the active canary candidate to 100% production (Green becomes Blue)
 */
canaryDirectorRouter.post("/v1/traffic/canary/promote", (_req: Request, res: Response) => {
  try {
    const deployment = canaryTrafficDirectorEngine.promoteCanary();

    return res.status(200).json({
      success: true,
      deployment,
      message: `Canary candidate ${deployment.candidateVersion} successfully promoted to stable production baseline.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to promote canary deployment",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/traffic/canary/rollback
 * Emergency rollback: sheds canary traffic immediately to 0%
 */
canaryDirectorRouter.post("/v1/traffic/canary/rollback", (req: Request, res: Response) => {
  try {
    const { reason } = req.body || {};
    const deployment = canaryTrafficDirectorEngine.emergencyRollback(
      reason || "Manual operator triggered rollback",
      "MANUAL_OPERATOR"
    );

    return res.status(200).json({
      success: true,
      deployment,
      message: "Emergency rollback executed. 100% traffic restored to stable baseline.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to execute emergency rollback",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/traffic/canary/simulate-anomaly
 * Injects artificial anomaly to test autonomous circuit breaker self-healing
 */
canaryDirectorRouter.post("/v1/traffic/canary/simulate-anomaly", (req: Request, res: Response) => {
  try {
    const { type } = req.body || {};
    const anomalyType = type === "LATENCY_SPIKE" || type === "HTTP_5XX" ? type : "ERROR_SPIKE";

    const result = canaryTrafficDirectorEngine.simulateAnomaly(anomalyType);

    return res.status(200).json({
      success: true,
      anomalyType,
      telemetry: result.telemetry,
      circuitBreakerTriggered: result.circuitBreakerTriggered,
      rollbackEvent: result.rollbackEvent,
      message: result.circuitBreakerTriggered
        ? "Circuit breaker triggered! Autonomous self-healing rollback executed immediately."
        : "Anomaly simulated; SLO remains within acceptable boundaries.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to simulate anomaly",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/traffic/canary/telemetry
 * Returns time-series SLO metrics history
 */
canaryDirectorRouter.get("/v1/traffic/canary/telemetry", (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 30;
    const history = canaryTrafficDirectorEngine.getTelemetryHistory(limit);

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve telemetry history",
      message: error?.message || String(error),
    });
  }
});
