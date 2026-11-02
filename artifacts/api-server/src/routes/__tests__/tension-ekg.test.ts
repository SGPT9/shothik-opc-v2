import { describe, it, expect } from "vitest";
import {
  calculateTextTension,
  detectFlatlines,
  generateTensionEkgData,
  TensionBeatPoint
} from "../tension-ekg.js";

describe("Narrative Tension Heartbeat & Pacing Velocity EKG", () => {
  it("calculates high tension and elevated heart rate BPM for dread and shock cues", () => {
    const shockSnippet = "দরজায় আকস্মিক তীব্র তিনটে করাঘাত পড়ল! ওপাশে কি রক্তমাখা অস্ত্রধারী খুনি?";
    const result = calculateTextTension(shockSnippet);
    
    expect(result.tension).toBeGreaterThanOrEqual(75);
    expect(result.bpm).toBeGreaterThanOrEqual(120);
    expect(["shock", "dread"]).toContain(result.emotionalState);
  });

  it("calculates lower tension and calm heart rate for serene peaceful descriptions", () => {
    const calmSnippet = "ভোরের প্রথম আলো ফুটে উঠল। চারিদিকে এক অপার্থিব শান্ত সুখের বাতাস বইছে।";
    const result = calculateTextTension(calmSnippet);
    
    expect(result.tension).toBeLessThanOrEqual(55);
    expect(result.bpm).toBeLessThanOrEqual(95);
  });

  it("detects tension flatlines when multiple consecutive beats have minimal variance", () => {
    const stagnantBeats: TensionBeatPoint[] = [
      { beatIndex: 1, chapterNumber: 1, label: "Beat 1", tensionLevel: 30, heartRateBpm: 70, conflictVelocity: 1, emotionalState: "curiosity", snippet: "a" },
      { beatIndex: 2, chapterNumber: 1, label: "Beat 2", tensionLevel: 32, heartRateBpm: 71, conflictVelocity: 1, emotionalState: "curiosity", snippet: "b" },
      { beatIndex: 3, chapterNumber: 1, label: "Beat 3", tensionLevel: 31, heartRateBpm: 70, conflictVelocity: 1, emotionalState: "curiosity", snippet: "c" }
    ];

    const warnings = detectFlatlines(stagnantBeats);
    expect(warnings.length).toBe(1);
    expect(warnings[0].reason).toContain("stagnation");
    expect(warnings[0].suggestedComplication).toBeDefined();
  });

  it("returns no flatlines for dynamic rollercoaster pacing curves", () => {
    const dynamicBeats: TensionBeatPoint[] = [
      { beatIndex: 1, chapterNumber: 1, label: "Beat 1", tensionLevel: 30, heartRateBpm: 70, conflictVelocity: 1, emotionalState: "curiosity", snippet: "a" },
      { beatIndex: 2, chapterNumber: 1, label: "Beat 2", tensionLevel: 75, heartRateBpm: 120, conflictVelocity: 6, emotionalState: "shock", snippet: "b" },
      { beatIndex: 3, chapterNumber: 1, label: "Beat 3", tensionLevel: 95, heartRateBpm: 145, conflictVelocity: 9, emotionalState: "dread", snippet: "c" }
    ];

    const warnings = detectFlatlines(dynamicBeats);
    expect(warnings.length).toBe(0);
  });

  it("generates complete tension EKG dataset with ideal and actual curves", () => {
    const data = generateTensionEkgData("proj_tension_demo");
    expect(data.projectId).toBe("proj_tension_demo");
    expect(data.actualTensionCurve.length).toBe(data.beatPoints.length);
    expect(data.idealArcCurve.length).toBe(data.beatPoints.length);
    expect(data.overallPacingHealthScore).toBeGreaterThan(0);
    expect(data.recommendations.length).toBeGreaterThan(0);
  });
});
