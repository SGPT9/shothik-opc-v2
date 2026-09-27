import { describe, it, expect } from "vitest";
import { BengaliTypographyShaper } from "../bengali-shaper.js";

describe("BengaliTypographyShaper (OpenType & Complex Script Shaper)", () => {
  it("normalizes and resolves complex conjuncts (যুক্তবর্ণ)", () => {
    const text = "বাংলাদেশ একটি সুন্দর রাষ্ট্র এবং আন্তর্জাতিক খ্যাতিসম্পন্ন";
    const res = BengaliTypographyShaper.shape(text, 12);

    expect(res.isCompliant).toBe(true);
    expect(res.glyphCount).toBeGreaterThan(0);
    expect(res.estimatedWidthMm).toBeGreaterThan(0);
    expect(res.hasPreBaseVowels).toBe(true);
  });

  it("handles empty or single word inputs gracefully", () => {
    const resEmpty = BengaliTypographyShaper.shape("");
    expect(resEmpty.glyphCount).toBe(0);
    expect(resEmpty.estimatedWidthMm).toBe(0);

    const resSingle = BengaliTypographyShaper.shape("বইমেলা", 10);
    expect(resSingle.shapedText).toBe("বইমেলা");
    expect(resSingle.glyphCount).toBe(6);
  });

  it("pre-orders syllables for raw bitmap rasterization (ESC/POS thermal printers)", () => {
    const raw = "কিশোর";
    const bitmapOrdered = BengaliTypographyShaper.preOrderForBitmap(raw);
    expect(bitmapOrdered).toBeDefined();
    expect(bitmapOrdered.length).toBeGreaterThan(0);
  });
});
