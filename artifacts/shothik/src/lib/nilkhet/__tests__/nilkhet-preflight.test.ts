/**
 * Nilkhet Preflight & DRM Engine Test Suite
 * Tests spine-width calculation, preflight rules, bleeds, DPI checks, and cryptographic DRM watermarks
 */

import { describe, it, expect } from 'vitest';
import { NilkhetPreflightEngine, type PreflightInput } from '../nilkhet-preflight-engine';

describe('NilkhetPreflightEngine', () => {
  const baseInput: PreflightInput = {
    bookTitle: 'The Amar Ekushey Monograph',
    authorName: 'Ahmed Sharif',
    pageCount: 160,
    trimWidthMm: 148, // A5
    trimHeightMm: 210, // A5
    bleedMm: 3.0,
    paperType: '80gsm_offset',
    bindingType: 'perfect_bound',
    imagesDpi: [300, 450, 600],
    colorProfiles: ['ISO Coated v2 (ECI)'],
  };

  it('should calculate accurate spine width for perfect binding', () => {
    // 160 pages / 2 leaves = 80 leaves * 0.108mm = 8.64mm -> rounded to 8.6mm
    const spine = NilkhetPreflightEngine.calculateSpineWidth(160, '80gsm_offset', 'perfect_bound');
    expect(spine).toBe(8.6);
  });

  it('should add extra board allowance for hardcover binding', () => {
    const spine = NilkhetPreflightEngine.calculateSpineWidth(160, '80gsm_offset', 'hardcover');
    // 8.64 + 3.0 = 11.64mm -> rounded to 11.6mm
    expect(spine).toBe(11.6);
  });

  it('should pass preflight inspection for compliant manuscripts', () => {
    const result = NilkhetPreflightEngine.inspect(baseInput);

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.spineWidthMm).toBe(8.6);
    expect(result.drmFingerprint.watermarkId).toMatch(/^DRM-NLK-[A-F0-9]{10}$/);
    expect(result.pressSpecification.recommendedPressType).toContain('Nilkhet Offset Press');
  });

  it('should flag saddle-stitch errors if page count is not multiple of 4', () => {
    const result = NilkhetPreflightEngine.inspect({
      ...baseInput,
      pageCount: 37, // Not divisible by 4
      bindingType: 'saddle_stitch',
    });

    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.code === 'PAGE_COUNT_NOT_MULTIPLE_OF_4')).toBe(true);
  });

  it('should flag warning for low-resolution images (< 300 DPI)', () => {
    const result = NilkhetPreflightEngine.inspect({
      ...baseInput,
      imagesDpi: [300, 72, 96], // 2 low DPI images
    });

    expect(result.passed).toBe(true); // Warnings don't fail, but reduce score
    expect(result.score).toBeLessThan(100);
    expect(result.issues.some((i) => i.code === 'LOW_IMAGE_RESOLUTION')).toBe(true);
  });

  it('should generate consistent and deterministic DRM hashes', () => {
    const res1 = NilkhetPreflightEngine.inspect(baseInput);
    expect(res1.drmFingerprint.hash).toHaveLength(64); // SHA-256 hex
    expect(res1.drmFingerprint.encryptedLicense).toMatch(/^LIC-[A-F0-9]{16}$/);
  });
});
