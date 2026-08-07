import { defineRoute, z } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { DeerFlowEngine } from "@/lib/hermes/modules/deerflow-engine";
import logger from "@/lib/logger";

const ExecuteDeerFlowCommandSchema = z.object({
  workspaceId: z.string().default("ws_df_default"),
  goal: z.string().min(3, "Goal must be at least 3 characters"),
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
});

/**
 * POST /api/hermes/deerflow - Execute DeepSeek-powered DeerFlow DAG workflow
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/deerflow",
  summary: "Execute DeepSeek-powered DeerFlow DAG workflow with Semantic RAG + ODS",
  tags: ["DeerFlow", "Hermes"],
  schemas: {
    body: ExecuteDeerFlowCommandSchema,
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
      const plan = await DeerFlowEngine.executeWorkflow(
        body.workspaceId,
        body.goal,
        body.prompt
      );

      logger.info("[api] DeerFlow workflow executed successfully", {
        workflowId: plan.workflowId,
        status: plan.status,
        overallLatencyMs: plan.overallLatencyMs,
      });

      return Response.json({ data: plan }, { status: 200 });
    } catch (error) {
      logger.error("[api] DeerFlow workflow execution failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      return Response.json(
        {
          error: "DeerFlow workflow execution failed",
          code: "DEERFLOW_EXECUTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});
