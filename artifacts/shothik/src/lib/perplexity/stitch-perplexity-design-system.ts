export interface StitchDesignSystemConfig {
  displayName: string;
  theme: {
    colorMode: "DARK" | "LIGHT";
    customColor: string; // #10B981 Emerald 500
    headlineFont: string; // Inter / Geist
    bodyFont: string; // Inter
    roundness: "ROUND_TWELVE" | "ROUND_FULL";
    colorVariant: "VIBRANT" | "MONOCHROME";
    overrideNeutralColor: string; // #0F172A Slate 900
    overridePrimaryColor: string; // #10B981 Emerald 500
    overrideSecondaryColor: string; // #A855F7 Purple 500
    designMd: string;
  };
}

export const STITCH_PERPLEXITY_DESIGN_SYSTEM: StitchDesignSystemConfig = {
  displayName: "Shothik Perplexity Design System (Stitch MCP Standard)",
  theme: {
    colorMode: "DARK",
    customColor: "#10B981",
    headlineFont: "INTER",
    bodyFont: "INTER",
    roundness: "ROUND_TWELVE",
    colorVariant: "VIBRANT",
    overrideNeutralColor: "#0F172A",
    overridePrimaryColor: "#10B981",
    overrideSecondaryColor: "#A855F7",
    designMd: `
# Stitch MCP — Perplexity Design System Specification

## Color Tokens
- Primary: #10B981 (Emerald 500)
- Secondary: #A855F7 (Purple 500)
- Surface/Neutral: #0F172A (Slate 900)
- Border: #1E293B (Slate 800)

## Typography & Roundness
- Fonts: Inter, Geist Mono
- Roundness: 24px (rounded-3xl container, rounded-2xl cards, rounded-full pills)
- Vertical Rhythm: 20px (space-y-5)

## Component Layout Slots
1. Header Action Bar (Voice Orb, Swarm Debate, Paywall)
2. Search Focus Selector (All Web, Pro Search, Academic, Finance & Tax, Merchant)
3. Sources Grid Carousel ([1], [2], [3] Domain Cards)
4. Real-World Execution Cards (bKash Verify, Steadfast Dispatch, NBR Tax Return)
5. Related Question Pills (+ Related Questions)
    `,
  },
};

export class StitchDesignSystemEngine {
  static applyTokens(): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--stitch-primary", STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.overridePrimaryColor);
    root.style.setProperty("--stitch-secondary", STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.overrideSecondaryColor);
    root.style.setProperty("--stitch-neutral", STITCH_PERPLEXITY_DESIGN_SYSTEM.theme.overrideNeutralColor);
  }
}
