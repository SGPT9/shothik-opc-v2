import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InventoryMatrixModal } from "../InventoryMatrixModal";

describe("Frontend AG-UI Component: InventoryMatrixModal", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("renders InventoryMatrixModal with Channel Matrix, Stock-Out Radar, Rebalance, and Supplier PO tabs", () => {
    render(<InventoryMatrixModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(document.body.style.overflow).toBe("hidden");

    expect(screen.getByText(/Multi-Channel Inventory Matrix & Prediction/i)).toBeInTheDocument();
    expect(screen.getByText(/Channel Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock-Out Radar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dark Hub Rebalance/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Supplier PO/i)).toBeInTheDocument();
  });

  it("locks body scroll while open, dismisses on Escape, and cleans up on unmount", () => {
    const handleClose = vi.fn();
    const { unmount } = render(<InventoryMatrixModal isOpen={true} onClose={handleClose} />);

    expect(document.body.style.overflow).toBe("hidden");

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("calls onClose when close button clicked", () => {
    const handleClose = vi.fn();
    render(<InventoryMatrixModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: "Close inventory matrix dialog" });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

