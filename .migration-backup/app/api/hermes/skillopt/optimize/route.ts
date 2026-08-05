import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { SkillOptService } from "@/lib/infrastructure/skillopt-service";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/skillopt/optimize - Execute SkillOpt self-evolving skill optimization
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const result = await SkillOptService.optimizeSkill({
      skillSlug: body.skillSlug || "skillopt",
      validationScore: body.validationScore || 72.5,
      rolloutFeedback: body.rolloutFeedback || ["Clarify bounded diff constraints", "Add rejected edit buffer"],
    });

    logger.info("[api] SkillOpt optimization completed", {
      skillSlug: result.skillSlug,
      accuracyGainPoints: result.accuracyGainPoints,
    });

    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    logger.error("[api] SkillOpt optimization error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "SkillOpt optimization failed",
        code: "SKILLOPT_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
