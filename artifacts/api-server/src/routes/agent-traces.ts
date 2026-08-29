import { Router, type Request, type Response } from "express";
import {
  recordAgentTrace,
  getAgentTracesBySession,
  getAgentTrace,
  clearSessionTraces,
  initSqliteTables,
} from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

// Ensure SQLite tables are ready
initSqliteTables().catch((err: any) => {
  logger.warn({ err: err?.message }, "[agent-traces] Failed to initialize SQLite tables");
});

/**
 * POST /api/v1/agent/traces
 * Record a new agent execution trace, thought step, or tool invocation.
 */
router.post(["/v1/agent/traces", "/agent/traces"], async (req: Request, res: Response) => {
  try {
    const { sessionId, agentName, prompt, response, status, durationMs, metadata } = req.body;

    if (!sessionId || !agentName || !prompt) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sessionId, agentName, prompt",
      });
    }

    const trace = await recordAgentTrace({
      sessionId,
      agentName,
      prompt,
      response: response ?? "",
      status: status ?? "completed",
      durationMs: typeof durationMs === "number" ? durationMs : 0,
      metadata: metadata || {},
    });

    return res.status(201).json({
      success: true,
      trace,
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "[agent-traces] Failed to record trace");
    return res.status(500).json({
      success: false,
      error: "Failed to persist trace",
      message: err.message,
    });
  }
});

/**
 * GET /api/v1/agent/traces
 * GET /api/v1/agent/traces/:sessionId
 * Fetch all traces recorded for a given session.
 */
router.get(["/v1/agent/traces", "/agent/traces", "/v1/agent/traces/:sessionId", "/agent/traces/:sessionId"], async (req: Request, res: Response) => {
  try {
    const sessionId = (req.params.sessionId || req.query.sessionId) as string;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Missing sessionId parameter",
      });
    }

    const traces = await getAgentTracesBySession(sessionId);

    return res.status(200).json({
      success: true,
      sessionId,
      count: traces.length,
      traces,
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "[agent-traces] Failed to fetch session traces");
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve traces",
      message: err.message,
    });
  }
});

/**
 * GET /api/v1/agent/traces/item/:id
 * Retrieve a single trace by its unique trace ID.
 */
router.get(["/v1/agent/traces/item/:id", "/agent/traces/item/:id"], async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const trace = await getAgentTrace(id);

    if (!trace) {
      return res.status(404).json({
        success: false,
        error: `Trace with id ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      trace,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve trace",
      message: err.message,
    });
  }
});

/**
 * DELETE /api/v1/agent/traces/:sessionId
 * Clear all traces associated with a session.
 */
router.delete(["/v1/agent/traces/:sessionId", "/agent/traces/:sessionId"], async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    await clearSessionTraces(sessionId);

    return res.status(200).json({
      success: true,
      message: `Traces for session ${sessionId} cleared`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to clear session traces",
      message: err.message,
    });
  }
});

export default router;
