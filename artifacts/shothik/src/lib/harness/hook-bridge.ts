/**
 * Hook Bridge — Cross-Platform Event Bridges (ECC ↔ ShothikGPT ↔ DSH)
 * Adapted from DeepSeek Harness packages/hooks/ (hook bridges + shared protocol)
 *
 * Provides bidirectional event bridges:
 *  - ECC hooks can trigger ShothikGPT harness actions
 *  - ShothikGPT session events can trigger ECC hook scripts
 *  - DSH lifecycle events map onto both systems
 *
 * "The hooks subsystem lets users extend the agent at lifecycle points"
 */

import type { SessionEventLog, SessionEventType } from './session-event-log';
import type { PluginRegistry } from './plugin-registry';
import type { Guard, GuardViolation } from './guard';

// ── Hook Protocol Types ─────────────────────────────────

export type HookTiming = 'pre' | 'post';
export type HookDialect = 'ecc' | 'shothik' | 'dsh';

export interface HookEvent {
  /** Unique event ID */
  readonly id: string;
  /** Which system originated this event */
  readonly dialect: HookDialect;
  /** Lifecycle timing */
  readonly timing: HookTiming;
  /** Event name (e.g., 'tool:use', 'session:start', 'commit') */
  readonly name: string;
  /** Event payload */
  readonly data: Record<string, unknown>;
  /** ISO 8601 timestamp */
  readonly timestamp: string;
}

export interface HookHandler {
  /** Unique handler ID */
  readonly id: string;
  /** Human-readable description */
  readonly description: string;
  /** Which events this handler matches (glob-style) */
  readonly matcher: string;
  /** Source dialect to listen to */
  readonly sourceDialect: HookDialect;
  /** Target dialect to emit to */
  readonly targetDialect: HookDialect;
  /** Whether this handler runs asynchronously */
  readonly async: boolean;
  /** Timeout in milliseconds (0 = no timeout) */
  readonly timeoutMs: number;
  /** The transformation/action to perform */
  readonly transform: (event: HookEvent) => HookEvent | null;
}

export interface HookBridgeConfig {
  /** Enable ECC → ShothikGPT bridge */
  eccToShothik: boolean;
  /** Enable ShothikGPT → ECC bridge */
  shothikToEcc: boolean;
  /** Enable DSH lifecycle event mapping */
  dshLifecycleMapping: boolean;
  /** Maximum handlers per event (prevent runaway chains) */
  maxHandlersPerEvent: number;
}

// ── Hook Bridge ─────────────────────────────────────────

const DEFAULT_BRIDGE_CONFIG: HookBridgeConfig = {
  eccToShothik: true,
  shothikToEcc: true,
  dshLifecycleMapping: true,
  maxHandlersPerEvent: 10,
};

export class HookBridge {
  private readonly config: HookBridgeConfig;
  private readonly handlers: Map<string, HookHandler> = new Map();
  private readonly eventLog: SessionEventLog | null;
  private readonly listeners: Set<(event: HookEvent) => void> = new Set();
  private eventCounter = 0;

  constructor(config?: Partial<HookBridgeConfig>, eventLog?: SessionEventLog) {
    this.config = { ...DEFAULT_BRIDGE_CONFIG, ...config };
    this.eventLog = eventLog ?? null;
  }

  /**
   * Register a hook handler (bridge rule).
   * Returns a disposer function.
   */
  registerHandler(handler: HookHandler): () => void {
    if (this.handlers.has(handler.id)) {
      throw new Error(`Hook handler already registered: ${handler.id}`);
    }
    this.handlers.set(handler.id, handler);
    return () => {
      this.handlers.delete(handler.id);
    };
  }

  /**
   * Emit an event into the bridge system.
   * Matching handlers are executed and may produce bridged events in the target dialect.
   */
  emit(dialect: HookDialect, timing: HookTiming, name: string, data: Record<string, unknown> = {}): HookEvent[] {
    const event: HookEvent = {
      id: `hook-${++this.eventCounter}`,
      dialect,
      timing,
      name,
      data,
      timestamp: new Date().toISOString(),
    };

    // Notify direct listeners
    for (const listener of this.listeners) {
      listener(event);
    }

    // Find matching handlers
    const matchingHandlers = this.findMatchingHandlers(event);
    const bridgedEvents: HookEvent[] = [];

    for (const handler of matchingHandlers.slice(0, this.config.maxHandlersPerEvent)) {
      // Check bridge direction permissions
      if (!this.isBridgeAllowed(handler.sourceDialect, handler.targetDialect)) {
        continue;
      }

      try {
        const result = handler.transform(event);
        if (result) {
          bridgedEvents.push(result);
          // Recursive emit for the bridged event (limited by maxHandlersPerEvent)
          this.notifyBridgedEvent(result);
        }
      } catch (err) {
        // Log but don't fail — hooks should be resilient
        this.eventLog?.append('guard/stall', {
          hookHandlerId: handler.id,
          error: err instanceof Error ? err.message : String(err),
          sourceEvent: event.name,
        }, true);
      }
    }

    return bridgedEvents;
  }

  /**
   * Create default ECC → ShothikGPT bridge handlers.
   * Maps ECC hook lifecycle events to ShothikGPT session events.
   */
  registerDefaultEccToShothikHandlers(): void {
    // ECC commit hooks → ShothikGPT session events
    this.registerHandler({
      id: 'ecc:commit→shothik:session',
      description: 'ECC git commit events trigger ShothikGPT session checkpoints',
      matcher: 'commit*',
      sourceDialect: 'ecc',
      targetDialect: 'shothik',
      async: true,
      timeoutMs: 5000,
      transform: (event) => ({
        ...event,
        id: `bridge-${++this.eventCounter}`,
        dialect: 'shothik',
        name: 'session:checkpoint',
        data: {
          ...event.data,
          bridgedFrom: 'ecc',
          originalEvent: event.name,
          reason: 'ECC commit hook triggered session checkpoint',
        },
      }),
    });

    // ECC build completion → ShothikGPT notification
    this.registerHandler({
      id: 'ecc:build→shothik:notify',
      description: 'ECC build completion triggers ShothikGPT platform notifications',
      matcher: 'build:complete',
      sourceDialect: 'ecc',
      targetDialect: 'shothik',
      async: true,
      timeoutMs: 3000,
      transform: (event) => ({
        ...event,
        id: `bridge-${++this.eventCounter}`,
        dialect: 'shothik',
        name: 'platform:notification',
        data: {
          type: 'build_complete',
          message: `Build completed: ${event.data['target'] ?? 'unknown'}`,
          bridgedFrom: 'ecc',
        },
      }),
    });

    // ECC security review → ShothikGPT guard event
    this.registerHandler({
      id: 'ecc:security→shothik:guard',
      description: 'ECC security findings trigger ShothikGPT guard alerts',
      matcher: 'security:*',
      sourceDialect: 'ecc',
      targetDialect: 'shothik',
      async: false,
      timeoutMs: 0,
      transform: (event) => ({
        ...event,
        id: `bridge-${++this.eventCounter}`,
        dialect: 'shothik',
        name: 'guard:security-alert',
        data: {
          severity: event.data['severity'] ?? 'warning',
          finding: event.data['finding'] ?? event.name,
          bridgedFrom: 'ecc',
        },
      }),
    });
  }

  /**
   * Create default ShothikGPT → ECC bridge handlers.
   * Maps ShothikGPT session events to ECC hook triggers.
   */
  registerDefaultShothikToEccHandlers(): void {
    // ShothikGPT goal completion → ECC code review trigger
    this.registerHandler({
      id: 'shothik:goal→ecc:review',
      description: 'ShothikGPT goal completion triggers ECC code review',
      matcher: 'goal:completed',
      sourceDialect: 'shothik',
      targetDialect: 'ecc',
      async: true,
      timeoutMs: 10000,
      transform: (event) => ({
        ...event,
        id: `bridge-${++this.eventCounter}`,
        dialect: 'ecc',
        name: 'review:requested',
        data: {
          goalTitle: event.data['title'],
          bridgedFrom: 'shothik',
          agent: 'code-reviewer',
        },
      }),
    });

    // ShothikGPT guard violation → ECC loop-operator intervention
    this.registerHandler({
      id: 'shothik:guard→ecc:intervention',
      description: 'ShothikGPT guard violations trigger ECC loop-operator alerts',
      matcher: 'guard:*',
      sourceDialect: 'shothik',
      targetDialect: 'ecc',
      async: false,
      timeoutMs: 0,
      transform: (event) => ({
        ...event,
        id: `bridge-${++this.eventCounter}`,
        dialect: 'ecc',
        name: 'loop:intervention',
        data: {
          violationType: event.data['violationType'],
          details: event.data['details'],
          bridgedFrom: 'shothik',
          agent: 'loop-operator',
        },
      }),
    });

    // ShothikGPT Tonight Engine overnight task → ECC planner
    this.registerHandler({
      id: 'shothik:tonight→ecc:planner',
      description: 'Tonight Engine batch tasks fire ECC planner for implementation planning',
      matcher: 'tonight:task-start',
      sourceDialect: 'shothik',
      targetDialect: 'ecc',
      async: true,
      timeoutMs: 15000,
      transform: (event) => ({
        ...event,
        id: `bridge-${++this.eventCounter}`,
        dialect: 'ecc',
        name: 'plan:requested',
        data: {
          taskTitle: event.data['title'],
          subtasks: event.data['subtasks'],
          bridgedFrom: 'shothik',
          agent: 'planner',
        },
      }),
    });
  }

  /**
   * Connect to ShothikGPT session event log and auto-bridge relevant events.
   */
  connectSessionEventLog(eventLog: SessionEventLog): () => void {
    return eventLog.subscribe((event) => {
      // Map session events to bridge events
      if (event.type.startsWith('goal/')) {
        this.emit('shothik', 'post', event.type, event.data);
      }
      if (event.type.startsWith('guard/')) {
        this.emit('shothik', 'post', event.type, event.data);
      }
      if (event.type === 'turn/end') {
        this.emit('shothik', 'post', 'turn:completed', event.data);
      }
    });
  }

  /**
   * Connect to Guard and bridge violations.
   */
  connectGuard(guard: Guard): () => void {
    return guard.onViolation((violation: GuardViolation) => {
      this.emit('shothik', 'post', `guard:${violation.type}`, {
        violationType: violation.type,
        details: violation.details,
        severity: violation.severity,
        toolName: violation.toolName,
      });
    });
  }

  /**
   * Get all registered handlers.
   */
  getHandlers(): readonly HookHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Subscribe to all bridge events.
   */
  onEvent(listener: (event: HookEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get bridge status.
   */
  getStatus(): {
    handlersCount: number;
    eccToShothik: boolean;
    shothikToEcc: boolean;
    dshLifecycleMapping: boolean;
    eventsProcessed: number;
  } {
    return {
      handlersCount: this.handlers.size,
      eccToShothik: this.config.eccToShothik,
      shothikToEcc: this.config.shothikToEcc,
      dshLifecycleMapping: this.config.dshLifecycleMapping,
      eventsProcessed: this.eventCounter,
    };
  }

  private findMatchingHandlers(event: HookEvent): HookHandler[] {
    return Array.from(this.handlers.values()).filter((handler) => {
      if (handler.sourceDialect !== event.dialect) return false;
      return this.matchesPattern(handler.matcher, event.name);
    });
  }

  private matchesPattern(pattern: string, name: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      return name.startsWith(pattern.slice(0, -1));
    }
    return pattern === name;
  }

  private isBridgeAllowed(source: HookDialect, target: HookDialect): boolean {
    if (source === 'ecc' && target === 'shothik') return this.config.eccToShothik;
    if (source === 'shothik' && target === 'ecc') return this.config.shothikToEcc;
    if (source === 'dsh' || target === 'dsh') return this.config.dshLifecycleMapping;
    return true;
  }

  private notifyBridgedEvent(event: HookEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
