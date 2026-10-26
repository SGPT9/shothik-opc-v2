import { logger } from "../logger";

export type SupervisionStrategy = "one_for_one" | "one_for_all" | "rest_for_one";

export type ActorStatus = "IDLE" | "PROCESSING" | "FAILED" | "RESTARTING" | "QUARANTINED" | "TERMINATED";

export interface ActorMessage<TPayload = any> {
  id: string;
  sender?: string;
  type: string;
  payload: TPayload;
  timestamp: number;
}

export interface ActorState<TState = any> {
  actorId: string;
  type: string;
  status: ActorStatus;
  state: TState;
  mailboxLength: number;
  processedCount: number;
  crashCount: number;
  lastCrashTimestamp?: number;
  lastCrashReason?: string;
  deadLetterCount: number;
  startedAt: string;
}

export type MessageHandler<TState, TPayload, TResult> = (
  state: TState,
  message: ActorMessage<TPayload>
) => Promise<{ newState: TState; result?: TResult }>;

export interface ActorSpec<TState = any> {
  actorId: string;
  type: string;
  initialState: () => TState;
  handler: MessageHandler<TState, any, any>;
  maxMailboxSize?: number;
}

export interface SupervisorConfig {
  strategy: SupervisionStrategy;
  maxRestarts: number; // e.g. 3 restarts
  periodSeconds: number; // e.g. within 60s
}

/**
 * Pillar 3: Erlang/OTP Actor Supervision Tree for Specialized Twins
 * 
 * Provides isolated actor mailboxes, crash containment boundaries, and automatic hot-restart
 * policies (one_for_one, one_for_all, rest_for_one) so single twin crashes (LLM rate limits,
 * unhandled exceptions) do not crash the swarm or node process.
 */
export class ActorSupervisor {
  private static instance: ActorSupervisor;
  private readonly config: SupervisorConfig;
  private readonly actors = new Map<string, {
    spec: ActorSpec;
    status: ActorStatus;
    state: any;
    mailbox: ActorMessage[];
    processedCount: number;
    crashCount: number;
    recentCrashTimestamps: number[];
    lastCrashReason?: string;
    deadLetters: Array<{ message: ActorMessage; error: string; timestamp: number }>;
    isLoopRunning: boolean;
    startedAt: string;
  }>();
  private readonly pendingCalls = new Map<string, {
    resolve: (res: any) => void;
    reject: (err: any) => void;
    timer: NodeJS.Timeout;
  }>();

  private constructor(config?: Partial<SupervisorConfig>) {
    this.config = {
      strategy: config?.strategy || "one_for_one",
      maxRestarts: config?.maxRestarts ?? 3,
      periodSeconds: config?.periodSeconds ?? 60,
    };
  }

  public static getInstance(config?: Partial<SupervisorConfig>): ActorSupervisor {
    if (!ActorSupervisor.instance) {
      ActorSupervisor.instance = new ActorSupervisor(config);
    }
    return ActorSupervisor.instance;
  }

  /**
   * Spawns or registers a supervised actor.
   */
  public spawnActor<TState>(spec: ActorSpec<TState>): void {
    const existing = this.actors.get(spec.actorId);
    if (existing) {
      logger.warn({ actorId: spec.actorId }, "[ActorSupervisor] Actor already spawned, updating spec");
      existing.spec = spec;
      return;
    }

    const initialState = spec.initialState();
    this.actors.set(spec.actorId, {
      spec,
      status: "IDLE",
      state: initialState,
      mailbox: [],
      processedCount: 0,
      crashCount: 0,
      recentCrashTimestamps: [],
      deadLetters: [],
      isLoopRunning: false,
      startedAt: new Date().toISOString(),
    });

    logger.info({ actorId: spec.actorId, type: spec.type }, "[ActorSupervisor] Spawned supervised actor");
  }

  /**
   * Enqueues a message into the actor's private mailbox.
   */
  public send<TPayload>(actorId: string, message: Omit<ActorMessage<TPayload>, "id" | "timestamp">): { success: boolean; messageId: string; mailboxLength: number } {
    const actor = this.actors.get(actorId);
    if (!actor) {
      throw new Error(`Actor '${actorId}' not found in supervision tree`);
    }

    if (actor.status === "QUARANTINED" || actor.status === "TERMINATED") {
      throw new Error(`Cannot send to actor '${actorId}': actor is ${actor.status}`);
    }

    const maxSize = actor.spec.maxMailboxSize ?? 100;
    if (actor.mailbox.length >= maxSize) {
      logger.warn({ actorId, mailboxLength: actor.mailbox.length, maxSize }, "[ActorSupervisor] Mailbox backpressure overflow: rejecting message");
      throw new Error(`Mailbox for actor '${actorId}' exceeded max capacity (${maxSize})`);
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullMessage: ActorMessage<TPayload> = {
      id: messageId,
      sender: message.sender,
      type: message.type,
      payload: message.payload,
      timestamp: Date.now(),
    };

    actor.mailbox.push(fullMessage);

    // Trigger mailbox pump
    this.triggerMailboxPump(actorId);

    return {
      success: true,
      messageId,
      mailboxLength: actor.mailbox.length,
    };
  }

  /**
   * Synchronous call (Request-Reply): enqueues message and awaits execution result.
   */
  public async call<TPayload = any, TResult = any>(
    actorId: string,
    message: Omit<ActorMessage<TPayload>, "id" | "timestamp">,
    timeoutMs = 5000
  ): Promise<TResult> {
    const actor = this.actors.get(actorId);
    if (!actor) {
      throw new Error(`Actor '${actorId}' not found`);
    }

    return new Promise<TResult>((resolve, reject) => {
      const sendResult = this.send(actorId, message);
      const timer = setTimeout(() => {
        this.pendingCalls.delete(sendResult.messageId);
        reject(new Error(`Actor call timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingCalls.set(sendResult.messageId, { resolve, reject, timer });
    });
  }

  /**
   * Internal FIFO Mailbox loop with Crash Containment and OTP Supervision.
   */
  private async triggerMailboxPump(actorId: string): Promise<void> {
    const actor = this.actors.get(actorId);
    if (!actor || actor.isLoopRunning || actor.status === "QUARANTINED" || actor.status === "TERMINATED") {
      return;
    }

    actor.isLoopRunning = true;

    while (actor.mailbox.length > 0 && (actor.status as ActorStatus) !== "QUARANTINED" && (actor.status as ActorStatus) !== "TERMINATED") {
      const msg = actor.mailbox[0];
      actor.status = "PROCESSING";

      try {
        const { newState, result } = await actor.spec.handler(actor.state, msg);
        actor.state = newState;
        actor.processedCount++;
        actor.mailbox.shift(); // Successfully processed: remove from queue
        actor.status = actor.mailbox.length > 0 ? "PROCESSING" : "IDLE";

        const pending = this.pendingCalls.get(msg.id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pendingCalls.delete(msg.id);
          pending.resolve(result);
        }
      } catch (err: any) {
        // CRASH CAUGHT BY SUPERVISOR
        const errorMsg = err?.message || String(err);
        logger.error({ actorId, error: errorMsg, messageId: msg.id }, "[ActorSupervisor] Actor crashed processing message");

        actor.crashCount++;
        actor.lastCrashReason = errorMsg;
        const now = Date.now();
        actor.recentCrashTimestamps.push(now);

        // Move poisoned message to dead-letter queue
        const poisonedMsg = actor.mailbox.shift()!;
        actor.deadLetters.push({
          message: poisonedMsg,
          error: errorMsg,
          timestamp: now,
        });
        if (actor.deadLetters.length > 50) actor.deadLetters.shift();

        const pending = this.pendingCalls.get(msg.id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pendingCalls.delete(msg.id);
          pending.reject(err);
        }

        // Prune older crash timestamps outside window
        const cutoff = now - this.config.periodSeconds * 1000;
        actor.recentCrashTimestamps = actor.recentCrashTimestamps.filter(t => t >= cutoff);

        // Check if exceeded max restarts
        if (actor.recentCrashTimestamps.length > this.config.maxRestarts) {
          logger.fatal(
            { actorId, crashes: actor.recentCrashTimestamps.length, windowSec: this.config.periodSeconds },
            "[ActorSupervisor] Actor exceeded max restarts threshold: QUARANTINING actor",
          );
          actor.status = "QUARANTINED";
          actor.isLoopRunning = false;
          return;
        }

        // Apply Supervision Strategy
        await this.handleSupervisionStrategy(actorId, errorMsg);
        break; // Exit current pump loop while restarting
      }
    }

    actor.isLoopRunning = false;
    if (actor.status === "PROCESSING" && actor.mailbox.length === 0) {
      actor.status = "IDLE";
    }
  }

  /**
   * Applies OTP supervision restart strategy (one_for_one, one_for_all, rest_for_one).
   */
  private async handleSupervisionStrategy(crashedActorId: string, reason: string): Promise<void> {
    const strategy = this.config.strategy;
    logger.warn({ strategy, crashedActorId }, "[ActorSupervisor] Executing OTP supervision restart strategy");

    if (strategy === "one_for_one") {
      this.restartSingleActor(crashedActorId);
    } else if (strategy === "one_for_all") {
      // Restart all registered actors
      for (const id of this.actors.keys()) {
        this.restartSingleActor(id);
      }
    } else if (strategy === "rest_for_one") {
      // Restart crashed actor and all actors registered after it
      let found = false;
      for (const id of this.actors.keys()) {
        if (id === crashedActorId) found = true;
        if (found) {
          this.restartSingleActor(id);
        }
      }
    }
  }

  /**
   * Hot-restarts a single actor, resetting state to clean baseline while preserving non-poisoned mailbox.
   */
  public restartSingleActor(actorId: string): void {
    const actor = this.actors.get(actorId);
    if (!actor) return;

    actor.status = "RESTARTING";
    logger.info({ actorId }, "[ActorSupervisor] Hot-restarting actor state to clean baseline");

    try {
      actor.state = actor.spec.initialState();
      actor.status = "IDLE";
      actor.isLoopRunning = false;

      // Resume processing remaining queue if any
      if (actor.mailbox.length > 0) {
        this.triggerMailboxPump(actorId);
      }
    } catch (reInitErr: any) {
      logger.error({ actorId, error: reInitErr?.message }, "[ActorSupervisor] Failed to re-initialize actor state");
      actor.status = "FAILED";
    }
  }

  /**
   * Quarantines an actor, halting all message processing.
   */
  public quarantineActor(actorId: string): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.status = "QUARANTINED";
      logger.warn({ actorId }, "[ActorSupervisor] Actor manually quarantined");
    }
  }

  /**
   * Releases an actor from quarantine.
   */
  public unquarantineActor(actorId: string): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.status = "IDLE";
      actor.recentCrashTimestamps = [];
      actor.state = actor.spec.initialState();
      if (actor.mailbox.length > 0) {
        this.triggerMailboxPump(actorId);
      }
    }
  }

  public getActorState(actorId: string): ActorState | undefined {
    const actor = this.actors.get(actorId);
    if (!actor) return undefined;

    return {
      actorId,
      type: actor.spec.type,
      status: actor.status,
      state: actor.state,
      mailboxLength: actor.mailbox.length,
      processedCount: actor.processedCount,
      crashCount: actor.crashCount,
      lastCrashTimestamp: actor.recentCrashTimestamps[actor.recentCrashTimestamps.length - 1],
      lastCrashReason: actor.lastCrashReason,
      deadLetterCount: actor.deadLetters.length,
      startedAt: actor.startedAt,
    };
  }

  public listActors(): ActorState[] {
    return Array.from(this.actors.keys()).map(id => this.getActorState(id)!);
  }

  public getDeadLetters(actorId: string): Array<{ message: ActorMessage; error: string; timestamp: number }> {
    const actor = this.actors.get(actorId);
    return actor ? [...actor.deadLetters] : [];
  }
}

export const actorSupervisor = ActorSupervisor.getInstance();
