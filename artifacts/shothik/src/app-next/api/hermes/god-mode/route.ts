import { defineRoute, z } from "@/lib/api-validation";
import { GodModeRuntime } from "@/lib/infrastructure/god-mode-runtime";
import logger from "@/lib/logger";

const GodModePostBodySchema = z.object({
  action: z.enum(["start", "pause", "resume", "tick"]).default("start"),
  sessionId: z.string().optional(),
  workspaceId: z.string().default("ws_god_default"),
  userId: z.string().default("usr_god_default"),
  intent: z.string().default("7-Day Autonomous Growth & Dev Loop"),
  durationDays: z.number().int().min(1).max(30).default(7),
});

const GodModeGetQuerySchema = z.object({
  sessionId: z.string().min(1, "sessionId required"),
});

/**
 * POST /api/hermes/god-mode - Control God Mode 7-day autonomous sessions
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/god-mode",
  summary: "Control God Mode 7-day autonomous sessions (start, pause, resume, tick)",
  tags: ["GodMode", "Hermes"],
  schemas: {
    body: GodModePostBodySchema,
  },
  handler: async ({ body }) => {
    try {
      const { action, sessionId } = body;

      if (action === "start") {
        const session = await GodModeRuntime.startGodModeSession({
          workspaceId: body.workspaceId,
          userId: body.userId,
          intent: body.intent,
          durationDays: body.durationDays,
        });

        return Response.json({ data: session }, { status: 201 });
      }

      if (action === "pause" && sessionId) {
        const session = await GodModeRuntime.pauseGodModeSession(sessionId);
        return Response.json({ data: session });
      }

      if (action === "resume" && sessionId) {
        const session = await GodModeRuntime.resumeGodModeSession(sessionId);
        return Response.json({ data: session });
      }

      if (action === "tick" && sessionId) {
        const result = await GodModeRuntime.executeAutonomousTick(sessionId);
        return Response.json({ data: result });
      }

      return Response.json({ error: "Invalid action or missing sessionId", code: "INVALID_GOD_MODE_ACTION" }, { status: 400 });
    } catch (error) {
      logger.error("[api] God Mode control failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      return Response.json(
        {
          error: "God Mode execution failed",
          code: "GOD_MODE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});

/**
 * GET /api/hermes/god-mode?sessionId=xyz - Check God Mode session status
 */
export const GET = defineRoute({
  method: "get",
  path: "/api/hermes/god-mode",
  summary: "Check God Mode autonomous session status",
  tags: ["GodMode", "Hermes"],
  schemas: {
    query: GodModeGetQuerySchema,
  },
  handler: async ({ query }) => {
    const session = GodModeRuntime.getSession(query.sessionId);
    if (!session) {
      return Response.json({ error: "Session not found", code: "SESSION_NOT_FOUND" }, { status: 404 });
    }

    return Response.json({ data: session });
  },
});
