import { describe, it, expect } from "vitest";
import { NilkhetSpineCalculator } from "../spine-calculator.js";

describe("Nilkhet Print-on-Demand (POD) Spine & CMYK Layout Engine", () => {
  it("calculates softcover spine width, bleed margins, and book weight accurately", () => {
    // 200-page Bangla novel on 80 GSM offset paper, 140x215mm trim
    const layout = NilkhetSpineCalculator.calculate({
      pageCount: 200,
      trimWidthMm: 140,
      trimHeightMm: 215,
      paperGSM: 80,
      coverGSM: 300,
      bindingStyle: "perfect_binding_softcover",
      bleedMarginMm: 3,
    });

    expect(layout.leafCount).toBe(100);
    expect(layout.spineThicknessMm).toBeGreaterThan(10); // 100 * 0.104 + 0.5 = 10.9mm
    expect(layout.totalCoverWidthMm).toBe(140 * 2 + layout.spineThicknessMm + 6);
    expect(layout.bleedMarginMm).toBe(3);
    expect(layout.estimatedWeightGrams).toBeGreaterThan(200);
    expect(layout.pressReadyValidation.dpiRequirement).toBe(300);
    expect(layout.pressReadyValidation.colorSpace).toBe("CMYK");
  });

  it("adds greyboard wrap allowance for casebound hardcovers", () => {
    const soft = NilkhetSpineCalculator.calculate({
      pageCount: 300,
      trimWidthMm: 140,
      trimHeightMm: 215,
      paperGSM: 80,
      coverGSM: 300,
      bindingStyle: "perfect_binding_softcover",
    });

    const hard = NilkhetSpineCalculator.calculate({
      pageCount: 300,
      trimWidthMm: 140,
      trimHeightMm: 215,
      paperGSM: 80,
      coverGSM: 300,
      bindingStyle: "casebound_hardcover",
    });

    expect(hard.spineThicknessMm).toBeGreaterThan(soft.spineThicknessMm);
    expect(hard.estimatedWeightGrams).toBeGreaterThan(soft.estimatedWeightGrams);
  });
});
