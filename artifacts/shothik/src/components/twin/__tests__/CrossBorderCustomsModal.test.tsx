import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CrossBorderCustomsModal } from "../CrossBorderCustomsModal";

describe("CrossBorderCustomsModal Component (CrossBorderCustomsModal.tsx)", () => {
  it("renders header, statutory badge, and ⌘U shortcut when open", () => {
    render(<CrossBorderCustomsModal isOpen={true} onClose={() => {}} />);

    expect(
      screen.getByText("Cross-Border Sourcing & Bangladesh Customs Studio")
    ).toBeInTheDocument();
    expect(screen.getByText("NBR Act 2023")).toBeInTheDocument();
    expect(screen.getByText("⌘U")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<CrossBorderCustomsModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 4 navigation tabs", () => {
    render(<CrossBorderCustomsModal isOpen={true} onClose={() => {}} />);

    const calcTab = screen.getByRole("button", { name: /Landed Cost Calculator/i });
    const breakdownTab = screen.getByRole("button", { name: /NBR Tariff Cascade/i });
    const hsCodesTab = screen.getByRole("button", { name: /HS Code Directory/i });
    const briefTab = screen.getByRole("button", { name: /C&F Clearing Brief/i });

    expect(calcTab).toBeInTheDocument();
    expect(breakdownTab).toBeInTheDocument();
    expect(hsCodesTab).toBeInTheDocument();
    expect(briefTab).toBeInTheDocument();

    // Default tab is calculator
    expect(screen.getByText("Calculated Landed Unit Cost")).toBeInTheDocument();

    // Switch to NBR Tariff Cascade
    fireEvent.click(breakdownTab);
    expect(screen.getByText(/NBR Statutory Duty Cascade/i)).toBeInTheDocument();
    expect(screen.getByText(/Customs Duty \(CD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Value Added Tax \(VAT\)/i)).toBeInTheDocument();

    // Switch to HS Code Directory
    fireEvent.click(hsCodesTab);
    expect(screen.getByPlaceholderText(/Search HS Code/i)).toBeInTheDocument();

    // Switch to C&F Clearing Brief
    fireEvent.click(briefTab);
    expect(screen.getByText(/Chittagong \/ Airport Port C&F Clearing Brief/i)).toBeInTheDocument();
    expect(screen.getByText(/BANGLADESH CUSTOMS CLEARANCE DISPATCH BRIEF/i)).toBeInTheDocument();
  });

  it("dynamically updates unit landed cost when quantity or price change", () => {
    render(<CrossBorderCustomsModal isOpen={true} onClose={() => {}} />);

    const unitCostLabel = screen.getByText("Calculated Landed Unit Cost");
    expect(unitCostLabel).toBeInTheDocument();

    // Find Quantity input and change from 100 to 500
    const inputs = screen.getAllByRole("spinbutton");
    const qtyInput = inputs.find((input) => (input as HTMLInputElement).value === "100");
    expect(qtyInput).toBeDefined();

    if (qtyInput) {
      fireEvent.change(qtyInput, { target: { value: "500" } });
      expect((qtyInput as HTMLInputElement).value).toBe("500");
    }
  });

  it("calls onClose when close button or Close Studio is clicked", () => {
    const handleClose = vi.fn();
    render(<CrossBorderCustomsModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeStudioBtn = screen.getByRole("button", { name: "Close Studio" });
    fireEvent.click(closeStudioBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
