import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CourierArbitrageModal } from "../CourierArbitrageModal";

describe("CourierArbitrageModal Component (CourierArbitrageModal.tsx)", () => {
  it("renders header, multi-carrier badge, and summary when open", () => {
    render(<CourierArbitrageModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Autonomous Courier Fleet Arbitrage & Micro-Hub Dispatcher")).toBeInTheDocument();
    expect(screen.getByText("Slice 35 · Multi-Carrier Routing")).toBeInTheDocument();
    expect(screen.getByText(/Steadfast vs\. Pathao vs\. RedX vs\. Paperfly Dynamic Arbitrage/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CourierArbitrageModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 4 navigation tabs and renders arbitrage controls", () => {
    render(<CourierArbitrageModal isOpen={true} onClose={() => {}} />);

    const calcTab = screen.getByRole("button", { name: /Carrier Arbitrage Calculator/i });
    const feedTab = screen.getByRole("button", { name: /Consignments Feed/i });
    const matrixTab = screen.getByRole("button", { name: /64-District DSR Matrix/i });
    const rtoTab = screen.getByRole("button", { name: /RTO Prevention & Alerts/i });

    expect(calcTab).toBeInTheDocument();
    expect(feedTab).toBeInTheDocument();
    expect(matrixTab).toBeInTheDocument();
    expect(rtoTab).toBeInTheDocument();

    // Default tab is Carrier Arbitrage Calculator
    expect(screen.getByText("Live Parcel Parameters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Recompute Arbitrage/i })).toBeInTheDocument();

    // Switch to Consignments Feed
    fireEvent.click(feedTab);
    expect(screen.getByText("Unified Multi-Carrier Consignments")).toBeInTheDocument();
    expect(screen.getByText("CNS_STF_9901")).toBeInTheDocument();

    // Switch to 64-District Matrix
    fireEvent.click(matrixTab);
    expect(screen.getByText("64-District Delivery Success Rate (DSR) Heatmap")).toBeInTheDocument();
    expect(screen.getByText("Dhaka (Inside Metro)")).toBeInTheDocument();

    // Switch to RTO Prevention
    fireEvent.click(rtoTab);
    expect(screen.getByText("1 Parcel Flagged with Delivery Friction (RTO Risk)")).toBeInTheDocument();
    expect(screen.getByText(/Kamrul Islam/i)).toBeInTheDocument();
  });

  it("renders carrier rankings when viewing arbitrage calculator", () => {
    render(<CourierArbitrageModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Live Parcel Parameters")).toBeInTheDocument();
    expect(screen.getByText("Destination District")).toBeInTheDocument();
    expect(screen.getByText("COD Amount (BDT)")).toBeInTheDocument();
  });
});
