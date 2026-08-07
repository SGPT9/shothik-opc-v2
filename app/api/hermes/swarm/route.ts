/**
 * Hermes Multi-Agent Swarm Topology API Route
 * 
 * Provides API endpoints for creating multi-agent swarms, triggering agent handoffs,
 * and querying active agent swarm topology state.
 */

import { defineRoute, z } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { HermesSwarmOrchestrator, type SwarmAgentRole } from "@/lib/hermes/modules/swarm-orchestrator";
import logger from "@/lib/logger";

const SwarmAgentRoleSchema = z.enum(["researcher", "writer", "coder", "reviewer"]);

const SwarmPostBodySchema = z.object({
  action: z.enum(["create", "handoff"]).default("create"),
  workspaceId: z.string().min(1, "workspaceId is required"),
  runId: z.string().min(1, "runId is required"),
  initialRole: SwarmAgentRoleSchema.optional(),
  swarmId: z.string().optional(),
  fromRole: SwarmAgentRoleSchema.optional(),
  toRole: SwarmAgentRoleSchema.optional(),
  taskPayload: z.record(z.string(), z.unknown()).optional(),
});

const SwarmGetQuerySchema = z.object({
  swarmId: z.string().min(1, "swarmId parameter is required"),
});

function unauthorized() {
  return Response.json(
    {
      error: "Authentication required",
      code: "AUTH_REQUIRED",
      message: "Please sign in to manage multi-agent swarms.",
    },
    { status: 401 }
  );
}

/**
 * POST /api/hermes/swarm - Create swarm or trigger agent handoffs
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/swarm",
  summary: "Create multi-agent swarm or trigger inter-agent handoff",
  tags: ["Swarm", "Hermes"],
  schemas: {
    body: SwarmPostBodySchema,
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) return unauthorized();

    try {
      if (body.action === "create") {
        const swarm = await HermesSwarmOrchestrator.createSwarm({
          workspaceId: body.workspaceId,
          runId: body.runId,
          initialRole: body.initialRole,
        });

        return Response.json({ data: swarm }, { status: 201 });
      }

      if (body.action === "handoff") {
        if (!body.swarmId || !body.fromRole || !body.toRole) {
          return Response.json(
            {
              error: "Missing parameters for handoff",
              code: "MISSING_HANDOFF_PARAMS",
              message: "swarmId, fromRole, and toRole are required for handoffs.",
            },
            { status: 400 }
          );
        }

        const swarm = await HermesSwarmOrchestrator.triggerHandoff({
          swarmId: body.swarmId,
          workspaceId: body.workspaceId,
          runId: body.runId,
          fromRole: body.fromRole,
          toRole: body.toRole,
          taskPayload: body.taskPayload || {},
          userId: String(user._id),
        });

        return Response.json({ data: swarm });
      }

      return Response.json({ error: "Invalid action", code: "INVALID_ACTION" }, { status: 400 });
    } catch (error: any) {
      logger.error("[api] Swarm orchestration failed", {
        userId: String(user._id),
        error: error.message,
      });

      return Response.json(
        {
          error: "Swarm operation failed",
          code: "SWARM_ERROR",
          message: error.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});

/**
 * GET /api/hermes/swarm?swarmId=xyz - Query active swarm topology
 */
export const GET = defineRoute({
  method: "get",
  path: "/api/hermes/swarm",
  summary: "Query active multi-agent swarm topology state",
  tags: ["Swarm", "Hermes"],
  schemas: {
    query: SwarmGetQuerySchema,
  },
  handler: async ({ query }) => {
    const swarm = HermesSwarmOrchestrator.getSwarm(query.swarmId);
    if (!swarm) {
      return Response.json({ error: "Swarm not found", code: "SWARM_NOT_FOUND" }, { status: 404 });
    }

    return Response.json({ data: swarm });
  },
});
