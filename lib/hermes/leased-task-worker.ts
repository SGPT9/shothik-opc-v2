import { randomUUID } from "node:crypto";

export class LostLeaseError extends Error {
  constructor(message = "Task was paused, cancelled, or taken over by another worker") {
    super(message);
    this.name = "LostLeaseError";
  }
}

export type TaskStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "waiting_input"
  | "scheduled"
  | "paused"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface TaskStep {
  id: string;
  title: string;
  status: "pending" | "running" | "succeeded" | "failed" | "waiting";
  detail?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  prompt: string;
  kind: "agent" | "document" | "monitor" | "finance" | "plan" | "courier" | "tax";
  status: TaskStatus;
  goalId?: string;
  plan: TaskStep[];
  input: Record<string, unknown>;
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  nextRunAt?: string;
  leaseId?: string | null;
  leaseUntil?: string | null;
  attempts: number;
  actionId?: string | null;
  result?: string;
  error?: string | null;
  question?: string;
  artifactIds: string[];
}

export interface RunEvent {
  id: string;
  taskId: string;
  date: string;
  kind: "plan" | "step" | "observation" | "approval" | "result" | "error" | "status";
  title: string;
  detail: string;
}

export interface TaskContext {
  signal: AbortSignal;
  guard(): Promise<void>;
  checkpoint(patch: Partial<AgentTask>): Promise<AgentTask>;
  event(kind: RunEvent["kind"], title: string, detail?: string): Promise<void>;
}

export type TaskHandler = (
  owner: string,
  task: AgentTask,
  context: TaskContext,
) => Promise<Partial<AgentTask>>;

export interface TaskStoreAdapter {
  get<T>(owner: string, kind: string, id: string): Promise<T | null>;
  scan<T>(kind: string): Promise<{ owner: string; value: T }[]>;
  put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T>;
  compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null>;
}

export class MemoryTaskStore implements TaskStoreAdapter {
  private records = new Map<string, Record<string, unknown>>();

  private key(owner: string, kind: string, id: string) {
    return `${owner}:${kind}:${id}`;
  }

  async get<T>(owner: string, kind: string, id: string): Promise<T | null> {
    const val = this.records.get(this.key(owner, kind, id));
    return val ? (JSON.parse(JSON.stringify(val)) as T) : null;
  }

  async scan<T>(kind: string): Promise<{ owner: string; value: T }[]> {
    const results: { owner: string; value: T }[] = [];
    for (const [k, v] of this.records.entries()) {
      const parts = k.split(":");
      if (parts[1] === kind) {
        results.push({ owner: parts[0], value: JSON.parse(JSON.stringify(v)) as T });
      }
    }
    return results;
  }

  async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
    this.records.set(this.key(owner, kind, value.id), JSON.parse(JSON.stringify(value)));
    return value;
  }

  async compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    const current = this.records.get(this.key(owner, kind, id));
    if (!current) return null;

    for (const [expKey, expVal] of Object.entries(expected)) {
      const currentVal = current[expKey] ?? null;
      const targetVal = expVal ?? null;
      if (currentVal !== targetVal) return null;
    }

    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.records.set(this.key(owner, kind, id), updated);
    return JSON.parse(JSON.stringify(updated)) as T;
  }
}

export class LeasedTaskWorker {
  private timer?: NodeJS.Timeout;
  private ticking = false;
  private stopping = false;
  private active = new Map<string, AbortController>();
  public lastTickAt?: string;

  constructor(
    private readonly db: TaskStoreAdapter,
    private readonly execute: TaskHandler,
    private readonly options: {
      now?: () => number;
      leaseMs?: number;
      pollMs?: number;
      settled?: (owner: string, task: AgentTask) => Promise<void>;
    } = {},
  ) {}

  private now() {
    return this.options.now?.() ?? Date.now();
  }

  get isRunning() {
    return Boolean(this.timer);
  }

  start() {
    if (this.timer) return;
    this.stopping = false;
    this.timer = setInterval(() => {
      void this.tick().catch(() => {});
    }, this.options.pollMs ?? 1000);
    void this.tick().catch(() => {});
  }

  async stop() {
    this.stopping = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    for (const controller of this.active.values()) controller.abort();
    while (this.active.size || this.ticking) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  abort(taskId: string) {
    this.active.get(taskId)?.abort();
  }

  async tick() {
    if (this.stopping) return;
    if (this.ticking) return;
    this.ticking = true;
    this.lastTickAt = new Date(this.now()).toISOString();

    try {
      const records = await this.db.scan<AgentTask>("tasks");
      const due = records.filter(({ value: t }) => {
        if (this.active.has(t.id)) return false;
        if (t.status === "queued") return true;
        if (t.status === "scheduled" && Date.parse(t.nextRunAt ?? "") <= this.now()) return true;
        if (t.status === "running" && Date.parse(t.leaseUntil ?? "") <= this.now()) return true;
        return false;
      });

      const eligible = due.slice(0, 5);
      await Promise.all(eligible.map(({ owner, value }) => this.run(owner, value)));
    } finally {
      this.ticking = false;
    }
  }

  private async run(owner: string, previous: AgentTask) {
    if (this.stopping) return;
    const leaseId = randomUUID();
    const leaseMs = this.options.leaseMs ?? 60000;

    const expected: Record<string, unknown> = {
      status: previous.status,
      leaseId: previous.leaseId ?? null,
    };
    if (previous.status === "running") expected.leaseUntil = previous.leaseUntil;

    let task = await this.db.compareAndSwap<AgentTask>(owner, "tasks", previous.id, expected, {
      status: "running",
      leaseId,
      leaseUntil: new Date(this.now() + leaseMs).toISOString(),
      updatedAt: new Date(this.now()).toISOString(),
      attempts: (previous.attempts || 0) + 1,
    });

    if (!task) return;

    const controller = new AbortController();
    this.active.set(task.id, controller);
    const taskId = task.id;

    const guard = async () => {
      const latest = await this.db.get<AgentTask>(owner, "tasks", taskId);
      if (controller.signal.aborted || latest?.leaseId !== leaseId || latest.status !== "running") {
        throw new LostLeaseError();
      }
    };

    const checkpoint = async (patch: Partial<AgentTask>) => {
      if (controller.signal.aborted) throw new LostLeaseError();
      const next = await this.db.compareAndSwap<AgentTask>(
        owner,
        "tasks",
        taskId,
        { leaseId, status: "running" },
        { ...patch, updatedAt: new Date(this.now()).toISOString() },
      );
      if (!next) throw new LostLeaseError();
      task = next;
      return next;
    };

    const event = async (kind: RunEvent["kind"], title: string, detail = "") => {
      await guard();
      await this.db.put(owner, "run-events", {
        id: randomUUID(),
        taskId,
        date: new Date(this.now()).toISOString(),
        kind,
        title,
        detail,
      });
    };

    const heartbeat = setInterval(() => {
      void this.db
        .compareAndSwap(
          owner,
          "tasks",
          taskId,
          { leaseId, status: "running" },
          { leaseUntil: new Date(this.now() + leaseMs).toISOString() },
        )
        .then((value) => {
          if (!value) controller.abort();
        })
        .catch(() => controller.abort());
    }, Math.max(10, Math.floor(leaseMs / 3)));

    try {
      const result = await this.execute(owner, task, {
        signal: controller.signal,
        guard,
        checkpoint,
        event,
      });

      await checkpoint({ ...result, leaseId: null, leaseUntil: null });
    } catch (error) {
      if (error instanceof LostLeaseError || controller.signal.aborted) {
        await this.db.compareAndSwap(
          owner,
          "tasks",
          taskId,
          { leaseId, status: "running" },
          { status: "queued", leaseId: null, leaseUntil: null },
        );
      } else {
        const detail = error instanceof Error ? error.message : "Task execution failed";
        await event("error", "Task needs attention", detail).catch(() => {});
        await this.db.compareAndSwap(
          owner,
          "tasks",
          taskId,
          { leaseId, status: "running" },
          {
            status: "failed",
            error: detail,
            leaseId: null,
            leaseUntil: null,
            updatedAt: new Date(this.now()).toISOString(),
          },
        );
      }
    } finally {
      clearInterval(heartbeat);
      this.active.delete(taskId);
    }

    const settled = await this.db.get<AgentTask>(owner, "tasks", taskId);
    if (settled && this.options.settled) {
      await this.options.settled(owner, settled);
    }
  }
}
