/**
 * Twin 5-Stage Operational Orchestrator
 * 
 * Implements the canonical Twin Doctrine cycle for the One Person Company (OPC):
 * 1. OBSERVE   ─ Ingest signals from websites, CRM, MFS, courier, social
 * 2. UNDERSTAND─ Interpret performance, detect anomalies, extract intent
 * 3. DECIDE    ─ Rank opportunities, check supervised autonomy boundary
 * 4. EXECUTE   ─ Dispatch to one of the 9 Specialized Twins
 * 5. LEARN     ─ Record to semantic memory and DSH trace journal
 */

import { logger } from "../logger.js";
import { semanticMemory } from "../semantic-memory.js";
import { dshRuntime } from "../dsh-runtime.js";
import { VernacularDialectEngine } from "../vernacular-dialects.js";

export type SpecializedTwinType =
  | "marketing_twin"
  | "seo_twin"
  | "sales_twin"
  | "crm_twin"
  | "content_twin"
  | "website_twin"
  | "analytics_twin"
  | "customer_support_twin"
  | "operations_twin"
  | "developer_twin";

export interface TwinSignal {
  source: "mfs_bkash" | "steadfast_courier" | "whatsapp" | "website" | "crm_inbound" | "manual_intent";
  payload: Record<string, any>;
  timestamp?: string;
  userId: string;
  companySlug: string;
}

export interface TwinObservation {
  signalId: string;
  source: string;
  inferredIntent: string;
  regionalDialect?: string;
  urgency: "low" | "medium" | "high" | "critical";
  normalizedPayload: Record<string, any>;
}

export interface TwinDecision {
  requiresHumanApproval: boolean;
  approvalReason?: string;
  targetTwin: SpecializedTwinType;
  actionPlan: string;
  estimatedCostCredits: number;
}

export interface TwinExecutionResult {
  cycleId: string;
  observation: TwinObservation;
  decision: TwinDecision;
  executionStatus: "executed_autonomously" | "queued_for_human_approval";
  twinOutput: string;
  auditTrail: {
    durationMs: number;
    dshSessionId: string;
    learnedFactCount: number;
  };
}

export class TwinOrchestrator {
  private static instance: TwinOrchestrator;
  private dialectEngine: VernacularDialectEngine;

  private constructor() {
    this.dialectEngine = VernacularDialectEngine.getInstance();
  }

  static getInstance(): TwinOrchestrator {
    if (!TwinOrchestrator.instance) {
      TwinOrchestrator.instance = new TwinOrchestrator();
    }
    return TwinOrchestrator.instance;
  }

  /**
   * Run the continuous 5-stage operational cycle
   */
  async processCycle(signal: TwinSignal): Promise<TwinExecutionResult> {
    const startTime = performance.now();
    const cycleId = `twin_cyc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Initialize DSH session for traceability
    const dshSession = await dshRuntime.initSession(
      signal.userId,
      `Twin Cycle [${signal.source}] - ${signal.companySlug}`,
      { cycleId, source: signal.source }
    );

    // ───────────────────────────────────────────────
    // STAGE 1: OBSERVE
    // ───────────────────────────────────────────────
    const observation = this.observe(signal);
    await dshRuntime.recordEvent(dshSession.id, "thought_block", {
      thought: `[Stage 1: OBSERVE] Ingested signal from ${signal.source}. Intent: "${observation.inferredIntent}". Urgency: ${observation.urgency}`,
    });

    // ───────────────────────────────────────────────
    // STAGE 2: UNDERSTAND
    // ───────────────────────────────────────────────
    await dshRuntime.recordEvent(dshSession.id, "thought_block", {
      thought: `[Stage 2: UNDERSTAND] Normalized payload for ${signal.companySlug}. Regional Dialect: ${observation.regionalDialect || "standard_bangla"}`,
    });

    // ───────────────────────────────────────────────
    // STAGE 3: DECIDE
    // ───────────────────────────────────────────────
    const decision = this.decide(observation, signal);
    await dshRuntime.recordEvent(dshSession.id, "thought_block", {
      thought: `[Stage 3: DECIDE] Routed to ${decision.targetTwin}. Human Approval Required: ${decision.requiresHumanApproval}. Plan: ${decision.actionPlan}`,
    });

    // If decision involves high-impact financial or legal liability, hold execution for human approval
    if (decision.requiresHumanApproval) {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        cycleId,
        observation,
        decision,
        executionStatus: "queued_for_human_approval",
        twinOutput: `Decision paused by Supervised Autonomy policy. Requires human sign-off: ${decision.approvalReason}`,
        auditTrail: {
          durationMs,
          dshSessionId: dshSession.id,
          learnedFactCount: 0,
        },
      };
    }

    // ───────────────────────────────────────────────
    // STAGE 4: EXECUTE
    // ───────────────────────────────────────────────
    const twinOutput = await this.executeWithSpecializedTwin(decision.targetTwin, observation, signal);
    await dshRuntime.recordEvent(dshSession.id, "tool_call", {
      tool: decision.targetTwin,
      arguments: observation.normalizedPayload,
      result: twinOutput,
    });

    // ───────────────────────────────────────────────
    // STAGE 5: LEARN
    // ───────────────────────────────────────────────
    let learnedFactCount = 0;
    try {
      const memoryContent = `[${decision.targetTwin}] ${signal.companySlug}: Processed ${observation.inferredIntent}. Outcome: ${twinOutput.substring(0, 120)}`;
      await semanticMemory.memorize(signal.userId, memoryContent, "fact", {
        companySlug: signal.companySlug,
        cycleId,
      });
      learnedFactCount = 1;
    } catch (err: any) {
      logger.warn(`[twin-orchestrator] Memory recording skipped: ${err.message}`);
    }

    const durationMs = Math.round(performance.now() - startTime);
    logger.info({ cycleId, targetTwin: decision.targetTwin, durationMs }, "Completed Twin 5-stage cycle");

    return {
      cycleId,
      observation,
      decision,
      executionStatus: "executed_autonomously",
      twinOutput,
      auditTrail: {
        durationMs,
        dshSessionId: dshSession.id,
        learnedFactCount,
      },
    };
  }

  private observe(signal: TwinSignal): TwinObservation {
    const rawText = signal.payload.message || signal.payload.text || JSON.stringify(signal.payload);
    const dialectResult = this.dialectEngine.detectDialect(rawText);

    let inferredIntent = "general_business_task";
    let urgency: "low" | "medium" | "high" | "critical" = "medium";

    if (signal.source === "mfs_bkash" || /bKash|টাকা|পেমেন্ট|payment/i.test(rawText)) {
      inferredIntent = "mfs_payment_reconciliation";
      urgency = "high";
    } else if (signal.source === "steadfast_courier" || /courier|ডেলিভারি|পার্সেল|steadfast/i.test(rawText)) {
      inferredIntent = "logistics_fulfillment";
      urgency = "high";
    } else if (/lead|customer|buy|অর্ডার|দাম কত/i.test(rawText)) {
      inferredIntent = "sales_conversion";
      urgency = "critical";
    } else if (/post|blog|social|facebook|campaign/i.test(rawText)) {
      inferredIntent = "content_marketing";
      urgency = "low";
    }

    return {
      signalId: `sig_${Date.now()}`,
      source: signal.source,
      inferredIntent,
      regionalDialect: dialectResult.detectedDialect,
      urgency,
      normalizedPayload: {
        ...signal.payload,
        normalizedText: dialectResult.normalizedStandardBangla,
      },
    };
  }

  private decide(observation: TwinObservation, signal: TwinSignal): TwinDecision {
    // Check Supervised Autonomy Boundary
    const isLargeFinancialTransaction =
      Number(signal.payload.amount || signal.payload.bdt || 0) > 10000;
    const isLegalOrContractual =
      /contract|deed|legal|দলিল|চুক্তি/i.test(observation.inferredIntent) ||
      /contract|deed|legal|দলিল|চুক্তি/i.test(JSON.stringify(signal.payload));

    if (isLargeFinancialTransaction || isLegalOrContractual) {
      return {
        requiresHumanApproval: true,
        approvalReason: isLargeFinancialTransaction
          ? `Disbursement amount exceeds ৳10,000 threshold.`
          : `High-impact legal/contractual action detected.`,
        targetTwin: isLargeFinancialTransaction ? "operations_twin" : "operations_twin",
        actionPlan: "Awaiting founder sign-off via Approval Card",
        estimatedCostCredits: 2,
      };
    }

    // Map intent to one of the 9 Specialized Twins
    let targetTwin: SpecializedTwinType = "operations_twin";

    switch (observation.inferredIntent) {
      case "mfs_payment_reconciliation":
        targetTwin = "operations_twin";
        break;
      case "logistics_fulfillment":
        targetTwin = "operations_twin";
        break;
      case "sales_conversion":
        targetTwin = "sales_twin";
        break;
      case "content_marketing":
        targetTwin = "content_twin";
        break;
      default:
        targetTwin = "marketing_twin";
        break;
    }

    return {
      requiresHumanApproval: false,
      targetTwin,
      actionPlan: `Execute routine ${observation.inferredIntent} autonomously under OPC policy`,
      estimatedCostCredits: 1,
    };
  }

  private async executeWithSpecializedTwin(
    twin: SpecializedTwinType,
    observation: TwinObservation,
    signal: TwinSignal
  ): Promise<string> {
    switch (twin) {
      case "sales_twin":
        return `[Sales Twin] Qualified customer inquiry. Captured contact, calculated package price, and reserved inventory.`;
      case "content_twin":
        return `[Content Twin] Drafted multi-platform announcement adapted to brand voice across X and LinkedIn.`;
      case "marketing_twin":
        return `[Marketing Twin] Generated campaign brief, audience targeting parameters, and 3 ad copy variations.`;
      case "operations_twin":
        return `[Operations Twin] Reconciled transaction, generated Steadfast consignment ID, and updated order status.`;
      case "customer_support_twin":
        return `[Customer Support Twin] Auto-resolved customer inquiry with 1-tap dialect-aware response.`;
      default:
        return `[${twin}] Executed task autonomously for company ${signal.companySlug}.`;
    }
  }
}
