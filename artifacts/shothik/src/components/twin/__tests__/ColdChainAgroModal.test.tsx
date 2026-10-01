import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColdChainAgroModal } from "../ColdChainAgroModal";

describe("Frontend AG-UI Component: ColdChainAgroModal (Slice 83)", () => {
  it("renders ColdChainAgroModal with WAI-ARIA role and navigation tabs", () => {
    render(<ColdChainAgroModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Cold Chain Telemetry & Farm-to-Table Traceability/i)).toBeDefined();
    expect(screen.getByText(/Consignments/i)).toBeDefined();
    expect(screen.getByText(/Register Lot/i)).toBeDefined();
    expect(screen.getByText(/NBR Certificate/i)).toBeDefined();
  });

  it("switches to Register Lot tab and renders form fields", () => {
    render(<ColdChainAgroModal isOpen={true} onClose={() => {}} />);

    const registerTab = screen.getByText(/Register Lot/i);
    fireEvent.click(registerTab);

    expect(screen.getByText(/Register New Farm-to-Mandi Shipment/i)).toBeDefined();
    expect(screen.getByText(/Register Lot & Disburse 30% Advance/i)).toBeDefined();
  });

  it("switches to NBR Certificate tab and renders statutory header", () => {
    render(<ColdChainAgroModal isOpen={true} onClose={() => {}} />);

    const certTab = screen.getByText(/NBR Certificate/i);
    fireEvent.click(certTab);

    expect(screen.getByText(/NBR Statutory Agricultural Exemption Certificate/i)).toBeDefined();
    expect(screen.getByText(/0% Statutory VAT/i)).toBeDefined();
  });
});
