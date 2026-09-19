import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { FranchiseMultiBranchModal } from "../FranchiseMultiBranchModal";

describe("FranchiseMultiBranchModal Component (FranchiseMultiBranchModal.tsx)", () => {
  it("renders header, active branches count when open", () => {
    render(<FranchiseMultiBranchModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Multi-Tenant Franchise & Multi-Branch Stock Studio")).toBeInTheDocument();
    expect(screen.getByText(/4 Nodes Active/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <FranchiseMultiBranchModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 4 navigation tabs", () => {
    render(<FranchiseMultiBranchModal isOpen={true} onClose={() => {}} />);

    const inventoryTab = screen.getByRole("button", { name: /Branch Stock Matrix/i });
    const commissionTab = screen.getByRole("button", { name: /Commission Split Journal/i });
    const transfersTab = screen.getByRole("button", { name: /Inter-Branch Transfers \(IBST\)/i });
    const settlementsTab = screen.getByRole("button", { name: /bKash Sub-Merchant Settlement/i });

    expect(inventoryTab).toBeInTheDocument();
    expect(commissionTab).toBeInTheDocument();
    expect(transfersTab).toBeInTheDocument();
    expect(settlementsTab).toBeInTheDocument();

    // Default tab is inventory
    expect(screen.getByText("Multi-Branch Real-Time Inventory Matrix")).toBeInTheDocument();
    expect(screen.getByText("Tejgaon Central Fulfillment Hub")).toBeInTheDocument();
    expect(screen.getByText("Dhanmondi 27 Outlet")).toBeInTheDocument();

    // Switch to Commission Split Journal
    fireEvent.click(commissionTab);
    expect(screen.getByText("3-Way Franchise Commission Split Ledger")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Record Branch Sale/i })).toBeInTheDocument();

    // Switch to Inter-Branch Transfers
    fireEvent.click(transfersTab);
    expect(screen.getAllByText(/Inter-Branch Stock Transfers \(IBST\)/i).length).toBeGreaterThanOrEqual(1);

    // Switch to bKash Settlement
    fireEvent.click(settlementsTab);
    expect(screen.getByText(/Decentralized bKash \/ Nagad Sub-Merchant Royalty Settlement/i)).toBeInTheDocument();
  });

  it("toggles the record sale form when clicking the button", () => {
    render(<FranchiseMultiBranchModal isOpen={true} onClose={() => {}} />);

    const commissionTab = screen.getByRole("button", { name: /Commission Split Journal/i });
    fireEvent.click(commissionTab);

    const recordBtn = screen.getByRole("button", { name: /Record Branch Sale/i });
    fireEvent.click(recordBtn);

    expect(screen.getByText("Point-of-Sale Transaction Ingestion")).toBeInTheDocument();
  });
});
