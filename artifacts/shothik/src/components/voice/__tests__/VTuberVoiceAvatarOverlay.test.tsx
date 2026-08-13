import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { VTuberVoiceAvatarOverlay } from '../VTuberVoiceAvatarOverlay';

describe('VTuberVoiceAvatarOverlay (Open-LLM-VTuber Presenter)', () => {
  it('renders avatar presenter overlay with Bangladeshi and Banglish language options', () => {
    render(<VTuberVoiceAvatarOverlay avatarName="Shothik Maya Presenter" isActive={true} />);

    expect(screen.getAllByText(/Shothik Maya Presenter/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/Bangladeshi Bangla/i)).toBeInTheDocument();
  });

  it('toggles speech state between idle and speaking', () => {
    render(<VTuberVoiceAvatarOverlay isActive={true} />);

    const toggleBtn = screen.getByTitle(/Toggle VTuber Speech/i);
    expect(screen.getByText(/কথা বলুন, আমি শুনছি/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Second-Me Twin/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<VTuberVoiceAvatarOverlay isActive={true} onClose={onClose} />);

    const closeBtn = screen.getByTitle(/Close Avatar/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
