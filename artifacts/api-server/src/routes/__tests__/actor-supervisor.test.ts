import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { actorSupervisor } from "../../lib/twin/actor-supervisor";

describe("Pillar 3: Erlang/OTP Actor Supervision Tree for Specialized Twins", { timeout: 25000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    // Register test twin actors
    actorSupervisor.spawnActor<{ counter: number; logs: string[] }>({
      actorId: "test_sales_twin",
      type: "sales_twin",
      maxMailboxSize: 5,
      initialState: () => ({ counter: 0, logs: [] }),
      handler: async (state, msg) => {
        if (msg.type === "EXPLODE") {
          throw new Error("Simulated Sales Twin LLM Context Overflow!");
        }
        if (msg.type === "INCREMENT") {
          return {
            newState: {
              counter: state.counter + (msg.payload.amount || 1),
              logs: [...state.logs, `inc_${msg.payload.amount || 1}`],
            },
            result: state.counter + (msg.payload.amount || 1),
          };
        }
        return { newState: state };
      },
    });

    actorSupervisor.spawnActor<{ healthy: boolean }>({
      actorId: "test_logistics_twin",
      type: "operations_twin",
      initialState: () => ({ healthy: true }),
      handler: async (state) => ({ newState: state }),
    });
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("lists all registered supervised actors with health states", async () => {
    const res = await fetch(`${baseUrl}/api/v1/actors`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(2);

    const sales = body.data.find((a: any) => a.actorId === "test_sales_twin");
    expect(sales).toBeDefined();
    expect(sales.status).toBe("IDLE");
    expect(sales.state.counter).toBe(0);
  });

  it("processes messages through private actor mailbox", async () => {
    const sendRes = await fetch(`${baseUrl}/api/v1/actors/test_sales_twin/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "INCREMENT",
        payload: { amount: 5 },
      }),
    });

    expect(sendRes.status).toBe(200);
    const sendBody = await sendRes.json();
    expect(sendBody.success).toBe(true);

    // Wait a brief tick for async mailbox pump
    await new Promise((r) => setTimeout(r, 50));

    const detailRes = await fetch(`${baseUrl}/api/v1/actors/test_sales_twin`);
    expect(detailRes.status).toBe(200);
    const detailBody = await detailRes.json();
    expect(detailBody.data.state.counter).toBe(5);
    expect(detailBody.data.processedCount).toBeGreaterThanOrEqual(1);
  });

  it("contains crash without affecting other actors, routes message to DLQ, and hot-restarts actor", async () => {
    // Check healthy neighbor before crash
    const neighborBefore = actorSupervisor.getActorState("test_logistics_twin");
    expect(neighborBefore?.status).toBe("IDLE");

    // Send poison pill to sales twin
    await fetch(`${baseUrl}/api/v1/actors/test_sales_twin/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "EXPLODE",
      }),
    });

    // Wait for crash containment and restart
    await new Promise((r) => setTimeout(r, 60));

    const salesAfter = await (await fetch(`${baseUrl}/api/v1/actors/test_sales_twin`)).json();
    expect(salesAfter.data.crashCount).toBeGreaterThanOrEqual(1);
    expect(salesAfter.data.lastCrashReason).toContain("Simulated Sales Twin LLM Context Overflow");
    expect(salesAfter.data.deadLetterCount).toBeGreaterThanOrEqual(1);
    expect(salesAfter.data.deadLetters[0].error).toContain("Simulated Sales Twin LLM Context Overflow");
    // State reset to clean baseline (0)
    expect(salesAfter.data.state.counter).toBe(0);
    // Neighbor twin remained completely unaffected
    const neighborAfter = actorSupervisor.getActorState("test_logistics_twin");
    expect(neighborAfter?.status).toBe("IDLE");
  });

  it("enforces backpressure rejecting messages when mailbox exceeds capacity", async () => {
    // Actor maxMailboxSize is 5
    // Enqueue 5 messages quickly
    for (let i = 0; i < 5; i++) {
      actorSupervisor.send("test_sales_twin", {
        type: "INCREMENT",
        payload: { amount: 1 },
      });
    }

    // Next send through API should either be processed or if still in queue reject
    const overflowActorId = "test_backpressure_twin";
    actorSupervisor.spawnActor({
      actorId: overflowActorId,
      type: "custom",
      maxMailboxSize: 2,
      initialState: () => ({}),
      handler: async (state) => {
        // Sleep 150ms to simulate slow operation
        await new Promise((r) => setTimeout(r, 150));
        return { newState: state };
      },
    });

    // Fill mailbox
    actorSupervisor.send(overflowActorId, { type: "A", payload: {} });
    actorSupervisor.send(overflowActorId, { type: "B", payload: {} });

    // 3rd message should trigger backpressure error
    const res = await fetch(`${baseUrl}/api/v1/actors/${overflowActorId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "C", payload: {} }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("SEND_FAILED");
    expect(body.error.message).toContain("exceeded max capacity");
  });

  it("quarantines actor when exceeding max restarts in window", async () => {
    const unstableActorId = "test_unstable_twin";
    actorSupervisor.spawnActor({
      actorId: unstableActorId,
      type: "unstable",
      maxMailboxSize: 20,
      initialState: () => ({}),
      handler: async () => {
        throw new Error("Chronic crash loop");
      },
    });

    // Send 4 rapid poison messages (maxRestarts is 3 in supervisor)
    for (let i = 0; i < 4; i++) {
      try {
        actorSupervisor.send(unstableActorId, { type: "CRASH", payload: {} });
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 30));
    }

    const state = actorSupervisor.getActorState(unstableActorId);
    expect(state?.status).toBe("QUARANTINED");

    // Any further messages rejected
    const res = await fetch(`${baseUrl}/api/v1/actors/${unstableActorId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "PING", payload: {} }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("is QUARANTINED");
  });
});
