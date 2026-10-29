import { Router, Request, Response } from "express";
import { dshRuntime } from "../lib/dsh-runtime";
import { logger } from "../lib/logger";
import { resolveUserId } from "../middleware/auth.js";

export const dshRouter = Router();

/**
 * POST /api/v1/dsh/sessions/init
 * Initialize a new tracked execution trace session.
 */
dshRouter.post("/v1/dsh/sessions/init", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId: bodyUserId, title, initialContext } = req.body;
    const userId = resolveUserId(req, typeof bodyUserId === "string" ? bodyUserId : "");

    if (!userId || typeof userId !== "string") {
      res.status(400).json({ success: false, error: "Missing required field: 'userId' (string)" });
      return;
    }

    const session = await dshRuntime.initSession(userId, title, initialContext);
    res.status(201).json({
      success: true,
      session,
    });
  } catch (err: any) {
    logger.error(`[dsh-router] Session initialization failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/dsh/sessions/:sessionId/event
 * Record a lifecycle event in the append-only session journal.
 */
dshRouter.post("/v1/dsh/sessions/:sessionId/event", async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = typeof req.params.sessionId === "string" ? req.params.sessionId : String(req.params.sessionId || "");
    const { type, data, metadata } = req.body;

    if (!sessionId || !type || !data) {
      res.status(400).json({ success: false, error: "Missing 'sessionId', 'type', or 'data'" });
      return;
    }

    const event = await dshRuntime.recordEvent(sessionId, type, data, metadata);
    res.status(201).json({
      success: true,
      event,
    });
  } catch (err: any) {
    logger.error(`[dsh-router] Failed to record event: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/dsh/sessions/:sessionId/trace
 * Retrieve the full execution trace and event log for a session.
 */
dshRouter.get("/v1/dsh/sessions/:sessionId/trace", async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = typeof req.params.sessionId === "string" ? req.params.sessionId : String(req.params.sessionId || "");
    const session = await dshRuntime.getSession(sessionId);

    if (!session) {
      res.status(404).json({ success: false, error: "DSH Session not found" });
      return;
    }

    res.json({
      success: true,
      session,
    });
  } catch (err: any) {
    logger.error(`[dsh-router] Failed to fetch trace: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/dsh/sessions/:sessionId/fork
 * Fork an execution session at a specific step to create a new branch.
 */
dshRouter.post("/v1/dsh/sessions/:sessionId/fork", async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = typeof req.params.sessionId === "string" ? req.params.sessionId : String(req.params.sessionId || "");
    const { atEventIndex, forkTitle } = req.body;

    const forkedSession = await dshRuntime.forkSession(sessionId, atEventIndex, forkTitle);
    res.status(201).json({
      success: true,
      forkedSession,
    });
  } catch (err: any) {
    logger.error(`[dsh-router] Failed to fork session: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/dsh/sessions/:sessionId/replay
 * Replay the session step-by-step with time deltas and execution summaries.
 */
dshRouter.get("/v1/dsh/sessions/:sessionId/replay", async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = typeof req.params.sessionId === "string" ? req.params.sessionId : String(req.params.sessionId || "");
    const replay = await dshRuntime.replaySession(sessionId);

    res.json({
      success: true,
      replay,
    });
  } catch (err: any) {
    logger.error(`[dsh-router] Failed to replay session: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/dsh/sessions
 * List all active/historical DSH sessions.
 */
dshRouter.get("/v1/dsh/sessions", async (req: Request, res: Response): Promise<void> => {
  try {
    const resolved = resolveUserId(req, "");
    const userId = resolved || undefined;
    const sessions = await dshRuntime.listSessions(userId);

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (err: any) {
    logger.error(`[dsh-router] Failed to list sessions: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});
