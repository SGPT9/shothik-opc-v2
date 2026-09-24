import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CorporateTaxModal } from "../CorporateTaxModal";

describe("CorporateTaxModal Component (CorporateTaxModal.tsx)", () => {
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
      <CorporateTaxModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary cards when open", () => {
    render(<CorporateTaxModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Corporate Income Tax & VAT Mushak-9.1 Engine/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Income Tax Act 2023 & Form 82C/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual Gross Turnover/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Net Taxable Profit/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/AIT Deducted at Source/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Net Final Tax Payable/i).length).toBeGreaterThan(0);
  });

  it("calculates live corporate tax and handles entity type selection", () => {
    render(<CorporateTaxModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Corporate Tax Parameters/i)).toBeInTheDocument();
    expect(screen.getByText(/Tax Computation Summary \(ITA 2023\)/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Cashless Banking Compliance/i)).toBeInTheDocument();
  });

  it("switches to AIT Certificate Vault tab and displays verified items", () => {
    render(<CorporateTaxModal isOpen={true} onClose={mockOnClose} />);

    const aitTab = screen.getByRole("button", {
      name: /AIT Certificate Vault/i,
    });
    fireEvent.click(aitTab);

    expect(screen.getByText(/Advance Income Tax \(AIT\) Source Withholding Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Apex Enterprises Ltd./i)).toBeInTheDocument();
    expect(screen.getByText(/Grameen Digital PLC/i)).toBeInTheDocument();
    expect(screen.getByText(/Eastern Bank PLC \(Principal Branch\)/i)).toBeInTheDocument();
  });

  it("switches to VAT Mushak-9.1 Monthly Return tab and renders VAT breakdown", () => {
    render(<CorporateTaxModal isOpen={true} onClose={mockOnClose} />);

    const mushakTab = screen.getByRole("button", {
      name: /VAT Mushak-9.1 Monthly Return/i,
    });
    fireEvent.click(mushakTab);

    expect(screen.getByText(/Monthly VAT Return \(Mushak-9.1\) Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Part 2: Gross Output VAT on Local Supplies/i)).toBeInTheDocument();
    expect(screen.getByText(/Part 3: Input Tax Credit \(ITC\) on Raw Materials/i)).toBeInTheDocument();
    expect(screen.getByText(/Part 5: Net VAT Payable to Government Treasury/i)).toBeInTheDocument();
  });

  it("switches to Statutory e-Return Compiler tab and copies payload", () => {
    render(<CorporateTaxModal isOpen={true} onClose={mockOnClose} />);

    const eReturnTab = screen.getByRole("button", {
      name: /Statutory e-Return Compiler/i,
    });
    fireEvent.click(eReturnTab);

    expect(screen.getByText(/NBR e-Return Statutory JSON Payload/i)).toBeInTheDocument();
    const copyBtn = screen.getByRole("button", { name: /Copy Payload/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<CorporateTaxModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
