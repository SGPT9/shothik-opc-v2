import { describe, it, expect } from "vitest";
import {
  REGISTER_CATALOG,
  transpileBengaliRegister,
} from "../dialect-transpiler";

describe("Vernacular Dialect & Historical Register Transpiler (Capability #20)", () => {
  it("provides metadata catalog for all 8 registers", () => {
    const keys = Object.keys(REGISTER_CATALOG);
    expect(keys.length).toBe(8);

    expect(keys).toContain("sadhu_bhasha");
    expect(keys).toContain("dhakaiya_kutti");
    expect(keys).toContain("sylheti_nagri");
    expect(keys).toContain("chittagonian_chatgaya");
    expect(keys).toContain("barisali");
    expect(keys).toContain("liberation_war_1971");
    expect(keys).toContain("cinematic_melodrama_1950s");
    expect(keys).toContain("cholit_standard");

    for (const key of keys) {
      const reg = REGISTER_CATALOG[key as keyof typeof REGISTER_CATALOG];
      expect(reg.nameBangla).toBeTruthy();
      expect(reg.historicalPeriod).toBeTruthy();
      expect(reg.geographicRegion).toBeTruthy();
      expect(reg.culturalNote).toBeTruthy();
    }
  });

  it("converts standard text into 19th C. Classical Sadhu Bhasha with uncontracted verbs and pronouns", () => {
    const input = "আমরা সেখানে গিয়েছিলাম এবং তাকে দেখেছিলাম।";
    const result = transpileBengaliRegister(input, "sadhu_bhasha");

    expect(result.targetRegister).toBe("sadhu_bhasha");
    expect(result.transpiledText).toContain("তথায়");
    expect(result.transpiledText).toContain("গিয়াছিলাম");
    expect(result.transpiledText).toContain("তাহাকে");
    expect(result.transformationsCount).toBeGreaterThanOrEqual(3);
    expect(result.authenticityScore).toBeGreaterThanOrEqual(75);
    expect(result.linguisticNotes.length).toBeGreaterThan(0);
  });

  it("respects preserveDialogueQuotesOnly option leaving narrative intact", () => {
    const narrativeWithQuote = 'তিনি শান্ত গলায় বললেন, "ভাই কেমন আছেন? আপনি কি খেয়েছেন?" তারপর তিনি চলে গেলেন।';
    const result = transpileBengaliRegister(narrativeWithQuote, "dhakaiya_kutti", {
      preserveDialogueQuotesOnly: true,
    });

    // Outside the quote, narrative stays intact
    expect(result.transpiledText).toContain("তিনি শান্ত গলায় বললেন");
    // Inside the quote, dialogue is converted to Dhakaiya
    expect(result.transpiledText).toContain("মামা খবর কি");
    expect(result.dialogueQuotesOnly).toBe(true);
  });

  it("converts pronouns and verbal inflections into Barisali", () => {
    const input = "আমাদের সাথে চলো, কোথায় যাবে তুমি?";
    const result = transpileBengaliRegister(input, "barisali");

    expect(result.targetRegister).toBe("barisali");
    expect(result.transpiledText).toContain("মোগো লগে চল");
    expect(result.transpiledText).toContain("কনে যাবা");
    expect(result.transformationTokens.length).toBeGreaterThan(0);
  });

  it("transpiles accurately into 1971 Liberation War battlefield register", () => {
    const input = "শত্রুরা আক্রমণ করছে, আমাদের ক্যাম্পে সতর্কতা জারি করো। জয় হোক!";
    const result = transpileBengaliRegister(input, "liberation_war_1971");

    expect(result.targetRegister).toBe("liberation_war_1971");
    expect(result.transpiledText).toContain("পাক হানাদার বাহিনী");
    expect(result.transpiledText).toContain("ক্যাম্প অ্যালার্ট");
    expect(result.transpiledText).toContain("জয় বাংলা");
  });

  it("transpiles into 1950s Golden Era Theatrical Melodrama", () => {
    const input = "ভগবানের কসম, তুমি এটা কি করলে? আমি চিরতরে চলে যাব।";
    const result = transpileBengaliRegister(input, "cinematic_melodrama_1950s");

    expect(result.targetRegister).toBe("cinematic_melodrama_1950s");
    expect(result.transpiledText).toContain("ঈশ্বর সাক্ষী");
    expect(result.transpiledText).toContain("এ তুমি কি করিলে");
  });
});
