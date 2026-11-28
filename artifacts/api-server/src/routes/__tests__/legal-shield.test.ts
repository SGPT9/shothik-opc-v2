import { describe, it, expect } from "vitest";
import {
  createLegalShieldRouter,
  scanManuscriptForLegalRisks,
  buildDefaultLegalReport,
  DEFAULT_LEGAL_ITEMS
} from "../legal-shield.js";

describe("Capability #45: Legal Defamation & Trademark Preflight Shield", () => {
  it("audits manuscript for defamation, trademark dilution, and song lyrics copyright risks", () => {
    const report = buildDefaultLegalReport("proj_legal_test");
    expect(report.projectId).toBe("proj_legal_test");
    expect(report.overallComplianceScore).toBeGreaterThanOrEqual(85);
    expect(report.totalRisksFound).toBe(DEFAULT_LEGAL_ITEMS.length);

    const categories = report.items.map((i) => i.category);
    expect(categories).toContain("defamation_libel");
    expect(categories).toContain("trademark_dilution");
    expect(categories).toContain("song_lyrics_copyright");
  });

  it("provides actionable fictionalized alternatives and statutory legal bases for flagged items", () => {
    const report = buildDefaultLegalReport("proj_legal_test");
    const tmItem = report.items.find((i) => i.category === "trademark_dilution");

    expect(tmItem).toBeDefined();
    expect(tmItem?.legalBasisBn).toContain("ট্রেডমার্কস অ্যাক্ট");
    expect(tmItem?.fictionalizedAlternativeBn).toBeTruthy();
    expect(tmItem?.suggestedRemedyBn).toBeTruthy();
  });

  it("dynamically flags commercial MFS trademarks when mentioned in text", () => {
    const baseline = scanManuscriptForLegalRisks("সাধারণ নিরপেক্ষ টেক্সট");
    expect(baseline.length).toBe(DEFAULT_LEGAL_ITEMS.length);

    const enriched = scanManuscriptForLegalRisks("টাকাটা বিকাশ বা নগদ দিয়ে পাঠানো হয়েছিল");
    expect(enriched.length).toBe(baseline.length + 1);
    expect(enriched.some((i) => i.id === "legal_tm_mfs")).toBe(true);
  });

  it("generates comprehensive bilingual safe harbor publisher disclaimers", () => {
    const report = buildDefaultLegalReport("proj_legal_test");
    expect(report.statutoryDisclaimerBn).toContain("সম্পূর্ণরূপে কাল্পনিক");
    expect(report.statutoryDisclaimerEn).toContain("work of fiction");
  });

  it("exports an Express router function with valid legal shield endpoints", () => {
    const router = createLegalShieldRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
