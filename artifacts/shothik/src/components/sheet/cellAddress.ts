/**
 * Shothik Cell Address & Coordinate Math
 * Adapted from GenOffice (Apache-2.0)
 * Translates between Excel A1 notations and 0-indexed row/column coordinates.
 */

export interface CellCoordinates {
  readonly row: number;
  readonly column: number;
}

export interface RangeBounds {
  readonly startRow: number;
  readonly startColumn: number;
  readonly endRow: number;
  readonly endColumn: number;
}

export function parseAddress(address: string): CellCoordinates {
  const match = /^([A-Z]+)([1-9][0-9]*)$/.exec(address.trim().toUpperCase());
  if (!match?.[1] || !match[2]) throw new Error(`Invalid cell address: ${address}`);
  let column = 0;
  for (const character of match[1]) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return { row: Number(match[2]) - 1, column: column - 1 };
}

export function columnLabel(column: number): string {
  let label = '';
  let remaining = column + 1;
  while (remaining > 0) {
    remaining -= 1;
    label = String.fromCharCode(65 + (remaining % 26)) + label;
    remaining = Math.floor(remaining / 26);
  }
  return label;
}

export function formatAddress(row: number, column: number): string {
  return `${columnLabel(column)}${row + 1}`;
}

export function columnIndex(label: string): number {
  const upper = label.trim().toUpperCase();
  if (!/^[A-Z]+$/.test(upper)) throw new Error(`Invalid column label: ${label}`);
  let column = 0;
  for (const character of upper) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return column - 1;
}

export function parseRange(range: string): RangeBounds {
  const parts = range.split(':');
  if (parts.length > 2 || !parts[0]) throw new Error(`Invalid range: ${range}`);
  const first = parseAddress(parts[0]);
  const second = parts[1] ? parseAddress(parts[1]) : first;
  return {
    startRow: Math.min(first.row, second.row),
    startColumn: Math.min(first.column, second.column),
    endRow: Math.max(first.row, second.row),
    endColumn: Math.max(first.column, second.column),
  };
}

export function rangeCellCount(bounds: RangeBounds): number {
  return (bounds.endRow - bounds.startRow + 1) * (bounds.endColumn - bounds.startColumn + 1);
}

export function rangeAddresses(bounds: RangeBounds): string[] {
  const addresses: string[] = [];
  for (let row = bounds.startRow; row <= bounds.endRow; row += 1) {
    for (let column = bounds.startColumn; column <= bounds.endColumn; column += 1) {
      addresses.push(formatAddress(row, column));
    }
  }
  return addresses;
}
