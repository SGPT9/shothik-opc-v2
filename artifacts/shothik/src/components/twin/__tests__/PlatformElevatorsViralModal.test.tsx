import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PlatformElevatorsViralModal } from "../PlatformElevatorsViralModal";

describe("PlatformElevatorsViralModal Component (PlatformElevatorsViralModal.tsx)", () => {
  it("renders header, current level badge, and ⌘G shortcut when open", () => {
    render(<PlatformElevatorsViralModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Platform Elevators & Viral Growth")).toBeInTheDocument();
    expect(screen.getByText(/Level 3: Power Merchant/i)).toBeInTheDocument();
    expect(screen.getByText("Shortcut: ⌘G")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <PlatformElevatorsViralModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 4 navigation tabs", () => {
    render(<PlatformElevatorsViralModal isOpen={true} onClose={() => {}} />);

    const elevatorTab = screen.getByRole("button", { name: /OPC Elevator Ladder/i });
    const referralsTab = screen.getByRole("button", { name: /bKash Referral Cashback/i });
    const sourcingTab = screen.getByRole("button", { name: /1688 Group Sourcing Pools/i });
    const trustBadgeTab = screen.getByRole("button", { name: /Verified Trust Seal/i });

    expect(elevatorTab).toBeInTheDocument();
    expect(referralsTab).toBeInTheDocument();
    expect(sourcingTab).toBeInTheDocument();
    expect(trustBadgeTab).toBeInTheDocument();

    // Default tab is elevator ladder
    expect(screen.getByText("Merchant Health Index (MHI)")).toBeInTheDocument();
    expect(screen.getByText("OPC Progression Ladder & Automatic Privileges")).toBeInTheDocument();

    // Switch to bKash Referral Cashback
    fireEvent.click(referralsTab);
    expect(screen.getByText("Total bKash Cashback Earned")).toBeInTheDocument();
    expect(screen.getByText("Your Viral Referral Code & Micro-Link")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy Link/i })).toBeInTheDocument();

    // Switch to 1688 Group Sourcing Pools
    fireEvent.click(sourcingTab);
    expect(screen.getByText("1688 Cross-Border Group Sourcing Cohorts")).toBeInTheDocument();
    expect(screen.getByText(/Wireless ANC TWS Earbuds/i)).toBeInTheDocument();

    // Switch to Verified Trust Seal
    fireEvent.click(trustBadgeTab);
    expect(screen.getByText("Verifiable COD Merchant Trust Seal (Steadfast Certified)")).toBeInTheDocument();
    expect(screen.getByText("Live Widget Preview")).toBeInTheDocument();
  });

  it("allows toggling and submitting the start sourcing pool drawer", () => {
    render(<PlatformElevatorsViralModal isOpen={true} onClose={() => {}} />);

    const sourcingTab = screen.getByRole("button", { name: /1688 Group Sourcing Pools/i });
    fireEvent.click(sourcingTab);

    const startPoolBtn = screen.getByRole("button", { name: /Start Sourcing Pool/i });
    expect(startPoolBtn).toBeInTheDocument();

    fireEvent.click(startPoolBtn);
    expect(screen.getByText("Create New 1688 Group Import Cohort")).toBeInTheDocument();
  });
});
