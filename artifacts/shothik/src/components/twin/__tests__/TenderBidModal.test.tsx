import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TenderBidModal } from "../TenderBidModal";

describe("TenderBidModal Component (TenderBidModal.tsx)", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <TenderBidModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary metrics when open", () => {
    render(<TenderBidModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Government e-GP Tender & Corporate Bid Studio/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/CPTU \/ PPR 2008 Compliant/i)).toBeInTheDocument();
    expect(screen.getByText(/Tenders Tracked/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Bid Portfolio/i)).toBeInTheDocument();
  });

  it("switches to New Bid Dossier Drafter tab and renders bid creation form", () => {
    render(<TenderBidModal isOpen={true} onClose={mockOnClose} />);

    const genTab = screen.getByRole("button", {
      name: /New Bid Dossier Drafter/i,
    });
    fireEvent.click(genTab);

    expect(screen.getByText(/e-GP Tender ID \/ Reference/i)).toBeInTheDocument();
    expect(screen.getByText(/Procuring Entity \/ Ministry/i)).toBeInTheDocument();
    expect(screen.getByText(/Quoted Total Bid Value \(BDT\)/i)).toBeInTheDocument();
  });

  it("switches to CPTU BOQ Rate Analysis tab and calculates unit rate and taxes", () => {
    render(<TenderBidModal isOpen={true} onClose={mockOnClose} />);

    const boqTab = screen.getByRole("button", {
      name: /CPTU BOQ Rate Analysis/i,
    });
    fireEvent.click(boqTab);

    expect(
      screen.getByText(/BOQ Item Rate Analysis & Statutory Withholding/i)
    ).toBeInTheDocument();

    const calcBtn = screen.getByRole("button", {
      name: /Calculate BOQ Rate & Statutory Taxes/i,
    });
    fireEvent.click(calcBtn);

    expect(screen.getByText(/Quoted Unit Rate \(All-Inclusive\):/i)).toBeInTheDocument();
    expect(screen.getByText(/VAT \(7.5%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/AIT \(5.0%\)/i)).toBeInTheDocument();
  });

  it("switches to PPR 2008 Eligibility Screener tab and executes qualification pre-audit", () => {
    render(<TenderBidModal isOpen={true} onClose={mockOnClose} />);

    const screenTab = screen.getByRole("button", {
      name: /PPR 2008 Eligibility Screener/i,
    });
    fireEvent.click(screenTab);

    expect(
      screen.getByText(/CPTU & PPR 2008 Rule 54 Eligibility Pre-Auditor/i)
    ).toBeInTheDocument();

    const auditBtn = screen.getByRole("button", {
      name: /Run Eligibility Pre-Audit/i,
    });
    fireEvent.click(auditBtn);

    expect(screen.getByText(/Qualification Score/i)).toBeInTheDocument();
    expect(screen.getByText(/QUALIFIED/i)).toBeInTheDocument();
  });
});
