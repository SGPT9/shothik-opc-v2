import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SolarMicroGridModal } from "../SolarMicroGridModal";

describe("Frontend AG-UI Component: SolarMicroGridModal (Slice 86)", () => {
  it("renders SolarMicroGridModal with WAI-ARIA role and tab navigation", () => {
    render(<SolarMicroGridModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Solar Micro-Grid & Net-Metering Studio/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /^Smart Telemetry$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^PBS Net-Metering$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Genset Hybrid Arbitrage$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^SREDA Carbon Offset$/i })).toBeDefined();
  });

  it("switches to Smart Telemetry tab and displays telemetry controls", () => {
    render(<SolarMicroGridModal isOpen={true} onClose={() => {}} />);

    const telTab = screen.getByRole("button", { name: /^Smart Telemetry$/i });
    fireEvent.click(telTab);

    expect(screen.getByText(/Ingest Smart Meter Telemetry/i)).toBeDefined();
    expect(screen.getByText(/Palli Bidyut Zone/i)).toBeDefined();
    expect(screen.getByText(/Solar Gen \(kWh\)/i)).toBeDefined();
  });

  it("switches to PBS Net-Metering tab and displays settlement controls", () => {
    render(<SolarMicroGridModal isOpen={true} onClose={() => {}} />);

    const netTab = screen.getByRole("button", { name: /^PBS Net-Metering$/i });
    fireEvent.click(netTab);

    expect(screen.getByText(/Execute Net-Metering Settlement/i)).toBeDefined();
    expect(screen.getByText(/Total Grid Import \(kWh\)/i)).toBeDefined();
    expect(screen.getByText(/Total Solar Export \(kWh\)/i)).toBeDefined();
  });
});
