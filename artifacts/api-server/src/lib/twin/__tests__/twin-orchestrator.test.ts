import { describe, it, expect } from "vitest";
import { TwinOrchestrator } from "../twin-orchestrator.js";

describe("Twin 5-Stage Operational Orchestrator (OPC Doctrine)", () => {
  const orchestrator = TwinOrchestrator.getInstance();

  it("completes a full 5-stage cycle for an autonomous sales inquiry", async () => {
    const signal = {
      source: "whatsapp" as const,
      payload: {
        text: "ভাই এই প্রিমিয়াম সাবস্ক্রিপশনের দাম কত? buy করতে চাই।",
        amount: 2500,
      },
      userId: "usr_test_founder_1",
      companySlug: "shothik_agency",
    };

    const result = await orchestrator.processCycle(signal);

    // 1. Observe
    expect(result.observation.inferredIntent).toBe("sales_conversion");
    expect(result.observation.urgency).toBe("critical");
    expect(result.observation.normalizedPayload.normalizedText).toBeDefined();

    // 2. Decide
    expect(result.decision.targetTwin).toBe("sales_twin");
    expect(result.decision.requiresHumanApproval).toBe(false);

    // 3. Execute
    expect(result.executionStatus).toBe("executed_autonomously");
    expect(result.twinOutput).toContain("[Sales Twin]");

    // 4. Learn & Audit
    expect(result.auditTrail.dshSessionId).toBeDefined();
    expect(result.auditTrail.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.auditTrail.learnedFactCount).toBeGreaterThanOrEqual(0);
  });

  it("routes logistics and courier signals to Operations Twin autonomously", async () => {
    const signal = {
      source: "steadfast_courier" as const,
      payload: {
        consignmentId: "ST-89412",
        status: "delivered",
        message: "পার্সেল সফলভাবে ডেলিভারি হয়েছে",
      },
      userId: "usr_test_founder_2",
      companySlug: "deshi_crafts",
    };

    const result = await orchestrator.processCycle(signal);

    expect(result.observation.inferredIntent).toBe("logistics_fulfillment");
    expect(result.decision.targetTwin).toBe("operations_twin");
    expect(result.executionStatus).toBe("executed_autonomously");
    expect(result.twinOutput).toContain("[Operations Twin]");
  });

  it("enforces Supervised Autonomy boundary when financial disbursement exceeds ৳10,000", async () => {
    const signal = {
      source: "mfs_bkash" as const,
      payload: {
        message: "Vendor supplier payout request via bKash",
        amount: 25000,
      },
      userId: "usr_test_founder_3",
      companySlug: "agro_mart",
    };

    const result = await orchestrator.processCycle(signal);

    expect(result.decision.requiresHumanApproval).toBe(true);
    expect(result.decision.approvalReason).toContain("৳10,000 threshold");
    expect(result.executionStatus).toBe("queued_for_human_approval");
    expect(result.twinOutput).toContain("Decision paused by Supervised Autonomy policy");
  });

  it("enforces Supervised Autonomy boundary for legal or contract commitments", async () => {
    const signal = {
      source: "manual_intent" as const,
      payload: {
        message: "ক্লায়েন্টের সাথে নতুন অফিস লিজ চুক্তি (contract agreement) স্বাক্ষর করুন",
      },
      userId: "usr_test_founder_4",
      companySlug: "dhaka_studios",
    };

    const result = await orchestrator.processCycle(signal);

    expect(result.decision.requiresHumanApproval).toBe(true);
    expect(result.decision.approvalReason).toContain("legal/contractual");
    expect(result.executionStatus).toBe("queued_for_human_approval");
  });

  it("normalizes regional dialects (e.g. Chatgaya) into standard Bengali in the Understand stage", async () => {
    const signal = {
      source: "whatsapp" as const,
      payload: {
        text: "জাহাজের মাল খালাস টেঁয়া কত কুরিয়ার পোঁছাই গেইয়ে",
      },
      userId: "usr_test_founder_5",
      companySlug: "ctg_retail",
    };

    const result = await orchestrator.processCycle(signal);

    expect(result.observation.regionalDialect).toBe("chatgaya");
    expect(result.observation.normalizedPayload.normalizedText).toContain("জাহাজের পণ্য খালাস");
    expect(result.observation.normalizedPayload.normalizedText).toContain("টাকা কত");
    expect(result.executionStatus).toBe("executed_autonomously");
  });
});
