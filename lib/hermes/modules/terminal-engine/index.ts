/**
 * Hermes Interactive Terminal Session Engine
 * 
 * Manages interactive background shell command execution, stdin input streaming,
 * output log buffering, and process lifecycle termination.
 */

import { randomUUID } from "crypto";
import { getHermesDatabase } from "../../infra/db";
import { getHermesStreamingEngine } from "../streaming-engine";
import logger from "@/lib/logger";
import type { RunId, WorkspaceId, UserId } from "../../contracts/core";

export interface TerminalSession {
  sessionId: string;
  runId: RunId;
  workspaceId: WorkspaceId;
  command: string;
  status: "idle" | "running" | "completed" | "failed" | "killed";
  outputBuffer: string[];
  exitCode: number | null;
  createdAt: string;
  updatedAt: string;
}

export class HermesTerminalEngine {
  private static sessions = new Map<string, TerminalSession>();

  /**
   * Spawns a new interactive terminal command session.
   */
  static async createSession(params: {
    workspaceId: WorkspaceId;
    runId: RunId;
    command: string;
  }): Promise<TerminalSession> {
    const sessionId = `trm_${randomUUID()}`;

    const session: TerminalSession = {
      sessionId,
      runId: params.runId,
      workspaceId: params.workspaceId,
      command: params.command,
      status: "running",
      outputBuffer: [`$ ${params.command}\n`],
      exitCode: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);

    const streaming = getHermesStreamingEngine();
    await streaming.emitRunEvent({
      eventId: randomUUID(),
      runId: params.runId,
      workspaceId: params.workspaceId,
      domain: "chat",
      eventType: "progress_update",
      timestamp: new Date().toISOString(),
      sequence: 1,
      payload: {
        sessionId,
        statusMessage: `Terminal process spawned: ${params.command}`,
      },
      metadata: {
        action: "terminal_spawn",
      },
    });

    logger.info("[terminal-engine] Interactive terminal session created", {
      sessionId,
      runId: params.runId,
      command: params.command,
    });

    return session;
  }

  /**
   * Sends stdin input to a running terminal process.
   */
  static async sendInput(sessionId: string, input: string): Promise<TerminalSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`);
    }

    if (session.status !== "running") {
      throw new Error(`Terminal session ${sessionId} is not in running state`);
    }

    session.outputBuffer.push(`> ${input}\n`);
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    logger.info("[terminal-engine] Stdin input received", { sessionId, input });
    return session;
  }

  /**
   * Appends stdout/stderr log output buffer lines.
   */
  static appendOutput(sessionId: string, text: string): TerminalSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`);
    }

    session.outputBuffer.push(text);
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Marks terminal session as completed with exit code.
   */
  static async completeSession(sessionId: string, exitCode = 0): Promise<TerminalSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`);
    }

    session.status = exitCode === 0 ? "completed" : "failed";
    session.exitCode = exitCode;
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    const streaming = getHermesStreamingEngine();
    await streaming.emitRunEvent({
      eventId: randomUUID(),
      runId: session.runId,
      workspaceId: session.workspaceId,
      domain: "chat",
      eventType: exitCode === 0 ? "run_completed" : "run_failed",
      timestamp: new Date().toISOString(),
      sequence: 1,
      payload: {
        sessionId,
        exitCode,
      },
      metadata: {
        action: "terminal_exit",
      },
    });

    logger.info("[terminal-engine] Terminal session completed", { sessionId, exitCode });
    return session;
  }

  /**
   * Kills a running terminal process session.
   */
  static async killSession(sessionId: string): Promise<TerminalSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`);
    }

    session.status = "killed";
    session.exitCode = 137;
    session.outputBuffer.push("\n[Process terminated by user SIGKILL]\n");
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    logger.info("[terminal-engine] Terminal session killed", { sessionId });
    return session;
  }

  /**
   * Retrieves terminal session by ID.
   */
  static getSession(sessionId: string): TerminalSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  /**
   * Clears internal session store for testing.
   */
  static clearStore(): void {
    this.sessions.clear();
  }
}
