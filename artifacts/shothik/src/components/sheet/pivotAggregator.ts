/**
 * Shothik Pivot Table Aggregator
 * Adapted from GenOffice (Apache-2.0)
 * Computes 2D multidimensional pivot summaries (SUM, COUNT, AVG, MIN, MAX) from raw tabular records.
 */

export type AggregationFunction = 'SUM' | 'COUNT' | 'AVERAGE' | 'MIN' | 'MAX';

export interface PivotOptions {
  rowField: string;
  colField?: string;
  valField: string;
  aggFunc?: AggregationFunction;
}

export interface PivotSummary {
  rowKeys: string[];
  colKeys: string[];
  matrix: (number | null)[][];
  rowTotals: (number | null)[];
  colTotals: (number | null)[];
  grandTotal: number | null;
}

export function computePivotTable(
  rows: Record<string, any>[],
  options: PivotOptions
): PivotSummary {
  const { rowField, colField, valField, aggFunc = 'SUM' } = options;

  if (!rows || rows.length === 0) {
    return {
      rowKeys: [],
      colKeys: [],
      matrix: [],
      rowTotals: [],
      colTotals: [],
      grandTotal: null,
    };
  }

  const rowSet = new Set<string>();
  const colSet = new Set<string>();
  const buckets: Record<string, Record<string, number[]>> = {};

  rows.forEach((row) => {
    const rowVal = String(row[rowField] ?? 'Uncategorized').trim();
    const colVal = colField ? String(row[colField] ?? 'General').trim() : 'Value';
    const rawVal = row[valField];
    const num = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal || '0'));
    const cleanNum = isNaN(num) ? (aggFunc === 'COUNT' ? 1 : 0) : num;

    rowSet.add(rowVal);
    colSet.add(colVal);

    if (!buckets[rowVal]) buckets[rowVal] = {};
    if (!buckets[rowVal][colVal]) buckets[rowVal][colVal] = [];
    buckets[rowVal][colVal].push(cleanNum);
  });

  const rowKeys = Array.from(rowSet).sort();
  const colKeys = Array.from(colSet).sort();

  const aggregate = (nums: number[] | undefined): number | null => {
    if (!nums || nums.length === 0) return null;
    switch (aggFunc) {
      case 'SUM':
        return nums.reduce((a, b) => a + b, 0);
      case 'COUNT':
        return nums.length;
      case 'AVERAGE':
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      case 'MIN':
        return Math.min(...nums);
      case 'MAX':
        return Math.max(...nums);
      default:
        return nums.reduce((a, b) => a + b, 0);
    }
  };

  const matrix: (number | null)[][] = [];
  const rowTotals: (number | null)[] = [];

  rowKeys.forEach((rKey) => {
    const rowValues: (number | null)[] = [];
    const allRowNums: number[] = [];

    colKeys.forEach((cKey) => {
      const cellNums = buckets[rKey]?.[cKey];
      if (cellNums) allRowNums.push(...cellNums);
      rowValues.push(aggregate(cellNums));
    });

    matrix.push(rowValues);
    rowTotals.push(aggregate(allRowNums));
  });

  const colTotals: (number | null)[] = [];
  const allGrandNums: number[] = [];

  colKeys.forEach((cKey) => {
    const allColNums: number[] = [];
    rowKeys.forEach((rKey) => {
      const cellNums = buckets[rKey]?.[cKey];
      if (cellNums) allColNums.push(...cellNums);
    });
    allGrandNums.push(...allColNums);
    colTotals.push(aggregate(allColNums));
  });

  const grandTotal = aggregate(allGrandNums);

  return {
    rowKeys,
    colKeys,
    matrix,
    rowTotals,
    colTotals,
    grandTotal,
  };
}
