import { describe, it, expect } from "vitest";
import { runAutonomousEvasionLoop } from "../evasion-autoloop";

describe("Autonomous Evasion Loop", () => {
  it("executes multi-pass humanization loop and improves human score", () => {
    const rawAiText =
      "Furthermore, artificial intelligence is evolving at an unprecedented velocity across modern industries. Moreover, researchers delve deeply into generative architectures. In conclusion, neural systems will reshape our technological landscape.";

    const result = runAutonomousEvasionLoop({
      text: rawAiText,
      mode: "academic",
      maxPasses: 3,
      targetHumanScore: 90,
    });

    expect(result.success).toBe(true);
    expect(result.totalPassesExecuted).toBeGreaterThanOrEqual(1);
    expect(result.totalPassesExecuted).toBeLessThanOrEqual(3);
    expect(result.finalHumanScore).toBeGreaterThanOrEqual(result.initialHumanScore);
    expect(result.finalAiScore).toBeLessThanOrEqual(result.initialAiScore);
    expect(result.humanizedText).toBeDefined();
    expect(result.passes.length).toBe(result.totalPassesExecuted);
    expect(result.passes[0]).toHaveProperty("passNumber", 1);
    expect(result.passes[0]).toHaveProperty("ngramsBroken");
    expect(result.passes[0]).toHaveProperty("burstinessVariance");
  });

  it("handles Bengali text evasion loop seamlessly", () => {
    const banglaAiText =
      "উল্লেখযোগ্য যে কৃত্রিম বুদ্ধিমত্তা বর্তমান বিশ্বে অত্যন্ত দ্রুত গতিতে পরিবর্তিত হচ্ছে। অধিকন্তু গবেষকগণ গভীর অনুসন্ধান চালাচ্ছেন। পরিশেষে নতুন দিগন্ত উন্মোচিত হবে।";

    const result = runAutonomousEvasionLoop({
      text: banglaAiText,
      mode: "standard",
      language: "bn",
      maxPasses: 2,
      targetHumanScore: 85,
    });

    expect(result.success).toBe(true);
    expect(result.finalHumanScore).toBeGreaterThanOrEqual(80);
    expect(result.passes.length).toBeGreaterThanOrEqual(1);
    expect(result.humanizedText.length).toBeGreaterThan(0);
  });
});
