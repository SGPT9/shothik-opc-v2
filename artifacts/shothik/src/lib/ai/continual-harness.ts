/**
 * ContinualHarness — Prime Agent-Inspired Continual Self-Refining Harness & Recursive Subagent Dispatcher
 * Based on Prime Intellect Recursive Language Model (RLM) & Continual Harness (arXiv:2605.09998)
 * 
 * Features:
 *  - Evidence-backed refinement loop (/refine) for lessons and rules
 *  - Snapshot state capture and instant rollback
 *  - Programmatic recursive subagent spawning (rlmSpawn) with bounded turn & token budgets
 *  - Direct peer agent-to-agent communication mesh (no user routing required)
 *  - Persistent goal state tracking (/goal) and progress evaluation
 */

import { StudioMode } from './needle-dispatcher';

export interface HarnessLesson {
  id: string;
  mode: StudioMode;
  trigger: string;
  rule: string;
  evidence: string;
  confidence: number;
  timestamp: number;
}

export interface HarnessSnapshot {
  id: string;
  timestamp: number;
  description: string;
  lessons: HarnessLesson[];
}

export interface SubagentTask {
  id: string;
  parentId?: string;
  name: string;
  mode: StudioMode;
  objective: string;
  tokenBudget?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  createdAt: number;
  completedAt?: number;
}

export interface PeerMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  payload: any;
  timestamp: number;
}

export interface GoalSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface GoalState {
  id: string;
  title: string;
  mode: StudioMode;
  subtasks: GoalSubtask[];
  progressPercentage: number;
  createdAt: number;
  updatedAt: number;
}

export interface ContinualHarnessOptions {
  maxSnapshots?: number;
}

export class ContinualHarness {
  private lessons: HarnessLesson[] = [];
  private snapshots: HarnessSnapshot[] = [];
  private subagents: Map<string, SubagentTask> = new Map();
  private messageMesh: Map<string, PeerMessage[]> = new Map(); // toAgentId -> PeerMessage[]
  private activeGoal?: GoalState;
  private maxSnapshots: number;

  constructor(options: ContinualHarnessOptions = {}) {
    this.maxSnapshots = options.maxSnapshots ?? 20;
    this.createSnapshot('Initial baseline harness snapshot');
  }

  public getLessons(): HarnessLesson[] {
    return [...this.lessons];
  }

  public getSnapshots(): HarnessSnapshot[] {
    return [...this.snapshots];
  }

  public createSnapshot(description: string): HarnessSnapshot {
    const snap: HarnessSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      description,
      lessons: JSON.parse(JSON.stringify(this.lessons)),
    };

    this.snapshots.push(snap);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snap;
  }

  public refine(lessonInput: Omit<HarnessLesson, 'id' | 'timestamp'>): HarnessLesson {
    const lesson: HarnessLesson = {
      ...lessonInput,
      id: `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    this.lessons.push(lesson);
    this.createSnapshot(`Refined lesson: ${lesson.rule.substring(0, 40)}...`);
    return lesson;
  }

  public rollback(snapshotId: string): boolean {
    const target = this.snapshots.find((s) => s.id === snapshotId);
    if (!target) return false;

    this.lessons = JSON.parse(JSON.stringify(target.lessons));
    return true;
  }

  public rlmSpawn(config: {
    parentId?: string;
    name: string;
    mode: StudioMode;
    objective: string;
    tokenBudget?: number;
  }): SubagentTask {
    const task: SubagentTask = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      parentId: config.parentId,
      name: config.name,
      mode: config.mode,
      objective: config.objective,
      tokenBudget: config.tokenBudget ?? 8000,
      status: 'running',
      createdAt: Date.now(),
    };

    this.subagents.set(task.id, task);
    return task;
  }

  public completeSubagentTask(taskId: string, result: any): SubagentTask | undefined {
    const task = this.subagents.get(taskId);
    if (!task) return undefined;

    task.status = 'completed';
    task.result = result;
    task.completedAt = Date.now();
    return task;
  }

  public sendPeerMessage(msg: {
    fromAgentId: string;
    toAgentId: string;
    payload: any;
  }): PeerMessage {
    const message: PeerMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fromAgentId: msg.fromAgentId,
      toAgentId: msg.toAgentId,
      payload: msg.payload,
      timestamp: Date.now(),
    };

    if (!this.messageMesh.has(msg.toAgentId)) {
      this.messageMesh.set(msg.toAgentId, []);
    }
    this.messageMesh.get(msg.toAgentId)!.push(message);
    return message;
  }

  public getAgentInbox(agentId: string): PeerMessage[] {
    return this.messageMesh.get(agentId) || [];
  }

  public setGoal(goalInput: {
    title: string;
    mode: StudioMode;
    subtasks: GoalSubtask[];
  }): GoalState {
    const total = goalInput.subtasks.length;
    const completed = goalInput.subtasks.filter((t) => t.done).length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const goal: GoalState = {
      id: `goal_${Date.now()}`,
      title: goalInput.title,
      mode: goalInput.mode,
      subtasks: goalInput.subtasks,
      progressPercentage,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.activeGoal = goal;
    return goal;
  }

  public updateGoalSubtask(subtaskId: string, done: boolean): GoalState | undefined {
    if (!this.activeGoal) return undefined;

    const target = this.activeGoal.subtasks.find((t) => t.id === subtaskId);
    if (target) {
      target.done = done;
      const total = this.activeGoal.subtasks.length;
      const completed = this.activeGoal.subtasks.filter((t) => t.done).length;
      this.activeGoal.progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      this.activeGoal.updatedAt = Date.now();
    }

    return this.activeGoal;
  }

  public getActiveGoal(): GoalState | undefined {
    return this.activeGoal;
  }
}
