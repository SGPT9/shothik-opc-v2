import { describe, it, expect } from "vitest";
import {
  DUET_PARTNERS,
  generateDuetCounterVolley,
  type DuetPartnerId
} from "../character-duet";

describe("Live Character Duet Mode 'Sentence Tennis' (Capability #24)", () => {
  it("provides comprehensive profile catalog for all 5 duet character partners", () => {
    const ids = Object.keys(DUET_PARTNERS) as DuetPartnerId[];
    expect(ids.length).toBe(5);
    expect(ids).toContain("himu");
    expect(ids).toContain("badal");
    expect(ids).toContain("rupa");
    expect(ids).toContain("oc_rafiq");
    expect(ids).toContain("misir_ali");

    for (const id of ids) {
      const p = DUET_PARTNERS[id];
      expect(p.nameBangla).toBeTruthy();
      expect(p.nameEnglish).toBeTruthy();
      expect(p.avatarIcon).toBeTruthy();
      expect(p.taglineBangla).toBeTruthy();
      expect(p.counterStyleBangla).toBeTruthy();
      expect(p.sampleServeResponses.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("generates contextual counter-volley with emotional shift and subtext analysis", () => {
    const authorServe = "হিমু, তুমি কি সত্যি জানো কাল রাতে ওই বাড়িতে কে ঢুকেছিল?";
    const result = generateDuetCounterVolley("himu", authorServe, [], "tense");

    expect(result.partnerId).toBe("himu");
    expect(result.partnerNameBangla).toBe("হিমু");
    expect(result.characterResponseBangla).toBeTruthy();
    expect(result.emotionalShift).toBeTruthy();
    expect(result.subtextInsightBangla).toBeTruthy();
    expect(result.rallyCount).toBe(2);
    expect(result.rallySummary.length).toBe(2);

    expect(result.rallySummary[0].speaker).toBe("author");
    expect(result.rallySummary[0].text).toBe(authorServe);
    expect(result.rallySummary[1].speaker).toBe("character");
    expect(result.rallySummary[1].text).toBe(result.characterResponseBangla);
  });

  it("handles multi-turn rally exchanges accurately maintaining history sequence", () => {
    const priorHistory = [
      { speaker: "author" as const, text: "দরজাটা বন্ধ করে দাও।" },
      { speaker: "character" as const, text: "ওসি রফিক টেবিলে ফাইল রেখে বললেন, 'এখানে কোনো দরজা বন্ধ থাকবে না।'" }
    ];

    const newServe = "তাহলে আপনি কি আমাকে গ্রেপ্তার করতে এসেছেন?";
    const result = generateDuetCounterVolley("oc_rafiq", newServe, priorHistory, "tense");

    expect(result.rallyCount).toBe(4);
    expect(result.rallySummary.length).toBe(4);
    expect(result.partnerId).toBe("oc_rafiq");
    expect(result.pacingRhythm).toBe("explosive");
    expect(result.rallySummary[2].text).toBe(newServe);
    expect(result.rallySummary[3].speaker).toBe("character");
  });

  it("adapts counter responses for Badal, Rupa, and Misir Ali uniquely", () => {
    const badalResult = generateDuetCounterVolley("badal", "আমরা কি ধরা পড়ে গেলাম?");
    expect(badalResult.characterResponseBangla).toContain("বাদল");
    expect(badalResult.emotionalShift).toContain("উদ্বেগ");

    const rupaResult = generateDuetCounterVolley("rupa", "আমি আজ রাতে দেখা করতে পারছি না।");
    expect(rupaResult.characterResponseBangla).toContain("রূপা");

    const misirResult = generateDuetCounterVolley("misir_ali", "ঘরের আলোটা নিভে যাওয়ার পরেই ভূতটা দেখা গেল।");
    expect(misirResult.characterResponseBangla).toContain("মিসির আলি");
    expect(misirResult.pacingRhythm).toBe("contemplative");
  });
});
