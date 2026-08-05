import { NextRequest } from "next/server";
import { HermesTriggerGateway } from "@/lib/infrastructure/trigger-gateway";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/triggers/cron - Ingress endpoint for scheduled cron jobs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const scheduleId = body.scheduleId || `cron_${Date.now()}`;
    const cronPrompt = body.prompt;

    const result = await HermesTriggerGateway.handleCronSchedule(scheduleId, cronPrompt);

    logger.info("[api] Cron trigger processed", {
      scheduleId,
      triggered: result.triggered,
      runId: result.runId,
    });

    return Response.json({
      data: result,
    });
  } catch (error) {
    logger.error("[api] Cron trigger failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Cron trigger failed",
        code: "CRON_TRIGGER_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
