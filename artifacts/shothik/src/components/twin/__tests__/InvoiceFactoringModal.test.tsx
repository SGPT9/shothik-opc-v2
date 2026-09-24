import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoiceFactoringModal } from "../InvoiceFactoringModal";

describe("InvoiceFactoringModal Component (InvoiceFactoringModal.tsx)", () => {
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
      <InvoiceFactoringModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary cards when open", () => {
    render(<InvoiceFactoringModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/B2B Invoice Factoring & Islamic Murabaha Engine/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/NBR Mushak-6.3 & BB Receivables Escrow/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Factored Receivables/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Advances Disbursed/i)).toBeInTheDocument();
    expect(screen.getByText(/Retained in Escrow Lien/i)).toBeInTheDocument();
  });

  it("switches to Active Factored Invoices tab and renders invoice rows", () => {
    render(<InvoiceFactoringModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/PRAN-RFL Group \(Agricultural Marketing Co\.\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Square Pharmaceuticals PLC/i)).toBeInTheDocument();
    expect(screen.getByText(/Aarong \(BRAC Enterprises\)/i)).toBeInTheDocument();
  });

  it("switches to Dual Pricing Simulator tab and calculates dynamic quotes", () => {
    render(<InvoiceFactoringModal isOpen={true} onClose={mockOnClose} />);

    const simTab = screen.getByRole("button", {
      name: /Dual Pricing Simulator/i,
    });
    fireEvent.click(simTab);

    expect(screen.getByText(/Receivables Advance Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Advance Quote & Net Cash Payout/i)).toBeInTheDocument();

    const murabahaBtn = screen.getByRole("button", { name: /Islamic Murabaha/i });
    const conventionalBtn = screen.getByRole("button", { name: /Conventional SMART/i });

    expect(murabahaBtn).toBeInTheDocument();
    expect(conventionalBtn).toBeInTheDocument();
    fireEvent.click(conventionalBtn);

    expect(screen.getByText(/Conventional Financing Fee:/i)).toBeInTheDocument();
  });

  it("switches to New Invoice Cash Advance tab and renders application form", () => {
    render(<InvoiceFactoringModal isOpen={true} onClose={mockOnClose} />);

    const appTab = screen.getByRole("button", {
      name: /New Invoice Cash Advance/i,
    });
    fireEvent.click(appTab);

    expect(screen.getByText(/Submit Verified Mushak-6.3 e-Invoice for Instant Cash/i)).toBeInTheDocument();
    expect(screen.getByText(/Mushak-6.3 Invoice Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Order \(PO\) Number/i)).toBeInTheDocument();
  });

  it("switches to Enterprise Debtor Tiers tab and renders credit matrix", () => {
    render(<InvoiceFactoringModal isOpen={true} onClose={mockOnClose} />);

    const debtorTab = screen.getByRole("button", {
      name: /Enterprise Debtor Tiers/i,
    });
    fireEvent.click(debtorTab);

    expect(screen.getByText(/Approved Corporate Debtor Rating & LTV Matrix/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tier-1 Blue Chip \(AAA\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tier-2 Corporate \(A\+\)/i).length).toBeGreaterThan(0);
  });

  it("calls onClose when the close button is clicked", () => {
    render(<InvoiceFactoringModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
