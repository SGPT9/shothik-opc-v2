import { Router, type Request, type Response } from "express";

const router = Router();

interface TelemetryEvent {
  event: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

const memoryTelemetryStore: TelemetryEvent[] = [];

/**
 * POST /api/telemetry
 * Ingests telemetry metrics, trace spans, and TTFT events
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { event, properties, userId, sessionId } = req.body;

    const record: TelemetryEvent = {
      event: event || "generic_metric",
      timestamp: new Date().toISOString(),
      properties: properties || {},
      userId,
      sessionId,
    };

    memoryTelemetryStore.push(record);
    if (memoryTelemetryStore.length > 500) {
      memoryTelemetryStore.shift();
    }

    return res.status(200).json({
      success: true,
      recordedAt: record.timestamp,
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
 * Retrieves recent telemetry spans
 */
router.get("/", async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    count: memoryTelemetryStore.length,
    events: memoryTelemetryStore.slice(-50),
  });
});

export default router;
