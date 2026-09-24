import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Mushak43DeclarationModal from '../Mushak43DeclarationModal.js';

describe('Mushak43DeclarationModal Component (Mushak43DeclarationModal.tsx)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<Mushak43DeclarationModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header, NBR form badge, and registered declarations when open', () => {
    render(<Mushak43DeclarationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/NBR Mushak-4.3 Factory Costing & Coefficient Declarator/i)).toBeInTheDocument();
    expect(screen.getByText(/মূসক-৪.৩ বিধিবদ্ধ ডিক্লেয়ারেশন/i)).toBeInTheDocument();
    expect(screen.getByText(/Butter Toast Biscuit 250g Family Pack/i)).toBeInTheDocument();
  });

  it('switches across the 5 navigation tabs and renders controls', () => {
    render(<Mushak43DeclarationModal isOpen={true} onClose={() => {}} />);

    // Tab 2: BOM Costing Calculator
    const calcTab = screen.getByText(/BOM Costing Calculator/i);
    fireEvent.click(calcTab);
    expect(screen.getByText(/Product & Manufacturer Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Raw Material Inputs & Process Wastage/i)).toBeInTheDocument();
    expect(screen.getByText(/Value Addition %:/i)).toBeInTheDocument();

    // Tab 3: Formal মূসক-৪.৩ Form
    const formTab = screen.getByText(/Formal মূসক-৪.৩ Form/i);
    fireEvent.click(formTab);
    expect(screen.getByText(/NBR Statutory Form মূসক-৪.৩/i)).toBeInTheDocument();
    expect(screen.getByText(/গণপ্রজাতন্ত্রী বাংলাদেশ সরকার · জাতীয় রাজস্ব বোর্ড/i)).toBeInTheDocument();

    // Tab 4: 7.5% Variance Auditor
    const auditTab = screen.getByText(/7.5% Variance Auditor/i);
    fireEvent.click(auditTab);
    expect(screen.getByText(/Production Batch Variance Auditor/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit Batch & Verify 7.5% NBR Gate/i)).toBeInTheDocument();

    // Tab 5: BOM Templates
    const templatesTab = screen.getByText(/BOM Templates/i);
    fireEvent.click(templatesTab);
    expect(screen.getByText(/Predefined Industry BOM Templates/i)).toBeInTheDocument();
    expect(screen.getByText(/Bakery & Confectionery/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready-Made Garments/i)).toBeInTheDocument();
  });
});
