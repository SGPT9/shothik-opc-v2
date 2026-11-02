import { describe, it, expect } from "vitest";
import {
  calculateCliffhangerScore,
  calculateDialogueRatio,
  evaluatePacingRisk,
  generateRetentionRadarData
} from "../retention-radar.js";

describe("Market Trend & Reader Retention Radar", () => {
  it("calculates high cliffhanger score for endings with unresolved questions or dramatic entries", () => {
    const strongEnding = "দরজায় আকস্মিক তীব্র তিনটে করাঘাত পড়ল। কে হতে পারে এই বৃষ্টিভেজা রাতে?";
    const score = calculateCliffhangerScore(strongEnding);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it("calculates moderate score for calm descriptive endings", () => {
    const calmEnding = "সোডিয়াম বাতিগুলো আস্তে আস্তে নিভে গেল। রাত শেষ হয়ে সকাল হল।";
    const score = calculateCliffhangerScore(calmEnding);
    expect(score).toBeLessThan(75);
  });

  it("calculates dialogue-to-exposition ratio accurately", () => {
    const dialogueSample = `হিমু: কেমন আছ বাদল?\nবাদল: ভালো না ভাই।\nহিমু: ভালো থাকা উচিত নয়।`;
    const ratio = calculateDialogueRatio(dialogueSample);
    expect(ratio).toBe(100);

    const narrativeSample = `বাইরে বৃষ্টি হচ্ছে।\nআকাশ মেঘলা।\nবাতাস বইছে।`;
    const narrativeRatio = calculateDialogueRatio(narrativeSample);
    expect(narrativeRatio).toBe(0);
  });

  it("identifies high bounce risk on chapters with excessive exposition and zero dialogue", () => {
    const risk = evaluatePacingRisk(3500, 10, 30);
    expect(risk.bounceRiskLevel).toBe("high");
    expect(risk.riskExplanation).toContain("Overly dense narrative exposition");
  });

  it("generates comprehensive retention radar report with market tropes and actionable interventions", () => {
    const data = generateRetentionRadarData("proj_test_01", "হিমু: চলো যাই।");
    expect(data.projectId).toBe("proj_test_01");
    expect(data.overallRetentionScore).toBeGreaterThan(0);
    expect(data.chapterMetrics.length).toBeGreaterThan(0);
    expect(data.tropes.length).toBeGreaterThan(0);
    expect(data.actionableInterventions.length).toBeGreaterThan(0);
  });
});
