import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OutputChannels } from '../components/OutputChannels';

describe('Twin Platform Autopilot Capabilities', () => {
  it('renders all 4 growth channels: Meta Ads, Twitter/X, Cold Email, and Publish', () => {
    render(<OutputChannels />);

    expect(screen.getByText(/Meta Ads Growth Loop/i)).toBeInTheDocument();
    expect(screen.getByText(/Twitter \/ X Autopilot/i)).toBeInTheDocument();
    expect(screen.getByText(/Cold Email Outreach/i)).toBeInTheDocument();
    expect(screen.getByText(/^Publish$/i)).toBeInTheDocument();
  });
});
