/**
 * Microservice Circuit Breaker Guard
 * Protects downstream LLM APIs (DeepSeek, Claude, OpenAI) and Payment Gateways from cascading outage failures.
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number; // e.g. 3 consecutive failures
  recoveryTimeoutMs: number; // e.g. 10,000ms
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private nextAttemptTime = 0;
  private options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions = { failureThreshold: 3, recoveryTimeoutMs: 10000 }) {
    this.options = options;
  }

  /**
   * Execute protected async action with fallback on circuit trip
   */
  public async execute<T>(actionFn: () => Promise<T>, fallbackFn: () => T): Promise<T> {
    const now = Date.now();

    if (this.state === "OPEN") {
      if (now > this.nextAttemptTime) {
        this.state = "HALF_OPEN";
      } else {
        return fallbackFn();
      }
    }

    try {
      const result = await actionFn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return fallbackFn();
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      this.nextAttemptTime = Date.now() + this.options.recoveryTimeoutMs;
    }
  }

  public getStatus(): { state: CircuitState; failureCount: number; nextAttemptTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}

export const llmCircuitBreaker = new CircuitBreaker();

/**
 * Capability 2: The 10-Fail Fatigue Circuit Breaker & 15-Minute Floor Engine
 * 
 * Protects merchant tokens, API quotas, and background workers from runaway tight loops:
 * 1. 15-Minute Floor: Clamps interval to Math.max(intervalSeconds, 900).
 * 2. 10-Fail Circuit Breaker: If consecutiveFailures >= 10, marks FATIGUE_PAUSED and alerts merchant.
 * 3. Silent Backlog Drain: On server restart/recovery, overdue iterations are silently advanced
 *    without burst-firing stale runs.
 */

export interface RoutineSchedule {
  id: string;
  name: string;
  category: "Finance" | "Logistics" | "Inventory" | "Security" | "Marketing";
  intervalSeconds: number; // Enforced floor: >= 900s (15 minutes)
  consecutiveFailures: number;
  status: "ACTIVE" | "FATIGUE_PAUSED" | "PAUSED";
  lastRunAt?: string;
  nextRunAt?: string;
  lastError?: string;
  pauseReason?: string;
  totalExecutions: number;
  totalFailures: number;
  lastDrainedAt?: string;
}

export interface FatigueAlert {
  id: string;
  routineId: string;
  routineName: string;
  consecutiveFailures: number;
  message: string;
  timestamp: string;
}

export class RoutineFatigueGuard {
  public static readonly MIN_INTERVAL_SECONDS = 900; // 15-minute floor
  public static readonly MAX_CONSECUTIVE_FAILURES = 10; // 10-fail fatigue threshold

  private routines = new Map<string, RoutineSchedule>();
  private alerts: FatigueAlert[] = [];

  constructor() {
    this.seedDefaultRoutines();
    this.drainOverdueBacklog();
  }

  private seedDefaultRoutines() {
    const defaults: Array<{
      id: string;
      name: string;
      category: RoutineSchedule["category"];
      intervalSeconds: number;
    }> = [
      {
        id: "routine_mfs_settlement",
        name: "bKash & Nagad MFS TrxID Settlement Reconciliation",
        category: "Finance",
        intervalSeconds: 3600, // 1 hour
      },
      {
        id: "routine_courier_rto",
        name: "Steadfast & Pathao Courier RTO Fraud Minimizer Sweep",
        category: "Logistics",
        intervalSeconds: 1800, // 30 minutes
      },
      {
        id: "routine_inventory_sync",
        name: "Multi-Storefront Stock Matrix Sync & DIR Rebalance",
        category: "Inventory",
        intervalSeconds: 900, // 15 minutes (Floor)
      },
      {
        id: "routine_container_sec",
        name: "Dokploy Container Memory Profiling & Security Latch",
        category: "Security",
        intervalSeconds: 86400, // 24 hours
      },
    ];

    const now = Date.now();
    for (const d of defaults) {
      const interval = Math.max(d.intervalSeconds, RoutineFatigueGuard.MIN_INTERVAL_SECONDS);
      this.routines.set(d.id, {
        id: d.id,
        name: d.name,
        category: d.category,
        intervalSeconds: interval,
        consecutiveFailures: 0,
        status: "ACTIVE",
        lastRunAt: new Date(now - 600000).toISOString(),
        nextRunAt: new Date(now + interval * 1000).toISOString(),
        totalExecutions: 24,
        totalFailures: 0,
      });
    }
  }

  /**
   * Register or update a routine schedule with the 15-minute floor enforced
   */
  public registerOrUpdate(params: {
    id: string;
    name: string;
    category?: RoutineSchedule["category"];
    intervalSeconds: number;
  }): RoutineSchedule {
    const clampedInterval = Math.max(params.intervalSeconds, RoutineFatigueGuard.MIN_INTERVAL_SECONDS);
    const existing = this.routines.get(params.id);

    if (existing) {
      existing.name = params.name;
      existing.category = params.category || existing.category;
      existing.intervalSeconds = clampedInterval;
      return existing;
    }

    const now = Date.now();
    const newRoutine: RoutineSchedule = {
      id: params.id,
      name: params.name,
      category: params.category || "Finance",
      intervalSeconds: clampedInterval,
      consecutiveFailures: 0,
      status: "ACTIVE",
      nextRunAt: new Date(now + clampedInterval * 1000).toISOString(),
      totalExecutions: 0,
      totalFailures: 0,
    };

    this.routines.set(params.id, newRoutine);
    return newRoutine;
  }

  /**
   * Check if a routine is permitted to execute
   */
  public canExecute(id: string): { allowed: boolean; reason?: string; routine?: RoutineSchedule } {
    const routine = this.routines.get(id);
    if (!routine) {
      return { allowed: false, reason: `Routine "${id}" not registered` };
    }

    if (routine.status === "FATIGUE_PAUSED") {
      return {
        allowed: false,
        reason: `Routine "${routine.name}" is FATIGUE_PAUSED after 10 consecutive failures. Auto-disabled to protect merchant credits. Manual founder reset required.`,
        routine,
      };
    }

    if (routine.status === "PAUSED") {
      return {
        allowed: false,
        reason: `Routine "${routine.name}" is manually paused.`,
        routine,
      };
    }

    return { allowed: true, routine };
  }

  /**
   * Record a successful execution. Resets consecutiveFailures to 0.
   */
  public recordSuccess(id: string): RoutineSchedule | undefined {
    const routine = this.routines.get(id);
    if (!routine) return undefined;

    routine.consecutiveFailures = 0;
    routine.lastError = undefined;
    routine.pauseReason = undefined;
    routine.status = "ACTIVE";
    routine.totalExecutions += 1;
    routine.lastRunAt = new Date().toISOString();
    routine.nextRunAt = new Date(Date.now() + routine.intervalSeconds * 1000).toISOString();

    return routine;
  }

  /**
   * Record a failed execution. Increments consecutiveFailures.
   * If consecutiveFailures >= 10, triggers FATIGUE_PAUSED and alerts merchant.
   */
  public recordFailure(id: string, errorMessage: string): {
    routine: RoutineSchedule;
    tripped: boolean;
    alert?: FatigueAlert;
  } {
    let routine = this.routines.get(id);
    if (!routine) {
      routine = this.registerOrUpdate({
        id,
        name: id,
        intervalSeconds: RoutineFatigueGuard.MIN_INTERVAL_SECONDS,
      });
    }

    routine.consecutiveFailures += 1;
    routine.totalFailures += 1;
    routine.lastError = errorMessage;
    routine.lastRunAt = new Date().toISOString();

    let tripped = false;
    let alert: FatigueAlert | undefined;

    if (routine.consecutiveFailures >= RoutineFatigueGuard.MAX_CONSECUTIVE_FAILURES) {
      routine.status = "FATIGUE_PAUSED";
      routine.pauseReason = `Auto-disabled by 10-Fail Fatigue Circuit Breaker after ${routine.consecutiveFailures} consecutive failures: ${errorMessage}`;
      tripped = true;

      alert = {
        id: `alert_fatigue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        routineId: routine.id,
        routineName: routine.name,
        consecutiveFailures: routine.consecutiveFailures,
        message: `🚨 [FATIGUE CIRCUIT BREAKER] Routine "${routine.name}" has failed 10 consecutive times. Auto-disabled to prevent credit drain and API quota exhaustion.`,
        timestamp: new Date().toISOString(),
      };

      this.alerts.unshift(alert);
      if (this.alerts.length > 20) {
        this.alerts.pop();
      }
    } else {
      // Re-schedule next attempt with interval floor
      routine.nextRunAt = new Date(Date.now() + routine.intervalSeconds * 1000).toISOString();
    }

    return { routine, tripped, alert };
  }

  /**
   * Reset routine fatigue status (manual founder action)
   */
  public resetRoutine(id: string): { success: boolean; routine?: RoutineSchedule } {
    const routine = this.routines.get(id);
    if (!routine) return { success: false };

    routine.consecutiveFailures = 0;
    routine.lastError = undefined;
    routine.pauseReason = undefined;
    routine.status = "ACTIVE";
    routine.nextRunAt = new Date(Date.now() + routine.intervalSeconds * 1000).toISOString();

    return { success: true, routine };
  }

  /**
   * Silent Backlog Drain on Server Restart/Recovery
   * Prevents burst-firing stale routine runs that piled up while the server was down.
   */
  public drainOverdueBacklog(): { drainedCount: number; routines: string[] } {
    const now = Date.now();
    const drained: string[] = [];

    for (const routine of this.routines.values()) {
      if (routine.nextRunAt && new Date(routine.nextRunAt).getTime() < now) {
        routine.lastDrainedAt = new Date(now).toISOString();
        routine.nextRunAt = new Date(now + routine.intervalSeconds * 1000).toISOString();
        drained.push(routine.id);
      }
    }

    return { drainedCount: drained.length, routines: drained };
  }

  public listRoutines(): RoutineSchedule[] {
    return Array.from(this.routines.values());
  }

  public getAlerts(): FatigueAlert[] {
    return [...this.alerts];
  }
}

export const routineFatigueGuard = new RoutineFatigueGuard();
