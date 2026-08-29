/**
 * Shothik Formula Reference Shifter
 * Adapted from GenOffice (Apache-2.0)
 * Rewrites A1 relative references and ranges in formulas when shifting rows or columns.
 */

import { columnIndex, columnLabel } from './cellAddress';

export interface ShiftSpec {
  readonly axis: 'row' | 'column';
  readonly start: number;
  readonly delta: number;
}

export function shiftIndex(index: number, spec: ShiftSpec): number | null {
  if (index < spec.start) return index;
  if (spec.delta > 0) return index + spec.delta;
  if (index < spec.start - spec.delta) return null;
  return index + spec.delta;
}

interface RefPart {
  readonly colAbs: string;
  readonly col: number;
  readonly rowAbs: string;
  readonly row: number;
}

function formatRef(part: RefPart): string {
  return `${part.colAbs}${columnLabel(part.col)}${part.rowAbs}${part.row + 1}`;
}

function shiftRefPart(part: RefPart, spec: ShiftSpec): RefPart | null {
  const value = spec.axis === 'row' ? part.row : part.col;
  const shifted = shiftIndex(value, spec);
  if (shifted === null) return null;
  return spec.axis === 'row' ? { ...part, row: shifted } : { ...part, col: shifted };
}

const REF_RE =
  /(?<![A-Za-z0-9_.$!])(?:(?:'([^']+)'|([A-Za-z0-9_.]+))!)?(\$?)([A-Z]{1,3})(\$?)([0-9]{1,7})(?::(\$?)([A-Z]{1,3})(\$?)([0-9]{1,7}))?(?![A-Za-z0-9(])/g;

export interface FormulaShiftResult {
  readonly formula: string;
  readonly changed: boolean;
  readonly hasRefError: boolean;
}

/**
 * Shifts formula references by given row/column delta (useful for drag-to-fill / copy-paste)
 */
export function offsetFormula(
  formula: string,
  rowDelta: number,
  columnDelta: number
): FormulaShiftResult {
  if (!formula.startsWith('=')) return { formula, changed: false, hasRefError: false };

  let changed = false;
  let hasRefError = false;

  const rewritten = formula.replace(
    REF_RE,
    (
      fullMatch,
      _singleQuotedSheet,
      _bareSheet,
      col1Abs,
      col1,
      row1Abs,
      row1,
      col2Abs,
      col2,
      row2Abs,
      row2
    ) => {
      const part1: RefPart = {
        colAbs: col1Abs,
        col: columnIndex(col1),
        rowAbs: row1Abs,
        row: Number(row1) - 1,
      };

      const newRow1 = part1.rowAbs === '$' ? part1.row : part1.row + rowDelta;
      const newCol1 = part1.colAbs === '$' ? part1.col : part1.col + columnDelta;

      if (newRow1 < 0 || newCol1 < 0) {
        hasRefError = true;
        changed = true;
        return '#REF!';
      }

      const shifted1 = formatRef({ ...part1, row: newRow1, col: newCol1 });

      if (col2 && row2) {
        const part2: RefPart = {
          colAbs: col2Abs || '',
          col: columnIndex(col2),
          rowAbs: row2Abs || '',
          row: Number(row2) - 1,
        };
        const newRow2 = part2.rowAbs === '$' ? part2.row : part2.row + rowDelta;
        const newCol2 = part2.colAbs === '$' ? part2.col : part2.col + columnDelta;

        if (newRow2 < 0 || newCol2 < 0) {
          hasRefError = true;
          changed = true;
          return '#REF!';
        }

        const shifted2 = formatRef({ ...part2, row: newRow2, col: newCol2 });
        const result = `${shifted1}:${shifted2}`;
        if (result !== fullMatch) changed = true;
        return result;
      }

      if (shifted1 !== fullMatch) changed = true;
      return shifted1;
    }
  );

  return { formula: rewritten, changed, hasRefError };
}
