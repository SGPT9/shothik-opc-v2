import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DutyDrawbackModal } from "../DutyDrawbackModal";

describe("DutyDrawbackModal Component (DutyDrawbackModal.tsx)", () => {
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
      <DutyDrawbackModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary metrics when open", () => {
    render(<DutyDrawbackModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/NBR Customs Duty Drawback & DEC Studio/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Customs Act 2023 Sec 33\/34/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Drawback Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/Sanctioned & Disbursed/i)).toBeInTheDocument();
  });

  it("switches to New Claim Drafter tab and verifies drawback calculator inputs", () => {
    render(<DutyDrawbackModal isOpen={true} onClose={mockOnClose} />);

    const draftTab = screen.getByRole("button", {
      name: /New Claim Drafter & Duty Calculator/i,
    });
    fireEvent.click(draftTab);

    expect(screen.getByText(/Drawback Claim Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Product Name & Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Export FOB Value \(USD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Statutory Drawback Entitlement/i)).toBeInTheDocument();
  });

  it("switches to B/E to Form-EXP Cross-Matcher tab and runs reconciliation check", () => {
    render(<DutyDrawbackModal isOpen={true} onClose={mockOnClose} />);

    const reconcileTab = screen.getByRole("button", {
      name: /B\/E to Form-EXP Cross-Matcher/i,
    });
    fireEvent.click(reconcileTab);

    expect(
      screen.getByText(/Automated ASYCUDA World & Form-EXP Cross-Matcher/i)
    ).toBeInTheDocument();

    const verifyBtn = screen.getByRole("button", { name: /Verify Reconciliation Match/i });
    fireEvent.click(verifyBtn);

    expect(screen.getByText(/100% MATCHED/i)).toBeInTheDocument();
  });

  it("switches to DEDO Statutory Tariff Schedule tab and renders rate table", () => {
    render(<DutyDrawbackModal isOpen={true} onClose={mockOnClose} />);

    const scheduleTab = screen.getByRole("button", {
      name: /DEDO Statutory Tariff Schedule/i,
    });
    fireEvent.click(scheduleTab);

    expect(
      screen.getByText(/NBR DEDO Statutory Flat Rate Tariff Schedule/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Knitted Cotton Apparel/i)).toBeInTheDocument();
    expect(screen.getByText(/Woven Garments/i)).toBeInTheDocument();
  });
});
