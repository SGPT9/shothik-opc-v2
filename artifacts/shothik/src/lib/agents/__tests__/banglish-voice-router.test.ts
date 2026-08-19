import { describe, it, expect } from "vitest";
import { BanglishVoiceRouter } from "../banglish-voice-router";

describe("🎙️ Banglish Voice Intent Router TDD Suite", () => {
  it("should decompose complex multi-intent Banglish speech into parallel subagent tasks", () => {
    const router = new BanglishVoiceRouter();
    const spokenInput = "Bhai, Tanveer er Steadfast parcel ta track koren ar ৳150 advance bKash payse kina check koren";

    const plan = router.decomposeIntent(spokenInput);

    expect(plan.detectedLanguage).toBe("banglish");
    expect(plan.confidence).toBeGreaterThan(0.9);
    expect(plan.parallelTasks.length).toBe(2);

    // Logistics task
    expect(plan.parallelTasks[0].assignedAgent).toBe("logistics_agent");
    expect(plan.parallelTasks[0].payload.preferredCarrier).toBe("steadfast");
    expect(plan.parallelTasks[0].payload.customerName).toBe("Tanveer");

    // MFS task
    expect(plan.parallelTasks[1].assignedAgent).toBe("sales_twin");
    expect(plan.parallelTasks[1].payload.requestedPrice).toBe(150);
    expect(plan.parallelTasks[1].payload.provider).toBe("bkash");

    expect(plan.spokenResponseText).toContain("Shothik Swarm 2 ti task");
  });

  it("should execute voice plan across peer agents in parallel", async () => {
    const router = new BanglishVoiceRouter();
    const plan = router.decomposeIntent(
      "Bhai, Tanveer er Steadfast parcel ta track koren ar ৳150 advance bKash payse kina check koren"
    );

    const results = await router.executeVoicePlan(plan);

    expect(results.length).toBe(2);
    expect(results[0].status).toBe("completed");
    expect(results[0].result.consignmentId).toMatch(/^ST-\d{6}$/);
    expect(results[1].status).toBe("completed");
    expect(results[1].result.status).toBe("AWAITING_BKASH");
  });
});
