import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { AddyOsmaniSkillsService } from "@/lib/infrastructure/addyosmani-skills-service";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/skills/lifecycle - Execute Addy Osmani 8-stage lifecycle commands
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const result = await AddyOsmaniSkillsService.executeLifecycleCommand({
      command: body.command || "/build",
      targetPath: body.targetPath,
      autoExecute: body.autoExecute || false,
    });

    logger.info("[api] Addy Osmani lifecycle command executed", {
      command: result.command,
      stage: result.lifecycleStage,
    });

    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    logger.error("[api] Lifecycle command execution error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Lifecycle command execution failed",
        code: "LIFECYCLE_COMMAND_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
