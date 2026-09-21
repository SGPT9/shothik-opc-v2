import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DarkHubFulfillmentModal } from "../DarkHubFulfillmentModal";

describe("DarkHubFulfillmentModal Component (DarkHubFulfillmentModal.tsx)", () => {
  it("renders header, SLA badge, and summary when open", () => {
    render(<DarkHubFulfillmentModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Autonomous Hyperlocal Dark Store & Micro-Hub Orchestrator")).toBeInTheDocument();
    expect(screen.getByText("Slice 37 · Sub-30m SLA")).toBeInTheDocument();
    expect(screen.getByText(/Multi-hub Dhaka\/Chittagong\/Sylhet geofencing/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DarkHubFulfillmentModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 5 navigation tabs and renders controls", () => {
    render(<DarkHubFulfillmentModal isOpen={true} onClose={() => {}} />);

    const hubsTab = screen.getByRole("button", { name: /Dark Hubs Network/i });
    const routingTab = screen.getByRole("button", { name: /Hyperlocal Thana Router/i });
    const pickTab = screen.getByRole("button", { name: /S-Curve Bin Pick-Path/i });
    const expiryTab = screen.getByRole("button", { name: /FEFO Expiry Radar/i });
    const rebalanceTab = screen.getByRole("button", { name: /Inter-Hub Rebalance/i });

    expect(hubsTab).toBeInTheDocument();
    expect(routingTab).toBeInTheDocument();
    expect(pickTab).toBeInTheDocument();
    expect(expiryTab).toBeInTheDocument();
    expect(rebalanceTab).toBeInTheDocument();

    // Default tab is Dark Hubs Network
    expect(screen.getByText("Active Regional Dark Store Network")).toBeInTheDocument();

    // Switch to Thana Router
    fireEvent.click(routingTab);
    expect(screen.getByText("Customer Location & Order Input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /(Route to Optimal Hub|Resolving Geofence)/i })).toBeInTheDocument();

    // Switch to S-Curve Bin Pick-Path
    fireEvent.click(pickTab);
    expect(screen.getByText("Select Dark Fulfillment Store")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /(Generate S-Curve Path|Optimizing Path)/i })).toBeInTheDocument();

    // Switch to FEFO Expiry Radar
    fireEvent.click(expiryTab);
    expect(screen.getByText("First-Expired, First-Out (FEFO) Inventory Watch")).toBeInTheDocument();

    // Switch to Inter-Hub Rebalance
    fireEvent.click(rebalanceTab);
    expect(screen.getByText("Velocity-Driven Inter-Hub Stock Balancing")).toBeInTheDocument();
  });
});
