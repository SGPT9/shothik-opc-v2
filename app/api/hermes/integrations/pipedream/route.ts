import { NextRequest } from "next/server";
import { PipedreamConnectService } from "@/lib/infrastructure/pipedream-connect";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/integrations/pipedream - Pipedream Connect action execution & OAuth config generator
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || "run_action";

    if (mode === "get_config") {
      const config = PipedreamConnectService.getConnectConfig({
        externalUserId: body.externalUserId || "usr_guest",
        app: body.app || "facebook",
        oauthAppId: body.oauthAppId,
      });
      return Response.json({ data: config });
    }

    const actionResult = await PipedreamConnectService.runAction({
      actionId: body.actionId || "facebook-post-message",
      externalUserId: body.externalUserId || "usr_guest",
      params: body.params,
    });

    return Response.json({ data: actionResult });
  } catch (error) {
    logger.error("[api] Pipedream Connect integration error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Pipedream action failed",
        code: "PIPEDREAM_ACTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
