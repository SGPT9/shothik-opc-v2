/**
 * Hermes Research & Deep Search Generation API Route
 * 
 * Provides artifact-first research report generation through the Hermes Research Orchestrator backend.
 */

import { defineRoute } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { getHermesResearchOrchestrator } from "@/lib/hermes/modules/research-orchestrator";
import { GenerateResearchReportCommandSchema } from "@/lib/hermes/contracts/research";
import logger from "@/lib/logger";

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

/**
 * POST /api/hermes/research/generate - Initiate a deep web research run
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/research/generate",
  summary: "Initiate an artifact-first deep web research run",
  tags: ["Research", "Hermes"],
  schemas: {
    body: GenerateResearchReportCommandSchema.omit({ userId: true, requestId: true }).extend({
      requestId: GenerateResearchReportCommandSchema.shape.requestId.optional(),
    }),
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) return unauthorized();

    try {
      const validated = GenerateResearchReportCommandSchema.parse({
        requestId: body.requestId || `research-${Date.now()}`,
        userId: String(user._id),
        ...body,
      });

      const researchOrchestrator = getHermesResearchOrchestrator();
      const result = await researchOrchestrator.generateResearch({
        workspaceId: validated.workspaceId,
        userId: String(user._id),
        query: validated.topic,
        depth: validated.depth,
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
    } catch (error: any) {
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
  },
});
