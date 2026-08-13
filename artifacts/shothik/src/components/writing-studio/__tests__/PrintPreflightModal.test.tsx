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
        title="Echoes of Bengal"
        pageCount={160}
        isbn="978-0-306-40615-7"
      />
    );

    expect(screen.getByText(/Physical Print Preflight/i)).toBeInTheDocument();
    expect(screen.getByText(/Spine Width/i)).toBeInTheDocument();
    expect(screen.getByText(/978-0-306-40615-7/i)).toBeInTheDocument();
  });

  it('allows changing paper stock and recalculates spine width', () => {
    render(
      <PrintPreflightModal
        isOpen={true}
        onClose={vi.fn()}
        title="Echoes of Bengal"
        pageCount={200}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '100_gsm_cream' } });

    expect(screen.getByText(/13.6/i)).toBeInTheDocument();
  });
});
