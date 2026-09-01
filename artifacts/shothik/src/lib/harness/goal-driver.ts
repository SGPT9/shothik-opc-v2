/**
 * Goal Driver — Structured Goal Decomposition & Automatic Continuation
 * Adapted from DeepSeek Harness packages/goal/ (same-session goal persistence)
 *
 * Provides structured GoalState with subtask decomposition, progress tracking,
 * dependency management (blockedBy), and automatic continuation logic.
 * Powers the Tonight Engine overnight batch processing.
 */

import type { SessionEventLog } from './session-event-log';

// ── Types ───────────────────────────────────────────────

export interface GoalSubtask {
  readonly id: string;
  readonly title: string;
  done: boolean;
  evidence?: string;
  blockedBy?: readonly string[];
}

export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused';

export interface GoalState {
  readonly id: string;
  readonly title: string;
  subtasks: GoalSubtask[];
  progressPercentage: number;
  status: GoalStatus;
  readonly createdAt: number;
  updatedAt: number;
}

export interface GoalInput {
  readonly title: string;
  readonly subtasks: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly done?: boolean;
    readonly blockedBy?: readonly string[];
  }>;
}

// ── Goal Driver ─────────────────────────────────────────

export class GoalDriver {
  private activeGoal: GoalState | null = null;
  private readonly eventLog: SessionEventLog | null;

  constructor(eventLog?: SessionEventLog) {
    this.eventLog = eventLog ?? null;
  }

  /**
   * Set a new goal with subtask decomposition.
   * Validates subtask IDs and blockedBy references.
   */
  setGoal(input: GoalInput): GoalState {
    const subtaskIds = new Set(input.subtasks.map((s) => s.id));

    // Validate blockedBy references
    for (const subtask of input.subtasks) {
      if (subtask.blockedBy) {
        for (const dep of subtask.blockedBy) {
          if (!subtaskIds.has(dep)) {
            throw new Error(
              `Subtask "${subtask.id}" has blockedBy reference to unknown subtask "${dep}"`
            );
          }
          if (dep === subtask.id) {
            throw new Error(`Subtask "${subtask.id}" cannot block itself`);
          }
        }
      }
    }

    const goal: GoalState = {
      id: crypto.randomUUID(),
      title: input.title,
      subtasks: input.subtasks.map((s) => ({
        id: s.id,
        title: s.title,
        done: s.done ?? false,
        blockedBy: s.blockedBy,
      })),
      progressPercentage: 0,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Compute initial progress (some subtasks might be pre-marked done)
    goal.progressPercentage = this.computeProgress(goal.subtasks);

    this.activeGoal = goal;

    this.eventLog?.append('goal/created', {
      goalId: goal.id,
      title: goal.title,
      subtaskCount: goal.subtasks.length,
    });

    return goal;
  }

  /**
   * Mark a subtask as completed with evidence.
   * Returns the updated GoalState or null if no active goal.
   */
  completeSubtask(subtaskId: string, evidence?: string): GoalState | null {
    if (!this.activeGoal) return null;

    const subtask = this.activeGoal.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) {
      throw new Error(`Subtask not found: ${subtaskId}`);
    }
    if (subtask.done) {
      return this.activeGoal; // Already done, idempotent
    }

    // Check if blocked
    if (this.isBlocked(subtaskId)) {
      const blockers = subtask.blockedBy?.filter(
        (dep) => !this.activeGoal!.subtasks.find((s) => s.id === dep)?.done
      );
      throw new Error(
        `Subtask "${subtaskId}" is blocked by incomplete subtasks: ${blockers?.join(', ')}`
      );
    }

    subtask.done = true;
    subtask.evidence = evidence;
    this.activeGoal.updatedAt = Date.now();
    this.activeGoal.progressPercentage = this.computeProgress(this.activeGoal.subtasks);

    this.eventLog?.append('goal/subtask-completed', {
      goalId: this.activeGoal.id,
      subtaskId,
      evidence,
      progress: this.activeGoal.progressPercentage,
    });

    // Check if all subtasks are done
    if (this.activeGoal.progressPercentage === 100) {
      this.activeGoal.status = 'completed';
      this.eventLog?.append('goal/completed', {
        goalId: this.activeGoal.id,
        title: this.activeGoal.title,
      });
    } else {
      this.eventLog?.append('goal/progress', {
        goalId: this.activeGoal.id,
        progress: this.activeGoal.progressPercentage,
      });
    }

    return this.activeGoal;
  }

  /**
   * Check if a subtask is blocked by incomplete dependencies.
   */
  isBlocked(subtaskId: string): boolean {
    if (!this.activeGoal) return false;
    const subtask = this.activeGoal.subtasks.find((s) => s.id === subtaskId);
    if (!subtask?.blockedBy?.length) return false;

    return subtask.blockedBy.some(
      (depId) => !this.activeGoal!.subtasks.find((s) => s.id === depId)?.done
    );
  }

  /**
   * Get the next actionable subtask (not done, not blocked).
   * Returns null if no actionable subtask exists.
   */
  getNextActionable(): GoalSubtask | null {
    if (!this.activeGoal) return null;
    return (
      this.activeGoal.subtasks.find((s) => !s.done && !this.isBlocked(s.id)) ?? null
    );
  }

  /**
   * Pause the active goal (guard intervention, user cancel, etc.).
   */
  pause(reason: string): GoalState | null {
    if (!this.activeGoal || this.activeGoal.status !== 'active') return null;

    this.activeGoal.status = 'paused';
    this.activeGoal.updatedAt = Date.now();

    this.eventLog?.append('goal/paused', {
      goalId: this.activeGoal.id,
      reason,
      progress: this.activeGoal.progressPercentage,
    });

    return this.activeGoal;
  }

  /**
   * Resume a paused goal.
   */
  resume(): GoalState | null {
    if (!this.activeGoal || this.activeGoal.status !== 'paused') return null;

    this.activeGoal.status = 'active';
    this.activeGoal.updatedAt = Date.now();

    this.eventLog?.append('goal/resumed', {
      goalId: this.activeGoal.id,
      progress: this.activeGoal.progressPercentage,
    });

    return this.activeGoal;
  }

  /**
   * Fail the active goal.
   */
  fail(reason: string): GoalState | null {
    if (!this.activeGoal) return null;

    this.activeGoal.status = 'failed';
    this.activeGoal.updatedAt = Date.now();

    this.eventLog?.append('goal/failed', {
      goalId: this.activeGoal.id,
      reason,
      progress: this.activeGoal.progressPercentage,
    });

    return this.activeGoal;
  }

  /**
   * Get the current active goal.
   */
  getActiveGoal(): GoalState | null {
    return this.activeGoal;
  }

  /**
   * Should the goal driver continue? Returns true if there's work to do.
   */
  shouldContinue(): boolean {
    if (!this.activeGoal) return false;
    if (this.activeGoal.status !== 'active') return false;
    return this.getNextActionable() !== null;
  }

  private computeProgress(subtasks: readonly GoalSubtask[]): number {
    if (subtasks.length === 0) return 100;
    const done = subtasks.filter((s) => s.done).length;
    return Math.round((done / subtasks.length) * 100);
  }
}
