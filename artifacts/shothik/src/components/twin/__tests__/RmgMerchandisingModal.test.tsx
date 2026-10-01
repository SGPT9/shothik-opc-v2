import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RmgMerchandisingModal } from "../RmgMerchandisingModal";

describe("Frontend AG-UI Component: RmgMerchandisingModal (Slice 85)", () => {
  it("renders RmgMerchandisingModal with WAI-ARIA role and tab navigation", () => {
    render(<RmgMerchandisingModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/RMG Merchandising & Fabric Consumption Studio/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /^Fabric Consumption$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Tech Pack & BOM$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^CM Milestone Escrow$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^NBR Mushak-4.3$/i })).toBeDefined();
  });

  it("switches to Fabric Consumption tab and displays calculation controls", () => {
    render(<RmgMerchandisingModal isOpen={true} onClose={() => {}} />);

    const consTab = screen.getByRole("button", { name: /^Fabric Consumption$/i });
    fireEvent.click(consTab);

    expect(screen.getByText(/Compute Fabric Consumption/i)).toBeDefined();
    expect(screen.getByText(/Garment Style/i)).toBeDefined();
    expect(screen.getByText(/Fabric Weight \(GSM\)/i)).toBeDefined();
  });

  it("switches to Tech Pack & BOM tab and displays tech pack controls", () => {
    render(<RmgMerchandisingModal isOpen={true} onClose={() => {}} />);

    const tpTab = screen.getByRole("button", { name: /^Tech Pack & BOM$/i });
    fireEvent.click(tpTab);

    expect(screen.getByText(/Generate Graded Tech Pack/i)).toBeDefined();
    expect(screen.getByText(/Style Code/i)).toBeDefined();
  });
});
