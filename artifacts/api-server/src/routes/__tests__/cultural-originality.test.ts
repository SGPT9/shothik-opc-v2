import { describe, it, expect } from "vitest";
import {
  createCulturalOriginalityRouter,
  auditCulturalOriginality,
  KNOWN_FOLK_HERITAGE
} from "../cultural-originality.js";

describe("Capability #37: Cultural Folk Idiom & Regional Originality Scorer", () => {
  it("maintains a rich database of public domain Bengali folk idioms with zero IP risk", () => {
    expect(KNOWN_FOLK_HERITAGE.length).toBeGreaterThanOrEqual(4);
    for (const idiom of KNOWN_FOLK_HERITAGE) {
      expect(idiom.phrase).toBeTruthy();
      expect(idiom.isPublicDomainHeritage).toBe(true);
      expect(idiom.ipInfringementRisk).toBe("none");
      expect(idiom.authenticityContributionScore).toBeGreaterThan(0);
    }
  });

  it("audits manuscript text and rewards authentic public domain folklore without flagging as plagiarism", () => {
    const textWithFolk = "নদীর কূলের বাস, ভাবনা বারো মাস—এই ভেবে জেলে নৌকা বেয়ে যাচ্ছিল।";
    const audit = auditCulturalOriginality(textWithFolk);

    expect(audit.overallOriginalityScore).toBeGreaterThanOrEqual(90);
    expect(audit.folkloreHeritageIndex).toBeGreaterThan(50);
    expect(audit.copyrightRiskLevel).toBe("negligible");
    expect(audit.totalHeritageIdiomsFound).toBeGreaterThanOrEqual(1);

    const riverProverb = audit.matches.find((m) => m.phrase.includes("নদীর কূলের বাস"));
    expect(riverProverb).toBeDefined();
    expect(riverProverb?.ipInfringementRisk).toBe("none");
  });

  it("detects modern copyright collisions and recommends folk enrichments", () => {
    const textWithCopyright = "তিনি বললেন, রবীন্দ্রনাথের গান কপিরাইট আইন অনুযায়ী নিষিদ্ধ।";
    const audit = auditCulturalOriginality(textWithCopyright);

    expect(audit.totalCopyrightCollisionsFound).toBe(1);
    expect(audit.copyrightRiskLevel).toBe("moderate");
    expect(audit.recommendedEnrichments.length).toBeGreaterThanOrEqual(2);
    expect(audit.generatedAuthenticProseSnippet).toContain("মাটির গন্ধ");
  });

  it("exports an Express router function with valid cultural originality endpoints", () => {
    const router = createCulturalOriginalityRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
