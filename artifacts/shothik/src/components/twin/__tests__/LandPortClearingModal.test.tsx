import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LandPortClearingModal } from "../LandPortClearingModal";

describe("Frontend AG-UI Component: LandPortClearingModal (Slice 84)", () => {
  it("renders LandPortClearingModal with WAI-ARIA role and tab navigation", () => {
    render(<LandPortClearingModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Cross-Border Land Port Clearing & ECTS Studio/i)).toBeDefined();
    expect(screen.getByText(/Port Stations/i)).toBeDefined();
    expect(screen.getByText(/Weighbridge Audit/i)).toBeDefined();
    expect(screen.getByText(/Quarantine & Health/i)).toBeDefined();
    expect(screen.getByText(/ECTS Transit Lock/i)).toBeDefined();
    expect(screen.getByText(/BBIN Permit & Escrow/i)).toBeDefined();
  });

  it("switches to Weighbridge Audit tab and displays tare/gross audit button", () => {
    render(<LandPortClearingModal isOpen={true} onClose={() => {}} />);

    const wbTab = screen.getByText(/Weighbridge Audit/i);
    fireEvent.click(wbTab);

    expect(screen.getByText(/Execute Weighbridge Audit/i)).toBeDefined();
    expect(screen.getByText(/Gross Scale Weight/i)).toBeDefined();
    expect(screen.getByText(/Truck Tare Weight/i)).toBeDefined();
  });

  it("switches to ECTS Transit Lock tab and displays telemetry controls", () => {
    render(<LandPortClearingModal isOpen={true} onClose={() => {}} />);

    const ectsTab = screen.getByText(/ECTS Transit Lock/i);
    fireEvent.click(ectsTab);

    expect(screen.getByText(/Ingest ECTS Corridor Telemetry/i)).toBeDefined();
    expect(screen.getByText(/Destination ICD/i)).toBeDefined();
  });
});
