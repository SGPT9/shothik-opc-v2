import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WayfinderBoard } from '../WayfinderBoard';

describe('WayfinderBoard (Visual Goal Frontier & Decision Map)', () => {
  it('renders destination goal and active unblocked frontier tickets', () => {
    render(
      <WayfinderBoard
        destination="Launch Physical Novel Distribution on bKash & Steadfast"
        initialTickets={[
          { title: 'Define courier payload schema', type: 'task', status: 'closed', resolution: 'Steadfast v2 API schema ready' },
          { title: 'Implement 1.85% fee bKash math', type: 'prototype', blockedBy: ['Define courier payload schema'], status: 'open' },
          { title: 'Stress-test 2GB RAM edge devices', type: 'research', blockedBy: ['Implement 1.85% fee bKash math'], status: 'open' },
        ]}
      />
    );

    expect(screen.getByText(/Launch Physical Novel Distribution/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Implement 1.85% fee bKash math/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Unblocked Frontier/i)).toBeInTheDocument();
  });

  it('allows resolving an unblocked ticket and advancing the frontier', () => {
    render(
      <WayfinderBoard
        destination="Build Autonomous Research Pipeline"
        initialTickets={[
          { title: 'Design Query Optimizer', type: 'task', status: 'open' },
          { title: 'Benchmark Needle vs Cloud', type: 'research', blockedBy: ['Design Query Optimizer'], status: 'open' },
        ]}
      />
    );

    const resolveBtn = screen.getByRole('button', { name: /Mark Resolved/i });
    fireEvent.click(resolveBtn);

    // Now 'Benchmark Needle vs Cloud' should be unlocked in the frontier
    expect(screen.getByText(/Benchmark Needle vs Cloud/i)).toBeInTheDocument();
  });
});
