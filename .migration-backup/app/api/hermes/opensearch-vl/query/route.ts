import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { OpenSearchVLService } from "@/lib/infrastructure/opensearch-vl-service";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/opensearch-vl/query - Multimodal Vision-Language Deep Research Search
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const result = await OpenSearchVLService.searchVisionLanguage({
      query: body.query || "Analyze screen layout and search documentation",
      imageBase64: body.imageBase64,
      enableImageEnhancement: body.enableImageEnhancement,
      enableLayoutParsing: body.enableLayoutParsing,
    });

    logger.info("[api] OpenSearch-VL query completed", {
      sourcesCount: result.evidenceSources.length,
      durationMs: result.durationMs,
    });

    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    logger.error("[api] OpenSearch-VL query error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "OpenSearch-VL query failed",
        code: "OPENSEARCH_VL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
