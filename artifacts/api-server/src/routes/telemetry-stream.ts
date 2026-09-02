import { Router, type Request, type Response } from "express";
import { backendEventBus } from "../lib/event-bus";
import { traceContextMiddleware, structuredLogger } from "../lib/structured-logger";

const router = Router();

router.use(traceContextMiddleware());

/**
 * GET /api/v1/events/stream
 * Real-time Server-Sent Events (SSE) stream endpoint for live agent steps & payments
 */
router.get("/v1/events/stream", (req: Request, res: Response) => {
  const traceId = (req as any).traceId || "trc_stream";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  structuredLogger.log("info", "Client connected to SSE event stream", traceId);

  const listener = (event: any) => {
    res.write(backendEventBus.formatSseMessage(event));
  };

  backendEventBus.on("system_event", listener);

  req.on("close", () => {
    backendEventBus.removeListener("system_event", listener);
    structuredLogger.log("info", "Client disconnected from SSE event stream", traceId);
  });
});

/**
 * POST /api/v1/events/publish
 * Publish event to distributed event bus
 */
router.post("/v1/events/publish", (req: Request, res: Response) => {
  const traceId = (req as any).traceId || "trc_pub";
  const { eventType = "agent_step", userId = "usr_default", data = {} } = req.body;

  const event = backendEventBus.publishEvent(eventType, userId, data, traceId);

  return res.status(200).json({
    success: true,
    eventId: event.eventId,
    traceId,
    timestamp: event.timestamp,
  });
});

export default router;
