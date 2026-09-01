/**
 * Session Event Log — Durable Append-Only Event Stream
 * Adapted from DeepSeek Harness packages/session/ (session data plane)
 *
 * Key DSH principle: "Model-visible means logged."
 * Anything that reaches a model request must be reconstructable from the log.
 * The session log is the source of the context the model sees.
 */

// ── Event Types ─────────────────────────────────────────

export type SessionEventType =
  | 'turn/start'
  | 'turn/end'
  | 'step/start'
  | 'step/end'
  | 'user/message'
  | 'assistant/message'
  | 'assistant/chunk'
  | 'tool/call'
  | 'tool/result'
  | 'goal/created'
  | 'goal/subtask-completed'
  | 'goal/progress'
  | 'goal/completed'
  | 'goal/failed'
  | 'goal/paused'
  | 'goal/resumed'
  | 'plugin/mounted'
  | 'plugin/unmounted'
  | 'guard/timeout'
  | 'guard/stall'
  | 'session/forked'
  | 'session/compacted';

export interface SessionEvent {
  /** Monotonically increasing sequence number */
  readonly seq: number;
  /** Event type discriminant */
  readonly type: SessionEventType;
  /** Session ID this event belongs to */
  readonly sessionId: string;
  /** ISO 8601 timestamp */
  readonly timestamp: string;
  /** Event payload (type-specific) */
  readonly data: Record<string, unknown>;
  /** If true, consumers that don't know this event type may safely skip it */
  readonly ignorable?: boolean;
}

// ── Session Event Log ───────────────────────────────────

export class SessionEventLog {
  private events: SessionEvent[] = [];
  private nextSeq = 0;
  private readonly sessionId: string;
  private readonly listeners: Set<(event: SessionEvent) => void> = new Set();

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? crypto.randomUUID();
  }

  /**
   * Append a new event to the log.
   * Events are append-only — they can never be modified or deleted.
   * Adapted from DSH: "Session events are durable facts appended to the log."
   */
  append(type: SessionEventType, data: Record<string, unknown>, ignorable = false): SessionEvent {
    const event: SessionEvent = {
      seq: this.nextSeq++,
      type,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data,
      ignorable,
    };

    this.events.push(event);

    // Broadcast to listeners
    for (const listener of this.listeners) {
      listener(event);
    }

    return event;
  }

  /**
   * Derive model-visible messages from the event log.
   * Adapted from DSH: "deriveMessages() projects model history from it."
   */
  deriveMessages(): Array<{ role: 'user' | 'assistant' | 'tool'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }> = [];

    for (const event of this.events) {
      switch (event.type) {
        case 'user/message':
          messages.push({
            role: 'user',
            content: String(event.data['content'] ?? ''),
          });
          break;
        case 'assistant/message':
          messages.push({
            role: 'assistant',
            content: String(event.data['content'] ?? ''),
          });
          break;
        case 'tool/result':
          messages.push({
            role: 'tool',
            content: JSON.stringify(event.data['result'] ?? {}),
          });
          break;
        // Other event types are logged but not projected into model messages
      }
    }

    return messages;
  }

  /**
   * Get all events in the log.
   */
  getAll(): readonly SessionEvent[] {
    return this.events;
  }

  /**
   * Get events of a specific type.
   */
  getByType(type: SessionEventType): readonly SessionEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get events since a specific sequence number (for incremental replay).
   */
  getSince(seq: number): readonly SessionEvent[] {
    return this.events.filter((e) => e.seq >= seq);
  }

  /**
   * Get the current sequence number (for checkpointing).
   */
  getSequence(): number {
    return this.nextSeq;
  }

  /**
   * Fork the session log at a given sequence number.
   * Creates a new log containing events up to the boundary.
   * Adapted from DSH: "ctx.sessions.fork(source, boundary?, childSessionId?)"
   */
  fork(boundary?: number, childSessionId?: string): SessionEventLog {
    const child = new SessionEventLog(childSessionId);
    const cutoff = boundary ?? this.nextSeq;

    for (const event of this.events) {
      if (event.seq < cutoff) {
        child.append(event.type, event.data, event.ignorable);
      }
    }

    // Record the fork in both logs
    this.append('session/forked', {
      childSessionId: child.getSessionId(),
      boundary: cutoff,
    });

    return child;
  }

  /**
   * Compact the log by summarizing old events.
   * Keeps recent events intact and replaces older ones with a summary.
   */
  compact(keepRecent: number = 50): void {
    if (this.events.length <= keepRecent) {
      return;
    }

    const toCompact = this.events.slice(0, this.events.length - keepRecent);
    const kept = this.events.slice(this.events.length - keepRecent);

    const summary: Record<string, unknown> = {
      compactedCount: toCompact.length,
      firstSeq: toCompact[0]?.seq,
      lastSeq: toCompact[toCompact.length - 1]?.seq,
      eventTypeCounts: {} as Record<string, number>,
    };

    for (const event of toCompact) {
      const counts = summary['eventTypeCounts'] as Record<string, number>;
      counts[event.type] = (counts[event.type] ?? 0) + 1;
    }

    // Replace with compaction summary + kept events
    this.events = [
      {
        seq: 0,
        type: 'session/compacted',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        data: summary,
        ignorable: false,
      },
      ...kept,
    ];
  }

  /**
   * Subscribe to new events.
   */
  subscribe(listener: (event: SessionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Export the log as a JSONL string (for persistence).
   */
  toJSONL(): string {
    return this.events.map((e) => JSON.stringify(e)).join('\n');
  }

  /**
   * Import events from a JSONL string (for recovery).
   */
  static fromJSONL(jsonl: string, sessionId?: string): SessionEventLog {
    const log = new SessionEventLog(sessionId);
    const lines = jsonl.split('\n').filter((l) => l.trim());

    for (const line of lines) {
      const event = JSON.parse(line) as SessionEvent;
      log.events.push(event);
      log.nextSeq = Math.max(log.nextSeq, event.seq + 1);
    }

    return log;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}
