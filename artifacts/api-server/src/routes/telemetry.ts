import { Router, type Request, type Response } from "express";

const router = Router();

export type TelemetryInitiatorKind = "person" | "routine" | "responsibility" | "handoff" | "meeting";

interface TelemetryEvent {
  event: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  initiatorKind?: TelemetryInitiatorKind;
  initiatorId?: string;
}

const memoryTelemetryStore: TelemetryEvent[] = [];

/**
 * POST /api/telemetry
 * Ingests telemetry metrics, trace spans, and TTFT events with initiator attribution
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { event, properties, userId, sessionId, initiatorKind, initiatorId } = req.body;

    const record: TelemetryEvent = {
      event: event || "generic_metric",
      timestamp: new Date().toISOString(),
      properties: properties || {},
      userId,
      sessionId,
      initiatorKind: initiatorKind || "person",
      initiatorId,
    };

    memoryTelemetryStore.push(record);
    if (memoryTelemetryStore.length > 500) {
      memoryTelemetryStore.shift();
    }

    return res.status(200).json({
      success: true,
      recordedAt: record.timestamp,
      initiatorKind: record.initiatorKind,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Telemetry ingestion failure",
      message: err.message,
    });
  }
});

/**
 * GET /api/telemetry
 * Retrieves recent telemetry spans, optionally filtered by ?nobodyWatching=true
 */
router.get("/", async (req: Request, res: Response) => {
  const nobodyWatching = req.query.nobodyWatching === "true" || req.query.nobodyWatching === "1";
  const initiatorKind = req.query.initiatorKind as string | undefined;

  let filtered = memoryTelemetryStore;
  if (nobodyWatching) {
    filtered = filtered.filter((e) => (e.initiatorKind || "person") !== "person");
  }
  if (initiatorKind) {
    filtered = filtered.filter((e) => (e.initiatorKind || "person") === initiatorKind);
  }

  return res.status(200).json({
    success: true,
    count: filtered.length,
    nobodyWatching,
    initiatorKind: initiatorKind || null,
    events: filtered.slice(-50),
  });
});

export default router;
