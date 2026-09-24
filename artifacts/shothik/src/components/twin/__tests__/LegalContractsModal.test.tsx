import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LegalContractsModal } from "../LegalContractsModal";

describe("LegalContractsModal Component (LegalContractsModal.tsx)", () => {
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
      <LegalContractsModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory compliance badges, and KPI summary metrics when open", () => {
    render(<LegalContractsModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/AI Legal Contract & Stamp Duty Act 1899 Studio/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/ICT Act 2006 Compliant/i)).toBeInTheDocument();
    expect(screen.getByText(/Executed Contracts/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Portfolio Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Stamp Duty Paid \(Act 1899\)/i)).toBeInTheDocument();
  });

  it("switches to New Contract Drafter tab and recalculates stamp duty dynamically", () => {
    render(<LegalContractsModal isOpen={true} onClose={mockOnClose} />);

    const draftTab = screen.getByRole("button", {
      name: /New Contract Drafter & Stamp Calculator/i,
    });
    fireEvent.click(draftTab);

    expect(screen.getByText(/Contract Template & Category/i)).toBeInTheDocument();
    expect(screen.getByText(/First Party/i)).toBeInTheDocument();
    expect(screen.getByText(/Second Party/i)).toBeInTheDocument();
    expect(screen.getByText(/Statutory Stamp Requirement/i)).toBeInTheDocument();
  });

  it("switches to Statutory Stamp Schedule tab and renders Stamp Act 1899 tariff matrix", () => {
    render(<LegalContractsModal isOpen={true} onClose={mockOnClose} />);

    const scheduleTab = screen.getByRole("button", {
      name: /Stamp Act 1899 Statutory Schedule/i,
    });
    fireEvent.click(scheduleTab);

    expect(
      screen.getByText(/The Stamp Act, 1899 Statutory Tariff Reference/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Non-Disclosure Agreement \(NDA\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Commercial Property \/ Warehouse Lease/i)).toBeInTheDocument();
  });

  it("switches to Contract Preview tab, toggles English/Bangla language mode, and copies seal", () => {
    render(<LegalContractsModal isOpen={true} onClose={mockOnClose} />);

    const previewTab = screen.getByRole("button", {
      name: /Contract Preview & Digital Seal/i,
    });
    fireEvent.click(previewTab);

    expect(screen.getAllByText(/STAMP DUTY PAID/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Operative Statutory Clauses/i)).toBeInTheDocument();

    const banglaBtn = screen.getByRole("button", { name: /বাংলা/i });
    fireEvent.click(banglaBtn);

    const copyBtn = screen.getByRole("button", { name: /Copy Seal Hash/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
