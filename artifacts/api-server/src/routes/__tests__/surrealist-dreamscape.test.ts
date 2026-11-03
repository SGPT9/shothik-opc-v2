import { describe, it, expect } from "vitest";
import {
  analyzeSurrealistDreamscape,
  type DreamDistortionTrope,
  type DualRealityDiscrepancy
} from "../surrealist-dreamscape";

describe("Surrealist Dreamscape & Unreliable Narrator Mode (Capability #30)", () => {
  it("audits narrator unreliability, cognitive distortion tropes and dual-reality discrepancies", () => {
    const text = "দেয়ালের পুরনো ঘড়িটার কাঁটা পিছন দিকে ঘুরতে শুরু করল। বাতাসে নীল রঙের একটা ধাতব তিতা গন্ধ ভেসে এল।";
    const report = analyzeSurrealistDreamscape(text, "proj_dream_test");

    expect(report.projectId).toBe("proj_dream_test");
    expect(report.unreliabilityScore).toBeGreaterThanOrEqual(60);
    expect(["GROUNDED", "FEVER_DREAM", "MAGICAL_REALISM", "PSYCHOTIC_DELIRIUM"]).toContain(
      report.narrativeState
    );
    expect(report.styleLabel).toBeTruthy();
    expect(report.groundTruthSummary).toBeTruthy();
    expect(report.groundTruthSummaryBn).toBeTruthy();

    // Verify Tropes Detected
    expect(report.tropesDetected.length).toBeGreaterThanOrEqual(2);
    for (const trope of report.tropesDetected) {
      expect(trope.id).toBeTruthy();
      expect(trope.name).toBeTruthy();
      expect(trope.nameBn).toBeTruthy();
      expect(["subtle", "hallucinatory", "shattering"]).toContain(trope.severity);
      expect(trope.groundTruthExplanation).toBeTruthy();
      expect(trope.groundTruthExplanationBn).toBeTruthy();
    }

    // Verify Dual Reality Discrepancy Matrix
    expect(report.discrepancies.length).toBeGreaterThanOrEqual(2);
    for (const disc of report.discrepancies) {
      expect(disc.narratedPerception).toBeTruthy();
      expect(disc.groundTruthFact).toBeTruthy();
      expect(disc.distortionType).toBeTruthy();
      expect(disc.confidenceScore).toBeGreaterThan(50);
    }
  });

  it("generates 3 distinct stylistic surrealist prose interpretations", () => {
    const report = analyzeSurrealistDreamscape("বৃষ্টি নেমেছে পুরান ঢাকায়।", "proj_prose_test");

    expect(report.suggestedDreamProse.length).toBe(3);
    const titles = report.suggestedDreamProse.map((p) => p.title);
    expect(titles.some((t) => t.includes("Elias"))).toBe(true);
    expect(titles.some((t) => t.includes("Murakami"))).toBe(true);
    expect(titles.some((t) => t.includes("Kafka"))).toBe(true);

    for (const sample of report.suggestedDreamProse) {
      expect(sample.prose).toBeTruthy();
      expect(sample.styleBadge).toBeTruthy();
    }
  });
});
