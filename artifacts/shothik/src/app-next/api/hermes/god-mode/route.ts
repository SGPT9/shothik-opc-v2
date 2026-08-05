import { NextRequest } from "next/server";
import { GodModeRuntime } from "@/lib/infrastructure/god-mode-runtime";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/god-mode - Control God Mode 7-day autonomous sessions (start, pause, resume, tick)
 * GET /api/hermes/god-mode?sessionId=xyz - Check God Mode session status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "start";
    const sessionId = body.sessionId;

    if (action === "start") {
      const session = await GodModeRuntime.startGodModeSession({
        workspaceId: body.workspaceId || "ws_god_default",
        userId: body.userId || "usr_god_default",
        intent: body.intent || "7-Day Autonomous Growth & Dev Loop",
        durationDays: body.durationDays || 7,
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
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return Response.json({ error: "sessionId required", code: "MISSING_SESSION_ID" }, { status: 400 });
  }

  const session = GodModeRuntime.getSession(sessionId);
  if (!session) {
    return Response.json({ error: "Session not found", code: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  return Response.json({ data: session });
}
