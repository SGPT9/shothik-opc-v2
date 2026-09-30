import { describe, it, expect } from "vitest";
import { openDataLoader, OpenDataLoaderBridge } from "../opendataloader-bridge.js";

describe("OpenDataLoaderBridge Document & Legal Deed Parser Suite", () => {
  const bridge = new OpenDataLoaderBridge();

  describe("parseTextDocument", () => {
    it("parses plain text files into markdown sections", () => {
      const content = "This is an executive thesis proposal on quantum algorithms in Dhaka.";
      const result = bridge.parseTextDocument(content, "thesis_proposal.txt");

      expect(result.title).toBe("thesis_proposal.txt");
      expect(result.markdown).toBe(content);
      expect(result.sections.length).toBe(1);
      expect(result.sections[0].type).toBe("text");
      expect(result.pageCount).toBe(1);
    });

    it("parses CSV files into clean markdown tables with column delimiters", () => {
      const csvContent = "SKU,Product Name,Price BDT,Stock\nSKU-001,Wireless Mouse,1200,45\nSKU-002,Mechanical Keyboard,3500,18";
      const result = bridge.parseTextDocument(csvContent, "inventory.csv");

      expect(result.title).toBe("inventory.csv");
      expect(result.sections[0].type).toBe("table");
      expect(result.markdown).toContain("| SKU | Product Name | Price BDT | Stock |");
      expect(result.markdown).toContain("| --- | --- | --- | --- |");
      expect(result.markdown).toContain("| SKU-001 | Wireless Mouse | 1200 | 45 |");
      expect(result.markdown).toContain("| SKU-002 | Mechanical Keyboard | 3500 | 18 |");
    });
  });

  describe("parseBanglaOcr", () => {
    it("normalizes common Bangla Academy orthography variants", () => {
      const rawText = "সরকারী গেজেট অনুযায়ী ১ম শ্রেণী কর্মকর্তাদের দাবী ও আইনজীবিদের শর্তাবলী।";
      const result = bridge.parseBanglaOcr(rawText, "circular.txt");

      expect(result.markdown).toContain("সরকারি গেজেট অনুযায়ী ১ম শ্রেণি কর্মকর্তাদের দাবি ও আইনজীবীদের শর্তাবলি।");
      expect(result.markdown).not.toContain("সরকারী");
      expect(result.markdown).not.toContain("শ্রেণী");
      expect(result.markdown).not.toContain("দাবী");
      expect(result.markdown).not.toContain("আইনজীবি");
      expect(result.markdown).not.toContain("শর্তাবলী");
    });

    it("extracts legal deed metadata (দলিল, খতিয়ান, দাগ, পরিমাণ, সাব-রেজিস্ট্রি) and generates summary table", () => {
      const deedText = `
গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
ধানমন্ডি সাব-রেজিস্ট্রি অফিস, ঢাকা
সাফ-কোবালা দলিল নং ৯৮৪৫
মৌজা: ধানমন্ডি, আরএস খতিয়ান নং: ১২৮/খ, দাগ নং: ৯৮২
জমির পরিমাণ: ৫.৫০ শতাংশ নাল জমি
দলিল মূল্য বাবদ পণ টাকা: ৪৫,০০,০০০ (পঁয়তাল্লিশ লাখ টাকা) পরিশোধিত।
      `;

      const result = bridge.parseBanglaOcr(deedText, "deed_sample.txt");

      expect(result.deedMetadata).toBeDefined();
      expect(result.deedMetadata?.deedType).toBe("সাফ-কোবালা দলিল");
      expect(result.deedMetadata?.subRegistryOffice).toContain("ধানমন্ডি সাব-রেজিস্ট্রি অফিস");
      expect(result.deedMetadata?.khatian).toContain("১২৮/খ");
      expect(result.deedMetadata?.daagNumber).toContain("৯৮২");
      expect(result.deedMetadata?.landArea).toContain("৫.৫০ শতাংশ");
      expect(result.deedMetadata?.considerationBdt).toContain("৪৫,০০,০০০");

      // Verifies formatted markdown table header
      expect(result.markdown).toContain("### 🏛️ আইনি দলিল সারসংক্ষেপ (Legal Deed Summary)");
      expect(result.markdown).toContain("| **দলিলের প্রকার (Deed Type)** |");
      expect(result.markdown).toContain("| **সাব-রেজিস্ট্রি অফিস (Registry)** |");
      expect(result.markdown).toContain("| **খতিয়ান (Khatian)** |");
      expect(result.markdown).toContain("| **জমির পরিমাণ (Area)** |");
    });
  });

  describe("parsePdf", () => {
    it("extracts text streams from simulated PDF byte streams into structured sections", async () => {
      const pdfBytes = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<< /Length 50 >>\nstream\nResearch Methodology for South Asian Micro-Commerce Systems.\nendstream\nendobj\n%%EOF"
      );

      const result = await bridge.parsePdf(pdfBytes, "thesis_chapter.pdf");

      expect(result.title).toBe("thesis_chapter.pdf");
      expect(result.pageCount).toBeGreaterThanOrEqual(1);
      expect(result.markdown).toContain("Research Methodology for South Asian Micro-Commerce Systems");
    });
  });
});
