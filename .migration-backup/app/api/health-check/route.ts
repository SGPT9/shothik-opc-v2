import { NextResponse } from "next/server";
import { diagnoseConvexJwtConfig, getConvexSiteUrl } from "@/lib/convex/auth-diagnostics";
import { verifyChatVendorAdaptation } from "@/lib/hermes/modules/chat-orchestrator/vendor-manager";

export async function GET() {
  const timestamp = new Date().toISOString();
  
  // 1. Diagnose Convex JWT & RS256 Keypair
  const convexDiagnostics = diagnoseConvexJwtConfig();
  
  // 2. Resolve Convex Site URL
  let siteUrl = "";
  try {
    siteUrl = getConvexSiteUrl();
  } catch (e) {
    siteUrl = "error";
  }

  // 3. Check OpenRouter API Key & Transport Adaptation
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  const openRouterAdaptationValid = verifyChatVendorAdaptation({
    selection: {
      provider: "gemini",
      model: "gemini-2.5-flash",
      modelHandle: "gemini/gemini-2.5-flash",
      transport: hasOpenRouterKey ? "openai_sse" : "gemini_sse",
      apiKey: process.env.OPENROUTER_API_KEY || undefined,
      baseUrl: hasOpenRouterKey ? "https://openrouter.ai/api/v1" : "https://generativelanguage.googleapis.com",
      priority: 10,
    },
    backend: "direct_provider",
    expectedTransport: "gemini_sse",
  });

  // 4. InsForge Backend Health
  const hasInsforgeUrl = Boolean(process.env.NEXT_PUBLIC_INSFORGE_URL?.trim());
  const hasInsforgeKey = Boolean(process.env.INSFORGE_API_KEY?.trim());

  const isHealthy =
    convexDiagnostics.status === "healthy" &&
    hasOpenRouterKey &&
    openRouterAdaptationValid &&
    hasInsforgeUrl &&
    hasInsforgeKey;

  return NextResponse.json({
    status: isHealthy ? "ok" : "degraded",
    timestamp,
    checks: {
      convexAuth: {
        status: convexDiagnostics.status,
        issueCode: convexDiagnostics.issueCode ?? null,
        keypairMatches: convexDiagnostics.keypairMatches,
        siteUrl,
      },
      openRouterStream: {
        configured: hasOpenRouterKey,
        adaptationValid: openRouterAdaptationValid,
        resolvedTransport: hasOpenRouterKey ? "openai_sse" : "gemini_sse",
      },
      insforgeBackend: {
        configured: hasInsforgeUrl && hasInsforgeKey,
      },
    },
  }, { status: isHealthy ? 200 : 503 });
}
