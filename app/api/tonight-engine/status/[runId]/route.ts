/**
 * GET /api/tonight-engine/status/[runId]
 *
 * Lightweight polling endpoint for overnight job status.
 * Returns JSON snapshot from Redis hot-state — O(1), no DB query.
 * Useful for UI polling when the client doesn't want a persistent SSE connection.
 *
 * Response:
 *   { status, progressPercent, currentStep, estimatedCompletion, modelLabel, artifactUrl? }
 */

import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { getHermesDatabase } from "@/lib/hermes/infra/db";
import { getTonightEngineQueue } from "@/lib/tonight-engine/tonight-engine-queue";
import logger from "@/lib/logger";

function unauthorized() {
  return Response.json(
    { error: "Authentication required", code: "AUTH_REQUIRED" },
    { status: 401 }
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) return unauthorized();

  const { runId } = await params;

  try {
    // Auth check: verify the run belongs to this user
    const db = getHermesDatabase();
    const run = await db.getRun(runId);

    if (!run) {
      return Response.json(
        { error: "Job not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (run.userId !== String(user._id)) {
      return Response.json(
        { error: "Access denied", code: "ACCESS_DENIED" },
        { status: 403 }
      );
    }

    // Get rich status from queue service (Redis hot-state + DB)
    const queue = getTonightEngineQueue();
    const jobStatus = await queue.getJobStatus(runId);

    if (!jobStatus) {
      return Response.json(
        { error: "Job status unavailable", code: "STATUS_UNAVAILABLE" },
        { status: 404 }
      );
    }

    return Response.json({ data: jobStatus });
  } catch (err) {
    logger.error("[tonight-engine] Status check failed", {
      runId,
      userId: String(user._id),
      error: err instanceof Error ? err.message : String(err),
    });

    return Response.json(
      {
        error: "Failed to get job status",
        code: "STATUS_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
