import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InventoryMatrixModal } from "../InventoryMatrixModal";

describe("Frontend AG-UI Component: InventoryMatrixModal", () => {
  it("renders InventoryMatrixModal with Channel Matrix, Stock-Out Radar, Rebalance, and Supplier PO tabs", () => {
    render(<InventoryMatrixModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Multi-Channel Inventory Matrix & Prediction/i)).toBeDefined();
    expect(screen.getByText(/Channel Matrix/i)).toBeDefined();
    expect(screen.getByText(/Stock-Out Radar/i)).toBeDefined();
    expect(screen.getAllByText(/Dark Hub Rebalance/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Supplier PO/i)).toBeDefined();
  });
});
