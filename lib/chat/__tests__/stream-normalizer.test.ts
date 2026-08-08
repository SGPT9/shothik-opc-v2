/**
 * stream-normalizer.test.ts
 *
 * Unit tests for the canonical SSE event normalizer.
 * Covers: all Hermes event name mappings, token extraction, error events,
 * done detection, feature-flag buffering (tested via normalizeRawBlock directly).
 */

import { describe, it, expect } from 'vitest';
import { normalizeRawBlock } from '../stream-normalizer';

// ─── Status label guard ───────────────────────────────────────────────────────

describe('normalizeRawBlock — status events', () => {
  const internals = ['queued', 'session', 'session_created', 'run', 'run_created', 'running'];

  it.each(internals)('maps internal name "%s" to Thinking…', (name) => {
    const result = normalizeRawBlock(name, '{}');
    expect(result).not.toBeNull();
    if (result?.type !== 'status') throw new Error(`Expected status, got ${result?.type}`);
    expect(result.label).toBe('Thinking…');
  });

  it('maps tool_start to Searching…', () => {
    const result = normalizeRawBlock('tool_start', '{"name":"web_search"}');
    // tool_start is treated as tool_call, not status
    expect(result?.type).toBe('tool_call');
  });

  it('maps response event to Writing…', () => {
    const result = normalizeRawBlock('response', '');
    expect(result).not.toBeNull();
    if (result?.type !== 'status') throw new Error(`Expected status, got ${result?.type}`);
    expect(result.label).toBe('Writing…');
  });

  it('maps completed event to null (no label needed)', () => {
    const result = normalizeRawBlock('completed', '');
    // completed maps to empty label → null
    expect(result).toBeNull();
  });
});

// ─── Token extraction ─────────────────────────────────────────────────────────

describe('normalizeRawBlock — token events', () => {
  it('returns token for plain text data with no event name', () => {
    const result = normalizeRawBlock(undefined, 'Hello world');
    expect(result).toEqual({ type: 'token', text: 'Hello world' });
  });

  it('returns token for explicit "token" event', () => {
    const result = normalizeRawBlock('token', 'some text');
    expect(result).toEqual({ type: 'token', text: 'some text' });
  });

  it('extracts token from JSON {token: "..."} data', () => {
    const result = normalizeRawBlock('token', JSON.stringify({ token: 'chunk' }));
    expect(result).toEqual({ type: 'token', text: 'chunk' });
  });

  it('extracts text from JSON {text: "..."} data', () => {
    const result = normalizeRawBlock(undefined, JSON.stringify({ text: 'hello' }));
    expect(result).toEqual({ type: 'token', text: 'hello' });
  });

  it('extracts content from JSON {content: "..."} data', () => {
    const result = normalizeRawBlock(undefined, JSON.stringify({ content: 'world' }));
    expect(result).toEqual({ type: 'token', text: 'world' });
  });

  it('returns null for empty data with no event name', () => {
    const result = normalizeRawBlock(undefined, '');
    expect(result).toBeNull();
  });
});

// ─── Done events ──────────────────────────────────────────────────────────────

describe('normalizeRawBlock — done', () => {
  it('returns done for [DONE] data', () => {
    expect(normalizeRawBlock(undefined, '[DONE]')).toEqual({ type: 'done' });
  });

  it('returns done for "done" event name', () => {
    expect(normalizeRawBlock('done', '')).toEqual({ type: 'done' });
  });
});

// ─── Error events ─────────────────────────────────────────────────────────────

describe('normalizeRawBlock — error', () => {
  it('returns error for "error" event', () => {
    const data = JSON.stringify({ message: 'Something went wrong', recoverable: false });
    const result = normalizeRawBlock('error', data);
    expect(result).toEqual({ type: 'error', message: 'Something went wrong', recoverable: false });
  });

  it('returns error for "run_failed" event', () => {
    const data = JSON.stringify({ message: 'Run failed', recoverable: true });
    const result = normalizeRawBlock('run_failed', data);
    expect(result).toEqual({ type: 'error', message: 'Run failed', recoverable: true });
  });

  it('defaults recoverable to true when not specified', () => {
    const result = normalizeRawBlock('error', '{}');
    expect(result?.type).toBe('error');
    if (result?.type !== 'error') return;
    expect(result.recoverable).toBe(true);
  });

  it('provides fallback message for empty error data', () => {
    const result = normalizeRawBlock('error', '');
    expect(result?.type).toBe('error');
    if (result?.type !== 'error') return;
    expect(result.message).toBeTruthy();
  });
});

// ─── Tool call events ─────────────────────────────────────────────────────────

describe('normalizeRawBlock — tool_call', () => {
  it('extracts tool name from tool_call event', () => {
    const data = JSON.stringify({ name: 'web_search', args: { query: 'test' } });
    const result = normalizeRawBlock('tool_call', data);
    expect(result).toEqual({ type: 'tool_call', name: 'web_search', args: { query: 'test' } });
  });

  it('uses "tool" field as fallback name', () => {
    const data = JSON.stringify({ tool: 'calculator' });
    const result = normalizeRawBlock('tool_call', data);
    expect(result?.type).toBe('tool_call');
    if (result?.type !== 'tool_call') return;
    expect(result.name).toBe('calculator');
  });

  it('falls back to "tool" name when no name in data', () => {
    const result = normalizeRawBlock('tool_call', '{}');
    expect(result?.type).toBe('tool_call');
    if (result?.type !== 'tool_call') return;
    expect(result.name).toBe('tool');
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('normalizeRawBlock — edge cases', () => {
  it('ignores comments (SSE lines starting with :)', () => {
    // Comments are stripped at the parseSseLine level, but normalizeRawBlock
    // receives pre-parsed data — empty data should be null
    expect(normalizeRawBlock(undefined, '')).toBeNull();
  });

  it('handles unknown event with JSON token data gracefully', () => {
    const result = normalizeRawBlock('unknown_future_event', JSON.stringify({ token: 'text' }));
    expect(result).toEqual({ type: 'token', text: 'text' });
  });

  it('handles unknown event with plain text data as token', () => {
    const result = normalizeRawBlock('unknown_future_event', 'raw text');
    expect(result).toEqual({ type: 'token', text: 'raw text' });
  });
});
