import { describe, it, expect } from "vitest";
import { STITCH_PERPLEXITY_DESIGN_SYSTEM } from "../stitch-perplexity-design-system";

describe("Stitch MCP Design System Integration", () => {
  it("verifies Stitch design system tokens and color mode", () => {
    expect(STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.colorMode).toBe("DARK");
    expect(STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.customColor).toBe("#10B981");
    expect(STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.headlineFont).toBe("INTER");
    expect(STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.roundness).toBe("ROUND_TWELVE");
  });

  it("verifies Stitch markdown specification content", () => {
    expect(STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.designMd).toContain("Perplexity Design System Specification");
    expect(STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.designMd).toContain("Header Action Bar");
  });
});
