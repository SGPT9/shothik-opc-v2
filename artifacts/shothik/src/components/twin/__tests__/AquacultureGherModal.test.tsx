import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AquacultureGherModal } from "../AquacultureGherModal";

describe("Frontend AG-UI Component: AquacultureGherModal (Slice 89)", () => {
  it("renders AquacultureGherModal with WAI-ARIA role and tab navigation", () => {
    render(<AquacultureGherModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Coastal Aquaculture & Shrimp Gher Studio/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /^Water Telemetry & Hypoxia$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Harvest Grading & Escrow$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^DoF EU Export Passport$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Coastal Gher Registry$/i })).toBeDefined();
  });

  it("switches to Water Telemetry & Hypoxia tab and displays water sensor controls", () => {
    render(<AquacultureGherModal isOpen={true} onClose={() => {}} />);

    const telTab = screen.getByRole("button", { name: /^Water Telemetry & Hypoxia$/i });
    fireEvent.click(telTab);

    expect(screen.getByText(/Dissolved Oxygen \(DO mg\/L\)/i)).toBeDefined();
    expect(screen.getByText(/Salinity Level \(ppt\)/i)).toBeDefined();
    expect(screen.getByText(/Unionized Ammonia \(NH3 mg\/L\)/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Evaluate Water Quality & Aeration/i })).toBeDefined();
  });

  it("switches to Harvest Grading & Escrow tab and displays grading controls", () => {
    render(<AquacultureGherModal isOpen={true} onClose={() => {}} />);

    const harvestTab = screen.getByRole("button", { name: /^Harvest Grading & Escrow$/i });
    fireEvent.click(harvestTab);

    expect(screen.getByText(/Harvest Batch ID/i)).toBeDefined();
    expect(screen.getByText(/Shrimp Size Grade Band/i)).toBeDefined();
    expect(screen.getByText(/Ice-Slurry Temperature \(°C\)/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Compute Harvest Value & Plant Escrow/i })).toBeDefined();
  });

  it("switches to DoF EU Export Passport tab and displays traceability controls", () => {
    render(<AquacultureGherModal isOpen={true} onClose={() => {}} />);

    const passTab = screen.getByRole("button", { name: /^DoF EU Export Passport$/i });
    fireEvent.click(passTab);

    expect(screen.getByText(/Gher Owner Name/i)).toBeDefined();
    expect(screen.getByText(/Destination Export Country/i)).toBeDefined();
    expect(screen.getByText(/Certified Lab Antibiotic Screening Pass/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Issue DoF EU Export Traceability Passport/i })).toBeDefined();
  });
});
