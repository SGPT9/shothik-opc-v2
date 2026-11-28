import { describe, it, expect } from "vitest";
import {
  analyzeCognitiveFriction,
  type AnalyzedSentenceFriction
} from "../cognitive-friction";

describe("Cognitive Flow & Reading Friction Heatmap (Capability #29)", () => {
  it("color-codes sentences across friction tiers from effortless to tangled crimson", () => {
    const text = `নিঝুম রাতে বৃষ্টি নামল।
সে চুপচাপ দাঁড়িয়ে রইল।
রাত তখন অনেক গভীর এবং বাতাসে এমন এক অদ্ভুত গন্ধ ছিল যা তাকে বহু বছর আগের সেই ঝড়ের রাতের কথা মনে করিয়ে দিচ্ছিল, যে রাতে তার সব কিছু হারিয়ে গিয়েছিল, যার ফলে সে আর কোনোদিন সেই পুরনো বাড়িতে ফিরে যেতে পারেনি।`;

    const report = analyzeCognitiveFriction(text, "proj_friction_test");

    expect(report.projectId).toBe("proj_friction_test");
    expect(report.totalSentences).toBeGreaterThanOrEqual(2);
    expect(report.totalWords).toBeGreaterThan(15);
    expect(report.overallFrictionScore).toBeGreaterThanOrEqual(10);
    expect(["A+", "A", "B", "C", "D", "F"]).toContain(report.flowGrade);

    // Verify distribution sums to ~100
    const sumPercent =
      report.distribution.effortlessPercent +
      report.distribution.moderatePercent +
      report.distribution.heavyPercent +
      report.distribution.tangledPercent;
    expect(sumPercent).toBeGreaterThanOrEqual(95);

    // Verify sentences have all diagnostic parameters
    for (const s of report.allSentences) {
      expect(s.index).toBeGreaterThanOrEqual(1);
      expect(s.text).toBeTruthy();
      expect(s.wordCount).toBeGreaterThan(0);
      expect(s.frictionScore).toBeGreaterThanOrEqual(0);
      expect(["effortless", "moderate", "heavy", "tangled_crimson"]).toContain(s.frictionLevel);
      expect(s.primaryCause).toBeTruthy();
      expect(s.primaryCauseBn).toBeTruthy();
      expect(s.estimatedFixationMs).toBeGreaterThan(100);
      expect(s.regressionProbabilityPercent).toBeGreaterThanOrEqual(0);
    }
  });

  it("identifies highest friction sentence and provides de-tangled streamlined revision", () => {
    const denseText = "সে জানালার পাশে এসে দাঁড়াল কিন্তু বাতাসে যে গন্ধ ছিল তা তাকে বিভ্রান্ত করল কারণ সে জানত যে এই রাতের পর আর কিছুই অবশিষ্ট থাকবে না।";
    const report = analyzeCognitiveFriction(denseText, "proj_dense_test");

    expect(report.highestFrictionSentences.length).toBeGreaterThan(0);
    const topTangled = report.highestFrictionSentences[0];
    expect(topTangled.frictionScore).toBeGreaterThanOrEqual(40);
    expect(topTangled.streamlinedRevision).toBeTruthy();
    expect(topTangled.streamlinedRevision).not.toEqual(denseText);
  });

  it("handles empty or blank text gracefully with effortless defaults", () => {
    const report = analyzeCognitiveFriction("", "proj_empty");
    expect(report.totalSentences).toBe(0);
    expect(report.overallFrictionScore).toBeLessThanOrEqual(20);
    expect(report.flowGrade).toBe("A+");
    expect(report.allSentences.length).toBe(0);
  });
});
