import { describe, it, expect } from "vitest";
import {
  BETA_READER_PERSONAS,
  performBetaReaderAudit,
  type BetaReaderRole
} from "../beta-readers";

describe("Simulated AI Beta Reader Focus Group (Capability #23)", () => {
  it("provides rich profiles for all 5 diverse beta reader personas", () => {
    const roles = Object.keys(BETA_READER_PERSONAS) as BetaReaderRole[];
    expect(roles.length).toBe(5);
    expect(roles).toContain("farhan_logic");
    expect(roles).toContain("nabila_thriller");
    expect(roles).toContain("tahsin_stylist");
    expect(roles).toContain("samira_romance");
    expect(roles).toContain("kabir_commuter");

    for (const role of roles) {
      const p = BETA_READER_PERSONAS[role];
      expect(p.nameBangla).toBeTruthy();
      expect(p.nameEnglish).toBeTruthy();
      expect(p.avatarIcon).toBeTruthy();
      expect(p.demographics).toBeTruthy();
      expect(p.focusArea).toBeTruthy();
      expect(p.readingSpeed).toBeTruthy();
      expect(p.dnfTolerance).toBeTruthy();
      expect(p.critiqueStyle).toBeTruthy();
    }
  });

  it("performs comprehensive focus group audit with scoring, DNF risk, and inline annotations", () => {
    const manuscript = `রাত নেমেছে শহরের বুকে। বৃষ্টির ফোঁটাগুলো জানালায় আছড়ে পড়ছে।
সে তার হাতের ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।
কোনো শব্দ নেই, কেবল দেয়ালঘড়ির টিকটিক আওয়াজ।
দরজায় দুটো মৃদু কড়া নাড়ার শব্দ হলো।`;

    const report = performBetaReaderAudit(
      "proj_beta_test",
      manuscript,
      "অধ্যায় ১: নীরব সংকেত"
    );

    expect(report.auditId).toBeTruthy();
    expect(report.projectId).toBe("proj_beta_test");
    expect(report.chapterTitle).toBe("অধ্যায় ১: নীরব সংকেত");
    expect(report.wordCount).toBeGreaterThan(10);
    expect(report.readingTimeMinutes).toBeGreaterThanOrEqual(1);

    // Consensus Summary checks
    expect(report.consensusSummary.overallScore).toBeGreaterThanOrEqual(1.0);
    expect(report.consensusSummary.overallScore).toBeLessThanOrEqual(5.0);
    expect(report.consensusSummary.averageDnfRiskPercent).toBeGreaterThanOrEqual(0);
    expect(report.consensusSummary.averageDnfRiskPercent).toBeLessThanOrEqual(100);
    expect(report.consensusSummary.groupVerdictBangla).toBeTruthy();
    expect(report.consensusSummary.topStrengthsBangla.length).toBeGreaterThan(0);
    expect(report.consensusSummary.urgentFixesBangla.length).toBeGreaterThan(0);

    // 5 persona reviews
    expect(report.personaReviews.length).toBe(5);

    // Farhan check: Logic Auditor
    const farhan = report.personaReviews.find((p) => p.personaId === "farhan_logic");
    expect(farhan).toBeDefined();
    expect(farhan!.score).toBeGreaterThan(3.0);
    expect(farhan!.annotatedMarginNotes.length).toBeGreaterThanOrEqual(1);
    expect(farhan!.annotatedMarginNotes[0].type).toBe("plot_hole");

    // Nabila check: Thriller Reader
    const nabila = report.personaReviews.find((p) => p.personaId === "nabila_thriller");
    expect(nabila).toBeDefined();
    expect(nabila!.annotatedMarginNotes.some((n) => n.type === "pacing_drag")).toBe(true);

    // Tahsin check: Stylist
    const tahsin = report.personaReviews.find((p) => p.personaId === "tahsin_stylist");
    expect(tahsin).toBeDefined();
    expect(tahsin!.firstImpressionBangla).toBeTruthy();

    // Samira check: Romance & Emotion
    const samira = report.personaReviews.find((p) => p.personaId === "samira_romance");
    expect(samira).toBeDefined();
    expect(samira!.annotatedMarginNotes.some((n) => n.type === "emotional_peak")).toBe(true);

    // Kabir check: Commuter / Mass Reader
    const kabir = report.personaReviews.find((p) => p.personaId === "kabir_commuter");
    expect(kabir).toBeDefined();
    expect(kabir!.annotatedMarginNotes.some((n) => n.type === "confusing")).toBe(true);
  });

  it("supports running audit on selective subset of personas", () => {
    const manuscript = "রাস্তার মোড়ে ছাতা হাতে দাঁড়িয়েছিল এক অচেনা তরুণ। ঘড়িতে তখন রাত তিনটা।";
    const selected: BetaReaderRole[] = ["farhan_logic", "nabila_thriller"];

    const report = performBetaReaderAudit(
      "proj_beta_test",
      manuscript,
      "অধ্যায় ২",
      selected
    );

    expect(report.personaReviews.length).toBe(2);
    const ids = report.personaReviews.map((p) => p.personaId);
    expect(ids).toEqual(["farhan_logic", "nabila_thriller"]);
  });
});
