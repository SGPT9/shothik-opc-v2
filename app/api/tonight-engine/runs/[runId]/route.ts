import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { getHermesOrchestrator } from "@/lib/hermes";
import logger from "@/lib/logger";

function unauthorized() {
  return Response.json(
    {
      error: "Authentication required",
      code: "TONIGHT_ENGINE_AUTH_REQUIRED",
      message: "Please sign in to access Tonight Engine telemetry.",
    },
    { status: 401 }
  );
}

/**
 * GET /api/tonight-engine/runs/[runId] - Fetch job telemetry context & SSE streaming
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) return unauthorized();

  const { runId } = await params;

  try {
    const hermes = getHermesOrchestrator();
    const context = await hermes.getRunContext(runId);
    const hotState = await hermes.events.getRunHotState(runId);

    if (!context) {
      return Response.json(
        { error: "Run not found", code: "RUN_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (context.run.userId !== String(user._id)) {
      return Response.json(
        { error: "Access denied", code: "ACCESS_DENIED" },
        { status: 403 }
      );
    }

    const accept = request.headers.get("accept");
    if (accept?.includes("text/event-stream")) {
      return new Response(context.streaming, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    return Response.json({
      data: {
        run: context.run,
        workspace: context.workspace,
        canResume: context.canResume,
        hotState,
      },
    });
  } catch (error) {
    logger.error("[api] Failed to fetch Tonight Engine run context", {
      runId,
      userId: String(user._id),
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Failed to get run context",
        code: "GET_TONIGHT_RUN_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
