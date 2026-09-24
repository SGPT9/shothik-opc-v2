import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PayrollTaxModal } from "../PayrollTaxModal";

describe("PayrollTaxModal Component (PayrollTaxModal.tsx)", () => {
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
      <PayrollTaxModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and monthly payroll summary cards when open", () => {
    render(<PayrollTaxModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/SME Payroll Tax & Statutory Benefits Engine/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Income Tax Act 2023 & Labour Act 2006/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Gross Payroll/i)).toBeInTheDocument();
    expect(screen.getByText(/Net Disbursed Take-Home/i)).toBeInTheDocument();
    expect(screen.getByText(/NBR TDS Tax Withheld/i)).toBeInTheDocument();
    expect(screen.getByText(/PF Trust Fund Reserve/i)).toBeInTheDocument();
  });

  it("switches to Employee Breakdown tab and renders employee rows with slab breakdowns", () => {
    render(<PayrollTaxModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Tanvir Hossain/i)).toBeInTheDocument();
    expect(screen.getByText(/Lead AI System Architect/i)).toBeInTheDocument();
    expect(screen.getByText(/Nusrat Jahan/i)).toBeInTheDocument();
    expect(screen.getByText(/Senior Product Designer/i)).toBeInTheDocument();
    expect(screen.getByText(/Rahim Uddin/i)).toBeInTheDocument();
  });

  it("switches to Income Tax Act 2023 Slabs tab and renders slab details", () => {
    render(<PayrollTaxModal isOpen={true} onClose={mockOnClose} />);

    const slabsTab = screen.getByRole("button", {
      name: /Income Tax Act 2023 Slabs/i,
    });
    fireEvent.click(slabsTab);

    expect(screen.getByText(/Statutory Income Slab/i)).toBeInTheDocument();
    expect(screen.getByText(/Taxable Amount \(BDT\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Annual Tax Liability:/i)).toBeInTheDocument();
  });

  it("switches to Provident Fund & Gratuity tab and renders benefits ledger", () => {
    render(<PayrollTaxModal isOpen={true} onClose={mockOnClose} />);

    const pfTab = screen.getByRole("button", {
      name: /Provident Fund & Gratuity/i,
    });
    fireEvent.click(pfTab);

    expect(screen.getByText(/Statutory Benefits Ledger \(Labour Act 2006\)/i)).toBeInTheDocument();
    expect(screen.getByText(/10% matching Provident Fund contribution/i)).toBeInTheDocument();
  });

  it("switches to Monthly Payroll Run tab and renders execution card", () => {
    render(<PayrollTaxModal isOpen={true} onClose={mockOnClose} />);

    const runTab = screen.getByRole("button", {
      name: /Monthly Payroll Run & MFS Batch/i,
    });
    fireEvent.click(runTab);

    expect(screen.getByText(/Select Payroll Month/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Eligible Staff:/i)).toBeInTheDocument();
    expect(screen.getByText(/Execute & Disburse/i)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<PayrollTaxModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
