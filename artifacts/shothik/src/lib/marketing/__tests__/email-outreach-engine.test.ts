import { describe, it, expect } from "vitest";
import { EmailOutreachEngine } from "../email-outreach-engine";

describe("Cold Email Outreach Engine (email-outreach-engine.ts)", () => {
  it("manages prospect leads, 3-step cadence sequence, and campaign metrics", async () => {
    const initialLeads = EmailOutreachEngine.getLeads();
    expect(initialLeads.length).toBeGreaterThan(0);

    // Add a new prospect lead
    const newLead = EmailOutreachEngine.addLead({
      name: "Rafiqul Islam",
      email: "rafiq@banglafintech.com",
      company: "BanglaFinTech Ltd",
    });

    expect(newLead.status).toBe("queued");
    expect(newLead.step).toBe(0);

    const stats = EmailOutreachEngine.getStats();
    expect(stats.totalLeads).toBeGreaterThan(0);
    expect(stats.openRatePct).toBeGreaterThan(0);

    // Dispatch batch
    const dispatchResult = await EmailOutreachEngine.dispatchNextBatch();
    expect(dispatchResult.dispatchedCount).toBeGreaterThan(0);

    const updatedLeads = EmailOutreachEngine.getLeads();
    const dispatchedLead = updatedLeads.find((l) => l.id === newLead.id);
    expect(dispatchedLead?.status).toBe("sent");
    expect(dispatchedLead?.step).toBe(1);
  });

  it("provides 3-step value hook cadence sequence", () => {
    const sequence = EmailOutreachEngine.getSequence();
    expect(sequence.length).toBe(3);
    expect(sequence[0].subject).toContain("{{company}}");
    expect(sequence[1].delayDays).toBe(3);
    expect(sequence[2].delayDays).toBe(6);
  });
});
