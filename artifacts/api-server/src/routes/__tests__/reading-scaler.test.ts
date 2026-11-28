import { describe, it, expect } from "vitest";
import {
  createReadingScalerRouter,
  generateReadingMetrics,
  buildDefaultScalerState,
  DEFAULT_ORIGINAL_EXCERPT
} from "../reading-scaler.js";

describe("Capability #43: Adaptive Reading Level & Vocabulary Scaler", () => {
  it("calculates distinct readability metrics for Young Adult, Scholarly, and Executive tiers", () => {
    const yaMetrics = generateReadingMetrics(DEFAULT_ORIGINAL_EXCERPT, "young_adult");
    expect(yaMetrics.lexileScore).toBe("620L");
    expect(yaMetrics.readabilityEaseScore).toBeGreaterThan(80);
    expect(yaMetrics.averageWordsPerSentence).toBeLessThan(15);

    const scholarlyMetrics = generateReadingMetrics(DEFAULT_ORIGINAL_EXCERPT, "scholarly_annotated");
    expect(scholarlyMetrics.lexileScore).toBe("1280L");
    expect(scholarlyMetrics.readabilityEaseScore).toBeLessThan(50);
    expect(scholarlyMetrics.typeTokenRatio).toBeGreaterThan(0.8);

    const execMetrics = generateReadingMetrics(DEFAULT_ORIGINAL_EXCERPT, "executive_digest");
    expect(execMetrics.lexileScore).toBe("810L");
    expect(execMetrics.dialectPurity).toBe("executive_concise");
  });

  it("builds complete multi-tier editions with transformed prose and annotations", () => {
    const state = buildDefaultScalerState("proj_scaler_test");
    expect(state.projectId).toBe("proj_scaler_test");
    expect(state.editions.young_adult).toBeDefined();
    expect(state.editions.scholarly_annotated).toBeDefined();
    expect(state.editions.executive_digest).toBeDefined();

    // Verify Young Adult transformations
    expect(state.editions.young_adult.transformedExcerptBn).toContain("সোডিয়ামের হলুদ আলো");
    expect(state.editions.young_adult.targetAudienceBn).toContain("কিশোর");

    // Verify Scholarly annotations
    const annotations = state.editions.scholarly_annotated.scholarlyAnnotations;
    expect(annotations).toBeDefined();
    expect(annotations?.length).toBeGreaterThanOrEqual(3);
    expect(annotations?.some((a) => a.originType === "তৎসম")).toBe(true);
    expect(annotations?.some((a) => a.originType === "আরবি/ফারসি")).toBe(true);

    // Verify Executive beats
    const beats = state.editions.executive_digest.executiveBeats;
    expect(beats).toBeDefined();
    expect(beats?.length).toBeGreaterThanOrEqual(3);
  });

  it("exports an Express router function with valid reading scaler endpoints", () => {
    const router = createReadingScalerRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
