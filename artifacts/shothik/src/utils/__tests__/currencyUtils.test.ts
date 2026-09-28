import { describe, it, expect } from "vitest";
import {
  toBengaliNumerals,
  formatSouthAsianNumber,
  getLakhCroreDescription,
  formatBanglaCurrency,
} from "../currencyUtils";

describe("Bangladeshi Currency & Number Formatter (currencyUtils)", () => {
  describe("toBengaliNumerals", () => {
    it("converts 0-9 to Bengali numerals ০-৯", () => {
      expect(toBengaliNumerals("1234567890")).toBe("১২৩৪৫৬৭৮৯০");
      expect(toBengaliNumerals(5000000)).toBe("৫০০০০০০");
    });
  });

  describe("formatSouthAsianNumber", () => {
    it("formats thousands (3-digit group)", () => {
      expect(formatSouthAsianNumber(1000)).toBe("1,000");
      expect(formatSouthAsianNumber(999)).toBe("999");
    });

    it("formats lakhs (2-digit grouping after first 3 digits)", () => {
      expect(formatSouthAsianNumber(100000)).toBe("1,00,000"); // 1 Lakh
      expect(formatSouthAsianNumber(1250000)).toBe("12,50,000"); // 12.5 Lakh
      expect(formatSouthAsianNumber(5000000)).toBe("50,00,000"); // 50 Lakh
    });

    it("formats crores (8+ digits)", () => {
      expect(formatSouthAsianNumber(10000000)).toBe("1,00,00,000"); // 1 Crore
      expect(formatSouthAsianNumber(250000000)).toBe("25,00,00,000"); // 25 Crore
    });
  });

  describe("getLakhCroreDescription", () => {
    it("returns Bengali words for scales", () => {
      expect(getLakhCroreDescription(5000000, "bn")).toBe("৫০ লাখ টাকা");
      expect(getLakhCroreDescription(12500000, "bn")).toBe("১.২৫ কোটি টাকা");
      expect(getLakhCroreDescription(85000, "bn")).toBe("৮৫ হাজার টাকা");
    });

    it("returns English words for scales", () => {
      expect(getLakhCroreDescription(5000000, "en")).toBe("50 Lakh BDT");
      expect(getLakhCroreDescription(12500000, "en")).toBe("1.25 Crore BDT");
    });
  });

  describe("formatBanglaCurrency", () => {
    it("formats with South Asian comma grouping and currency symbol", () => {
      expect(formatBanglaCurrency(5000000)).toBe("৳ 50,00,000");
    });

    it("includes word representation when showWords is true", () => {
      expect(formatBanglaCurrency(5000000, { showWords: true })).toBe(
        "৳ 50,00,000 (৫০ লাখ টাকা)"
      );
      expect(
        formatBanglaCurrency(12500000, { showWords: true, locale: "en" })
      ).toBe("৳ 1,25,00,000 (1.25 Crore BDT)");
    });

    it("formats with Bengali digits when bengaliDigits is true", () => {
      expect(formatBanglaCurrency(5000000, { bengaliDigits: true })).toBe(
        "৳ ৫০,০০,০০০"
      );
    });
  });
});
