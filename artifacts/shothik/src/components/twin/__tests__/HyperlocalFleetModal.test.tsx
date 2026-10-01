import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HyperlocalFleetModal } from "../HyperlocalFleetModal";

describe("Frontend AG-UI Component: HyperlocalFleetModal (Slice 82)", () => {
  it("renders HyperlocalFleetModal with WAI-ARIA role and navigation tabs", () => {
    render(<HyperlocalFleetModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Hyperlocal Delivery Fleet & Drone Dispatch/i)).toBeDefined();
    expect(screen.getByText(/Fleet Cockpit/i)).toBeDefined();
    expect(screen.getByText(/Dispatch Console/i)).toBeDefined();
    expect(screen.getByText(/Urban Corridors/i)).toBeDefined();
  });

  it("switches to Dispatch Console tab and allows input configuration", () => {
    render(<HyperlocalFleetModal isOpen={true} onClose={() => {}} />);

    const dispatchTab = screen.getByText(/Dispatch Console/i);
    fireEvent.click(dispatchTab);

    expect(screen.getByText(/New Hyperlocal Consignment/i)).toBeDefined();
    expect(screen.getByText(/Dispatch Hyperlocal Parcel/i)).toBeDefined();
  });

  it("switches to Urban Corridors tab and lists flight zones", () => {
    render(<HyperlocalFleetModal isOpen={true} onClose={() => {}} />);

    const corridorsTab = screen.getByText(/Urban Corridors/i);
    fireEvent.click(corridorsTab);

    expect(screen.getByText(/Urban Geofenced Delivery Corridors/i)).toBeDefined();
  });
});
