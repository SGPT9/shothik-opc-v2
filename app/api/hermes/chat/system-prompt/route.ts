import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { ShothikSystemPromptEngine } from "@/lib/infrastructure/shothik-system-prompt";

/**
 * GET /api/hermes/chat/system-prompt - Fetch Shothik AI System Prompt v3.0
 */
export async function GET(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  const userName = user?.name || "Developer";

  const prompt = ShothikSystemPromptEngine.generateSystemPrompt({
    userName,
    enableWigoloWebSearch: true,
    enableGortexCodeGraph: true,
    enableDiffusionGemma: true,
    enableArtifactCanvas: true,
  });

  return Response.json({
    data: {
      version: "3.0.0",
      systemPrompt: prompt,
    },
  });
}
