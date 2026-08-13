import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlideNarrationSync } from '../useSlideNarrationSync';

describe('VTuber Slide Narration Sync Engine (useSlideNarrationSync)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('initializes with first slide and inactive narration state', () => {
    const slides = [
      { id: 's1', title: 'Intro', script: 'Welcome to Polsia OPC platform.' },
      { id: 's2', title: 'Metrics', script: 'We are growing 35% MoM.' },
    ];

    const { result } = renderHook(() => useSlideNarrationSync({ slides }));

    expect(result.current.currentSlideIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('starts playing narration and advances to next slide when complete', () => {
    const slides = [
      { id: 's1', title: 'Intro', script: 'Short script.' }, // ~2 seconds
      { id: 's2', title: 'Metrics', script: 'Final slide.' },
    ];

    const { result } = renderHook(() => useSlideNarrationSync({ slides, speedMultiplier: 1.0 }));

    act(() => {
      result.current.startNarration();
    });

    expect(result.current.isPlaying).toBe(true);

    // Fast-forward time for first slide
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.currentSlideIndex).toBe(1);
  });

  it('allows stopping and resetting narration', () => {
    const slides = [
      { id: 's1', title: 'Intro', script: 'Slide 1' },
      { id: 's2', title: 'Metrics', script: 'Slide 2' },
    ];

    const { result } = renderHook(() => useSlideNarrationSync({ slides }));

    act(() => {
      result.current.startNarration();
      result.current.stopNarration();
    });

    expect(result.current.isPlaying).toBe(false);
  });
});
