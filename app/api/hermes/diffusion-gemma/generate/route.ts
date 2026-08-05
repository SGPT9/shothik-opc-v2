import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { DiffusionGemmaEngine } from "@/lib/infrastructure/diffusion-gemma-engine";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/diffusion-gemma/generate - 2,000+ tok/s DiffusionGemma ultra-fast inference
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const result = await DiffusionGemmaEngine.generate({
      prompt: body.prompt || "Synthesize instant response",
      systemPrompt: body.systemPrompt,
      maxTokens: body.maxTokens || 2048,
      multimodalImageBase64: body.multimodalImageBase64,
    });

    logger.info("[api] DiffusionGemma inference completed", {
      tokensPerSecond: result.tokensPerSecond,
      latencyMs: result.latencyMs,
    });

    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    logger.error("[api] DiffusionGemma inference error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "DiffusionGemma inference failed",
        code: "DIFFUSION_GEMMA_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
