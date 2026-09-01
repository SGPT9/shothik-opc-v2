/**
 * Guard — Loop Hygiene & Safety Module
 * Adapted from DeepSeek Harness packages/guard/
 *
 * Provides:
 *  - Tool-timeout enforcement (deadline enforcer)
 *  - Repeat-call detection (advisory reminders)
 *  - Loop stall intervention for autonomous Twin operations
 *  - Token budget tracking and enforcement
 */

import type { SessionEventLog } from './session-event-log';

// ── Types ───────────────────────────────────────────────

export interface GuardConfig {
  /** Maximum milliseconds a single tool call can run before timeout */
  toolTimeoutMs: number;
  /** Maximum number of identical consecutive tool calls before flagging repeat */
  maxRepeatCalls: number;
  /** Maximum milliseconds between progress events before flagging stall */
  stallTimeoutMs: number;
  /** Maximum total token budget for the session */
  tokenBudget: number;
  /** Whether to auto-pause goals on guard violations */
  autoPauseOnViolation: boolean;
}

export interface GuardViolation {
  readonly type: 'timeout' | 'repeat-call' | 'stall' | 'token-budget';
  readonly timestamp: number;
  readonly details: string;
  readonly severity: 'warning' | 'critical';
  readonly toolName?: string;
  readonly suggestion?: string;
}

export type GuardViolationListener = (violation: GuardViolation) => void;

interface ToolCallRecord {
  toolName: string;
  argsHash: string;
  timestamp: number;
}

// ── Guard ───────────────────────────────────────────────

const DEFAULT_CONFIG: GuardConfig = {
  toolTimeoutMs: 30_000,      // 30 seconds per tool call
  maxRepeatCalls: 3,           // Flag after 3 identical consecutive calls
  stallTimeoutMs: 120_000,     // 2 minutes without progress = stall
  tokenBudget: 500_000,       // 500K tokens per session
  autoPauseOnViolation: true,
};

export class Guard {
  private readonly config: GuardConfig;
  private readonly eventLog: SessionEventLog | null;
  private readonly listeners: Set<GuardViolationListener> = new Set();

  private recentToolCalls: ToolCallRecord[] = [];
  private tokensUsed = 0;
  private lastProgressAt: number = Date.now();
  private activeTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(config?: Partial<GuardConfig>, eventLog?: SessionEventLog) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventLog = eventLog ?? null;
  }

  /**
   * Start a tool-timeout timer for a tool call.
   * Returns a cleanup function to call when the tool completes.
   */
  startToolTimer(toolName: string, callId: string): () => void {
    const timer = setTimeout(() => {
      this.reportViolation({
        type: 'timeout',
        timestamp: Date.now(),
        details: `Tool "${toolName}" exceeded timeout of ${this.config.toolTimeoutMs}ms`,
        severity: 'critical',
        toolName,
        suggestion: `Consider breaking this operation into smaller steps or increasing toolTimeoutMs`,
      });
      this.activeTimers.delete(callId);
    }, this.config.toolTimeoutMs);

    this.activeTimers.set(callId, timer);

    return () => {
      clearTimeout(timer);
      this.activeTimers.delete(callId);
    };
  }

  /**
   * Record a tool call and check for repeat-call patterns.
   */
  recordToolCall(toolName: string, args: Record<string, unknown>): void {
    const argsHash = this.hashArgs(args);
    const record: ToolCallRecord = { toolName, argsHash, timestamp: Date.now() };

    this.recentToolCalls.push(record);

    // Keep only last N*2 calls for analysis
    const maxHistory = this.config.maxRepeatCalls * 2;
    if (this.recentToolCalls.length > maxHistory) {
      this.recentToolCalls = this.recentToolCalls.slice(-maxHistory);
    }

    // Check for consecutive identical calls
    const consecutiveCount = this.countConsecutiveIdentical(toolName, argsHash);
    if (consecutiveCount >= this.config.maxRepeatCalls) {
      this.reportViolation({
        type: 'repeat-call',
        timestamp: Date.now(),
        details: `Tool "${toolName}" called ${consecutiveCount} times consecutively with identical arguments`,
        severity: 'warning',
        toolName,
        suggestion: `The agent may be stuck in a loop. Consider a different approach or breaking the task down.`,
      });
    }

    // Update last progress timestamp
    this.lastProgressAt = Date.now();
  }

  /**
   * Record token usage and check against budget.
   */
  recordTokenUsage(tokens: number): void {
    this.tokensUsed += tokens;

    if (this.tokensUsed >= this.config.tokenBudget) {
      this.reportViolation({
        type: 'token-budget',
        timestamp: Date.now(),
        details: `Token budget exceeded: ${this.tokensUsed} / ${this.config.tokenBudget}`,
        severity: 'critical',
        suggestion: `Session has consumed its token budget. Consider compacting the session log or starting a new session.`,
      });
    } else if (this.tokensUsed >= this.config.tokenBudget * 0.8) {
      this.reportViolation({
        type: 'token-budget',
        timestamp: Date.now(),
        details: `Token budget at 80%: ${this.tokensUsed} / ${this.config.tokenBudget}`,
        severity: 'warning',
        suggestion: `Consider compacting the session log to free up token budget.`,
      });
    }
  }

  /**
   * Check for stall condition (no progress within stallTimeoutMs).
   */
  checkStall(): boolean {
    const elapsed = Date.now() - this.lastProgressAt;
    if (elapsed >= this.config.stallTimeoutMs) {
      this.reportViolation({
        type: 'stall',
        timestamp: Date.now(),
        details: `No progress for ${Math.round(elapsed / 1000)}s (threshold: ${this.config.stallTimeoutMs / 1000}s)`,
        severity: 'critical',
        suggestion: `The agent appears stalled. Consider intervening or restarting the task.`,
      });
      return true;
    }
    return false;
  }

  /**
   * Get current guard status.
   */
  getStatus(): {
    tokensUsed: number;
    tokenBudget: number;
    tokenPercentage: number;
    activeTimers: number;
    lastProgressSecondsAgo: number;
    recentCallCount: number;
  } {
    return {
      tokensUsed: this.tokensUsed,
      tokenBudget: this.config.tokenBudget,
      tokenPercentage: Math.round((this.tokensUsed / this.config.tokenBudget) * 100),
      activeTimers: this.activeTimers.size,
      lastProgressSecondsAgo: Math.round((Date.now() - this.lastProgressAt) / 1000),
      recentCallCount: this.recentToolCalls.length,
    };
  }

  /**
   * Subscribe to guard violations.
   */
  onViolation(listener: GuardViolationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reset guard state (for new sessions or after intervention).
   */
  reset(): void {
    this.recentToolCalls = [];
    this.tokensUsed = 0;
    this.lastProgressAt = Date.now();

    for (const timer of this.activeTimers.values()) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }

  /**
   * Clean up all timers (for shutdown).
   */
  dispose(): void {
    for (const timer of this.activeTimers.values()) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
    this.listeners.clear();
  }

  private reportViolation(violation: GuardViolation): void {
    // Log to session event log
    this.eventLog?.append(
      violation.type === 'timeout' ? 'guard/timeout' : 'guard/stall',
      {
        violationType: violation.type,
        details: violation.details,
        severity: violation.severity,
        toolName: violation.toolName,
        suggestion: violation.suggestion,
      }
    );

    // Notify listeners
    for (const listener of this.listeners) {
      listener(violation);
    }
  }

  private countConsecutiveIdentical(toolName: string, argsHash: string): number {
    let count = 0;
    for (let i = this.recentToolCalls.length - 1; i >= 0; i--) {
      const call = this.recentToolCalls[i];
      if (call.toolName === toolName && call.argsHash === argsHash) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private hashArgs(args: Record<string, unknown>): string {
    try {
      return JSON.stringify(args, Object.keys(args).sort());
    } catch {
      return 'unhashable';
    }
  }
}
