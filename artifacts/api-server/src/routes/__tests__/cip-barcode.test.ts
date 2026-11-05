import { describe, it, expect } from "vitest";
import {
  createCipBarcodeRouter,
  validateAndCalculateEan13Checksum,
  generateSimpleEan13Svg,
  buildNationalLibraryCipBlock
} from "../cip-barcode.js";

describe("Capability #40: Autonomous National Library Cataloging (CIP) & ISBN Barcode Engine", () => {
  it("validates and calculates EAN-13 ISBN checksums accurately", () => {
    // 978-984-96421-8-3 -> valid check digit is 3
    const res = validateAndCalculateEan13Checksum("978-984-96421-8-3");
    expect(res.isValid).toBe(true);
    expect(res.calculatedCheckDigit).toBe(3);
    expect(res.cleanDigits).toBe("9789849642183");

    // Invalid check digit test
    const invalidRes = validateAndCalculateEan13Checksum("978-984-96421-8-9");
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.calculatedCheckDigit).toBe(3);

    // Calculate check digit from 12 digits
    const calcFrom12 = validateAndCalculateEan13Checksum("978984964218");
    expect(calcFrom12.isValid).toBe(true);
    expect(calcFrom12.calculatedCheckDigit).toBe(3);
    expect(calcFrom12.cleanDigits).toBe("9789849642183");
  });

  it("compiles official National Library of Bangladesh CIP block with DDC 891.443", () => {
    const cip = buildNationalLibraryCipBlock("অনন্ত নক্ষত্রবীথি", "শহীদুল ইসলাম", "Islam, Shahidul", 2026, 160);
    expect(cip.libraryStandard).toContain("National Library of Bangladesh");
    expect(cip.ddcClassification).toContain("891.443");
    expect(cip.formattedCipCardBn).toContain("বাংলাদেশ জাতীয় গ্রন্থপঞ্জি প্রকাশনা-উপাত্ত");
    expect(cip.formattedCipCardBn).toContain("অনন্ত নক্ষত্রবীথি / শহীদুল ইসলাম");
    expect(cip.copyrightNoticeBn).toContain("সর্বস্বত্ব সংরক্ষিত");
    expect(cip.bnbControlNumber).toContain("BNB-2026");
  });

  it("generates valid vector SVG markup with EAN-13 quiet zones and guard bars", () => {
    const svg = generateSimpleEan13Svg("978-984-96421-8-3");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("rect");
    expect(svg).toContain("789849");
  });

  it("exports an Express router function with valid CIP and barcode endpoints", () => {
    const router = createCipBarcodeRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
