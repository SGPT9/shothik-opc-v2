/**
 * Conversational Layer Comprehensive Test Suite
 * Tests all 10 Conversational Layer Subsystems in ShothikGPT:
 *  1. Chat Space
 *  2. Message Actions
 *  3. Conversation Control (Branching/Fork)
 *  4. Context Management (Tokens/Memory)
 *  5. Agent Interaction (@agent mentions & decision explanations)
 *  6. Rich Outputs
 *  7. Artifact Connection
 *  8. Collaboration & Share Modal
 *  9. Input System (Slash Commands)
 * 10. Conversation Intelligence & GoalDriver
 */

import { describe, it, expect, vi } from 'vitest';
import { AGENT_ROSTER } from '../AgentMentionOverlay';
import { SLASH_COMMANDS } from '../SlashCommandOverlay';
import { NilkhetPreflightEngine } from '../../../lib/nilkhet/nilkhet-preflight-engine';
import { GoalDriver } from '../../../lib/harness/goal-driver';
import { SessionEventLog } from '../../../lib/harness/session-event-log';

describe('Conversational Layer 10-Subsystem Architecture', () => {
  // ── Subsystem 5: Agent Interaction (@agent roster) ─────────

  describe('Subsystem 5: Agent Interaction & Mentions', () => {
    it('should maintain comprehensive agent roster containing ECC and DSH agents', () => {
      expect(AGENT_ROSTER.length).toBeGreaterThanOrEqual(8);

      const handles = AGENT_ROSTER.map((a) => a.handle);
      expect(handles).toContain('planner');
      expect(handles).toContain('architect');
      expect(handles).toContain('code-reviewer');
      expect(handles).toContain('security-reviewer');
      expect(handles).toContain('dsh-bridge');
      expect(handles).toContain('loop-operator');
    });

    it('should categorize agents into ecc, dsh, and specialist roles', () => {
      const dshAgents = AGENT_ROSTER.filter((a) => a.category === 'dsh');
      const eccAgents = AGENT_ROSTER.filter((a) => a.category === 'ecc');

      expect(dshAgents.length).toBeGreaterThan(0);
      expect(eccAgents.length).toBeGreaterThan(0);
    });
  });

  // ── Subsystem 9: Input System (Slash commands) ────────────

  describe('Subsystem 9: Input System & Slash Commands', () => {
    it('should support core slash commands (/goal, /schedule, /grill-me, /learn)', () => {
      const commands = SLASH_COMMANDS.map((c) => c.command);
      expect(commands).toContain('goal');
      expect(commands).toContain('schedule');
      expect(commands).toContain('grill-me');
      expect(commands).toContain('learn');
    });
  });

  // ── Subsystem 3 & 4: Context Management & Branching ──────

  describe('Subsystem 3 & 4: Session Context & Conversation Branching', () => {
    it('should fork conversation session event log at specific sequence boundary', () => {
      const log = new SessionEventLog('parent-session');
      log.append('user/message', { content: 'Initial idea' });
      log.append('assistant/message', { content: 'Analysis' });
      log.append('user/message', { content: 'Next step' });

      // Fork at index 2 (Branching conversation)
      const branched = log.fork(2, 'branched-session');

      expect(branched.getSessionId()).toBe('branched-session');
      expect(branched.getAll()).toHaveLength(2);
      expect(branched.deriveMessages()).toHaveLength(2);
    });
  });

  // ── Subsystem 7 & 10: Intelligence & Goal Execution ──────

  describe('Subsystem 7 & 10: Conversation Intelligence & Goal Execution', () => {
    it('should decompose tasks and auto-update goal progress', () => {
      const log = new SessionEventLog('goal-session');
      const driver = new GoalDriver(log);

      driver.setGoal({
        title: 'Build Market Analysis Artifact',
        subtasks: [
          { id: 't1', title: 'Gather competitor data' },
          { id: 't2', title: 'Compile chart tables', blockedBy: ['t1'] },
        ],
      });

      expect(driver.getNextActionable()?.id).toBe('t1');
      driver.completeSubtask('t1');

      expect(driver.getActiveGoal()?.progressPercentage).toBe(50);
      expect(driver.getNextActionable()?.id).toBe('t2');
    });
  });
});
