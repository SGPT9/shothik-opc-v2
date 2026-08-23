import fs from "fs";
import path from "path";
import { logger } from "./logger";

export type DshEventType =
  | "session_init"
  | "model_call"
  | "thought_block"
  | "tool_call"
  | "tool_result"
  | "subagent_spawn"
  | "context_compaction"
  | "checkpoint"
  | "session_done"
  | "error";

export interface DshEvent {
  id: string;
  sessionId: string;
  index: number;
  type: DshEventType;
  timestamp: number;
  data: Record<string, any>;
  metadata?: {
    model?: string;
    provider?: string;
    ttftMs?: number;
    tokens?: number;
    durationMs?: number;
  };
}

export interface DshSession {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  status: "active" | "completed" | "forked" | "failed";
  forkedFromSessionId?: string;
  forkedAtEventIndex?: number;
  events: DshEvent[];
  metrics: {
    totalEvents: number;
    totalToolCalls: number;
    totalTokens: number;
    avgTtftMs: number;
  };
}

export class DshRuntimeEngine {
  private static instance: DshRuntimeEngine;
  private sessions: Map<string, DshSession> = new Map();
  private storageFilePath: string;

  constructor(customStoragePath?: string) {
    const cwd = process.cwd();
    const candidateDirs = [
      path.join(cwd, "scratch"),
      path.join(cwd, "../../scratch"),
      path.join(cwd, "tmp"),
      path.join(cwd, ".."),
    ];
    const targetDir = candidateDirs.find((d) => fs.existsSync(d)) || cwd;
    this.storageFilePath = customStoragePath || path.join(targetDir, "dsh-execution-traces.json");
    this.loadFromDisk();
  }

  static getInstance(): DshRuntimeEngine {
    if (!DshRuntimeEngine.instance) {
      DshRuntimeEngine.instance = new DshRuntimeEngine();
    }
    return DshRuntimeEngine.instance;
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        for (const [id, session] of Object.entries(parsed)) {
          this.sessions.set(id, session as DshSession);
        }
        logger.info(`[dsh-runtime] Loaded ${this.sessions.size} sessions from DSH trace journal`);
      }
    } catch (err: any) {
      logger.warn(`[dsh-runtime] Could not load trace journal: ${err.message}`);
    }
  }

  private saveToDisk(): void {
    try {
      const obj: Record<string, DshSession> = {};
      for (const [id, session] of this.sessions.entries()) {
        obj[id] = session;
      }
      fs.writeFileSync(this.storageFilePath, JSON.stringify(obj, null, 2), "utf-8");
    } catch (err: any) {
      logger.warn(`[dsh-runtime] Could not persist trace journal: ${err.message}`);
    }
  }

  async initSession(userId: string, title = "Autonomous Agent Session", initialContext?: Record<string, any>): Promise<DshSession> {
    const now = Date.now();
    const sessionId = `dsh_${now}_${Math.random().toString(36).substring(2, 7)}`;

    const initEvent: DshEvent = {
      id: `evt_${now}_0`,
      sessionId,
      index: 0,
      type: "session_init",
      timestamp: now,
      data: {
        userId,
        title,
        ...(initialContext || {}),
      },
    };

    const session: DshSession = {
      id: sessionId,
      userId,
      title,
      createdAt: now,
      updatedAt: now,
      status: "active",
      events: [initEvent],
      metrics: {
        totalEvents: 1,
        totalToolCalls: 0,
        totalTokens: 0,
        avgTtftMs: 0,
      },
    };

    this.sessions.set(sessionId, session);
    this.saveToDisk();

    logger.info(`[dsh-runtime] Initialized DSH tracked session ${sessionId} for user ${userId}`);
    return session;
  }

  async recordEvent(
    sessionId: string,
    type: DshEventType,
    data: Record<string, any>,
    metadata?: DshEvent["metadata"]
  ): Promise<DshEvent> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`DSH Session ${sessionId} not found`);
    }

    const now = Date.now();
    const eventIndex = session.events.length;
    const event: DshEvent = {
      id: `evt_${now}_${eventIndex}`,
      sessionId,
      index: eventIndex,
      type,
      timestamp: now,
      data,
      metadata,
    };

    session.events.push(event);
    session.updatedAt = now;
    session.metrics.totalEvents = session.events.length;

    if (type === "tool_call") {
      session.metrics.totalToolCalls += 1;
    }
    if (metadata?.tokens) {
      session.metrics.totalTokens += metadata.tokens;
    }
    if (metadata?.ttftMs) {
      const currentAvg = session.metrics.avgTtftMs;
      session.metrics.avgTtftMs = currentAvg === 0 ? metadata.ttftMs : Math.round((currentAvg + metadata.ttftMs) / 2);
    }
    if (type === "session_done") {
      session.status = "completed";
    }

    this.saveToDisk();
    return event;
  }

  async getSession(sessionId: string): Promise<DshSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async listSessions(userId?: string): Promise<DshSession[]> {
    const all = Array.from(this.sessions.values());
    if (userId) {
      return all.filter((s) => s.userId === userId);
    }
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async forkSession(sessionId: string, atEventIndex?: number, forkTitle?: string): Promise<DshSession> {
    const source = this.sessions.get(sessionId);
    if (!source) {
      throw new Error(`Source DSH Session ${sessionId} not found`);
    }

    const cutIndex = atEventIndex !== undefined ? Math.min(atEventIndex, source.events.length - 1) : source.events.length - 1;
    const forkedEvents = source.events.slice(0, cutIndex + 1);

    const now = Date.now();
    const newSessionId = `dsh_fork_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const title = forkTitle || `Fork of ${source.title} (at step ${cutIndex})`;

    const remappedEvents: DshEvent[] = forkedEvents.map((evt, idx) => ({
      ...evt,
      id: `evt_fork_${now}_${idx}`,
      sessionId: newSessionId,
      index: idx,
    }));

    const checkpointEvent: DshEvent = {
      id: `evt_fork_${now}_${remappedEvents.length}`,
      sessionId: newSessionId,
      index: remappedEvents.length,
      type: "checkpoint",
      timestamp: now,
      data: {
        message: `Branch created from session ${sessionId} at event index ${cutIndex}`,
        sourceSessionId: sessionId,
        cutIndex,
      },
    };
    remappedEvents.push(checkpointEvent);

    const forkedSession: DshSession = {
      id: newSessionId,
      userId: source.userId,
      title,
      createdAt: now,
      updatedAt: now,
      status: "active",
      forkedFromSessionId: sessionId,
      forkedAtEventIndex: cutIndex,
      events: remappedEvents,
      metrics: {
        totalEvents: remappedEvents.length,
        totalToolCalls: remappedEvents.filter((e) => e.type === "tool_call").length,
        totalTokens: source.metrics.totalTokens,
        avgTtftMs: source.metrics.avgTtftMs,
      },
    };

    this.sessions.set(newSessionId, forkedSession);
    this.saveToDisk();

    logger.info(`[dsh-runtime] Forked session ${sessionId} into new session ${newSessionId} at index ${cutIndex}`);
    return forkedSession;
  }

  async replaySession(sessionId: string): Promise<{ sessionId: string; timeline: Array<{ step: number; type: DshEventType; timeDeltaMs: number; summary: string }> }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`DSH Session ${sessionId} not found`);
    }

    const firstTime = session.events[0]?.timestamp || session.createdAt;
    const timeline = session.events.map((evt) => {
      let summary = `${evt.type}`;
      if (evt.type === "tool_call") {
        summary = `Tool [${evt.data.tool || "unknown"}] invoked with args: ${JSON.stringify(evt.data.arguments || {})}`;
      } else if (evt.type === "model_call") {
        summary = `Model [${evt.metadata?.model || "deepseek"}] generated response (TTFT: ${evt.metadata?.ttftMs || 0}ms)`;
      } else if (evt.type === "thought_block") {
        summary = `Agent reasoning: ${(evt.data.thought || "").substring(0, 80)}...`;
      } else if (evt.type === "session_init") {
        summary = `Session initialized: ${evt.data.title || "Untitled"}`;
      }
      return {
        step: evt.index,
        type: evt.type,
        timeDeltaMs: evt.timestamp - firstTime,
        summary,
      };
    });

    return {
      sessionId,
      timeline,
    };
  }
}

export const dshRuntime = DshRuntimeEngine.getInstance();
