/**
 * Hermes Interactive Terminal API Route
 * 
 * Provides API endpoints for spawning interactive shell processes, sending stdin,
 * terminating running sessions, and reading real-time output log buffers.
 */

import { defineRoute, z } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { HermesTerminalEngine } from "@/lib/hermes/modules/terminal-engine";
import logger from "@/lib/logger";

const TerminalPostBodySchema = z.object({
  action: z.enum(["spawn", "input", "kill"]).default("spawn"),
  workspaceId: z.string().min(1, "workspaceId is required"),
  runId: z.string().min(1, "runId is required"),
  command: z.string().optional(),
  sessionId: z.string().optional(),
  input: z.string().optional(),
});

const TerminalGetQuerySchema = z.object({
  sessionId: z.string().min(1, "sessionId parameter is required"),
});

function unauthorized() {
  return Response.json(
    {
      error: "Authentication required",
      code: "AUTH_REQUIRED",
      message: "Please sign in to execute interactive terminal sessions.",
    },
    { status: 401 }
  );
}

/**
 * POST /api/hermes/terminal - Spawn process, send stdin, or kill session
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/terminal",
  summary: "Spawn shell process, send stdin input, or kill terminal session",
  tags: ["Terminal", "Hermes"],
  schemas: {
    body: TerminalPostBodySchema,
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) return unauthorized();

    try {
      if (body.action === "spawn") {
        if (!body.command) {
          return Response.json({ error: "command is required to spawn terminal process", code: "MISSING_COMMAND" }, { status: 400 });
        }

        const session = await HermesTerminalEngine.createSession({
          workspaceId: body.workspaceId,
          runId: body.runId,
          command: body.command,
        });

        return Response.json({ data: session }, { status: 201 });
      }

      if (body.action === "input") {
        if (!body.sessionId || body.input === undefined) {
          return Response.json({ error: "sessionId and input are required", code: "MISSING_INPUT_PARAMS" }, { status: 400 });
        }

        const session = await HermesTerminalEngine.sendInput(body.sessionId, body.input);
        return Response.json({ data: session });
      }

      if (body.action === "kill") {
        if (!body.sessionId) {
          return Response.json({ error: "sessionId is required to kill terminal process", code: "MISSING_SESSION_ID" }, { status: 400 });
        }

        const session = await HermesTerminalEngine.killSession(body.sessionId);
        return Response.json({ data: session });
      }

      return Response.json({ error: "Invalid action", code: "INVALID_ACTION" }, { status: 400 });
    } catch (error: any) {
      logger.error("[api] Terminal operation failed", {
        userId: String(user._id),
        error: error.message,
      });

      return Response.json(
        {
          error: "Terminal operation failed",
          code: "TERMINAL_ERROR",
          message: error.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});

/**
 * GET /api/hermes/terminal?sessionId=xyz - Query terminal output log buffer
 */
export const GET = defineRoute({
  method: "get",
  path: "/api/hermes/terminal",
  summary: "Query interactive terminal session status and output buffer",
  tags: ["Terminal", "Hermes"],
  schemas: {
    query: TerminalGetQuerySchema,
  },
  handler: async ({ query }) => {
    const session = HermesTerminalEngine.getSession(query.sessionId);
    if (!session) {
      return Response.json({ error: "Terminal session not found", code: "SESSION_NOT_FOUND" }, { status: 404 });
    }

    return Response.json({ data: session });
  },
});
