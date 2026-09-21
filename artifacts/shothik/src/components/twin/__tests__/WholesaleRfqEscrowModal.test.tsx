import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WholesaleRfqEscrowModal from '../WholesaleRfqEscrowModal.js';

describe('WholesaleRfqEscrowModal Component (WholesaleRfqEscrowModal.tsx)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<WholesaleRfqEscrowModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header, tabs, and market hub cards when open', () => {
    render(<WholesaleRfqEscrowModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Autonomous Wholesale RFQ & B2B Escrow Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Slice 39/i)).toBeInTheDocument();
    expect(screen.getByText(/Chawkbazar Wholesale Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Islampur Textile District/i)).toBeInTheDocument();
    expect(screen.getByText(/M\/S Al-Madina Hardware & Moulding Complex/i)).toBeInTheDocument();
  });

  it('switches across the 5 navigation tabs and renders controls', () => {
    render(<WholesaleRfqEscrowModal isOpen={true} onClose={() => {}} />);

    // Tab 2: Generate B2B RFQ
    const rfqTab = screen.getByText(/Generate B2B RFQ/i);
    fireEvent.click(rfqTab);
    expect(screen.getByText(/Request For Quotation \(RFQ\) Parameters/i)).toBeInTheDocument();
    expect(screen.getByText(/Volume Discount Curve & Price Tiers/i)).toBeInTheDocument();

    // Tab 3: Supplier Bids & SRI Ranker
    const bidsTab = screen.getByText(/Supplier Bids & SRI Ranker/i);
    fireEvent.click(bidsTab);
    expect(screen.getByText(/Competing Mill Quotations for RFQ/i)).toBeInTheDocument();
    expect(screen.getByText(/Bismillah Silk & Cotton Mills Ltd\./i)).toBeInTheDocument();

    // Tab 4: Milestone Escrow Agreement
    const escrowTab = screen.getByText(/Milestone Escrow Agreement/i);
    fireEvent.click(escrowTab);
    expect(screen.getByText(/Bilingual 3-Stage Milestone Escrow Agreement/i)).toBeInTheDocument();
    expect(screen.getByText(/Milestone 1: Raw Material Procurement/i)).toBeInTheDocument();

    // Tab 5: Volume Curve Simulator
    const simTab = screen.getByText(/Volume Curve Simulator/i);
    fireEvent.click(simTab);
    expect(screen.getByText(/Dynamic Volume Discount & Margin Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Wholesale Arbitrage Savings/i)).toBeInTheDocument();
  });
});
