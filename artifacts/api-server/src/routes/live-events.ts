import { Router, Request, Response } from "express";
import { EventEmitter } from "node:events";
import { logger } from "../lib/logger";

export interface LiveEventPayload {
  channel: "ivr_call" | "inventory_sync" | "browser_takeover" | "factoring_disbursement" | "system";
  eventType: string;
  data: Record<string, any>;
  timestamp: string;
}

class LiveEventBus extends EventEmitter {
  public publish(event: LiveEventPayload): void {
    this.emit("event", event);
  }
}

export const globalLiveEventBus = new LiveEventBus();

export const liveEventsRouter = Router();

/**
 * GET /api/events/stream
 * Server-Sent Events (SSE) endpoint for real-time telemetry
 */
liveEventsRouter.get("/events/stream", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  // Initial connection ping
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() })}\n\n`);

  // Periodic keep-alive ping to prevent proxy/cellular timeouts
  const heartbeatTimer = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, 20000);

  const onEvent = (event: LiveEventPayload) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  globalLiveEventBus.on("event", onEvent);

  req.on("close", () => {
    clearInterval(heartbeatTimer);
    globalLiveEventBus.off("event", onEvent);
    res.end();
  });
});

/**
 * POST /api/events/publish
 * Internal event publisher endpoint
 */
liveEventsRouter.post("/events/publish", (req: Request, res: Response) => {
  try {
    const { channel, eventType, data } = req.body;
    if (!channel || !eventType) {
      res.status(400).json({ success: false, error: "channel and eventType are required" });
      return;
    }

    const payload: LiveEventPayload = {
      channel,
      eventType,
      data: data || {},
      timestamp: new Date().toISOString(),
    };

    globalLiveEventBus.publish(payload);
    logger.info({ channel, eventType }, "[live-events] Broadcasted event");

    res.json({ success: true, delivered: true, payload });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
