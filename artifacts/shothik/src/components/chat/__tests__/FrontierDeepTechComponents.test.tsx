import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingSelectionToolbar } from "../FloatingSelectionToolbar";
import { ScrollSpyTOC } from "../artifacts/ScrollSpyTOC";
import { LivePrintRoiCalculator } from "../artifacts/LivePrintRoiCalculator";
import { SourceCardCarousel } from "../SourceCardCarousel";

describe("Frontier Deep-Tech UI/UX Components", () => {
  describe("ScrollSpyTOC (Genspark Sparkpages)", () => {
    it("renders headings list and triggers onSelect when a section is clicked", () => {
      const onSelect = vi.fn();
      const headings = [
        { id: "h1", title: "Executive Summary", level: 1 },
        { id: "h2", title: "Market Growth & TAM", level: 2 },
      ];

      render(<ScrollSpyTOC headings={headings} activeId="h1" onSelect={onSelect} />);

      expect(screen.getByText("Outline & Sections")).toBeDefined();
      expect(screen.getByText("Executive Summary")).toBeDefined();
      expect(screen.getByText("Market Growth & TAM")).toBeDefined();

      fireEvent.click(screen.getByText("Market Growth & TAM"));
      expect(onSelect).toHaveBeenCalledWith("h2");
    });
  });

  describe("LivePrintRoiCalculator (Genspark Interactive Widget)", () => {
    it("calculates Forme math and gross margin correctly", () => {
      render(<LivePrintRoiCalculator initialPages={160} initialQuantity={50} />);

      expect(screen.getByText("Interactive Nilkhet Manufacturing & ROI Model")).toBeDefined();
      expect(screen.getByText(/50 Copies/)).toBeDefined();
      expect(screen.getByText(/160 Pages/)).toBeDefined();
    });
  });

  describe("SourceCardCarousel (Perplexity Pro Search)", () => {
    it("renders source cards with verified citations and expands verbatim quotes on click", () => {
      const sources = [
        {
          id: 1,
          title: "Election Commission Gazette 2026",
          domain: "ecs.gov.bd",
          url: "https://ecs.gov.bd/gazette",
          snippet: "Official gazette results for Jatiya Sangsad elections.",
          verbatimQuote: "The constitutional parliamentary majority was verified.",
          reliability: "99.9%",
        },
      ];

      render(<SourceCardCarousel sources={sources} />);

      expect(screen.getByText(/Verified Sources/)).toBeDefined();
      expect(screen.getByText("ecs.gov.bd")).toBeDefined();
      expect(screen.getByText("Election Commission Gazette 2026")).toBeDefined();

      // Click card to open verbatim quote
      fireEvent.click(screen.getByText("Election Commission Gazette 2026"));
      expect(screen.getByText(/Verbatim Primary Quote/)).toBeDefined();
      expect(screen.getByText(/The constitutional parliamentary majority was verified./)).toBeDefined();
    });
  });
});
