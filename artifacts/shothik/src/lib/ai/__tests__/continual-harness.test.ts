import { describe, it, expect } from 'vitest';
import {
  ContinualHarness,
  type HarnessLesson,
  type SubagentTask,
  type GoalState
} from '../continual-harness';

describe('ContinualHarness (Prime Agent RLM & Self-Refining Harness for Shothik)', () => {
  it('initializes with durable memory and snapshot history', () => {
    const harness = new ContinualHarness({ maxSnapshots: 10 });
    expect(harness.getLessons()).toHaveLength(0);
    expect(harness.getSnapshots()).toHaveLength(1); // Initial baseline snapshot
  });

  it('records evidence-backed lessons via /refine with automatic snapshotting', () => {
    const harness = new ContinualHarness();
    
    const lesson: Omit<HarnessLesson, 'id' | 'timestamp'> = {
      mode: 'bookwriting',
      trigger: 'User corrected passive voice in Chapter 3',
      rule: 'Always use active verbs and sensory descriptions when writing scene transitions in Dhaka noir settings.',
      evidence: 'User replaced "was walking" with "strode through the neon-soaked alley"',
      confidence: 0.95,
    };

    const recorded = harness.refine(lesson);
    expect(recorded.id).toBeDefined();
    expect(harness.getLessons()).toHaveLength(1);
    expect(harness.getSnapshots().length).toBeGreaterThan(1);
  });

  it('supports snapshot rollback if a refinement degrades performance', () => {
    const harness = new ContinualHarness();
    const baselineSnapId = harness.getSnapshots()[0].id;

    harness.refine({
      mode: 'coding',
      trigger: 'Strict linting rule',
      rule: 'Disallow any any type anywhere',
      evidence: 'Compilation error',
      confidence: 0.8,
    });

    expect(harness.getLessons()).toHaveLength(1);

    // Rollback to baseline
    const success = harness.rollback(baselineSnapId);
    expect(success).toBe(true);
    expect(harness.getLessons()).toHaveLength(0);
  });

  it('spawns recursive subagents programmatically with bounded token budgets', () => {
    const harness = new ContinualHarness();
    
    const task: SubagentTask = harness.rlmSpawn({
      parentId: 'main-author-agent',
      name: 'plot-hole-auditor',
      mode: 'bookwriting',
      objective: 'Verify timeline consistency between Chapter 1 and Chapter 2',
      tokenBudget: 4000,
    });

    expect(task.id).toBeDefined();
    expect(task.status).toBe('running');
    expect(task.tokenBudget).toBe(4000);

    // Direct subagent result completion
    const completed = harness.completeSubagentTask(task.id, {
      inconsistenciesFound: 0,
      verifiedChapters: ['ch-1', 'ch-2'],
    });

    expect(completed?.status).toBe('completed');
    expect(completed?.result).toHaveProperty('inconsistenciesFound', 0);
  });

  it('enables direct agent-to-agent peer messaging without user routing', () => {
    const harness = new ContinualHarness();
    
    const agent1 = harness.rlmSpawn({ name: 'researcher', mode: 'deepresearch', objective: 'Fetch arXiv papers' });
    const agent2 = harness.rlmSpawn({ name: 'synthesizer', mode: 'deepresearch', objective: 'Synthesize findings' });

    harness.sendPeerMessage({
      fromAgentId: agent1.id,
      toAgentId: agent2.id,
      payload: { papersFound: 5, topic: 'RLM Attention' },
    });

    const inbox = harness.getAgentInbox(agent2.id);
    expect(inbox).toHaveLength(1);
    expect(inbox[0].payload).toHaveProperty('papersFound', 5);
  });

  it('tracks persistent goals and advances progress across turns', () => {
    const harness = new ContinualHarness();
    
    const goal: GoalState = harness.setGoal({
      title: 'Complete 5-Chapter Sci-Fi Novel Draft',
      mode: 'bookwriting',
      subtasks: [
        { id: 't1', title: 'Chapter 1: The Arrival', done: true },
        { id: 't2', title: 'Chapter 2: The Singularity', done: false },
        { id: 't3', title: 'Chapter 3: The Departure', done: false },
      ],
    });

    expect(goal.progressPercentage).toBe(33);

    // Mark subtask done
    const updated = harness.updateGoalSubtask('t2', true);
    expect(updated?.progressPercentage).toBe(67);
  });
});
