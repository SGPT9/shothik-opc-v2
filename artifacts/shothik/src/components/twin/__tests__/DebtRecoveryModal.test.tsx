import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DebtRecoveryModal } from "../DebtRecoveryModal";

describe("DebtRecoveryModal Component (DebtRecoveryModal.tsx)", () => {
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
      <DebtRecoveryModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary cards when open", () => {
    render(<DebtRecoveryModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/B2B Trade Credit Insurance & NI Act 138 Recovery Engine/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/NI Act 1881 Sec 138 & 90% Indemnity/i)).toBeInTheDocument();
    expect(screen.getByText(/Insured Supply Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/Bounced Cheques Tracked/i)).toBeInTheDocument();
    expect(screen.getByText(/Indemnity Claims Disbursed/i)).toBeInTheDocument();
  });

  it("switches to Trade Insurance Policies tab and renders policy rows", () => {
    render(<DebtRecoveryModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/PRAN-RFL Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Square Pharmaceuticals PLC/i)).toBeInTheDocument();
    expect(screen.getByText(/Chittagong Retail Distribution Ltd\./i)).toBeInTheDocument();
  });

  it("switches to NI Act 138 Legal Notice tab and renders dishonored cheque preview", () => {
    render(<DebtRecoveryModal isOpen={true} onClose={mockOnClose} />);

    const noticeTab = screen.getByRole("button", {
      name: /NI Act 138 Legal Notice Generator/i,
    });
    fireEvent.click(noticeTab);

    expect(screen.getByText(/Dishonored Security Cheques/i)).toBeInTheDocument();
    expect(screen.getByText(/Statutory Section 138 Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Bengal Traders & Logistics Ltd\./i)).toBeInTheDocument();

    const copyBtn = screen.getByRole("button", { name: /Copy Legal Notice/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("switches to Insure New Supply Invoice tab and renders bonding form", () => {
    render(<DebtRecoveryModal isOpen={true} onClose={mockOnClose} />);

    const insureTab = screen.getByRole("button", {
      name: /Insure New Supply Invoice/i,
    });
    fireEvent.click(insureTab);

    expect(screen.getByText(/Bond Supply Contract with 90% Trade Credit Insurance/i)).toBeInTheDocument();
    expect(screen.getByText(/Mushak-6.3 Invoice Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Premium \(0\.45%\):/i)).toBeInTheDocument();
  });

  it("switches to Log Cheque Dishonor Memo tab and renders filing form", () => {
    render(<DebtRecoveryModal isOpen={true} onClose={mockOnClose} />);

    const logTab = screen.getByRole("button", {
      name: /Log Cheque Dishonor Memo/i,
    });
    fireEvent.click(logTab);

    expect(screen.getByText(/Log Dishonored Cheque & Generate Statutory NI 138 Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Drawn Bank Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Dishonor Memo Date/i)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<DebtRecoveryModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
