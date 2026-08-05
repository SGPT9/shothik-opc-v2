import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { VtuberPresenterService } from "@/lib/infrastructure/vtuber-presenter";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/vtuber/session - Start Open-LLM-VTuber live avatar presenter session
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const session = await VtuberPresenterService.startPresenterSession({
      workspaceId: body.workspaceId || "ws_vtb_default",
      avatarModel: body.avatarModel || "shothik_vrm_default.vrm",
      voiceEngine: body.voiceEngine || "edge-tts",
      language: body.language || "en",
      enableVAD: body.enableVAD ?? true,
      enableVision: body.enableVision ?? true,
      mcpToolsEnabled: body.mcpToolsEnabled || ["web_search", "papermark_analytics", "pipedream_oauth"],
    });

    logger.info("[api] VTuber session created successfully", {
      sessionId: session.sessionId,
      websocketUrl: session.websocketUrl,
    });

    return Response.json({ data: session }, { status: 201 });
  } catch (error) {
    logger.error("[api] VTuber session creation failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "VTuber session initialization failed",
        code: "VTUBER_SESSION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
