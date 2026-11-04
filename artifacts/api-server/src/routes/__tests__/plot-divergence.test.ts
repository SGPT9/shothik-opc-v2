import { describe, it, expect } from "vitest";
import {
  analyzePlotDivergence,
  type PlotBranchFork,
  type DivergenceConsequence
} from "../plot-divergence";

describe("Semantic Time-Travel & Plot Divergence Replay (Capability #33)", () => {
  it("generates branching forks with semantic causal ripple consequences", () => {
    const manuscript = "মাঝিরা ট্রলারের ইঞ্জিন চালু করতেই আরাফাত দ্বিধায় পড়ে গেল—সিলটি কি এখনই ভাঙবে?";
    const state = analyzePlotDivergence(manuscript, "proj_divergence_test");

    expect(state.projectId).toBe("proj_divergence_test");
    expect(state.title).toBeTruthy();
    expect(state.titleBn).toBeTruthy();
    expect(state.totalBranches).toBeGreaterThanOrEqual(3);
    expect(state.branches.length).toBeGreaterThanOrEqual(3);

    // Verify presence of Canon baseline
    const canon = state.branches.find((b) => b.isCanon);
    expect(canon).toBeDefined();
    expect(canon?.parentBranchId).toBeNull();

    // Verify alternate divergence branches
    const alternates = state.branches.filter((b) => !b.isCanon);
    expect(alternates.length).toBeGreaterThanOrEqual(2);

    for (const alt of alternates) {
      expect(alt.id).toBeTruthy();
      expect(alt.branchName).toBeTruthy();
      expect(alt.whatIfPremise).toBeTruthy();
      expect(alt.consequences.length).toBeGreaterThanOrEqual(2);
      expect(alt.divergentProseSnippet).toBeTruthy();

      for (const c of alt.consequences) {
        expect(["Character Fate", "Plot Mystery", "Thematic Resonance", "Pacing Velocity"]).toContain(
          c.category
        );
        expect(["Subtle Shift", "Major Arc Reversal", "Catastrophic Timeline Shatter"]).toContain(
          c.impactSeverity
        );
        expect(c.canonState).toBeTruthy();
        expect(c.divergentState).toBeTruthy();
      }
    }
  });

  it("ensures divergent prose snippets are provided in bilingual format", () => {
    const state = analyzePlotDivergence("", "proj_bilingual_test");
    for (const branch of state.branches) {
      expect(branch.divergentProseSnippet).toBeTruthy();
      expect(branch.divergentProseSnippetBn).toBeTruthy();
    }
  });
});
