/**
 * Harness Integration Tests
 * Tests for all DSH-adapted harness modules:
 *  - PluginRegistry
 *  - SessionEventLog
 *  - GoalDriver
 *  - CapabilitySeamRegistry
 *  - Guard
 *  - HookBridge (Phase 3)
 *  - SkillProviderRegistry (Phase 3)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PluginRegistry, type PluginDescriptor } from '../plugin-registry';
import { SessionEventLog } from '../session-event-log';
import { GoalDriver } from '../goal-driver';
import { CapabilitySeamRegistry, type ServiceDefinition, type ServiceProvider } from '../capability-seam';
import { Guard } from '../guard';
import { HookBridge, type HookEvent, type HookHandler } from '../hook-bridge';
import { SkillProviderRegistry, type SkillDescriptor, type SkillProviderPlugin } from '../skill-provider-registry';

// ── Plugin Registry Tests ───────────────────────────────

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  const createDescriptor = (overrides?: Partial<PluginDescriptor>): PluginDescriptor => ({
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    category: 'agent',
    provides: ['chat'],
    requires: [],
    lifecycle: {},
    ...overrides,
  });

  it('should register a plugin and return a registration', () => {
    const reg = registry.register(createDescriptor());
    expect(reg.descriptor.id).toBe('test-plugin');
    expect(reg.status).toBe('registered');
    expect(typeof reg.dispose).toBe('function');
  });

  it('should reject duplicate plugin registrations', () => {
    registry.register(createDescriptor());
    expect(() => registry.register(createDescriptor())).toThrow('Plugin already registered');
  });

  it('should mount and unmount plugins with lifecycle hooks', async () => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();

    registry.register(
      createDescriptor({
        lifecycle: { onMount, onUnmount },
      })
    );

    await registry.mount('test-plugin');
    expect(onMount).toHaveBeenCalledOnce();

    await registry.unmount('test-plugin');
    expect(onUnmount).toHaveBeenCalledOnce();
  });

  it('should track capability providers', async () => {
    registry.register(createDescriptor({ provides: ['llm'] }));
    await registry.mount('test-plugin');

    expect(registry.hasCapability('llm')).toBe(true);
    expect(registry.hasCapability('nonexistent')).toBe(false);
  });

  it('should reject plugins with missing required capabilities', () => {
    expect(() =>
      registry.register(createDescriptor({ requires: ['llm'] }))
    ).toThrow('requires capability "llm"');
  });

  it('should emit plugin events', () => {
    const listener = vi.fn();
    registry.on('plugin:registered', listener);

    registry.register(createDescriptor());
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'plugin:registered', pluginId: 'test-plugin' })
    );
  });

  it('should filter plugins by category', () => {
    registry.register(createDescriptor({ id: 'agent-1', category: 'agent' }));
    registry.register(createDescriptor({ id: 'tool-1', category: 'tool', provides: [] }));
    registry.register(createDescriptor({ id: 'guard-1', category: 'guard', provides: [] }));

    expect(registry.getByCategory('agent')).toHaveLength(1);
    expect(registry.getByCategory('tool')).toHaveLength(1);
    expect(registry.getByCategory('guard')).toHaveLength(1);
  });
});

// ── Session Event Log Tests ─────────────────────────────

describe('SessionEventLog', () => {
  let log: SessionEventLog;

  beforeEach(() => {
    log = new SessionEventLog('test-session');
  });

  it('should append events with monotonic sequence numbers', () => {
    log.append('user/message', { content: 'Hello' });
    log.append('assistant/message', { content: 'Hi' });

    const events = log.getAll();
    expect(events).toHaveLength(2);
    expect(events[0].seq).toBe(0);
    expect(events[1].seq).toBe(1);
  });

  it('should derive model-visible messages', () => {
    log.append('turn/start', {});
    log.append('user/message', { content: 'What is AI?' });
    log.append('assistant/message', { content: 'AI is...' });
    log.append('turn/end', {});

    const messages = log.deriveMessages();
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ role: 'user', content: 'What is AI?' });
    expect(messages[1]).toEqual({ role: 'assistant', content: 'AI is...' });
  });

  it('should filter events by type', () => {
    log.append('user/message', { content: 'Hello' });
    log.append('tool/call', { name: 'search' });
    log.append('user/message', { content: 'More' });

    expect(log.getByType('user/message')).toHaveLength(2);
    expect(log.getByType('tool/call')).toHaveLength(1);
  });

  it('should fork the log at a boundary', () => {
    log.append('user/message', { content: 'First' });
    log.append('assistant/message', { content: 'Response' });
    log.append('user/message', { content: 'Second' });

    const child = log.fork(2, 'child-session');
    expect(child.getAll()).toHaveLength(2);
    expect(child.getSessionId()).toBe('child-session');
  });

  it('should compact old events', () => {
    for (let i = 0; i < 100; i++) {
      log.append('user/message', { content: `Message ${i}` });
    }

    log.compact(10);
    const events = log.getAll();
    // 1 compaction summary + 10 recent
    expect(events).toHaveLength(11);
    expect(events[0].type).toBe('session/compacted');
  });

  it('should export and import JSONL', () => {
    log.append('user/message', { content: 'Hello' });
    log.append('assistant/message', { content: 'World' });

    const jsonl = log.toJSONL();
    const restored = SessionEventLog.fromJSONL(jsonl, 'restored-session');

    expect(restored.getAll()).toHaveLength(2);
    expect(restored.deriveMessages()).toEqual(log.deriveMessages());
  });

  it('should notify subscribers of new events', () => {
    const listener = vi.fn();
    log.subscribe(listener);

    log.append('user/message', { content: 'Test' });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user/message' })
    );
  });
});

// ── Goal Driver Tests ───────────────────────────────────

describe('GoalDriver', () => {
  let driver: GoalDriver;
  let eventLog: SessionEventLog;

  beforeEach(() => {
    eventLog = new SessionEventLog('goal-test-session');
    driver = new GoalDriver(eventLog);
  });

  it('should create a goal with subtasks', () => {
    const goal = driver.setGoal({
      title: 'Process invoices',
      subtasks: [
        { id: 't1', title: 'Fetch data' },
        { id: 't2', title: 'Validate data', blockedBy: ['t1'] },
        { id: 't3', title: 'Generate report', blockedBy: ['t2'] },
      ],
    });

    expect(goal.title).toBe('Process invoices');
    expect(goal.subtasks).toHaveLength(3);
    expect(goal.progressPercentage).toBe(0);
    expect(goal.status).toBe('active');
  });

  it('should reject invalid blockedBy references', () => {
    expect(() =>
      driver.setGoal({
        title: 'Bad goal',
        subtasks: [{ id: 't1', title: 'Task', blockedBy: ['nonexistent'] }],
      })
    ).toThrow('unknown subtask "nonexistent"');
  });

  it('should reject self-blocking subtasks', () => {
    expect(() =>
      driver.setGoal({
        title: 'Bad goal',
        subtasks: [{ id: 't1', title: 'Task', blockedBy: ['t1'] }],
      })
    ).toThrow('cannot block itself');
  });

  it('should complete subtasks and track progress', () => {
    driver.setGoal({
      title: 'Two tasks',
      subtasks: [
        { id: 't1', title: 'First' },
        { id: 't2', title: 'Second' },
      ],
    });

    const after = driver.completeSubtask('t1', 'Done via API');
    expect(after!.progressPercentage).toBe(50);
    expect(after!.subtasks[0].done).toBe(true);
    expect(after!.subtasks[0].evidence).toBe('Done via API');
  });

  it('should prevent completing blocked subtasks', () => {
    driver.setGoal({
      title: 'Blocked',
      subtasks: [
        { id: 't1', title: 'First' },
        { id: 't2', title: 'Second', blockedBy: ['t1'] },
      ],
    });

    expect(() => driver.completeSubtask('t2')).toThrow('blocked by');
  });

  it('should auto-complete goal when all subtasks done', () => {
    driver.setGoal({
      title: 'Simple',
      subtasks: [{ id: 't1', title: 'Only task' }],
    });

    const result = driver.completeSubtask('t1');
    expect(result!.status).toBe('completed');
    expect(result!.progressPercentage).toBe(100);
  });

  it('should return next actionable subtask', () => {
    driver.setGoal({
      title: 'Ordered',
      subtasks: [
        { id: 't1', title: 'First' },
        { id: 't2', title: 'Second', blockedBy: ['t1'] },
      ],
    });

    expect(driver.getNextActionable()?.id).toBe('t1');

    driver.completeSubtask('t1');
    expect(driver.getNextActionable()?.id).toBe('t2');
  });

  it('should pause and resume goals', () => {
    driver.setGoal({
      title: 'Pausable',
      subtasks: [{ id: 't1', title: 'Task' }],
    });

    driver.pause('Guard timeout');
    expect(driver.getActiveGoal()!.status).toBe('paused');
    expect(driver.shouldContinue()).toBe(false);

    driver.resume();
    expect(driver.getActiveGoal()!.status).toBe('active');
    expect(driver.shouldContinue()).toBe(true);
  });

  it('should emit goal events to session log', () => {
    driver.setGoal({
      title: 'Logged',
      subtasks: [{ id: 't1', title: 'Task' }],
    });

    driver.completeSubtask('t1');

    const goalEvents = eventLog.getAll().filter((e) => e.type.startsWith('goal/'));
    expect(goalEvents.length).toBeGreaterThanOrEqual(2); // created + completed
  });
});

// ── Capability Seam Tests ───────────────────────────────

describe('CapabilitySeamRegistry', () => {
  let registry: CapabilitySeamRegistry;

  beforeEach(() => {
    registry = new CapabilitySeamRegistry();
  });

  interface MockLLM {
    complete(prompt: string): string;
  }

  const llmDefinition: ServiceDefinition<MockLLM> = {
    name: 'llm',
    description: 'Language model service',
    interfaceVersion: '1.0.0',
  };

  const deepseekProvider: ServiceProvider<MockLLM> = {
    id: 'deepseek-v4',
    name: 'DeepSeek V4',
    version: '4.0.0',
    priority: 10,
    implementation: { complete: (p: string) => `DeepSeek: ${p}` },
  };

  const geminiProvider: ServiceProvider<MockLLM> = {
    id: 'gemini-2.5',
    name: 'Gemini 2.5 Flash',
    version: '2.5.0',
    priority: 5,
    implementation: { complete: (p: string) => `Gemini: ${p}` },
  };

  it('should define a capability seam', () => {
    registry.defineSeam(llmDefinition);
    const status = registry.getSeamStatus();
    expect(status).toHaveLength(1);
    expect(status[0].name).toBe('llm');
    expect(status[0].isComplete).toBe(false);
  });

  it('should register and resolve providers', () => {
    registry.defineSeam(llmDefinition);
    registry.registerProvider('llm', deepseekProvider);

    const llm = registry.resolve<MockLLM>('llm');
    expect(llm.complete('Hello')).toBe('DeepSeek: Hello');
  });

  it('should auto-select highest priority provider', () => {
    registry.defineSeam(llmDefinition);
    registry.registerProvider('llm', geminiProvider); // priority 5
    registry.registerProvider('llm', deepseekProvider); // priority 10

    const llm = registry.resolve<MockLLM>('llm');
    expect(llm.complete('Test')).toBe('DeepSeek: Test');
  });

  it('should switch providers at runtime', () => {
    registry.defineSeam(llmDefinition);
    registry.registerProvider('llm', deepseekProvider);
    registry.registerProvider('llm', geminiProvider);

    // Default is DeepSeek (higher priority)
    expect(registry.resolve<MockLLM>('llm').complete('A')).toBe('DeepSeek: A');

    // Switch to Gemini — zero consumer code changes
    registry.switchProvider('llm', 'gemini-2.5');
    expect(registry.resolve<MockLLM>('llm').complete('A')).toBe('Gemini: A');
  });

  it('should return disposer that removes provider', () => {
    registry.defineSeam(llmDefinition);
    const dispose = registry.registerProvider('llm', deepseekProvider);
    registry.registerProvider('llm', geminiProvider);

    dispose();

    // Should fallback to Gemini
    const llm = registry.resolve<MockLLM>('llm');
    expect(llm.complete('After dispose')).toBe('Gemini: After dispose');
  });

  it('should throw on incomplete seam resolution', () => {
    registry.defineSeam(llmDefinition);
    expect(() => registry.resolve('llm')).toThrow('No active provider');
  });

  it('should list all providers for a seam', () => {
    registry.defineSeam(llmDefinition);
    registry.registerProvider('llm', deepseekProvider);
    registry.registerProvider('llm', geminiProvider);

    expect(registry.getProviders('llm')).toHaveLength(2);
  });
});

// ── Guard Tests ─────────────────────────────────────────

describe('Guard', () => {
  let guard: Guard;

  beforeEach(() => {
    vi.useFakeTimers();
    guard = new Guard({
      toolTimeoutMs: 1000,
      maxRepeatCalls: 3,
      stallTimeoutMs: 5000,
      tokenBudget: 10000,
    });
  });

  afterEach(() => {
    guard.dispose();
    vi.useRealTimers();
  });

  it('should detect tool timeouts', () => {
    const listener = vi.fn();
    guard.onViolation(listener);

    guard.startToolTimer('slow-tool', 'call-1');

    vi.advanceTimersByTime(1100);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'timeout', toolName: 'slow-tool' })
    );
  });

  it('should not fire timeout if tool completes in time', () => {
    const listener = vi.fn();
    guard.onViolation(listener);

    const cleanup = guard.startToolTimer('fast-tool', 'call-1');
    vi.advanceTimersByTime(500);
    cleanup();
    vi.advanceTimersByTime(1000);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should detect repeat calls', () => {
    const listener = vi.fn();
    guard.onViolation(listener);

    const args = { query: 'same thing' };
    guard.recordToolCall('search', args);
    guard.recordToolCall('search', args);
    guard.recordToolCall('search', args); // 3rd identical call triggers warning

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'repeat-call', severity: 'warning' })
    );
  });

  it('should not flag different tool calls as repeats', () => {
    const listener = vi.fn();
    guard.onViolation(listener);

    guard.recordToolCall('search', { query: 'a' });
    guard.recordToolCall('search', { query: 'b' });
    guard.recordToolCall('search', { query: 'c' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should detect stall conditions', () => {
    const listener = vi.fn();
    guard.onViolation(listener);

    vi.advanceTimersByTime(6000); // Exceed 5000ms stall timeout

    expect(guard.checkStall()).toBe(true);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'stall', severity: 'critical' })
    );
  });

  it('should track token budget', () => {
    const listener = vi.fn();
    guard.onViolation(listener);

    guard.recordTokenUsage(8500); // 85% — triggers warning
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'token-budget', severity: 'warning' })
    );

    guard.recordTokenUsage(2000); // Now exceeds 100% — triggers critical
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'token-budget', severity: 'critical' })
    );
  });

  it('should report guard status', () => {
    guard.recordTokenUsage(5000);
    guard.recordToolCall('test', { a: 1 });

    const status = guard.getStatus();
    expect(status.tokensUsed).toBe(5000);
    expect(status.tokenPercentage).toBe(50);
    expect(status.recentCallCount).toBe(1);
  });

  it('should reset guard state', () => {
    guard.recordTokenUsage(5000);
    guard.recordToolCall('test', {});

    guard.reset();

    const status = guard.getStatus();
    expect(status.tokensUsed).toBe(0);
    expect(status.recentCallCount).toBe(0);
  });
});

// ── Hook Bridge Tests ───────────────────────────────────

describe('HookBridge', () => {
  let bridge: HookBridge;
  let eventLog: SessionEventLog;

  beforeEach(() => {
    eventLog = new SessionEventLog('bridge-test');
    bridge = new HookBridge({}, eventLog);
  });

  it('should register and emit hook events', () => {
    const received: HookEvent[] = [];
    bridge.onEvent((e) => received.push(e));

    bridge.emit('ecc', 'post', 'commit:pushed', { branch: 'main' });

    expect(received).toHaveLength(1);
    expect(received[0].dialect).toBe('ecc');
    expect(received[0].name).toBe('commit:pushed');
  });

  it('should register default ECC→ShothikGPT handlers', () => {
    bridge.registerDefaultEccToShothikHandlers();
    expect(bridge.getHandlers().length).toBeGreaterThanOrEqual(3);
  });

  it('should register default ShothikGPT→ECC handlers', () => {
    bridge.registerDefaultShothikToEccHandlers();
    expect(bridge.getHandlers().length).toBeGreaterThanOrEqual(3);
  });

  it('should bridge ECC commit events to ShothikGPT session checkpoints', () => {
    bridge.registerDefaultEccToShothikHandlers();
    const received: HookEvent[] = [];
    bridge.onEvent((e) => received.push(e));

    const bridged = bridge.emit('ecc', 'post', 'commit:pushed', { branch: 'main' });

    expect(bridged).toHaveLength(1);
    expect(bridged[0].dialect).toBe('shothik');
    expect(bridged[0].name).toBe('session:checkpoint');
    expect(bridged[0].data['bridgedFrom']).toBe('ecc');
  });

  it('should bridge ShothikGPT goal completion to ECC review requests', () => {
    bridge.registerDefaultShothikToEccHandlers();
    const bridged = bridge.emit('shothik', 'post', 'goal:completed', {
      title: 'Process invoices',
    });

    expect(bridged).toHaveLength(1);
    expect(bridged[0].dialect).toBe('ecc');
    expect(bridged[0].name).toBe('review:requested');
    expect(bridged[0].data['agent']).toBe('code-reviewer');
  });

  it('should bridge ShothikGPT guard violations to ECC loop-operator', () => {
    bridge.registerDefaultShothikToEccHandlers();
    const bridged = bridge.emit('shothik', 'post', 'guard:timeout', {
      violationType: 'timeout',
      details: 'Tool exceeded timeout',
    });

    expect(bridged).toHaveLength(1);
    expect(bridged[0].name).toBe('loop:intervention');
    expect(bridged[0].data['agent']).toBe('loop-operator');
  });

  it('should return disposer that removes handler', () => {
    const dispose = bridge.registerHandler({
      id: 'test-handler',
      description: 'Test',
      matcher: '*',
      sourceDialect: 'ecc',
      targetDialect: 'shothik',
      async: false,
      timeoutMs: 0,
      transform: (e) => ({ ...e, id: 'bridged', dialect: 'shothik' }),
    });

    expect(bridge.getHandlers()).toHaveLength(1);
    dispose();
    expect(bridge.getHandlers()).toHaveLength(0);
  });

  it('should respect bridge direction config', () => {
    const restrictedBridge = new HookBridge({ eccToShothik: false });
    restrictedBridge.registerDefaultEccToShothikHandlers();

    const bridged = restrictedBridge.emit('ecc', 'post', 'commit:pushed', {});
    expect(bridged).toHaveLength(0); // Blocked by config
  });

  it('should connect to session event log', () => {
    bridge.registerDefaultShothikToEccHandlers();
    const received: HookEvent[] = [];
    bridge.onEvent((e) => received.push(e));

    const unsub = bridge.connectSessionEventLog(eventLog);
    eventLog.append('goal/completed', { title: 'Test goal' });

    // Bridge listener should have received the session event + the bridged event
    expect(received.length).toBeGreaterThanOrEqual(1);
    unsub();
  });

  it('should report bridge status', () => {
    bridge.registerDefaultEccToShothikHandlers();
    bridge.emit('ecc', 'post', 'test', {});

    const status = bridge.getStatus();
    expect(status.handlersCount).toBeGreaterThan(0);
    expect(status.eccToShothik).toBe(true);
    expect(status.eventsProcessed).toBeGreaterThan(0);
  });
});

// ── Skill Provider Registry Tests ───────────────────────

describe('SkillProviderRegistry', () => {
  let registry: SkillProviderRegistry;

  const mockSkills: SkillDescriptor[] = [
    {
      id: 'tdd-workflow',
      name: 'TDD Workflow',
      description: 'Test-driven development with 80%+ coverage',
      source: 'ecc',
      version: '1.0.0',
      tags: ['testing', 'tdd', 'coverage'],
      triggers: ['new feature', 'bug fix', 'refactor'],
      loaded: false,
    },
    {
      id: 'dsh-goal-driver',
      name: 'DSH Goal Driver',
      description: 'Structured goal decomposition and automatic continuation',
      source: 'ecc',
      version: '1.0.0',
      tags: ['goal', 'automation', 'tonight-engine'],
      triggers: ['overnight task', 'batch processing', 'goal tracking'],
      loaded: false,
    },
    {
      id: 'bangla-nlp-kit',
      name: 'Bangla NLP Toolkit',
      description: 'Bengali language processing for Shothik platform',
      source: 'emporium',
      version: '2.1.0',
      tags: ['bangla', 'nlp', 'language'],
      triggers: ['bengali text', 'translation', 'bangla processing'],
      loaded: false,
    },
  ];

  const createMockProvider = (source: 'ecc' | 'emporium', skills: SkillDescriptor[]): SkillProviderPlugin => ({
    id: `mock-${source}`,
    name: `Mock ${source} Provider`,
    source,
    discover: async () => skills,
    load: async (skillId) => {
      const skill = skills.find(s => s.id === skillId);
      return skill ? `# ${skill.name}\n\n${skill.description}` : null;
    },
  });

  beforeEach(() => {
    registry = new SkillProviderRegistry();
  });

  it('should register and discover skills from providers', async () => {
    registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    registry.registerProvider(createMockProvider('emporium', mockSkills.filter(s => s.source === 'emporium')));

    const skills = await registry.discoverAll();
    expect(skills).toHaveLength(3);
  });

  it('should search catalog by query', async () => {
    registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    await registry.discoverAll();

    const results = registry.search('goal tracking');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].descriptor.id).toBe('dsh-goal-driver');
  });

  it('should search by tags', async () => {
    registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    await registry.discoverAll();

    const results = registry.search('tdd');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].descriptor.id).toBe('tdd-workflow');
  });

  it('should filter by source', async () => {
    registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    registry.registerProvider(createMockProvider('emporium', mockSkills.filter(s => s.source === 'emporium')));
    await registry.discoverAll();

    expect(registry.getBySource('ecc')).toHaveLength(2);
    expect(registry.getBySource('emporium')).toHaveLength(1);
  });

  it('should load skill content', async () => {
    registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    await registry.discoverAll();

    const content = await registry.loadSkill('tdd-workflow');
    expect(content).toContain('TDD Workflow');
  });

  it('should cache loaded content', async () => {
    const provider = createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc'));
    const loadSpy = vi.spyOn(provider, 'load');
    registry.registerProvider(provider);
    await registry.discoverAll();

    await registry.loadSkill('tdd-workflow');
    await registry.loadSkill('tdd-workflow'); // Second call should hit cache

    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it('should find best match for task context', async () => {
    registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    await registry.discoverAll();

    const match = registry.findBestMatch('overnight batch processing goal');
    expect(match).not.toBeNull();
    expect(match!.descriptor.id).toBe('dsh-goal-driver');
  });

  it('should dispose provider and remove its skills', async () => {
    const dispose = registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    await registry.discoverAll();

    expect(registry.getCatalog()).toHaveLength(2);
    dispose();
    expect(registry.getCatalog()).toHaveLength(0);
  });

  it('should report registry status', async () => {
    registry.registerProvider(createMockProvider('ecc', mockSkills.filter(s => s.source === 'ecc')));
    registry.registerProvider(createMockProvider('emporium', mockSkills.filter(s => s.source === 'emporium')));
    await registry.discoverAll();

    const status = registry.getStatus();
    expect(status.providerCount).toBe(2);
    expect(status.catalogSize).toBe(3);
    expect(status.bySource['ecc']).toBe(2);
    expect(status.bySource['emporium']).toBe(1);
  });
});
