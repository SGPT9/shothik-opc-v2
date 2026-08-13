import { describe, it, expect } from 'vitest';
import { computeReadinessScore } from '../projectMetrics';

describe('computeReadinessScore', () => {
  it('handles empty criteria gracefully without throwing', () => {
    const result = computeReadinessScore({});
    expect(result).toBeDefined();
    expect(typeof result.score).toBe('number');
    expect(Array.isArray(result.criteria)).toBe(true);
    expect(result.criteria.length).toBeGreaterThan(0);
  });

  it('handles partial criteria with wordCount and plainText only', () => {
    const result = computeReadinessScore({
      wordCount: 1500,
      plainText: 'Sample book text without errors',
      citationCount: 0,
    });
    expect(result.score).toBeGreaterThan(0);
    const wordItem = result.criteria.find(c => c.id === 'wordcount');
    expect(wordItem).toBeDefined();
    expect(wordItem?.hint).toContain('1,500');
  });

  it('handles full research criteria correctly', () => {
    const result = computeReadinessScore({
      wordCount: 8500,
      genreTarget: 8000,
      grammarPassing: true,
      hasCitations: true,
      hasCoverArt: false,
      hasMetadata: true,
      hasPricing: false,
      projectType: 'research',
    });
    expect(result.score).toBeGreaterThanOrEqual(70);
    const citationItem = result.criteria.find(c => c.id === 'citations');
    expect(citationItem?.met).toBe(true);
  });
});
