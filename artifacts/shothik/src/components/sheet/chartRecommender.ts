/**
 * Shothik Chart Recommender Engine
 * Adapted from GenOffice (Apache-2.0)
 * Analyzes tabular data structures (time series, categorical comparisons, proportions)
 * and recommends the optimal chart presentation (Bar, Line, Area, Pie, Scatter).
 */

export type RecommendedKind =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'scatter';

export type RecommendReason =
  | 'time'
  | 'proportion'
  | 'comparison'
  | 'manyPoints';

export interface ChartRecommendation {
  kind: RecommendedKind;
  reason: RecommendReason;
  label: string;
  description: string;
}

const TIME_KEYWORDS = new Set([
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'january', 'february', 'march', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
  'q1', 'q2', 'q3', 'q4', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028',
  'month', 'year', 'date', 'quarter', 'day', 'week'
]);

export function analyzeAndRecommendCharts(
  headers: string[],
  rows: Record<string, any>[]
): ChartRecommendation[] {
  if (!rows || rows.length === 0 || !headers || headers.length === 0) {
    return [];
  }

  const recommendations: ChartRecommendation[] = [];
  const numRows = rows.length;

  // Detect time-series indicators
  const isTimeHeader = headers.some(h => TIME_KEYWORDS.has(h.toLowerCase().trim()));
  const firstColValues = rows.slice(0, 10).map(r => String(r[headers[0]] || '').toLowerCase().trim());
  const isTimeRows = firstColValues.some(val => TIME_KEYWORDS.has(val) || !isNaN(Date.parse(val)));

  if (isTimeHeader || isTimeRows) {
    recommendations.push({
      kind: 'line',
      reason: 'time',
      label: 'Trend Timeline (Line)',
      description: 'Optimal for showing trends and performance metrics across continuous time intervals.'
    });
    recommendations.push({
      kind: 'area',
      reason: 'time',
      label: 'Volume Flow (Area)',
      description: 'Displays cumulative totals and magnitude of change over time.'
    });
  }

  // Comparison recommendation
  if (numRows <= 20) {
    recommendations.push({
      kind: 'bar',
      reason: 'comparison',
      label: 'Comparative Columns (Bar)',
      description: 'Best for comparing distinct categories, product SKUs, or customer segments.'
    });
  }

  // Proportion recommendation (if few rows and positive metrics)
  if (numRows >= 2 && numRows <= 8) {
    recommendations.push({
      kind: 'pie',
      reason: 'proportion',
      label: 'Market Share / Distribution (Pie)',
      description: 'Ideal for displaying parts of a whole (e.g. channel split, cost breakdowns).'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      kind: 'bar',
      reason: 'comparison',
      label: 'Standard Bar Chart',
      description: 'General comparison across data points.'
    });
  }

  return recommendations;
}
