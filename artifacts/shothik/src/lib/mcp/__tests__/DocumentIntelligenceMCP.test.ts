import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import {
  DocumentIntelligenceMCPEngine,
  MagikaClassifier,
} from "../DocumentIntelligenceMCP";
import { SecondMeCognitiveMemory } from "@/lib/memory/second-me-cognitive-memory";

describe("DocumentIntelligenceMCP (Living Document Engine)", () => {
  let memory: SecondMeCognitiveMemory;
  let engine: DocumentIntelligenceMCPEngine;

  beforeEach(() => {
    memory = new SecondMeCognitiveMemory("test-session-doc");
    engine = new DocumentIntelligenceMCPEngine(memory);
  });

  describe("1. Magika Content-Type & MIME Validation", () => {
    it("accepts valid PDF documents", async () => {
      const res = await MagikaClassifier.detectMimeType(new Uint8Array([0x25, 0x50, 0x44, 0x46]), "report.pdf");
      expect(res.isSafe).toBe(true);
      expect(res.mimeType).toBe("application/pdf");
    });

    it("accepts valid DOCX documents", async () => {
      const res = await MagikaClassifier.detectMimeType(new Uint8Array([]), "contract.docx");
      expect(res.isSafe).toBe(true);
      expect(res.mimeType).toContain("wordprocessingml");
    });

    it("rejects unsafe executable binaries", async () => {
      const res = await MagikaClassifier.detectMimeType(new Uint8Array([]), "malicious.exe");
      expect(res.isSafe).toBe(false);
      expect(res.detectedFormat).toBe("executable");
    });
  });

  describe("2. Coordinate Normalization to [0, 1000]² Grid", () => {
    it("correctly normalizes standard top-left bounding boxes", () => {
      const raw = { x: 50, y: 100, w: 200, h: 150 };
      const bbox = engine.normalizeBBox(raw, 1000, 1000, false);
      expect(bbox).toEqual([100, 50, 250, 250]);
    });

    it("correctly handles PDF.js bottom-left origin inversion", () => {
      const raw = { x: 100, y: 200, w: 300, h: 100 };
      const bbox = engine.normalizeBBox(raw, 1000, 1000, true);
      // ymin = (1000 - 300) = 700, ymax = (1000 - 200) = 800
      expect(bbox).toEqual([700, 100, 800, 400]);
    });
  });

  describe("3. Ingestion & Dual-Scale Parent-Child AST Chunking", () => {
    it("ingests document and indexes child chunks into SecondMeCognitiveMemory", async () => {
      const result = await engine.ingestDocument({
        docId: "doc_venture_brief",
        fileName: "Venture_Brief.pdf",
      });

      expect(result.docId).toBe("doc_venture_brief");
      expect(result.totalNodes).toBe(3);
      expect(result.indexedChunks).toBe(3);

      // Verify SecondMeCognitiveMemory has indexed semantic nodes
      const recalled = memory.searchSemanticMemory("merchants", 3);
      expect(recalled.length).toBeGreaterThan(0);
      expect(recalled[0].text).toContain("68% of regional merchants");
    });
  });

  describe("4. MCP Tools: docInspectToc, docQueryCognitive, docReadSlice", () => {
    beforeEach(async () => {
      await engine.ingestDocument({
        docId: "doc_test_100",
        fileName: "Master_Agreement.pdf",
      });
    });

    it("docInspectToc returns structured outline", async () => {
      const res = await engine.docInspectToc("doc_test_100");
      expect(res.docId).toBe("doc_test_100");
      expect(res.outline.length).toBe(3);
      expect(res.outline[0].title).toContain("Executive Summary");
    });

    it("docQueryCognitive performs small-to-big retrieval with citation badges", async () => {
      const matches = await engine.docQueryCognitive("doc_test_100", "liability aggregate cap", 1);
      expect(matches.length).toBe(1);
      expect(matches[0].matchedSnippet).toContain("$2,000,000 USD");
      expect(matches[0].citationMarker).toBe("[[doc:doc_test_100:p3-p3-sec4]]");
      expect(matches[0].parentContext).toContain("Section 3: Limitation of Liability");
    });

    it("docReadSlice returns high-fidelity Virtual Table Matrix", async () => {
      const slice = await engine.docReadSlice("doc_test_100", "p2-tbl1");
      expect(slice).not.toBeNull();
      expect(slice?.type).toBe("table");
      expect(slice?.tableData?.headers[1].text).toBe("FY2024 ($M)");
      expect(slice?.tableData?.rows[0][1].numericValue).toBe(18.4);
    });
  });

  describe("5. Schema Extraction with Zod Validation", () => {
    beforeEach(async () => {
      await engine.ingestDocument({
        docId: "doc_legal_contract",
        fileName: "Contract.pdf",
      });
    });

    it("extracts and validates typed legal schema", async () => {
      const LegalSchema = z.object({
        liabilityCap: z.number(),
        currency: z.string(),
        indemnificationClause: z.boolean(),
      });

      const extracted = await engine.docExtractSchema("doc_legal_contract", LegalSchema, ["p3-sec4"]);
      expect(extracted.success).toBe(true);
      expect(extracted.data?.liabilityCap).toBe(2000000);
      expect(extracted.data?.currency).toBe("USD");
      expect(extracted.data?.indemnificationClause).toBe(true);
    });
  });

  describe("6. Fail-Closed Citation Verification Guardrail", () => {
    beforeEach(async () => {
      await engine.ingestDocument({
        docId: "doc_audited_report",
        fileName: "Report.pdf",
      });
    });

    it("verifies genuine citation against extracted AST text", () => {
      const tag = "[[doc:doc_audited_report:p3-p3-sec4]]";
      const excerpt = "liability exceed $2,000,000 USD";
      const result = engine.verifyCitation(tag, excerpt);

      expect(result.isValid).toBe(true);
      expect(result.similarity).toBeGreaterThan(0.7);
    });

    it("fails closed on fabricated / hallucinated claims", () => {
      const tag = "[[doc:doc_audited_report:p3-p3-sec4]]";
      const fakeExcerpt = "unlimited unlimited liability without any cap";
      const result = engine.verifyCitation(tag, fakeExcerpt);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("similarity below threshold");
    });

    it("fails closed on non-existent document nodes", () => {
      const tag = "[[doc:doc_audited_report:p99-fake-node]]";
      const result = engine.verifyCitation(tag, "some text");

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("does not exist in AST");
    });
  });
});
