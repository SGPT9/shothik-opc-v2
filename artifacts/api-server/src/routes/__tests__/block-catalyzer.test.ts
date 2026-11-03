import { describe, it, expect } from "vitest";
import {
  generateCatalyticSparks,
  generateReverseOutline,
  type CatalyticSparkType
} from "../block-catalyzer";

describe("Beat the Block Flow-State Catalyzer & Reverse Outliner (Capability #25)", () => {
  it("generates 3 archetypal catalytic sparks (Intrusion, Revelation, Hazard) with vivid narrative prompts", () => {
    const context = "রাত এগারোটা। হিমু আর বাদল চিলেকোঠার ঘরে বসে আছে। বাইরে টিপটিপ বৃষ্টি।";
    const sparks = generateCatalyticSparks(context, "thriller");

    expect(sparks.length).toBe(3);
    const types: CatalyticSparkType[] = sparks.map((s) => s.type);
    expect(types).toContain("intrusion");
    expect(types).toContain("revelation");
    expect(types).toContain("hazard");

    for (const spark of sparks) {
      expect(spark.id).toBeTruthy();
      expect(spark.typeLabelBangla).toBeTruthy();
      expect(spark.headlineBangla).toBeTruthy();
      expect(spark.promptSparkBangla).toBeTruthy();
      expect(spark.dramaticPurposeBangla).toBeTruthy();
    }
  });

  it("extracts 6-beat reverse outline from unstructured manuscript prose", () => {
    const manuscript = `রাত নেমেছে শহরের বুকে। বৃষ্টির ফোঁটাগুলো জানালায় আছড়ে পড়ছে।
সে তার হাতের ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।
কোনো শব্দ নেই, কেবল দেয়ালঘড়ির টিকটিক আওয়াজ যেন মৃত্যুর আগমনী বার্তা বাজাচ্ছে।
হঠাৎ বাইরে কোথাও কড়া ব্রেক কষার তীক্ষ্ণ চিৎকার।
পালানোর আর কোনো দৃশ্যমান পথ নেই।
ঠিক তখনই দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।`;

    const outline = generateReverseOutline(manuscript);

    expect(outline.totalWordCount).toBeGreaterThan(15);
    expect(outline.structuralHealthScore).toBeGreaterThanOrEqual(50);
    expect(outline.structuralHealthScore).toBeLessThanOrEqual(100);
    expect(outline.pacingAssessmentBangla).toBeTruthy();
    expect(outline.beats.length).toBe(6);

    // Verify classic 6 beats
    const beatNames = outline.beats.map((b) => b.beatNameEnglish);
    expect(beatNames[0]).toContain("Opening Image");
    expect(beatNames[1]).toContain("Inciting Incident");
    expect(beatNames[2]).toContain("Rising Complication");
    expect(beatNames[3]).toContain("Midpoint Shift");
    expect(beatNames[4]).toContain("Crisis Peak");
    expect(beatNames[5]).toContain("Climax");

    for (const beat of outline.beats) {
      expect(beat.beatNameBangla).toBeTruthy();
      expect(beat.synopsisBangla).toBeTruthy();
      expect(beat.detectedExcerpt).toBeTruthy();
      expect(["solid", "weak", "missing"]).toContain(beat.status);
      expect(beat.recommendationBangla).toBeTruthy();
    }
  });

  it("computes structural health score based on beat completion", () => {
    const shortProse = "অল্প কিছু কথা। একা বসে থাকা।";
    const outline = generateReverseOutline(shortProse);

    expect(outline.beats.length).toBe(6);
    expect(outline.structuralHealthScore).toBeDefined();
  });
});
