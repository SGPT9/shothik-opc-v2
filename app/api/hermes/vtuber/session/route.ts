import { defineRoute, z } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { VtuberPresenterService } from "@/lib/infrastructure/vtuber-presenter";
import logger from "@/lib/logger";

const VtuberSessionBodySchema = z.object({
  workspaceId: z.string().default("ws_vtb_default"),
  avatarModel: z.string().default("shothik_vrm_default.vrm"),
  voiceEngine: z.enum(["edge-tts", "gpt-sovits", "sherpa-onnx"]).default("edge-tts"),
  language: z.enum(["en", "bn", "hi", "es"]).default("en"),
  enableVAD: z.boolean().default(true),
  enableVision: z.boolean().default(true),
  mcpToolsEnabled: z.array(z.string()).default(["web_search", "papermark_analytics", "pipedream_oauth"]),
});

/**
 * POST /api/hermes/vtuber/session - Start Open-LLM-VTuber live avatar presenter session
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/vtuber/session",
  summary: "Start Open-LLM-VTuber live avatar presenter session",
  tags: ["VTuber", "Hermes"],
  schemas: {
    body: VtuberSessionBodySchema,
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
      const session = await VtuberPresenterService.startPresenterSession({
        workspaceId: body.workspaceId,
        avatarModel: body.avatarModel,
        voiceEngine: body.voiceEngine,
        language: body.language,
        enableVAD: body.enableVAD,
        enableVision: body.enableVision,
        mcpToolsEnabled: body.mcpToolsEnabled,
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
  },
});
