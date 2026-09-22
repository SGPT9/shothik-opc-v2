import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgriMandiRadarModal from '../AgriMandiRadarModal.js';

describe('AgriMandiRadarModal Component (AgriMandiRadarModal.tsx)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<AgriMandiRadarModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header, badges, and commodity cards when open', () => {
    render(<AgriMandiRadarModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Agri-Commodity Sourcing & Mandi Price Radar/i)).toBeInTheDocument();
    expect(screen.getByText(/Slice 40/i)).toBeInTheDocument();
    expect(screen.getByText(/তাহেরপুরী দেশি পেঁয়াজ/i)).toBeInTheDocument();
    expect(screen.getByText(/বগুড়ার তাজা কাঁচামরিচ/i)).toBeInTheDocument();
  });

  it('switches across the 5 navigation tabs and renders controls', () => {
    render(<AgriMandiRadarModal isOpen={true} onClose={() => {}} />);

    // Tab 2: Sourcing Lots & Micro-Advance (মণ)
    const lotsTab = screen.getByText(/Sourcing Lots & Micro-Advance \(মণ\)/i);
    fireEvent.click(lotsTab);
    expect(screen.getByText(/Create Agricultural Sourcing Lot & Calculate Farmer Advance/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard Bangladesh Agro Unit Conversion: 1 Maund \(মণ\) = 40 Kilograms/i)).toBeInTheDocument();

    // Tab 3: Arbitrage & Shrinkage Buffer
    const arbTab = screen.getByText(/Arbitrage & Shrinkage Buffer/i);
    fireEvent.click(arbTab);
    expect(screen.getByText(/Spatial Arbitrage Parameters/i)).toBeInTheDocument();
    expect(screen.getByText(/Moisture Evaporation Loss Mathematical Model/i)).toBeInTheDocument();

    // Tab 4: Cold-Chain Reefer Dispatch
    const ccTab = screen.getByText(/Cold-Chain Reefer Dispatch/i);
    fireEvent.click(ccTab);
    expect(screen.getByText(/Cold-Chain Reefer Route Planner vs Open Truck Savings/i)).toBeInTheDocument();
    expect(screen.getByText(/Open-Bed Cargo/i)).toBeInTheDocument();
    expect(screen.getByText(/Reefer Cold-Chain/i)).toBeInTheDocument();

    // Tab 5: Wholesale Trading Yards
    const yardsTab = screen.getByText(/Wholesale Trading Yards/i);
    fireEvent.click(yardsTab);
    expect(screen.getByText(/Karwan Bazar Central Wholesale Arat/i)).toBeInTheDocument();
    expect(screen.getByText(/Khatunganj & Chaktai Commodity Mandi/i)).toBeInTheDocument();
  });
});
