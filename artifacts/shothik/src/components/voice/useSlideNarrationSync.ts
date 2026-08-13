import { useState, useEffect, useRef, useCallback } from 'react';

export interface SlideNarrationItem {
  id: string;
  title: string;
  script: string;
  durationMs?: number;
}

export interface UseSlideNarrationSyncOptions {
  slides: SlideNarrationItem[];
  speedMultiplier?: number;
  onSlideChange?: (index: number) => void;
  onNarrationEnd?: () => void;
}

export function useSlideNarrationSync({
  slides,
  speedMultiplier = 1.0,
  onSlideChange,
  onNarrationEnd,
}: UseSlideNarrationSyncOptions) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<'IDLE' | 'A' | 'I' | 'U' | 'E' | 'O'>('IDLE');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateSlideDuration = useCallback((text: string): number => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    // ~150 words per minute -> 2.5 words per second -> 400ms per word
    const duration = Math.max(2000, wordCount * 400);
    return Math.round(duration / speedMultiplier);
  }, [speedMultiplier]);

  const advanceSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < slides.length) {
        if (onSlideChange) onSlideChange(nextIndex);
        return nextIndex;
      } else {
        setIsPlaying(false);
        setCurrentViseme('IDLE');
        if (onNarrationEnd) onNarrationEnd();
        return prevIndex;
      }
    });
  }, [slides.length, onSlideChange, onNarrationEnd]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrentViseme('IDLE');
      return;
    }

    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;

    setCurrentViseme('A'); // Active talking viseme
    const duration = currentSlide.durationMs || calculateSlideDuration(currentSlide.script);

    timerRef.current = setTimeout(() => {
      advanceSlide();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentSlideIndex, slides, calculateSlideDuration, advanceSlide]);

  const startNarration = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const stopNarration = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resetNarration = useCallback(() => {
    setIsPlaying(false);
    setCurrentSlideIndex(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    currentSlideIndex,
    isPlaying,
    currentViseme,
    startNarration,
    stopNarration,
    resetNarration,
    setCurrentSlideIndex,
  };
}
