import { describe, it, expect } from "vitest";
import { OvernightMerchantGoalEngine } from "../overnight-merchant-goal";

describe("🌙 Autonomous Overnight Merchant Goal TDD Suite", () => {
  it("should initialize 5-step overnight goal with PENDING status", () => {
    const engine = new OvernightMerchantGoalEngine("merchant-uttara-88");
    const session = engine.getSession();

    expect(session.status).toBe("PENDING");
    expect(session.steps.length).toBe(5);
    expect(session.steps[0].name).toBe("Parcel Tracking Batch Sync");
    expect(session.steps[4].name).toBe("Executive Morning Briefing");
  });

  it("should execute 5-step overnight goal to SATISFIED state and generate executive briefing", async () => {
    const engine = new OvernightMerchantGoalEngine("merchant-uttara-88");
    const session = await engine.executeOvernightGoal();

    expect(session.status).toBe("SATISFIED");
    expect(session.steps.every(s => s.status === "COMPLETED")).toBe(true);
    expect(session.metrics.parcelsAudited).toBe(42);
    expect(session.metrics.unreachableRescued).toBe(3);
    expect(session.metrics.totalCodReconciled).toBe(64500);
    expect(session.metrics.vatPayable).toBe(4837.5);
    expect(session.executiveSummary).toContain("Good Morning! Overnight Business Briefing");
    expect(session.executiveSummary).toContain("Net COD Payable");
    expect(session.executiveSummary).toContain("৳64,500");
  });
});
