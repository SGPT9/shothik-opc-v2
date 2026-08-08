import { NextRequest } from "next/server";
import { HermesTriggerGateway } from "@/lib/infrastructure/trigger-gateway";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/triggers/webhook - Ingress endpoint for external webhooks (GitHub, InsForge, Stripe)
 */
export async function POST(request: NextRequest) {
  try {
    const provider = request.headers.get("x-provider") || request.headers.get("x-github-event") ? "github" : "generic";
    const body = await request.json().catch(() => ({}));

    const result = await HermesTriggerGateway.handleWebhook(provider, body);

    logger.info("[api] Webhook trigger processed", {
      provider,
      triggered: result.triggered,
      runId: result.runId,
    });

    return Response.json({
      data: result,
    });
  } catch (error) {
    logger.error("[api] Webhook ingress failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Webhook ingress failed",
        code: "WEBHOOK_INGRESS_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
