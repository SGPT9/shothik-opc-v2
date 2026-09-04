import { describe, it, expect } from "vitest";
import { VernacularDialectAdapter } from "../VernacularDialectAdapter";

describe("VernacularDialectAdapter (Client-Side Demographic Adaptation)", () => {
  const adapter = VernacularDialectAdapter.getInstance();

  it("detects and normalizes Sylheti dialect expressions", () => {
    const input = "লন্ডন থাকি টেকা আইছে জমিনের দলিল দেখান";
    const result = adapter.detectDialect(input);
    expect(result.detectedDialect).toBe("sylheti");
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.normalizedStandardBangla).toContain("লন্ডন থেকে টাকা এসেছে");
    expect(result.normalizedStandardBangla).toContain("জমির দলিল");
  });

  it("detects and normalizes Chatgaya maritime trade expressions", () => {
    const input = "জাহাজের মাল খালাস কুরিয়ার পোঁছাই গেইয়ে";
    const result = adapter.detectDialect(input);
    expect(result.detectedDialect).toBe("chatgaya");
    expect(result.normalizedStandardBangla).toContain("জাহাজের পণ্য খালাস");
    expect(result.normalizedStandardBangla).toContain("কুরিয়ার পৌঁছে গেছে");
  });

  it("detects and normalizes Noakhailla merchant dialect", () => {
    const input = "হাছাই নি বিকাশে টেয়া মারি দেন";
    const result = adapter.detectDialect(input);
    expect(result.detectedDialect).toBe("noakhailla");
    expect(result.normalizedStandardBangla).toContain("সত্যি কি");
    expect(result.normalizedStandardBangla).toContain("বিকাশে টাকা পাঠিয়ে দিন");
  });

  it("detects and normalizes Dhakaiya F-Commerce slang", () => {
    const input = "মামা খবর কি ১-ট্যাপে বিকাশ মারেন মাল ছাইড়া দেন";
    const result = adapter.detectDialect(input);
    expect(result.detectedDialect).toBe("dhakaiya");
    expect(result.normalizedStandardBangla).toContain("ভাই কেমন আছেন");
    expect(result.normalizedStandardBangla).toContain("এক ট্যাপে বিকাশ পেমেন্ট করুন");
  });

  it("synthesizes standard Bangla into regional vernaculars", () => {
    const standard = "এক ট্যাপে বিকাশ পেমেন্ট করুন";
    const synthDhk = adapter.synthesizeDialect(standard, "dhakaiya");
    expect(synthDhk.translatedText).toBe("১-ট্যাপে বিকাশ মারেন");

    const synthNoak = adapter.synthesizeDialect("সত্যি কি", "noakhailla");
    expect(synthNoak.translatedText).toBe("হাছাই নি");
  });
});
