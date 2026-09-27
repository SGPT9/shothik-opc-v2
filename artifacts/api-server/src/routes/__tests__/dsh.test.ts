import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import fs from "fs";
import path from "path";
import app from "../../app.js";
import { DshRuntimeEngine } from "../../lib/dsh-runtime.js";

describe("DeepSeek Harness (DSH) Execution Trace Engine Suite", () => {
  const testJournalPath = path.join(process.cwd(), "test-dsh-traces.json");
  let testDshEngine: DshRuntimeEngine;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    if (fs.existsSync(testJournalPath)) {
      fs.unlinkSync(testJournalPath);
    }
    testDshEngine = new DshRuntimeEngine(testJournalPath);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (fs.existsSync(testJournalPath)) {
      fs.unlinkSync(testJournalPath);
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("initializes a session and records append-only lifecycle events", async () => {
    const session = await testDshEngine.initSession("usr_dsh_001", "Celestia Node Audit Task");
    expect(session.id).toMatch(/^dsh_/);
    expect(session.events.length).toBe(1);
    expect(session.events[0].type).toBe("session_init");

    // Record model call
    const modelEvent = await testDshEngine.recordEvent(
      session.id,
      "model_call",
      { prompt: "Audit ports 26656 and 26657" },
      { model: "deepseek-r1", ttftMs: 85, tokens: 240 }
    );
    expect(modelEvent.index).toBe(1);

    // Record tool call
    const toolEvent = await testDshEngine.recordEvent(
      session.id,
      "tool_call",
      { tool: "server-node-port-audit", arguments: { host: "127.0.0.1" } }
    );
    expect(toolEvent.index).toBe(2);

    const updated = await testDshEngine.getSession(session.id);
    expect(updated?.events.length).toBe(3);
    expect(updated?.metrics.totalToolCalls).toBe(1);
    expect(updated?.metrics.totalTokens).toBe(240);
  });

  it("supports forking a session from a past event index for speculative branching", async () => {
    const session = await testDshEngine.initSession("usr_dsh_002", "Commerce Workflow Exploration");

    await testDshEngine.recordEvent(session.id, "thought_block", { thought: "Exploring bKash vs Nagad options" });
    await testDshEngine.recordEvent(session.id, "tool_call", { tool: "mfs-verify", arguments: { method: "bkash" } });
    await testDshEngine.recordEvent(session.id, "tool_result", { success: true, verified: true });

    // Fork from index 1 (thought_block) to test an alternative path (Nagad)
    const forked = await testDshEngine.forkSession(session.id, 1, "Branch B: Nagad Alternative");
    expect(forked.id).toMatch(/^dsh_fork_/);
    expect(forked.forkedFromSessionId).toBe(session.id);
    expect(forked.forkedAtEventIndex).toBe(1);
    // 0: init, 1: thought, 2: checkpoint
    expect(forked.events.length).toBe(3);
    expect(forked.events[2].type).toBe("checkpoint");
  });

  it("replays a session step-by-step with structured timeline and time deltas", async () => {
    const session = await testDshEngine.initSession("usr_dsh_003", "Full Replay Verification");
    await testDshEngine.recordEvent(session.id, "thought_block", { thought: "Inspecting database schema" });
    await testDshEngine.recordEvent(session.id, "session_done", { status: "success" });

    const replay = await testDshEngine.replaySession(session.id);
    expect(replay.sessionId).toBe(session.id);
    expect(replay.timeline.length).toBe(3);
    expect(replay.timeline[0].step).toBe(0);
    expect(replay.timeline[0].type).toBe("session_init");
    expect(replay.timeline[2].type).toBe("session_done");
  });

  it("handles full HTTP REST API endpoints (/api/v1/dsh/*)", async () => {
    // 1. Init session
    const initRes = await fetch(`${baseUrl}/api/v1/dsh/sessions/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "usr_api_777", title: "API E2E Test" }),
    });
    expect(initRes.status).toBe(201);
    const initJson = (await initRes.json()) as any;
    const sessionId = initJson.session.id;

    // 2. Record event
    const eventRes = await fetch(`${baseUrl}/api/v1/dsh/sessions/${sessionId}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "tool_call",
        data: { tool: "steadfast-dispatch", arguments: { parcelId: "PK_99" } },
      }),
    });
    expect(eventRes.status).toBe(201);

    // 3. Get trace
    const traceRes = await fetch(`${baseUrl}/api/v1/dsh/sessions/${sessionId}/trace`);
    expect(traceRes.status).toBe(200);
    const traceJson = (await traceRes.json()) as any;
    expect(traceJson.session.events.length).toBe(2);

    // 4. Replay
    const replayRes = await fetch(`${baseUrl}/api/v1/dsh/sessions/${sessionId}/replay`);
    expect(replayRes.status).toBe(200);
    const replayJson = (await replayRes.json()) as any;
    expect(replayJson.replay.timeline.length).toBe(2);

    // 5. Fork
    const forkRes = await fetch(`${baseUrl}/api/v1/dsh/sessions/${sessionId}/fork`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atEventIndex: 0 }),
    });
    expect(forkRes.status).toBe(201);
    const forkJson = (await forkRes.json()) as any;
    expect(forkJson.forkedSession.forkedFromSessionId).toBe(sessionId);
  }, 15000);
});
