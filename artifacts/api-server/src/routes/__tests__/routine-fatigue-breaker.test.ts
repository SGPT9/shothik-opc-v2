import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Routine Fatigue Circuit Breaker & 15-Minute Floor (Capability 2)", { timeout: 25000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("enforces 15-minute (900s) floor on routine registration", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/routines/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "routine_fast_test",
        name: "Fast Courier Polling",
        category: "Logistics",
        intervalSeconds: 60, // 1 minute (should clamp to 900s)
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.routine.intervalSeconds).toBe(900);
    expect(body.data.enforced15MinFloor).toBe(true);
  });

  it("trips to FATIGUE_PAUSED after 10 consecutive failures and rejects subsequent calls", async () => {
    const routineId = "routine_fatigue_trip_test";

    // 1. Register routine
    await fetch(`${baseUrl}/api/v1/twin/routines/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: routineId,
        name: "bKash Webhook Listener",
        category: "Finance",
        intervalSeconds: 900,
      }),
    });

    // 2. Trigger 9 consecutive failures
    for (let i = 1; i <= 9; i++) {
      const failRes = await fetch(`${baseUrl}/api/v1/twin/routines/${routineId}/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceFailure: true, errorMessage: `Transient error ${i}` }),
      });
      expect(failRes.status).toBe(500);
      const failBody = await failRes.json();
      expect(failBody.data.routine.consecutiveFailures).toBe(i);
      expect(failBody.data.tripped).toBe(false);
    }

    // 3. 10th failure must trip FATIGUE_PAUSED
    const tripRes = await fetch(`${baseUrl}/api/v1/twin/routines/${routineId}/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forceFailure: true, errorMessage: "10th fatal error" }),
    });
    expect(tripRes.status).toBe(500);
    const tripBody = await tripRes.json();
    expect(tripBody.data.tripped).toBe(true);
    expect(tripBody.data.routine.status).toBe("FATIGUE_PAUSED");
    expect(tripBody.data.alert).toBeDefined();

    // 4. 11th trigger must be rejected with 429
    const blockedRes = await fetch(`${baseUrl}/api/v1/twin/routines/${routineId}/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(blockedRes.status).toBe(429);
    const blockedBody = await blockedRes.json();
    expect(blockedBody.error).toContain("FATIGUE_PAUSED");

    // 5. Merchant reset returns status to ACTIVE
    const resetRes = await fetch(`${baseUrl}/api/v1/twin/routines/${routineId}/reset`, {
      method: "POST",
    });
    expect(resetRes.status).toBe(200);
    const resetBody = await resetRes.json();
    expect(resetBody.data.routine.status).toBe("ACTIVE");
    expect(resetBody.data.routine.consecutiveFailures).toBe(0);
  });

  it("drains overdue backlog silently without burst firing", async () => {
    const drainRes = await fetch(`${baseUrl}/api/v1/twin/routines/drain-backlog`, {
      method: "POST",
    });
    expect(drainRes.status).toBe(200);
    const drainBody = await drainRes.json();
    expect(drainBody.success).toBe(true);
    expect(Array.isArray(drainBody.data.routines)).toBe(true);
  });
});
