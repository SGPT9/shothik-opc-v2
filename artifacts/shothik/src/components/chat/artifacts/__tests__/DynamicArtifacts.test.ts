import { describe, it, expect } from "vitest";
import { buildDynamicResearch, buildDynamicSteps } from "../DeepResearchArtifact";
import { buildDynamicDeck } from "../SlidesArtifact";
import { buildDynamicSheet, evaluateFormula, computeDynamicKPIs } from "../SheetArtifact";

describe("Dynamic Artifacts Test Suite", () => {
  describe("DeepResearchArtifact Generators", () => {
    it("generates structured sources and summary for governance query", () => {
      const result = buildDynamicResearch("Tarique Rahman democratic transition 2026");
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.summary).toContain("Tarique Rahman");
      expect(result.sources[0].reliability).toBeDefined();
    });

    it("generates dynamic steps based on custom query", () => {
      const steps = buildDynamicSteps("Organic Agriculture Export in Bangladesh");
      expect(steps.length).toBe(4);
      expect(steps[0].label).toContain("Organic Agriculture");
      expect(steps.every((s) => s.status === "completed")).toBe(true);
    });

    it("generates fallback research for arbitrary industry queries", () => {
      const result = buildDynamicResearch("Micro-hydropower dams in Chittagong Hill Tracts");
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.summary).toContain("Executive Summary");
      expect(result.sources[0].domain).toBe("worldbank.org");
    });
  });

  describe("SlidesArtifact Generators", () => {
    it("generates healthcare presentation deck for medical queries", () => {
      const deck = buildDynamicDeck("Digital Clinic & Telemedicine Network in Rural Bangladesh");
      expect(deck.length).toBeGreaterThanOrEqual(4);
      expect(deck[0].layout).toBe("hero");
      expect(deck[0].metrics).toBeDefined();
      expect(deck[0].metrics?.length).toBeGreaterThan(0);
      expect(deck[1].splitLeft).toBeDefined();
      expect(deck[1].splitRight).toBeDefined();
    });

    it("generates Seedstars / Accelerating Asia regional pitch deck for accelerator queries", () => {
      const deck = buildDynamicDeck("Seedstars South Asia Accelerator Pitch Deck");
      expect(deck.length).toBe(4);
      expect(deck[0].title).toBe("Seedstars South Asia Accelerator Pitch Deck");
      expect(deck[0].subtitle).toContain("Next-Billion Consumer");
      expect(deck[0].metrics?.some(m => m.label === "Regional TAM")).toBe(true);
      expect(deck[1].splitRight?.points.some(p => p.includes("bKash"))).toBe(true);
      expect(deck[2].metrics?.some(m => m.label === "LTV / CAC")).toBe(true);
    });

    it("generates University Thesis Defense deck for academic dissertation queries", () => {
      const deck = buildDynamicDeck("BUET Computer Science University Thesis Defense");
      expect(deck.length).toBe(4);
      expect(deck[0].tag).toBe("Academic Defense");
      expect(deck[0].metrics?.some(m => m.label === "Accuracy Gain")).toBe(true);
      expect(deck[1].splitLeft?.heading).toContain("Prior Art");
      expect(deck[2].metrics?.some(m => m.label === "F1 Score")).toBe(true);
    });

    it("generates general startup pitch deck for generic queries", () => {
      const deck = buildDynamicDeck("AI Logistics & Freight Optimization");
      expect(deck.length).toBeGreaterThanOrEqual(4);
      expect(deck.some((s) => s.layout === "timeline")).toBe(true);
      expect(deck.some((s) => s.speakerNotes.length > 0)).toBe(true);
    });
  });

  describe("SheetArtifact Generators & Formula Engine", () => {
    it("generates courier & MFS settlement model for logistics titles", () => {
      const sheet = buildDynamicSheet("Logistics & Courier Delivery Financials");
      expect(sheet.headers.length).toBeGreaterThan(2);
      expect(sheet.rows.length).toBeGreaterThan(3);
      expect(sheet.kpis.length).toBe(4);
    });

    it("evaluates SUM formula correctly", () => {
      const grid = [
        ["100", "200"],
        ["300", "400"],
      ];
      const sumResult = evaluateFormula("=SUM(A1:B2)", grid);
      expect(sumResult).toBe("1,000");
    });

    it("evaluates AVERAGE formula correctly", () => {
      const grid = [
        ["10", "20"],
        ["30", "40"],
      ];
      const avgResult = evaluateFormula("=AVERAGE(A1:B2)", grid);
      expect(avgResult).toBe("25");
    });

    it("evaluates arithmetic formula expressions", () => {
      const grid = [["1000", "50"]];
      const result = evaluateFormula("=A1 * 1.15", grid);
      expect(result).toBe("1,150");
    });

    it("dynamically recomputes KPIs based on grid state", () => {
      const grid = [
        ["Monthly Active Users", "20,000", "60,000", "10,000"],
        ["Average Order Value", "1,500", "2,000", "1,000"],
        ["Gross Revenue", "30,000,000", "120,000,000", "10,000,000"],
        ["Net Operating Profit", "+20,000,000", "+90,000,000", "+5,000,000"],
      ];
      const kpis = computeDynamicKPIs(grid, "3-Scenario Financial Model (BDT)");
      expect(kpis.length).toBe(4);
      expect(kpis[0].label).toBe("Base MRR");
      expect(kpis[0].value).toContain("30.00M");
    });
  });

  describe("Universal Print & Nilkhet POD Engine", () => {
    it("calculates estimated pages and physical POD cost accurately", () => {
      const wordCount = 1200; // ~3 pages on A4 (450 wpp) or ~5 pages on Royal Demy (280 wpp)
      const a4Pages = Math.ceil(wordCount / 450) + 1; // +1 for cover
      const a4Price = 80 + a4Pages * 1.5 + 80;
      expect(a4Pages).toBe(4);
      expect(a4Price).toBe(166);

      const royalPages = Math.ceil(wordCount / 280) + 1;
      const royalPrice = 80 + royalPages * 1.5 + 140;
      expect(royalPages).toBe(6);
      expect(royalPrice).toBe(229);
    });
  });
});
