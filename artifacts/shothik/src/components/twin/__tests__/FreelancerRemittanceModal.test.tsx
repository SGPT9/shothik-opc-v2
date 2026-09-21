import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { FreelancerRemittanceModal } from "../FreelancerRemittanceModal";

describe("FreelancerRemittanceModal Component (FreelancerRemittanceModal.tsx)", () => {
  it("renders header, statutory subsidy badge, and summary when open", () => {
    render(<FreelancerRemittanceModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Autonomous Freelancer Remittance & Bangladesh Bank ICT Subsidy Ledger")).toBeInTheDocument();
    expect(screen.getByText("Slice 36 · 4%-10% ICT Export Subsidy")).toBeInTheDocument();
    expect(screen.getByText(/Bangladesh Bank FE Circular 02\/2024/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <FreelancerRemittanceModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 4 navigation tabs and renders export remittance controls", () => {
    render(<FreelancerRemittanceModal isOpen={true} onClose={() => {}} />);

    const calcTab = screen.getByRole("button", { name: /Incentive Calculator & Remittance Ledger/i });
    const formCTab = screen.getByRole("button", { name: /Bangladesh Bank Form-C Declaration/i });
    const prcTab = screen.getByRole("button", { name: /Inward PRC \/ FFC Reconciler/i });
    const escrowTab = screen.getByRole("button", { name: /Milestone Escrow Contract Studio/i });

    expect(calcTab).toBeInTheDocument();
    expect(formCTab).toBeInTheDocument();
    expect(prcTab).toBeInTheDocument();
    expect(escrowTab).toBeInTheDocument();

    // Default tab is Incentive Calculator
    expect(screen.getByText("Bangladesh Bank Foreign Currency Inward Realization Engine")).toBeInTheDocument();
    expect(screen.getByText("REM_UPW_882910")).toBeInTheDocument();

    // Switch to Form-C Declaration
    fireEvent.click(formCTab);
    expect(screen.getByText("Bangladesh Bank Form-C Foreign Exchange Declaration Generator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Compile & Seal Form-C Declaration/i })).toBeInTheDocument();

    // Switch to PRC Reconciler
    fireEvent.click(prcTab);
    expect(screen.getByText("Proceeds Realization Certificate (PRC / FFC) Matching Hub")).toBeInTheDocument();
    expect(screen.getByText("FT2629104882")).toBeInTheDocument();

    // Switch to Escrow Studio
    fireEvent.click(escrowTab);
    expect(screen.getByText("International Milestone Escrow Service Agreement Studio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Compile Escrow Contract/i })).toBeInTheDocument();
  });

  it("generates Form-C declaration when clicking Compile & Seal", async () => {
    render(<FreelancerRemittanceModal isOpen={true} onClose={() => {}} />);

    const formCTab = screen.getByRole("button", { name: /Bangladesh Bank Form-C Declaration/i });
    fireEvent.click(formCTab);

    const compileBtn = screen.getByRole("button", { name: /Compile & Seal Form-C Declaration/i });
    fireEvent.click(compileBtn);

    await waitFor(() => {
      expect(screen.getByText("FORM-C (FOREIGN EXCHANGE DECLARATION)")).toBeInTheDocument();
    });
  });
});
