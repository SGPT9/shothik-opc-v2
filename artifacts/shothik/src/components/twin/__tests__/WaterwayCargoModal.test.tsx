import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WaterwayCargoModal } from "../WaterwayCargoModal";

describe("Frontend AG-UI Component: WaterwayCargoModal (Slice 87)", () => {
  it("renders WaterwayCargoModal with WAI-ARIA role and tab navigation", () => {
    render(<WaterwayCargoModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Inland Waterway Cargo & River Vessel Radar/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /^AIS Telemetry & Shoal Radar$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Laytime & Demurrage Audit$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^BIWTA River Tolls$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Navigable Corridors$/i })).toBeDefined();
  });

  it("switches to AIS Telemetry & Shoal Radar tab and displays navigation controls", () => {
    render(<WaterwayCargoModal isOpen={true} onClose={() => {}} />);

    const telTab = screen.getByRole("button", { name: /^AIS Telemetry & Shoal Radar$/i });
    fireEvent.click(telTab);

    expect(screen.getByText(/Vessel Identification \(M\.V\.\)/i)).toBeDefined();
    expect(screen.getByText(/Current Water Depth \(Meters\)/i)).toBeDefined();
    expect(screen.getByText(/Vessel Current Draft \(Meters\)/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Evaluate Shoal Hazard & Telemetry/i })).toBeDefined();
  });

  it("switches to Laytime & Demurrage Audit tab and displays stevedoring controls", () => {
    render(<WaterwayCargoModal isOpen={true} onClose={() => {}} />);

    const layTab = screen.getByRole("button", { name: /^Laytime & Demurrage Audit$/i });
    fireEvent.click(layTab);

    expect(screen.getByText(/Consignment ID/i)).toBeDefined();
    expect(screen.getByText(/Cargo Commodity/i)).toBeDefined();
    expect(screen.getByText(/Notice of Readiness \(NOR\) Accepted/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Compute Laytime Settlement/i })).toBeDefined();
  });

  it("switches to BIWTA River Tolls tab and displays statutory port dues controls", () => {
    render(<WaterwayCargoModal isOpen={true} onClose={() => {}} />);

    const tollTab = screen.getByRole("button", { name: /^BIWTA River Tolls$/i });
    fireEvent.click(tollTab);

    expect(screen.getByText(/Vessel Name/i)).toBeDefined();
    expect(screen.getByText(/BIWTA Registration No\./i)).toBeDefined();
    expect(screen.getByText(/Deadweight Tonnage \(DWT\)/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Generate BIWTA Toll Receipt/i })).toBeDefined();
  });
});
