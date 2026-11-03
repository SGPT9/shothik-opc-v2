import { describe, it, expect } from "vitest";
import {
  analyzeSensoryPalette,
  type SensorySense
} from "../sensory-palette";

describe("Sensory Palette & 5-Sense Immersion Painter (Capability #26)", () => {
  it("audits all 5 human senses (Sight, Sound, Smell, Touch, Taste) from Bengali manuscript prose", () => {
    const text = `রাত নেমেছে শহরের বুকে। নিওন আলোর ম্লান ছায়া।
বৃষ্টির ফোঁটাগুলো টিনের চালে সশব্দে আছড়ে পড়ছে।
খোলা জানালা দিয়ে ভেজা মাটির সোঁদা গন্ধ ভেসে আসছে।
তার হাত বরফের মতো ঠান্ডা হয়ে গেল, কপাল বেয়ে ঘাম ঝরে পড়ছে।
চায়ে এক চুমুক দিতেই তিতা স্বাদে মুখটা বিকৃত হয়ে গেল।`;

    const report = analyzeSensoryPalette(text, "proj_sensory_test");

    expect(report.projectId).toBe("proj_sensory_test");
    expect(report.totalWords).toBeGreaterThan(15);
    expect(report.sensoryImmersionScore).toBeGreaterThanOrEqual(50);
    expect(["low", "medium", "high"]).toContain(report.talkingHeadsRiskLevel);
    expect(report.talkingHeadsWarningBangla).toBeTruthy();

    const expectedSenses: SensorySense[] = ["sight", "sound", "smell", "touch", "taste"];
    for (const s of expectedSenses) {
      const score = report.senses[s];
      expect(score).toBeDefined();
      expect(score.sense).toBe(s);
      expect(score.labelBangla).toBeTruthy();
      expect(score.percentage).toBeGreaterThanOrEqual(0);
      expect(score.detectedKeywords.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("identifies sensory dead zones and provides actionable sensory brushes", () => {
    const dialogueOnlyText = `সে বলল, "তুমি কি যাবে?"
আরেকজন বলল, "না, আমি যাব না।"
"কেন যাবে না?"
"কারণ আমার ইচ্ছা নেই।"`;

    const report = analyzeSensoryPalette(dialogueOnlyText, "proj_dialogue_test");

    expect(report.deadZones.length).toBeGreaterThan(0);
    const firstDeadZone = report.deadZones[0];
    expect(firstDeadZone.excerpt).toBeTruthy();
    expect(firstDeadZone.issueBangla).toBeTruthy();
    expect(firstDeadZone.suggestedSensoryBrushBangla).toBeTruthy();

    expect(report.sensoryBrushes.length).toBeGreaterThanOrEqual(3);
    for (const brush of report.sensoryBrushes) {
      expect(brush.brushNameBangla).toBeTruthy();
      expect(brush.sampleSnippetBangla).toBeTruthy();
    }
  });
});
