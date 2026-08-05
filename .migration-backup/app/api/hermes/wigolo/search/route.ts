import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { WigoloWebIntelligenceService } from "@/lib/infrastructure/wigolo-service";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/wigolo/search - Keyless local-first web intelligence search
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const searchResult = await WigoloWebIntelligenceService.searchWeb({
      query: body.query || "Autonomous AI agent architecture",
      domains: body.domains,
      maxResults: body.maxResults || 10,
      timeRange: body.timeRange,
    });

    logger.info("[api] Wigolo search completed", {
      totalFound: searchResult.totalFound,
      query: searchResult.query,
    });

    return Response.json({ data: searchResult }, { status: 200 });
  } catch (error) {
    logger.error("[api] Wigolo search error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Wigolo web intelligence failed",
        code: "WIGOLO_SEARCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
