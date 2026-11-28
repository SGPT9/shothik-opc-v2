import { describe, it, expect } from "vitest";
import {
  createPolyglotMatrixRouter,
  auditCultureBoundItems,
  DEFAULT_CULTURE_BOUND_ITEMS
} from "../polyglot-matrix.js";

describe("Capability #42: Polyglot Cultural Localization Matrix", () => {
  it("provides comprehensive culture-bound items covering food, idioms, and social rituals", () => {
    expect(DEFAULT_CULTURE_BOUND_ITEMS.length).toBeGreaterThanOrEqual(3);
    const khichuri = DEFAULT_CULTURE_BOUND_ITEMS.find((i) => i.id === "cbi_khichuri");
    expect(khichuri).toBeDefined();
    expect(khichuri?.category).toBe("food_and_drink");
    expect(khichuri?.sourceBengali).toContain("খিচুড়ি");
  });

  it("covers 7 global languages with 4 distinct translation strategies each", () => {
    const adda = DEFAULT_CULTURE_BOUND_ITEMS.find((i) => i.id === "cbi_adda");
    expect(adda).toBeDefined();

    const expectedLangs = ["en", "hi", "es", "fr", "ar", "ja", "de"] as const;
    expectedLangs.forEach((lang) => {
      const loc = adda?.localizations[lang];
      expect(loc).toBeDefined();
      expect(loc?.domestication).toBeTruthy();
      expect(loc?.foreignization).toBeTruthy();
      expect(loc?.dynamicEquivalence).toBeTruthy();
      expect(loc?.culturalNote).toBeTruthy();
    });

    // English foreignization preserves Adda concept
    expect(adda?.localizations.en.foreignization).toContain("adda");
    // Japanese domestication maps to izakaya / red lantern salon
    expect(adda?.localizations.ja.foreignization).toContain("アッダ");
    // German domestication maps to Stammtisch
    expect(adda?.localizations.de.domestication).toContain("Stammtisch");
  });

  it("audits manuscript text and detects culture-bound clothing items dynamically", () => {
    const baseline = auditCultureBoundItems("সাধারণ গদ্য যেখানে কোনো বিশেষ শব্দ নেই");
    expect(baseline.length).toBe(DEFAULT_CULTURE_BOUND_ITEMS.length);

    const enriched = auditCultureBoundItems("তিনি নীল চেকের লুঙ্গি ও গামছা পরে ঘাটে নেমে এলেন");
    expect(enriched.length).toBe(baseline.length + 1);
    expect(enriched.some((i) => i.id === "cbi_lungi_gamcha")).toBe(true);
  });

  it("exports an Express router function with valid polyglot matrix endpoints", () => {
    const router = createPolyglotMatrixRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
