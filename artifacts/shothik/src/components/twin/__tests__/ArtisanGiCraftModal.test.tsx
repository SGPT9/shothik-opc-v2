import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArtisanGiCraftModal } from "../ArtisanGiCraftModal";

describe("Frontend AG-UI Component: ArtisanGiCraftModal (Slice 88)", () => {
  it("renders ArtisanGiCraftModal with WAI-ARIA role and tab navigation", () => {
    render(<ArtisanGiCraftModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Cottage Artisan Handloom & GI Certification Studio/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /^GI Technical Audit$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Weaver Living Wage Escrow$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Export Certificate of Origin$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Heritage Craft Registry$/i })).toBeDefined();
  });

  it("switches to GI Technical Audit tab and displays loom & yarn controls", () => {
    render(<ArtisanGiCraftModal isOpen={true} onClose={() => {}} />);

    const auditTab = screen.getByRole("button", { name: /^GI Technical Audit$/i });
    fireEvent.click(auditTab);

    expect(screen.getByText(/Heritage GI Craft Category/i)).toBeDefined();
    expect(screen.getByText(/Master Artisan Name & Title/i)).toBeDefined();
    expect(screen.getByText(/Loom Architecture/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Verify GI Craft Authenticity/i })).toBeDefined();
  });

  it("switches to Weaver Living Wage Escrow tab and displays fair labor wage controls", () => {
    render(<ArtisanGiCraftModal isOpen={true} onClose={() => {}} />);

    const escrowTab = screen.getByRole("button", { name: /^Weaver Living Wage Escrow$/i });
    fireEvent.click(escrowTab);

    expect(screen.getByText(/Weaver \/ Cluster Lead Name/i)).toBeDefined();
    expect(screen.getByText(/Estimated Weaving Days on Loom/i)).toBeDefined();
    expect(screen.getByText(/Buyer \/ Boutique Sourcing Budget \(BDT\)/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Lock Fair-Trade Weaver Escrow/i })).toBeDefined();
  });

  it("switches to Export Certificate of Origin tab and displays EPB compliance controls", () => {
    render(<ArtisanGiCraftModal isOpen={true} onClose={() => {}} />);

    const exportTab = screen.getByRole("button", { name: /^Export Certificate of Origin$/i });
    fireEvent.click(exportTab);

    expect(screen.getByText(/Registered Exporter Company/i)).toBeDefined();
    expect(screen.getByText(/Destination Export Country/i)).toBeDefined();
    expect(screen.getByText(/Certified GI Tag Number/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Generate EPB Certificate of Origin/i })).toBeDefined();
  });
});
