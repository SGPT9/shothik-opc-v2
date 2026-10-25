import { Router, type Request, type Response } from "express";
import { speculativeSystem1Engine } from "../lib/router/speculative-system1-engine";
import { logger } from "../lib/logger";

export const speculativeRouter = Router();

/**
 * POST /api/v1/router/speculate
 * Evaluates inbound prompt using Speculative System-1 edge inference.
 * Sub-50ms deterministic resolution with zero token cost for confident patterns,
 * escalates to System-2 Cloud LLM only when ambiguity threshold is breached.
 */
speculativeRouter.post("/v1/router/speculate", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (typeof query !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_QUERY", message: "query string is required" },
      });
      return;
    }

    const result = await speculativeSystem1Engine.evaluate(query);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[SpeculativeRouter] Evaluation error");
    res.status(500).json({
      success: false,
      error: { code: "ROUTER_ERROR", message: err.message || "Failed to evaluate speculative query" },
    });
  }
});

/**
 * GET /api/v1/router/metrics
 * Returns fast-path hit ratio, token savings, and system-1 vs system-2 telemetry.
 */
speculativeRouter.get("/v1/router/metrics", (_req: Request, res: Response) => {
  const metrics = speculativeSystem1Engine.getMetrics();
  res.json({
    success: true,
    data: metrics,
  });
});

/**
 * POST /api/v1/router/metrics/reset
 * Resets telemetry counters.
 */
speculativeRouter.post("/v1/router/metrics/reset", (_req: Request, res: Response) => {
  speculativeSystem1Engine.resetMetrics();
  res.json({
    success: true,
    message: "Speculative router metrics reset",
  });
});
