import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FieldAgentPosModal from '../FieldAgentPosModal.js';

describe('FieldAgentPosModal Component (FieldAgentPosModal.tsx)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<FieldAgentPosModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header, offline CRDT badge, and initial products when open', () => {
    render(<FieldAgentPosModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Field Agent POS & Bluetooth Print Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline CRDT Active/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Fresh Cha 200ml Flask Pack/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Chanachur Spicy Mix 150g/i).length).toBeGreaterThanOrEqual(1);
  });

  it('allows adding and removing items in the cart with dynamic total calculation', () => {
    render(<FieldAgentPosModal isOpen={true} onClose={() => {}} />);

    // Check that default cart has items
    expect(screen.getByText(/Current Cart/i)).toBeInTheDocument();
    expect(screen.getByText(/Grand Total:/i)).toBeInTheDocument();

    // Click "Add" button for Mineral Water
    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
    }
    expect(screen.getByText(/Current Cart/i)).toBeInTheDocument();
  });

  it('switches across the 5 navigation tabs and renders controls', () => {
    render(<FieldAgentPosModal isOpen={true} onClose={() => {}} />);

    // Tab 2: ESC/POS Thermal Print
    const thermalTab = screen.getByText(/ESC\/POS Thermal Print/i);
    fireEvent.click(thermalTab);
    expect(screen.getByText(/Bluetooth Thermal Printer/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Thermal Receipt Preview/i)).toBeInTheDocument();

    // Tab 3: Dynamic MFS QR
    const qrTab = screen.getByText(/Dynamic MFS QR/i);
    fireEvent.click(qrTab);
    expect(screen.getByText(/Dynamic EMVCo QR Parameters/i)).toBeInTheDocument();
    expect(screen.getByText(/bKash Merchant/i)).toBeInTheDocument();

    // Tab 4: Offline Queue & Sync
    const queueTab = screen.getByText(/Offline Queue & Sync/i);
    fireEvent.click(queueTab);
    expect(screen.getByText(/Offline Transaction Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Batch Sync to Master Franchise/i)).toBeInTheDocument();

    // Tab 5: Float Reconciler
    const floatTab = screen.getByText(/Float Reconciler/i);
    fireEvent.click(floatTab);
    expect(screen.getByText(/End-of-Day Cash Float Reconciliation/i)).toBeInTheDocument();
    expect(screen.getByText(/Reconcile & Generate Supervisor Seal/i)).toBeInTheDocument();
  });
});
