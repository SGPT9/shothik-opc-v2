import { Router, Request, Response } from "express";
import {
  multiModelParetoEngine,
  RoutingStrategy,
} from "../lib/multi-model-pareto-optimizer.js";

export const multiModelParetoRouter = Router();

/**
 * GET /api/v1/models/pareto/status
 * Returns overall Pareto optimization metrics, active strategy, models, and frontier coordinates
 */
multiModelParetoRouter.get("/v1/models/pareto/status", (_req: Request, res: Response) => {
  try {
    const status = multiModelParetoEngine.getStatus();
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/models/pareto/route
 * Analyzes prompt complexity and computes optimal Pareto model routing decision
 */
multiModelParetoRouter.post("/v1/models/pareto/route", (req: Request, res: Response) => {
  try {
    const { prompt, strategy } = req.body || {};
    if (typeof prompt !== "string") {
      return res.status(400).json({ success: false, error: "Prompt string is required" });
    }

    const decision = multiModelParetoEngine.routeQuery(prompt, strategy as RoutingStrategy);
    return res.status(200).json({
      success: true,
      ...decision,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/models/pareto/set-strategy
 * Updates the global routing strategy
 */
multiModelParetoRouter.post("/v1/models/pareto/set-strategy", (req: Request, res: Response) => {
  try {
    const { strategy } = req.body || {};
    const validStrategies: RoutingStrategy[] = [
      "PARETO_OPTIMAL",
      "COST_MINIMIZER",
      "QUALITY_MAXIMIZER",
      "LATENCY_FIRST",
      "OFFLINE_SOVEREIGN",
    ];

    if (!strategy || !validStrategies.includes(strategy)) {
      return res.status(400).json({
        success: false,
        error: `Invalid strategy. Must be one of: ${validStrategies.join(", ")}`,
      });
    }

    multiModelParetoEngine.setStrategy(strategy as RoutingStrategy);
    return res.status(200).json({
      success: true,
      strategy,
      message: `Routing strategy successfully set to ${strategy}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/models/pareto/calibrate
 * Runs synthetic calibration pass across all registered models
 */
multiModelParetoRouter.post("/v1/models/pareto/calibrate", (_req: Request, res: Response) => {
  try {
    const result = multiModelParetoEngine.calibrateFrontier();
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/models/pareto/telemetry
 * Chronological log of recent routing decisions and cost savings
 */
multiModelParetoRouter.get("/v1/models/pareto/telemetry", (_req: Request, res: Response) => {
  try {
    const telemetry = multiModelParetoEngine.getTelemetry();
    return res.status(200).json({
      success: true,
      telemetry,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
