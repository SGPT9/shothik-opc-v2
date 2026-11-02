import { describe, it, expect } from 'vitest';
import {
  convertProseToFountain,
  convertProseToComicPanels
} from '../script-storyboard.js';

describe('Novel-to-Screenplay & Comic Storyboard Transmuter', () => {
  const sampleProse = `INT. DHANMONDI RESIDENCE - NIGHT
বাইরে বৃষ্টির ঝাপটা।
হিমু: (হাসিমুখে) কেমন আছ বাদল?
বাদল: আমি ভয় পাচ্ছি হিমু ভাই।
CUT TO:`;

  it('correctly converts prose to Fountain screenplay syntax with standard sluglines and parentheticals', () => {
    const result = convertProseToFountain(sampleProse, 'DEMO SCRIPT');
    
    expect(result.script).toContain('Title: DEMO SCRIPT');
    expect(result.script).toContain('INT. DHANMONDI RESIDENCE - NIGHT');
    expect(result.script).toContain('হিমু');
    expect(result.script).toContain('(হাসিমুখে)');
    expect(result.script).toContain('কেমন আছ বাদল?');
    expect(result.script).toContain('বাদল');
    expect(result.script).toContain('আমি ভয় পাচ্ছি হিমু ভাই।');
    expect(result.elements.length).toBeGreaterThan(3);
    expect(result.runtimeMin).toBeGreaterThan(0);
  });

  it('extracts comic book panel layouts with camera angles and speech balloons', () => {
    const panels = convertProseToComicPanels(sampleProse);
    
    expect(panels.length).toBeGreaterThan(0);
    expect(panels[0].panelNumber).toBe(1);
    expect(panels[0].cameraShot).toBeDefined();
    expect(panels[0].charactersPresent.length).toBeGreaterThan(0);
    expect(panels[0].dialogueBalloons.length).toBeGreaterThan(0);
  });

  it('handles empty input gracefully by returning default panels and screenplay', () => {
    const emptyPanels = convertProseToComicPanels('');
    expect(emptyPanels.length).toBe(1);
    expect(emptyPanels[0].charactersPresent).toContain('হিমু (Himu)');

    const emptyFountain = convertProseToFountain('', 'EMPTY');
    expect(emptyFountain.script).toContain('Title: EMPTY');
    expect(emptyFountain.runtimeMin).toBe(1);
  });

  it('detects sound effects (SFX) from action keywords', () => {
    const sfxProse = `হিমু দরজার দিকে তাকাল। হঠাৎ দরজায় ধাক্কা পড়ল।\nবাদল: কে এল?`;
    const panels = convertProseToComicPanels(sfxProse);
    
    expect(panels.some(p => p.sfxSoundEffect !== undefined)).toBe(true);
  });

  it('calculates runtime statistics accurately based on word counts', () => {
    const longProse = Array(260).fill('শব্দ').join(' ');
    const result = convertProseToFountain(longProse, 'RUN TIME TEST');
    
    // ~260 words / 130 wpm = ~2 minutes
    expect(result.runtimeMin).toBeCloseTo(2, 0);
  });
});
