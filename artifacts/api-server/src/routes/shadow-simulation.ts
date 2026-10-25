import { Router, type Request, type Response } from "express";
import { shadowSimulationEngine, type SimulationAction } from "../lib/simulation/shadow-simulation-engine";
import { logger } from "../lib/logger";

export const shadowSimulationRouter = Router();

/**
 * POST /api/v1/simulation/rehearse
 * Executes a 10ms discrete-event dry run simulation across multiple twins
 * to verify pre-flight invariants and multi-twin state convergence before real external APIs are touched.
 */
shadowSimulationRouter.post("/v1/simulation/rehearse", (req: Request, res: Response) => {
  try {
    const { actions, initialState } = req.body;

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_ACTIONS", message: "actions must be a non-empty array of simulation actions" },
      });
      return;
    }

    const report = shadowSimulationEngine.rehearse(actions as SimulationAction[], initialState);

    const isRejected = report.verdict === "REJECTED_INVARIANT_VIOLATION";

    res.status(isRejected ? 422 : 200).json({
      success: !isRejected,
      data: report,
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[ShadowSimulationRouter] Rehearsal error");
    res.status(500).json({
      success: false,
      error: { code: "SIMULATION_FAILED", message: err.message || "Failed to execute shadow simulation" },
    });
  }
});

/**
 * GET /api/v1/simulation/scenarios
 * Lists available pre-registered rehearsal scenarios.
 */
shadowSimulationRouter.get("/v1/simulation/scenarios", (_req: Request, res: Response) => {
  const scenarios = shadowSimulationEngine.listScenarios();
  res.json({
    success: true,
    count: scenarios.length,
    data: scenarios,
  });
});

/**
 * POST /api/v1/simulation/scenarios/:id/run
 * Executes a named scenario and returns full simulation report with state deltas and trace.
 */
shadowSimulationRouter.post("/v1/simulation/scenarios/:id/run", (req: Request, res: Response) => {
  try {
    const scenarioId = String(req.params.id);
    const report = shadowSimulationEngine.runScenario(scenarioId);

    const isRejected = report.verdict === "REJECTED_INVARIANT_VIOLATION";

    res.status(isRejected ? 422 : 200).json({
      success: !isRejected,
      data: report,
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: { code: "SCENARIO_NOT_FOUND", message: err.message || `Scenario '${req.params.id}' not found` },
    });
  }
});
