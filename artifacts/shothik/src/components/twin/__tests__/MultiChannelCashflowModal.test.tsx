import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MultiChannelCashflowModal } from "../MultiChannelCashflowModal";

describe("MultiChannelCashflowModal Component (MultiChannelCashflowModal.tsx)", () => {
  it("renders header, PnL badge, and summary when open", () => {
    render(<MultiChannelCashflowModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Autonomous Multi-Channel Cashflow & COD Settlement Reconciler")).toBeInTheDocument();
    expect(screen.getByText("Slice 38 · PnL & Runway")).toBeInTheDocument();
    expect(screen.getByText(/bKash\/Nagad MFS fees, Steadfast\/Pathao COD reconciliation/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <MultiChannelCashflowModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 5 navigation tabs and renders controls", () => {
    render(<MultiChannelCashflowModal isOpen={true} onClose={() => {}} />);

    const liquidTab = screen.getByRole("button", { name: /Liquid Cash Position/i });
    const reconcilerTab = screen.getByRole("button", { name: /Courier Settlement Reconciler/i });
    const pnlTab = screen.getByRole("button", { name: /Daily Net PnL Waterfall/i });
    const discrepancyTab = screen.getByRole("button", { name: /Discrepancy & Claim Auditor/i });
    const runwayTab = screen.getByRole("button", { name: /30-Day Working Capital Runway/i });

    expect(liquidTab).toBeInTheDocument();
    expect(reconcilerTab).toBeInTheDocument();
    expect(pnlTab).toBeInTheDocument();
    expect(discrepancyTab).toBeInTheDocument();
    expect(runwayTab).toBeInTheDocument();

    // Default tab is Liquid Cash Position
    expect(screen.getByText("Bank & MFS Liquid Capital")).toBeInTheDocument();

    // Switch to Courier Settlement Reconciler
    fireEvent.click(reconcilerTab);
    expect(screen.getByText("Select Courier Provider")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /(Reconcile New Batch|Reconciling Manifest)/i })).toBeInTheDocument();

    // Switch to Daily PnL Waterfall
    fireEvent.click(pnlTab);
    expect(screen.getByText("Daily Operating Unit Economics & Net Profit")).toBeInTheDocument();

    // Switch to Discrepancy & Claim Auditor
    fireEvent.click(discrepancyTab);
    expect(screen.getByText("Carrier Underpayment & Weight Overcharge Radar")).toBeInTheDocument();

    // Switch to 30-Day Working Capital Runway
    fireEvent.click(runwayTab);
    expect(screen.getByText("Effective Working Capital")).toBeInTheDocument();
  });
});
