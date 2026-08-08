/**
 * stream-normalizer.ts
 *
 * Canonical client-side parser for chat SSE streams.
 *
 * Maps raw Hermes event lines (and plain-text chunks) to a typed union so
 * the UI never sees internal state names like "queued", "session", "run".
 *
 * Usage:
 *   for await (const event of normalizeSseLines(reader)) { ... }
 */

// ─── Canonical event union ────────────────────────────────────────────────────

export type TokenEvent    = { type: 'token';     text: string };
export type StatusEvent   = { type: 'status';    label: string };
export type ToolCallEvent = { type: 'tool_call'; name: string; args?: unknown };
export type ErrorEvent    = { type: 'error';     message: string; recoverable: boolean };
export type DoneEvent     = { type: 'done' };

export type StreamEvent =
  | TokenEvent
  | StatusEvent
  | ToolCallEvent
  | ErrorEvent
  | DoneEvent;

// ─── Label mapping ────────────────────────────────────────────────────────────

/** Maps any known Hermes/backend status name to a single user-friendly string. */
const STATUS_LABEL_MAP: Record<string, string> = {
  // Hermes event names
  queued:           'Thinking…',
  session:          'Thinking…',
  session_created:  'Thinking…',
  run:              'Thinking…',
  run_created:      'Thinking…',
  running:          'Thinking…',
  // Tool / search phases
  tool_start:       'Searching…',
  tool:             'Searching…',
  searching:        'Searching…',
  web_search:       'Searching…',
  // Writing / generation phases
  response:         'Writing…',
  generating:       'Writing…',
  // Terminal states
  completed:        '',
  done:             '',
  run_completed:    '',
  // Errors — not a label, handled separately
  run_failed:       '',
  error:            '',
};

function toFriendlyLabel(rawEvent: string): string {
  return STATUS_LABEL_MAP[rawEvent.toLowerCase()] ?? 'Thinking…';
}

// ─── Raw SSE line parser ──────────────────────────────────────────────────────

interface RawSseLine {
  event?: string;
  data?: string;
}

function parseSseLine(line: string): RawSseLine | null {
  if (!line || line.startsWith(':')) return null; // comment or blank
  if (line.startsWith('data: ')) {
    return { data: line.slice(6) };
  }
  if (line.startsWith('event: ')) {
    return { event: line.slice(7).trim() };
  }
  return null;
}

// ─── JSON-safe parse helper ───────────────────────────────────────────────────

function tryJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return null; }
}

// ─── Core normalizer ──────────────────────────────────────────────────────────

/**
 * Normalizes a single raw SSE block (event + data) to a canonical StreamEvent.
 * Returns `null` if the line should be silently ignored.
 */
export function normalizeRawBlock(
  eventName: string | undefined,
  dataRaw: string | undefined,
): StreamEvent | null {
  const data = dataRaw?.trim() ?? '';
  const ev   = (eventName ?? '').toLowerCase().trim();

  // ── done / terminal ───────────────────────────────────────────────────────
  if (ev === 'done' || data === '[DONE]') {
    return { type: 'done' };
  }

  // ── errors ────────────────────────────────────────────────────────────────
  if (ev === 'error' || ev === 'run_failed') {
    const parsed = tryJson(data) as { message?: string; recoverable?: boolean } | null;
    return {
      type: 'error',
      message: parsed?.message ?? 'An unexpected error occurred. You can retry.',
      recoverable: parsed?.recoverable ?? true,
    };
  }

  // ── tool calls ────────────────────────────────────────────────────────────
  if (ev === 'tool_call' || ev === 'tool_start' || ev === 'tool') {
    const parsed = tryJson(data) as { name?: string; tool?: string; args?: unknown } | null;
    const name = parsed?.name ?? parsed?.tool ?? 'tool';
    return { type: 'tool_call', name, args: parsed?.args };
  }

  // ── plain token (no event name, or explicit "token") ─────────────────────
  if (!ev || ev === 'token' || ev === 'text' || ev === 'delta') {
    // Check if data is a JSON object with a token/text/delta field
    const parsed = tryJson(data) as
      | { token?: string; text?: string; delta?: string; content?: string }
      | null;

    const text = parsed
      ? (parsed.token ?? parsed.text ?? parsed.delta ?? parsed.content ?? '')
      : data;

    if (text) return { type: 'token', text };
    return null;
  }

  // ── status events (queued / running / session / response / etc.) ──────────
  if (ev in STATUS_LABEL_MAP) {
    const label = toFriendlyLabel(ev);
    if (!label) return null; // terminal status with no label — treat as done signal
    return { type: 'status', label };
  }

  // ── unknown event with JSON data that has a text/token field ─────────────
  const parsed = tryJson(data) as { token?: string; text?: string; content?: string } | null;
  if (parsed) {
    const text = parsed.token ?? parsed.text ?? parsed.content ?? '';
    if (text) return { type: 'token', text };
  }

  // ── fallback: treat data as raw token text if non-empty ──────────────────
  if (data && data !== '[DONE]') {
    return { type: 'token', text: data };
  }

  return null;
}

// ─── Async generator over a ReadableStream<Uint8Array> ───────────────────────

/**
 * Consumes a fetch ReadableStream and yields canonical StreamEvents.
 *
 * @example
 * const res = await fetch('/api/chat', { method: 'POST', ... });
 * for await (const event of normalizeSseStream(res.body!)) {
 *   if (event.type === 'token') appendToken(event.text);
 * }
 */
export async function* normalizeSseStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const reader  = body.getReader();
  const decoder = new TextDecoder();
  let buffer    = '';
  let pendingEvent: string | undefined;

  try {
    while (true) {
      if (signal?.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep incomplete last line in buffer

      for (const line of lines) {
        const parsed = parseSseLine(line);
        if (!parsed) {
          // blank line = end of SSE block — flush pending event
          if (pendingEvent !== undefined) {
            pendingEvent = undefined;
          }
          continue;
        }

        if (parsed.event !== undefined) {
          pendingEvent = parsed.event;
          continue;
        }

        if (parsed.data !== undefined) {
          const event = normalizeRawBlock(pendingEvent, parsed.data);
          pendingEvent = undefined;
          if (event) yield event;
          if (event?.type === 'done') return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: 'done' };
}
