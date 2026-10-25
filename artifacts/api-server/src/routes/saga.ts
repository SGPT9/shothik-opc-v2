import { Router, type Request, type Response } from "express";
import { durableSagaEngine } from "../lib/saga/durable-saga-engine";
import { logger } from "../lib/logger";

export const sagaRouter = Router();

/**
 * GET /api/v1/sagas/definitions
 * Lists all registered Saga templates available for invocation.
 */
sagaRouter.get("/v1/sagas/definitions", (_req: Request, res: Response) => {
  const definitions = durableSagaEngine.listDefinitions();
  res.json({
    success: true,
    data: definitions,
  });
});

/**
 * GET /api/v1/sagas
 * Lists recent Saga execution logs with their final or current status.
 */
sagaRouter.get("/v1/sagas", (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
  const executions = durableSagaEngine.listExecutions(limit);
  res.json({
    success: true,
    count: executions.length,
    data: executions,
  });
});

/**
 * GET /api/v1/sagas/:id
 * Fetches single saga details, WAL steps, and rollback trail.
 */
sagaRouter.get("/v1/sagas/:id", (req: Request, res: Response) => {
  const sagaId = String(req.params.id);
  const saga = durableSagaEngine.getExecution(sagaId);
  if (!saga) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Saga execution '${sagaId}' not found` },
    });
    return;
  }
  res.json({
    success: true,
    data: saga,
  });
});

/**
 * POST /api/v1/sagas/execute
 * Triggers atomic forward execution of a registered saga, with automatic backward compensation.
 */
sagaRouter.post("/v1/sagas/execute", async (req: Request, res: Response) => {
  try {
    const { sagaName, initialContext, idempotencyKey, correlationId } = req.body;

    if (!sagaName || typeof sagaName !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_ARGUMENT", message: "sagaName is required" },
      });
      return;
    }

    const record = await durableSagaEngine.executeSaga({
      sagaName,
      initialContext: initialContext || {},
      idempotencyKey,
      correlationId,
    });

    const isFailure = record.status === "COMPENSATED" || record.status === "COMPENSATION_FAILED" || record.status === "FAILED";

    res.status(isFailure ? 422 : 200).json({
      success: !isFailure,
      data: record,
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[SagaRouter] Execution error");
    res.status(500).json({
      success: false,
      error: { code: "SAGA_EXECUTION_ERROR", message: err.message || "Failed to execute saga" },
    });
  }
});

/**
 * POST /api/v1/sagas/:id/resume
 * Resumes an interrupted or failed saga.
 */
sagaRouter.post("/v1/sagas/:id/resume", async (req: Request, res: Response) => {
  try {
    const record = await durableSagaEngine.resumeSaga(String(req.params.id));
    res.json({
      success: record.status === "COMPLETED",
      data: record,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: "RESUME_FAILED", message: err.message || "Failed to resume saga" },
    });
  }
});
