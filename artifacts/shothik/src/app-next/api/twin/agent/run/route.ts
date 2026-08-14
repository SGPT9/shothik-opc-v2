import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { TonightGraphRuntime } from "@/lib/tonight-engine/tonight-graph-runtime";
import { MonetizationPaywallService } from "@/lib/infrastructure/monetization-paywall-service";
import { InsForgeAuthRlsService } from "@/lib/insforge/auth-rls-service";
import logger from "@/lib/logger";

export const AGENT_CREDIT_RATES: Record<string, { label: string; creditCost: number }> = {
  ceo_orchestrator: { label: "CEO & Wayfinder Orchestrator", creditCost: 5 },
  business_planner: { label: "Business Planning & PRD Synthesis", creditCost: 5 },
  competitor_research: { label: "Competitor Intelligence & Ad Spy", creditCost: 3 },
  social_media: { label: "Social Media Auto-Post (Twitter/X)", creditCost: 1 },
  email_outreach: { label: "B2B Cold Email Outreach Cadence", creditCost: 2 },
  customer_support: { label: "Customer Support & Triage Reply", creditCost: 1 },
  ads_manager: { label: "Meta & Google Ads Campaign Manager", creditCost: 5 },
  finance_controller: { label: "Finance & 1.85% MFS P&L Controller", creditCost: 2 },
  code_generator: { label: "Code Generation & Dokploy Deployment", creditCost: 5 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId = "comp_verifiq",
      userId = "usr_founder_1",
      taskId = `task_${Date.now()}`,
      prompt,
      agentKey = "code_generator",
      depth = "standard",
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required 'prompt' field in payload." },
        { status: 400 }
      );
    }

    const agentRate = AGENT_CREDIT_RATES[agentKey] || AGENT_CREDIT_RATES.code_generator;
    const runId = `run_${randomUUID()}`;

    logger.info("[twin-agent-api] Received autonomous agent execution request", {
      companyId,
      userId,
      taskId,
      agentKey,
      creditCost: agentRate.creditCost,
    });

    // 1. Enforce Row-Level Security (RLS) check
    const rlsCheck = await InsForgeAuthRlsService.verifyWorkspaceRlsPolicy(companyId, userId);
    if (!rlsCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Forbidden: InsForge RLS policy violation." },
        { status: 403 }
      );
    }

    // 2. Atomically verify and deduct credits
    const deduction = MonetizationPaywallService.deductCredits(userId, "cofounder_tam_analysis");

    // 3. Dispatch into TonightGraphRuntime
    const graphState = await TonightGraphRuntime.executeGraph({
      runId,
      workspaceId: companyId,
      userId,
      prompt,
      depth: depth as "quick" | "standard" | "deep",
    });

    logger.info("[twin-agent-api] Successfully completed autonomous graph execution", {
      runId,
      activeNode: graphState.activeNode,
      finalReportLength: graphState.finalReport.length,
      creditsDeducted: agentRate.creditCost,
    });

    return NextResponse.json({
      success: true,
      runId,
      companyId,
      taskId,
      agentKey,
      agentLabel: agentRate.label,
      creditsDeducted: agentRate.creditCost,
      remainingCredits: deduction.remainingCredits,
      state: {
        activeNode: graphState.activeNode,
        topology: graphState.topology,
        plan: graphState.plan,
        finalReport: graphState.finalReport,
        leadsCount: graphState.leadsCount,
        postsCount: graphState.postsCount,
      },
      completedAt: Date.now(),
    });
  } catch (error: any) {
    logger.error("[twin-agent-api] Execution error during autonomous agent run", {
      error: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error during agent dispatch",
      },
      { status: 500 }
    );
  }
}
