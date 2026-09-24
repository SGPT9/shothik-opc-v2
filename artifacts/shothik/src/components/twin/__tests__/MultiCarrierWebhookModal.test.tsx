import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiCarrierWebhookModal } from "../MultiCarrierWebhookModal";

describe("MultiCarrierWebhookModal Component", () => {
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
      <MultiCarrierWebhookModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders carrier status badges, summary metrics, and default stream when open", () => {
    render(<MultiCarrierWebhookModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Multi-Carrier Inbound Webhook & Settlement Reconciler/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Autonomous Double-Entry GL/i)).toBeInTheDocument();
    expect(screen.getByText(/Total COD Collected/i)).toBeInTheDocument();
    expect(screen.getByText(/Bank Disbursed Payout/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Courier Receivable/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Fee Disputes/i)).toBeInTheDocument();
  });

  it("switches to Double-Entry GL Ledger tab and displays journal entry table", () => {
    render(<MultiCarrierWebhookModal isOpen={true} onClose={mockOnClose} />);

    const ledgerTab = screen.getByRole("button", {
      name: /Double-Entry GL Ledger/i,
    });
    fireEvent.click(ledgerTab);

    expect(screen.getByText(/Real-time double-entry journal postings/i)).toBeInTheDocument();
    expect(screen.getByText(/1130 - Accounts Receivable: Courier COD \(STEADFAST\)/i)).toBeInTheDocument();
    expect(screen.getByText(/4100 - Customer Sales Revenue/i)).toBeInTheDocument();
  });

  it("switches to Disputes tab and renders bilingual claim letters", () => {
    render(<MultiCarrierWebhookModal isOpen={true} onClose={mockOnClose} />);

    const disputesTab = screen.getByRole("button", {
      name: /Disputes & Claim Letters/i,
    });
    fireEvent.click(disputesTab);

    expect(screen.getByText(/দাবি পত্র \(বাংলা বয়ান\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Dispute Draft \(English\)/i)).toBeInTheDocument();
    expect(screen.getByText(/বিষয়: কনসাইনমেন্ট #SF-77192-এর সিওডি ডিসবার্সমেন্টে/i)).toBeInTheDocument();
  });

  it("switches to Webhook Sandbox Simulator tab and shows interactive form", () => {
    render(<MultiCarrierWebhookModal isOpen={true} onClose={mockOnClose} />);

    const simTab = screen.getByRole("button", {
      name: /Webhook Sandbox Simulator/i,
    });
    fireEvent.click(simTab);

    expect(screen.getByText(/Inbound Webhook Live Simulator & Reconciler/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fire Inbound Webhook Event/i })).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<MultiCarrierWebhookModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
