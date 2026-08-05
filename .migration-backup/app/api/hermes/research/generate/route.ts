import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { getHermesResearchOrchestrator } from "@/lib/hermes";
import logger from "@/lib/logger";
import { z } from "zod";

function unauthorized() {
  return Response.json(
    {
      error: "Authentication required",
      code: "HERMES_AUTH_REQUIRED",
      message: "Please sign in to execute research runs.",
    },
    { status: 401 }
  );
}

const GenerateResearchRequestSchema = z.object({
  workspaceId: z.string().min(1),
  query: z.string().min(1).optional(),
  topic: z.string().min(1).optional(),
  depth: z.enum(["quick", "standard", "deep"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine((data) => !!(data.query || data.topic), {
  message: "Either 'query' or 'topic' must be provided",
  path: ["query"],
});

/**
 * POST /api/hermes/research/generate - Initiate a deep web research run
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) return unauthorized();

  try {
    const body = await request.json();
    const validated = GenerateResearchRequestSchema.parse(body);
    const searchQuery = validated.query || validated.topic || "";

    const researchOrchestrator = getHermesResearchOrchestrator();
    const result = await researchOrchestrator.generateResearch({
      workspaceId: validated.workspaceId,
      userId: String(user._id),
      query: searchQuery,
      depth: validated.depth,
      metadata: validated.metadata,
    });

    logger.info("[api] Research run dispatched successfully", {
      runId: result.runId,
      artifactId: result.artifactId,
      userId: String(user._id),
    });

    return Response.json(
      {
        data: {
          runId: result.runId,
          artifactId: result.artifactId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: "Invalid request body",
          code: "VALIDATION_ERROR",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error("[api] Failed to start research run", {
      userId: String(user._id),
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Failed to start research run",
        code: "RESEARCH_RUN_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
