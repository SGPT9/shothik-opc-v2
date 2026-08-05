import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { GortexKnowledgeVaultService } from "@/lib/infrastructure/gortex-service";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/gortex/index - Index multi-repository AST knowledge graph & skills
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const result = await GortexKnowledgeVaultService.indexKnowledgeVault({
      workspaceId: body.workspaceId || "ws_gortex_default",
      repoPaths: body.repoPaths || ["c:\\Users\\USER\\hermes\\shothik-web-mirror-v2"],
      pdfPaths: body.pdfPaths || [],
      skillsPaths: body.skillsPaths || [".agents/skills"],
    });

    logger.info("[api] Gortex AST Knowledge graph indexed successfully", {
      workspaceId: result.workspaceId,
      totalSymbolsFound: result.totalSymbolsFound,
    });

    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    logger.error("[api] Gortex knowledge graph index error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Gortex knowledge graph indexing failed",
        code: "GORTEX_INDEX_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
