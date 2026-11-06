import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PrintPreflightModal } from '../components/PrintPreflightModal';

describe('PrintPreflightModal Component', () => {
  it('renders preflight report and spine thickness specifications', () => {
    render(
      <PrintPreflightModal
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj_demo_bengali"
      />
    );

    expect(screen.getByText(/Print Preflight/i)).toBeInTheDocument();
    expect(screen.getByText(/স্পাইন পুরুত্ব/i)).toBeInTheDocument();
  });

  it('allows changing paper stock and updates selection', () => {
    render(
      <PrintPreflightModal
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj_demo_bengali"
      />
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(selects[1], { target: { value: 'art_paper_100gsm' } });
    expect(selects[1]).toHaveValue('art_paper_100gsm');
  });
});
