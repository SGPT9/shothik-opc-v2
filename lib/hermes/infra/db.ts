const logger = {
  info: (...args: any[]) => console.log("[Hermes DB Info]", ...args),
  warn: (...args: any[]) => console.warn("[Hermes DB Warn]", ...args),
  error: (...args: any[]) => console.error("[Hermes DB Error]", ...args),
};

export interface ToolCallRecord {
  id: string;
  runId: string;
  toolName: string;
  input: Record<string, unknown>;
  result?: Record<string, unknown> | null;
  error?: string | null;
  status: "completed" | "failed";
  startedAt: string;
  completedAt: string;
}

export interface HermesDatabase {
  recordToolCall(record: ToolCallRecord): Promise<void>;
  createSession(data: {
    id: string;
    workspaceId: string;
    title: string;
    description?: string;
    settings?: Record<string, unknown>;
  }): Promise<any>;
  getSession(sessionId: string): Promise<any | null>;
  createRun(data: {
    id: string;
    sessionId: string;
    workspaceId: string;
    domain?: string;
    config?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<any>;
  getRun(runId: string): Promise<any | null>;
  updateRunStatus(runId: string, status: string, metadata?: Record<string, unknown>): Promise<any>;
}

class InMemoryHermesDatabase implements HermesDatabase {
  private toolCalls: Map<string, ToolCallRecord> = new Map();
  private sessions: Map<string, any> = new Map();
  private runs: Map<string, any> = new Map();

  async recordToolCall(record: ToolCallRecord): Promise<void> {
    this.toolCalls.set(record.id, record);
    logger.info(`Recorded tool call ${record.id} for tool ${record.toolName}`);
  }

  async createSession(data: {
    id: string;
    workspaceId: string;
    title: string;
    description?: string;
    settings?: Record<string, unknown>;
  }): Promise<any> {
    const session = {
      ...data,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(data.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<any | null> {
    return this.sessions.get(sessionId) || null;
  }

  async createRun(data: {
    id: string;
    sessionId: string;
    workspaceId: string;
    domain?: string;
    config?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<any> {
    const run = {
      ...data,
      domain: data.domain || "general",
      status: "queued",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.runs.set(data.id, run);
    return run;
  }

  async getRun(runId: string): Promise<any | null> {
    return this.runs.get(runId) || null;
  }

  async updateRunStatus(runId: string, status: string, metadata?: Record<string, unknown>): Promise<any> {
    const existing = this.runs.get(runId);
    if (!existing) return null;
    const updated = {
      ...existing,
      status,
      metadata: { ...existing.metadata, ...metadata },
      updatedAt: new Date().toISOString(),
      ...(status === "completed" || status === "failed" || status === "cancelled"
        ? { completedAt: new Date().toISOString() }
        : {}),
    };
    this.runs.set(runId, updated);
    return updated;
  }
}

const globalForHermesDb = globalThis as unknown as {
  hermesDbInstance?: HermesDatabase;
};

export function getHermesDatabase(): HermesDatabase {
  if (!globalForHermesDb.hermesDbInstance) {
    globalForHermesDb.hermesDbInstance = new InMemoryHermesDatabase();
  }
  return globalForHermesDb.hermesDbInstance;
}
