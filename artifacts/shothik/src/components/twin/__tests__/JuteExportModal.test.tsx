import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JuteExportModal } from "../JuteExportModal";

describe("Frontend AG-UI Component: JuteExportModal (Slice 91)", () => {
  it("renders JuteExportModal with WAI-ARIA role and tab navigation", () => {
    render(<JuteExportModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/সোনালী আঁশ · Golden Fiber & Jute Export Studio/i)).toBeDefined();
    expect(screen.getByText(/Raw Jute Grading & Baling/i)).toBeDefined();
    expect(screen.getByText(/DJG Manufacturing Yield/i)).toBeDefined();
    expect(screen.getByText(/12% Export Cash Subsidy/i)).toBeDefined();
    expect(screen.getByText(/NBR Bonded Dossier/i)).toBeDefined();
  });

  it("displays raw jute grading controls and interacts with form", () => {
    render(<JuteExportModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Lot ID \/ চালান কোড/i)).toBeDefined();
    expect(screen.getByText(/Variety \/ জাত/i)).toBeDefined();
    expect(screen.getByText(/Gross Weight \(kg\) \/ মোট ওজন/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Appraise Lot & Calculate Pucca Bales/i })).toBeDefined();

    const appraiseBtn = screen.getByRole("button", { name: /Appraise Lot & Calculate Pucca Bales/i });
    fireEvent.click(appraiseBtn);
  });

  it("switches to DJG Manufacturing Yield tab and displays costing calculator", () => {
    render(<JuteExportModal isOpen={true} onClose={() => {}} />);

    const costingTab = screen.getByText(/DJG Manufacturing Yield/i);
    fireEvent.click(costingTab);

    expect(screen.getByText(/Product Category \/ পাটপণ্যের ধরন/i)).toBeDefined();
    expect(screen.getByText(/Target Production Units \/ লক্ষ্যমাত্রা/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Calculate Manufacturing BOM & Yield/i })).toBeDefined();
  });

  it("switches to Export Cash Subsidy tab and displays subsidy auditor", () => {
    render(<JuteExportModal isOpen={true} onClose={() => {}} />);

    const subsidyTab = screen.getByText(/12% Export Cash Subsidy/i);
    fireEvent.click(subsidyTab);

    expect(screen.getByText(/Export Invoice Number/i)).toBeDefined();
    expect(screen.getByText(/FOB Export Value \(\$ USD\)/i)).toBeDefined();
    expect(screen.getByText(/Bank Proceeds Realization Certificate \(PRC\)/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Audit Subsidy & Generate Claim/i })).toBeDefined();
  });

  it("switches to NBR Bonded Dossier tab and displays customs release controls", () => {
    render(<JuteExportModal isOpen={true} onClose={() => {}} />);

    const bondedTab = screen.getByText(/NBR Bonded Dossier/i);
    fireEvent.click(bondedTab);

    expect(screen.getByText(/Foreign Importer \/ Buyer Name/i)).toBeDefined();
    expect(screen.getByText(/Destination Country/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Generate NBR Bonded Export Dossier & SHA-256 Seal/i })).toBeDefined();
  });
});
