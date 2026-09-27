import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlashSaleInventoryModal } from "../FlashSaleInventoryModal";

describe("Frontend AG-UI Component: FlashSaleInventoryModal (Slice 78)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ isFrozen: true }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders modal with header, tabs, and inventory matrix when open", () => {
    render(<FlashSaleInventoryModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Flash-Sale Inventory Matrix & Reservation Lock/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-Time Stock & Channels/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Leased Locks/i)).toBeInTheDocument();
    expect(screen.getByText(/Flash Surge Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Royal Silk Eid Panjabi/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<FlashSaleInventoryModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("switches tabs between Matrix, Leased Locks, and Flash Surge Simulator", () => {
    render(<FlashSaleInventoryModal isOpen={true} onClose={() => {}} />);

    // Click Active Leased Locks tab
    const locksTab = screen.getByText(/Active Leased Locks/i);
    fireEvent.click(locksTab);

    expect(screen.getByText(/RES_EID_9901/i)).toBeInTheDocument();
    expect(screen.getByText(/facebook live/i)).toBeInTheDocument();

    // Click Flash Surge Simulator tab
    const simTab = screen.getByText(/Flash Surge Simulator/i);
    fireEvent.click(simTab);

    expect(screen.getByText(/Concurrent Flash-Sale Traffic Surge Simulator/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Launch 5-Channel Surge/i })).toBeInTheDocument();
  });

  it("toggles panic freeze mode when button clicked", async () => {
    render(<FlashSaleInventoryModal isOpen={true} onClose={() => {}} />);

    const panicBtn = screen.getByRole("button", { name: /Normal Flow/i });
    expect(panicBtn).toBeInTheDocument();
    fireEvent.click(panicBtn);

    // Changes to PANIC FROZEN state
    await waitFor(() => {
      expect(screen.getByText(/PANIC FROZEN/i)).toBeInTheDocument();
    });
  });

  it("calls onClose when close button clicked", () => {
    const handleClose = vi.fn();
    render(<FlashSaleInventoryModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
