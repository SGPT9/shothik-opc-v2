import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportComplianceModal } from "../ExportComplianceModal";

describe("ExportComplianceModal Component (ExportComplianceModal.tsx)", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ExportComplianceModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary metrics when open", () => {
    render(<ExportComplianceModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Cross-Border Export Manifest & BB Form-EXP Engine/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/BB FERA 1947 & NBR ASYCUDA/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Turnover \(FOB\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Inward Realized \(SWIFT\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Repatriation/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Cash Subsidies/i)).toBeInTheDocument();
  });

  it("switches to Official Form-EXP Certificate tab and displays statutory document view", () => {
    render(<ExportComplianceModal isOpen={true} onClose={mockOnClose} />);

    const certTab = screen.getByRole("button", {
      name: /Official Form-EXP Certificate/i,
    });
    fireEvent.click(certTab);

    expect(
      screen.getByText(/BANGLADESH BANK ONLINE FORM-EXP/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Government of the People's Republic of Bangladesh/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/PARTICULARS OF COMMODITY & VALUATION/i)).toBeInTheDocument();
  });

  it("switches to LC & FERA Repatriation Radar tab and displays 120-day timeline", () => {
    render(<ExportComplianceModal isOpen={true} onClose={mockOnClose} />);

    const radarTab = screen.getByRole("button", {
      name: /LC & FERA Repatriation Radar/i,
    });
    fireEvent.click(radarTab);

    expect(
      screen.getByText(/120-Day FERA Foreign Exchange Repatriation Radar/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Statutory Repatriation Deadline:/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("switches to New Export Declaration Generator tab and displays inputs", () => {
    render(<ExportComplianceModal isOpen={true} onClose={mockOnClose} />);

    const newTab = screen.getByRole("button", {
      name: /New Export Form-EXP Generator/i,
    });
    fireEvent.click(newTab);

    expect(screen.getByText(/Exporter Enterprise/i)).toBeInTheDocument();
    expect(screen.getByText(/Consignee \/ Importer/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate Bangladesh Bank Form-EXP/i })
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ExportComplianceModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
