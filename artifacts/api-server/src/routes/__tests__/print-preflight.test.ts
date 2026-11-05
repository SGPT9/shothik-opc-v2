import { describe, it, expect } from "vitest";
import {
  createPrintPreflightRouter,
  auditManuscriptPrintPreflight,
  calculateSpineDimensions,
  calculateNilkhetSignatures,
  generatePressProductionSpecs,
  TRIM_PRESETS,
  PAPER_CALIPER_MM
} from "../print-preflight.js";

describe("Capability #38: One-Click Print Preflight & 6x9 Layout Typesetter", () => {
  it("provides comprehensive trim presets for Bangladeshi & international book publishing", () => {
    expect(TRIM_PRESETS["crown_octavo_5_5x8_5"]).toBeDefined();
    expect(TRIM_PRESETS["crown_octavo_5_5x8_5"].widthIn).toBe(5.5);
    expect(TRIM_PRESETS["crown_octavo_5_5x8_5"].heightIn).toBe(8.5);

    expect(TRIM_PRESETS["bangla_academy_5_5x8_75"]).toBeDefined();
    expect(TRIM_PRESETS["us_trade_6x9"].widthIn).toBe(6.0);
    expect(TRIM_PRESETS["a5_standard"].widthMm).toBe(148.0);
  });

  it("calculates spine dimensions based on page count and paper caliper with binding allowance", () => {
    // 200 pages on 80 GSM Munken Cream Paper
    const spine = calculateSpineDimensions(200, "book_cream_80gsm");
    expect(spine.spineMm).toBeGreaterThan(12);
    expect(spine.spineMm).toBeLessThan(14);
    expect(spine.spineInches).toBeGreaterThan(0.45);

    // 100 pages on 70 GSM White Offset
    const spineOffset = calculateSpineDimensions(100, "offset_70gsm");
    expect(spineOffset.spineMm).toBeLessThan(spine.spineMm);
  });

  it("calculates Nilkhet 16-page and 8-page signature imposition (ফরমা)", () => {
    // 144 pages should divide cleanly into 9 formas of 16 pages
    const sig144 = calculateNilkhetSignatures(144, 16);
    expect(sig144.totalFormas).toBe(9);
    expect(sig144.exactPagesCovered).toBe(144);
    expect(sig144.blankPaddingPages).toBe(0);
    expect(sig144.paperEfficiencyPercent).toBe(100);

    // 142 pages needs 9 formas with 2 blank padding pages
    const sig142 = calculateNilkhetSignatures(142, 16);
    expect(sig142.totalFormas).toBe(9);
    expect(sig142.blankPaddingPages).toBe(2);
    expect(sig142.paperEfficiencyPercent).toBeGreaterThan(98);
  });

  it("audits manuscript against PDF/X-1a compliance, gutter clearance, and font embedding", () => {
    const sampleText = "বৃষ্টির ভারী ধারা যখন সদরঘাটের টিনের চালে শেষবারের মতো আঘাত হানছিল, তখন ঘড়ির কাঁটায় রাত আড়াইটা।";
    const audit = auditManuscriptPrintPreflight(sampleText, {
      trimSize: "crown_octavo_5_5x8_5",
      paperStock: "book_cream_80gsm",
      margins: {
        insideGutterInches: 0.85,
        outsideInches: 0.55,
        topInches: 0.65,
        bottomInches: 0.75,
        bleedInches: 0.125
      }
    });

    expect(audit.overallPrintReadyScore).toBeGreaterThanOrEqual(80);
    expect(audit.isPdfX1aCompliant).toBe(true);
    expect(audit.gutterClearanceStatus).toBe("optimal");
    expect(audit.checks.length).toBeGreaterThanOrEqual(5);

    const fontCheck = audit.checks.find(c => c.id === "chk_fonts");
    expect(fontCheck?.status).toBe("pass");
  });

  it("generates production-ready Nilkhet press specifications", () => {
    const specs = generatePressProductionSpecs("হিমু ও বুড়িগঙ্গার কুয়াশা", 160, "crown_octavo_5_5x8_5", "book_cream_80gsm");
    expect(specs.jobTitle).toBe("হিমু ও বুড়িগঙ্গার কুয়াশা");
    expect(specs.trimBox.widthInches).toBe(5.5);
    expect(specs.bleedBox.bleedMm).toBe(3.175);
    expect(specs.nilkhetFormaPlan.formasCount).toBe(10);
    expect(specs.nilkhetPressNotesBn).toContain("ডিমাই সাইজ প্লেট");
  });

  it("exports an Express router function with valid print preflight endpoints", () => {
    const router = createPrintPreflightRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
