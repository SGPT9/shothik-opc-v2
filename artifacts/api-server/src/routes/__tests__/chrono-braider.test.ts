import { describe, it, expect } from "vitest";
import {
  analyzeChronoBraid,
  type ChronoNode,
  type ChronoParadoxAnomaly
} from "../chrono-braider";

describe("Multi-Tier Chrono-Braider for Non-Linear Flashbacks (Capability #32)", () => {
  it("aligns narrative reveal order against absolute diegetic in-universe chronology", () => {
    const manuscript = "বুড়িগঙ্গার তীরে দাঁড়িয়ে ১৯৭১ সালের স্মৃতির পাতা মেলল আরাফাত।";
    const state = analyzeChronoBraid(manuscript, "proj_chrono_test");

    expect(state.projectId).toBe("proj_chrono_test");
    expect(state.title).toBeTruthy();
    expect(state.titleBn).toBeTruthy();
    expect(state.totalChaptersMapped).toBeGreaterThanOrEqual(5);
    expect(state.nodes.length).toBeGreaterThanOrEqual(5);
    expect(state.chronologicalSpanYears).toBeGreaterThanOrEqual(50);
    expect(state.narrativeComplexityScore).toBeGreaterThanOrEqual(70);

    // Verify presence of different temporal movements
    const movements = state.nodes.map((n) => n.temporalMovement);
    expect(movements).toContain("Present Ground");
    expect(movements).toContain("Analepsis (Flashback)");
    expect(movements).toContain("Prolepsis (Flashforward)");

    // Verify chronological properties
    for (const node of state.nodes) {
      expect(node.id).toBeTruthy();
      expect(node.chapterNumber).toBeGreaterThan(0);
      expect(node.chapterTitle).toBeTruthy();
      expect(node.inUniverseYear).toBeGreaterThan(1900);
      expect(node.eraSensoryAnchor).toBeTruthy();
      expect(node.perspectiveCharacter).toBeTruthy();
      expect(node.synopsis).toBeTruthy();
    }
  });

  it("identifies biological age paradoxes and temporal continuity anomalies", () => {
    const state = analyzeChronoBraid("", "proj_anomaly_test");
    expect(state.anomalies.length).toBeGreaterThanOrEqual(1);

    for (const anom of state.anomalies) {
      expect(anom.id).toBeTruthy();
      expect(anom.title).toBeTruthy();
      expect(anom.description).toBeTruthy();
      expect(anom.recommendation).toBeTruthy();
      expect(["Low", "Medium", "High (Causal Paradox)"]).toContain(anom.severity);
      expect(anom.affectedChapterIndices.length).toBeGreaterThan(0);
    }
  });

  it("provides ready-to-use sensory transition prose templates", () => {
    const state = analyzeChronoBraid("", "proj_trans_test");
    expect(state.transitionProseTemplates.length).toBeGreaterThanOrEqual(3);

    for (const t of state.transitionProseTemplates) {
      expect(t.title).toBeTruthy();
      expect(t.bengaliSnippet).toBeTruthy();
      expect(t.englishSnippet).toBeTruthy();
    }
  });
});
