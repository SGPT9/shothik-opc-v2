/**
 * Shothik Spreadsheet Flash-Fill Engine
 * Adapted from GenOffice (Apache-2.0)
 * Infers concatenation and regex split patterns from user examples across spreadsheet rows.
 */

export type FlashFillToken =
  | { kind: 'literal'; text: string }
  | { kind: 'field'; index: number };

export type FlashFillTemplate = FlashFillToken[];

export interface FlashFillExample {
  readonly source: readonly string[];
  readonly output: string;
}

export function inferFlashFillTemplate(
  examples: readonly FlashFillExample[]
): FlashFillTemplate | null {
  const first = examples[0];
  if (!first || first.output.length === 0) return null;
  const template: FlashFillTemplate = [];
  let cursor = 0;
  let literal = '';
  const flushLiteral = (): void => {
    if (literal) {
      template.push({ kind: 'literal', text: literal });
      literal = '';
    }
  };
  while (cursor < first.output.length) {
    let matched: { index: number; length: number } | null = null;
    for (const [index, raw] of first.source.entries()) {
      const field = raw.trim();
      if (field.length < 2) continue;
      if (!first.output.startsWith(field, cursor)) continue;
      if (!matched || field.length > matched.length) matched = { index, length: field.length };
    }
    if (matched) {
      flushLiteral();
      template.push({ kind: 'field', index: matched.index });
      cursor += matched.length;
    } else {
      literal += first.output[cursor];
      cursor += 1;
    }
  }
  flushLiteral();
  if (!template.some((token) => token.kind === 'field')) return null;
  for (const example of examples) {
    if (applyFlashFillTemplate(template, example.source) !== example.output) return null;
  }
  return template;
}

export function applyFlashFillTemplate(
  template: FlashFillTemplate,
  source: readonly string[]
): string {
  return template
    .map((token) => (token.kind === 'literal' ? token.text : (source[token.index] ?? '').trim()))
    .join('');
}
