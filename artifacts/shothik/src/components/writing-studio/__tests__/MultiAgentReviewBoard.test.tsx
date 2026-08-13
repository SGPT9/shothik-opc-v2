import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MultiAgentReviewBoard } from '../components/MultiAgentReviewBoard';

describe('MultiAgentReviewBoard (MateClaw-Inspired 4-Agent Review Room)', () => {
  it('renders all 4 specialized review agents', () => {
    render(<MultiAgentReviewBoard chapterContent="Elena walked on Aethelgard Station." />);

    expect(screen.getByText(/Timeline & Plot Auditor/i)).toBeInTheDocument();
    expect(screen.getByText(/Character Voice Auditor/i)).toBeInTheDocument();
    expect(screen.getByText(/Fact & Citation Verifier/i)).toBeInTheDocument();
    expect(screen.getByText(/Banglish & Tone Polisher/i)).toBeInTheDocument();
  });

  it('runs parallel multi-agent audits when triggered', async () => {
    render(<MultiAgentReviewBoard chapterContent="Elena walked on Aethelgard Station." />);

    const runButton = screen.getByRole('button', { name: /Run Full Editorial Audit/i });
    fireEvent.click(runButton);

    expect(screen.getByText(/Auditing in progress/i)).toBeInTheDocument();
  });

  it('allows applying individual agent suggestions to the manuscript', () => {
    const onApplyFix = vi.fn();
    render(
      <MultiAgentReviewBoard
        chapterContent="Elena was walking slowly."
        onApplyFix={onApplyFix}
      />
    );

    const fixButtons = screen.getAllByRole('button', { name: /Apply Fix/i });
    expect(fixButtons.length).toBeGreaterThan(0);

    fireEvent.click(fixButtons[0]);
    expect(onApplyFix).toHaveBeenCalled();
  });
});
