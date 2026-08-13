import { describe, it, expect } from 'vitest';
import {
  validateIsbn13,
  calculateSpineWidthMm,
  auditPrintManuscript,
} from '../preflight-checker';

describe('Print Manuscript Preflight Validator (preflight-checker.ts)', () => {
  it('validates ISBN-13 checksums correctly', () => {
    // Valid ISBN-13
    expect(validateIsbn13('978-0-306-40615-7')).toBe(true);
    expect(validateIsbn13('978-984-95432-1-3')).toBe(true);
    expect(validateIsbn13('9780306406157')).toBe(true);

    // Invalid ISBN-13
    expect(validateIsbn13('978-0-306-40615-9')).toBe(false);
    expect(validateIsbn13('invalid-isbn')).toBe(false);
  });

  it('calculates physical book spine width accurately based on paper stock and page count', () => {
    // 200 pages on 80 GSM offset (0.0572mm per page)
    const spine80Gsm = calculateSpineWidthMm(200, '80_gsm_offset');
    expect(spine80Gsm).toBeCloseTo(11.44, 1);

    // 200 pages on 100 GSM premium (0.068mm per page)
    const spine100Gsm = calculateSpineWidthMm(200, '100_gsm_cream');
    expect(spine100Gsm).toBeCloseTo(13.6, 1);
  });

  it('audits manuscript pages for print-readiness (DPI, trim, bleed, ISBN)', () => {
    const report = auditPrintManuscript({
      title: 'Echoes of the Delta',
      pageCount: 180,
      paperStock: '80_gsm_offset',
      isbn: '978-984-95432-1-3',
      images: [
        { name: 'cover.jpg', dpi: 300, colorSpace: 'CMYK' },
        { name: 'map_figure.png', dpi: 150, colorSpace: 'RGB' }, // Low DPI
      ],
    });

    expect(report.passed).toBe(false); // Low DPI should trigger warning/block
    expect(report.warnings.length).toBeGreaterThan(0);
    expect(report.warnings[0]).toContain('map_figure.png');
    expect(report.spineWidthMm).toBeGreaterThan(0);
  });
});
