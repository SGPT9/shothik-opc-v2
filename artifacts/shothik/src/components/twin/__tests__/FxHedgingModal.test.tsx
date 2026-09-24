import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FxHedgingModal } from "../FxHedgingModal";

describe("FxHedgingModal Component (FxHedgingModal.tsx)", () => {
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
      <FxHedgingModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary metrics when open", () => {
    render(<FxHedgingModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Cross-Border FX Hedging & Forward Rate Lock Engine/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/BB FERA Chapter 10 & CIRP/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Hedged Exposure/i)).toBeInTheDocument();
    expect(screen.getByText(/Locked Value \(BDT\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MTM Unrealized Gain/i)).toBeInTheDocument();
    expect(screen.getByText(/5% Margin Lien Collateral/i)).toBeInTheDocument();
  });

  it("switches to CIRP Forward Rate Curve tab and displays tenor cards", () => {
    render(<FxHedgingModal isOpen={true} onClose={mockOnClose} />);

    const cirpTab = screen.getByRole("button", {
      name: /CIRP Forward Rate Curve/i,
    });
    fireEvent.click(cirpTab);

    expect(
      screen.getByText(/Covered Interest Rate Parity \(CIRP\) Forward Curve/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/30-Day Forward/i)).toBeInTheDocument();
    expect(screen.getByText(/90-Day Forward/i)).toBeInTheDocument();
    expect(screen.getByText(/180-Day Forward/i)).toBeInTheDocument();
  });

  it("switches to MTM Stress Test tab and renders spot simulation slider", () => {
    render(<FxHedgingModal isOpen={true} onClose={mockOnClose} />);

    const mtmTab = screen.getByRole("button", {
      name: /MTM Stress Test & Valuation/i,
    });
    fireEvent.click(mtmTab);

    expect(
      screen.getByText(/Simulate Market USD\/BDT Spot Rate Shift:/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Hedged Portfolio Realization/i)).toBeInTheDocument();
  });

  it("switches to Book Forward Contract tab and displays booking wizard", () => {
    render(<FxHedgingModal isOpen={true} onClose={mockOnClose} />);

    const bookTab = screen.getByRole("button", {
      name: /Book Forward Contract/i,
    });
    fireEvent.click(bookTab);

    expect(screen.getByText(/Authorized Dealer \(AD\) Bank/i)).toBeInTheDocument();
    expect(screen.getByText(/Notional Export Amount \(USD\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Book Forward Exchange Contract/i })
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<FxHedgingModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
