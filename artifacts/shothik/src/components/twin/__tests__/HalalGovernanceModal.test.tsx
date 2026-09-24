import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HalalGovernanceModal } from "../HalalGovernanceModal";

describe("HalalGovernanceModal Component (HalalGovernanceModal.tsx)", () => {
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
      <HalalGovernanceModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary metrics when open", () => {
    render(<HalalGovernanceModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Halal Certification & Islamic Shariah Governance Studio/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/BSTI BDS 1907 \/ AAOIFI 21/i)).toBeInTheDocument();
    expect(screen.getByText(/Halal Certified SKUs/i)).toBeInTheDocument();
    expect(screen.getByText(/Screened E-Numbers/i)).toBeInTheDocument();
  });

  it("switches to E-Number & Ingredient Screener tab and executes screening test", () => {
    render(<HalalGovernanceModal isOpen={true} onClose={mockOnClose} />);

    const screenerTab = screen.getByRole("button", {
      name: /E-Number & Ingredient Screener/i,
    });
    fireEvent.click(screenerTab);

    expect(
      screen.getByText(/E-Number & Food Additive Halal Screener/i)
    ).toBeInTheDocument();

    const screenBtn = screen.getByRole("button", {
      name: /Run BSTI Halal Compliance Screen/i,
    });
    fireEvent.click(screenBtn);

    expect(screen.getByText(/Overall Product Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Halal Elements/i)).toBeInTheDocument();
  });

  it("switches to AAOIFI Financial Shariah Screener tab and computes financial compliance", () => {
    render(<HalalGovernanceModal isOpen={true} onClose={mockOnClose} />);

    const financeTab = screen.getByRole("button", {
      name: /AAOIFI Financial Shariah Screener/i,
    });
    fireEvent.click(financeTab);

    expect(
      screen.getByText(/AAOIFI Shariah Financial Ratio Screener/i)
    ).toBeInTheDocument();

    const calcBtn = screen.getByRole("button", {
      name: /Calculate AAOIFI Shariah Compliance/i,
    });
    fireEvent.click(calcBtn);

    expect(screen.getByText(/Debt to Assets \(Max 33%\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Charitable Income Purification Required:/i)
    ).toBeInTheDocument();
  });

  it("switches to BSTI BDS 1907 & AAOIFI Standards tab and displays regulatory overviews", () => {
    render(<HalalGovernanceModal isOpen={true} onClose={mockOnClose} />);

    const standardsTab = screen.getByRole("button", {
      name: /BSTI BDS 1907 & AAOIFI Standards/i,
    });
    fireEvent.click(standardsTab);

    expect(
      screen.getByText(/Bangladesh & Global Shariah Standards Overview/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/BSTI BDS 1907:2016 \(Bangladesh Halal Standard\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AAOIFI Shariah Standard No. 21 \(Financial Ratio Screening\)/i)
    ).toBeInTheDocument();
  });
});
