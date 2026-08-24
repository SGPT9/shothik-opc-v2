import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { semanticMemory } from "../../lib/semantic-memory.js";
import { ragEngine } from "../../lib/rag-engine.js";
import { dshRuntime } from "../../lib/dsh-runtime.js";

describe("Shothik Platform End-to-End Autonomous Pipeline Integration", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    ragEngine.clearStore();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    ragEngine.clearStore();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("executes full autonomous lifecycle: Memorize -> Ingest RAG -> Deliberate Swarm -> Execute Sandbox -> Trace DSH", async () => {
    const userId = "usr_e2e_founder_1";

    // 1. Memorize user preference
    const memRes = await fetch(`${baseUrl}/api/memory/memorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        content: "Company is Dhaka Express, logistics partner is Steadfast, primary MFS is bKash.",
        category: "project_context",
      }),
    });
    expect(memRes.status).toBe(201);

    // 2. Ingest Architecture Spec into RAG Vector Store
    const ragRes = await fetch(`${baseUrl}/api/v1/rag/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: "Steadfast & bKash Spec",
        content: "Automated cash-on-delivery parcel booking with bKash 10-digit TrxID verification.",
        sourceType: "markdown",
      }),
    });
    expect(ragRes.status).toBe(201);
    const ragJson = (await ragRes.json()) as any;
    expect(ragJson.document.id).toBeDefined();

    // 3. Query RAG to verify retrieval
    const queryRes = await fetch(`${baseUrl}/api/v1/rag/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        query: "Steadfast bKash parcel booking",
        topK: 1,
      }),
    });
    expect(queryRes.status).toBe(200);
    const queryJson = (await queryRes.json()) as any;
    expect(queryJson.results.length).toBeGreaterThan(0);

    // 4. Run 5-Agent Swarm Deliberation (which records in DSH)
    const swarmRes = await fetch(`${baseUrl}/api/v1/swarm/deliberate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        goal: "Deploy automated bKash reconciliation and Steadfast courier booking for Dhaka Express",
      }),
    });
    expect(swarmRes.status).toBe(200);
    const swarmJson = (await swarmRes.json()) as any;
    expect(swarmJson.success).toBe(true);
    expect(swarmJson.summary.allPassed).toBe(true);
    expect(swarmJson.sessionId).toMatch(/^dsh_/);

    // 5. Execute code calculation in Isolated Sandbox
    const sandboxRes = await fetch(`${baseUrl}/api/v1/sandbox/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        code: `
          const deliveryCharge = 60;
          const orderValue = 1850;
          const total = orderValue + deliveryCharge;
          console.log(JSON.stringify({ orderValue, deliveryCharge, total }));
        `,
      }),
    });
    expect(sandboxRes.status).toBe(200);
    const sandboxJson = (await sandboxRes.json()) as any;
    expect(sandboxJson.result.stdout).toContain('"total":1910');

    // 6. Verify DSH Session Replay contains all subagent and trace events
    const dshRes = await fetch(`${baseUrl}/api/v1/dsh/sessions/${swarmJson.sessionId}/replay`);
    expect(dshRes.status).toBe(200);
    const dshJson = (await dshRes.json()) as any;
    expect(dshJson.success).toBe(true);
    expect(dshJson.replay.timeline.length).toBeGreaterThanOrEqual(2);
  });
});
