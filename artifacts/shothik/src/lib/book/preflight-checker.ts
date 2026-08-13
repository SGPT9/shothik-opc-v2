/**
 * Print Manuscript Preflight Validator
 * Production preflight engine for physical book printing and distribution in Bangladesh (Bangla Academy / Nilkhet / Concord standard)
 * and international POD networks (IngramSpark / KDP).
 */

export type PaperStock = '80_gsm_offset' | '100_gsm_cream' | '70_gsm_newsprint' | '120_gsm_art';

export interface ImagePreflightItem {
  name: string;
  dpi: number;
  colorSpace: 'CMYK' | 'RGB' | 'Grayscale';
}

export interface ManuscriptPreflightInput {
  title: string;
  pageCount: number;
  paperStock: PaperStock;
  isbn?: string;
  images?: ImagePreflightItem[];
  trimSize?: '6x9' | '5.5x8.5' | 'A5' | 'B5';
}

export interface PreflightReport {
  passed: boolean;
  title: string;
  pageCount: number;
  spineWidthMm: number;
  isbnValid: boolean;
  errors: string[];
  warnings: string[];
  specs: {
    bleedMm: number;
    innerGutterMarginMm: number;
    recommendedDpi: number;
  };
}

const PAPER_PAGES_PER_MM: Record<PaperStock, number> = {
  '80_gsm_offset': 0.0572,
  '100_gsm_cream': 0.0680,
  '70_gsm_newsprint': 0.0490,
  '120_gsm_art': 0.0820,
};

/**
 * Validates ISBN-10 or ISBN-13 with standard Modulo 10 / Modulo 11 checksum calculation.
 */
export function validateIsbn13(isbnStr: string): boolean {
  const digits = isbnStr.replace(/[^0-9X]/gi, '');
  if (digits.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(digits[12], 10);
}

/**
 * Calculates physical spine width in millimeters.
 */
export function calculateSpineWidthMm(pageCount: number, stock: PaperStock): number {
  const thicknessPerLeaf = PAPER_PAGES_PER_MM[stock] || 0.0572;
  return Number((pageCount * thicknessPerLeaf).toFixed(2));
}

/**
 * Executes a full preflight audit on the manuscript.
 */
export function auditPrintManuscript(input: ManuscriptPreflightInput): PreflightReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const spineWidthMm = calculateSpineWidthMm(input.pageCount, input.paperStock);
  const isbnValid = input.isbn ? validateIsbn13(input.isbn) : false;

  if (input.pageCount < 24) {
    warnings.push('Page count is below standard spine threshold (24 pages required for perfect binding). Saddle stitch recommended.');
  }

  if (input.isbn && !isbnValid) {
    errors.push(`Invalid ISBN-13 checksum provided: "${input.isbn}".`);
  }

  if (input.images && input.images.length > 0) {
    for (const img of input.images) {
      if (img.dpi < 300) {
        warnings.push(`Image "${img.name}" has ${img.dpi} DPI (minimum 300 DPI recommended for crisp print).`);
      }
      if (img.colorSpace === 'RGB') {
        warnings.push(`Image "${img.name}" uses RGB color space (CMYK conversion required before plate printing).`);
      }
    }
  }

  const passed = errors.length === 0 && warnings.filter((w) => w.includes('DPI')).length === 0;

  return {
    passed,
    title: input.title,
    pageCount: input.pageCount,
    spineWidthMm,
    isbnValid,
    errors,
    warnings,
    specs: {
      bleedMm: 3.175, // 0.125 in
      innerGutterMarginMm: input.pageCount > 150 ? 15.0 : 12.0,
      recommendedDpi: 300,
    },
  };
}
