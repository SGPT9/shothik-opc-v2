import { describe, it, expect } from "vitest";
import { VernacularDialectEngine } from "../vernacular-dialects.js";

describe("VernacularDialectEngine (Demographic Adaptation)", () => {
  const engine = VernacularDialectEngine.getInstance();

  it("detects Sylheti dialect keywords and normalizes to standard Bangla", () => {
    const input = "লন্ডন থাকি টেকা আইছে, অখন যাইরাম";
    const result = engine.detectDialect(input);
    expect(result.detectedDialect).toBe("sylheti");
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.normalizedStandardBangla).toContain("লন্ডন থেকে টাকা এসেছে");
    expect(result.normalizedStandardBangla).toContain("এখন যাচ্ছি");
  });

  it("detects Chatgaya maritime & port logistics dialect", () => {
    const input = "জাহাজের মাল খালাস টেঁয়া কত কুরিয়ার পোঁছাই গেইয়ে";
    const result = engine.detectDialect(input);
    expect(result.detectedDialect).toBe("chatgaya");
    expect(result.matchedKeywords.length).toBeGreaterThan(1);
    expect(result.normalizedStandardBangla).toContain("জাহাজের পণ্য খালাস");
  });

  it("detects Noakhailla merchant dialect", () => {
    const input = "হাছাই নি বিকাশে টেয়া মারি দেন";
    const result = engine.detectDialect(input);
    expect(result.detectedDialect).toBe("noakhailla");
    expect(result.normalizedStandardBangla).toContain("সত্যি কি");
  });

  it("detects Dhakaiya F-Commerce street slang", () => {
    const input = "মামা খবর কি ১-ট্যাপে বিকাশ মারেন মাল ছাইড়া দেন";
    const result = engine.detectDialect(input);
    expect(result.detectedDialect).toBe("dhakaiya");
    expect(result.normalizedStandardBangla).toContain("এক ট্যাপে বিকাশ পেমেন্ট করুন");
  });

  it("synthesizes standard Bangla into target regional dialects", () => {
    const standard = "এক ট্যাপে বিকাশ পেমেন্ট করুন";
    const synthDhakaiya = engine.synthesizeDialect(standard, "dhakaiya");
    expect(synthDhakaiya.translatedText).toBe("১-ট্যাপে বিকাশ মারেন");

    const synthNoakhailla = engine.synthesizeDialect("সত্যি কি", "noakhailla");
    expect(synthNoakhailla.translatedText).toBe("হাছাই নি");
  });
});
