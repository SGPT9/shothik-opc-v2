import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InlineDiffModal } from '../InlineDiffModal';

describe('InlineDiffModal (Qoderian-Inspired In-Place Rewrite)', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <InlineDiffModal
        isOpen={false}
        selectedText="Sample manuscript text"
        rewrittenText="Enhanced manuscript text"
        isStreaming={false}
        error={null}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onExecute={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders diff comparison and preset buttons when open', () => {
    const onExecute = vi.fn();
    const onAccept = vi.fn();
    const onClose = vi.fn();

    render(
      <InlineDiffModal
        isOpen={true}
        selectedText="The rain was falling heavily over Dhaka."
        rewrittenText="Monsoon rain hammered the corrugated roofs of Old Dhaka in relentless sheets."
        isStreaming={false}
        error={null}
        onClose={onClose}
        onAccept={onAccept}
        onExecute={onExecute}
      />
    );

    expect(screen.getByText('AI Inline Rewrite')).toBeDefined();
    expect(screen.getByText('The rain was falling heavily over Dhaka.')).toBeDefined();
    expect(screen.getByText('Monsoon rain hammered the corrugated roofs of Old Dhaka in relentless sheets.')).toBeDefined();
    expect(screen.getByText('⚡ Punchy & Tight')).toBeDefined();
    expect(screen.getByText('Accept & Replace')).toBeDefined();
  });

  it('calls onAccept when Accept button is clicked', () => {
    const onAccept = vi.fn();
    render(
      <InlineDiffModal
        isOpen={true}
        selectedText="Original text"
        rewrittenText="Rewritten text"
        isStreaming={false}
        error={null}
        onClose={vi.fn()}
        onAccept={onAccept}
        onExecute={vi.fn()}
      />
    );

    const acceptBtn = screen.getByText('Accept & Replace');
    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
