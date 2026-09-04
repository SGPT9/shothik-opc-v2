import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Twin Auto Mode Lifecycle API (Away / Overnight Execution)", { timeout: 25000 }, () => {
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

  const testSlug = "sylhet_crafts";

  it("POST /api/v1/twin/auto-mode/start activates Auto Mode, executes queued tasks, triggers 5-stage cycle, and compiles CEO Briefing", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/auto-mode/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hours: 4,
        companySlug: testSlug,
        companyName: "Sylhet Crafts OPC",
        userId: "usr_founder_auto_test",
        tasks: [
          {
            id: "task_auto_1",
            title: "Automate Steadfast Courier consignment generation",
            category: "Ops",
            urgency: "P0",
            costCredits: 1,
          },
          {
            id: "task_auto_2",
            title: "Publish UK/US remittance campaign to LinkedIn",
            category: "Marketing",
            urgency: "P1",
            costCredits: 1,
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify Session
    expect(body.data.session.active).toBe(true);
    expect(body.data.session.durationHours).toBe(4);
    expect(body.data.session.tasksCompleted).toBe(2);
    expect(body.data.session.creditsDeducted).toBeGreaterThanOrEqual(2);

    // Verify Executed Tasks
    expect(body.data.executedTasks.length).toBe(2);
    expect(body.data.executedTasks[0].commitHash).toMatch(/^shk_/);
    expect(body.data.executedTasks[0].standupLog).toContain("Logistics Setup Shipped");

    // Verify 5-Stage Twin Cycle
    expect(body.data.twinCycle.cycleId).toMatch(/^twin_cyc_/);
    expect(body.data.twinCycle.executionStatus).toBe("executed_autonomously");

    // Verify Nightshift CEO Away Briefing
    expect(body.data.digest.skillsExecuted.length).toBe(4);
    expect(body.data.digest.overallHealthScore).toBeGreaterThanOrEqual(90);
  });

  it("GET /api/v1/twin/auto-mode/status returns active session details and remaining countdown", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/auto-mode/status?companySlug=${testSlug}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.active).toBe(true);
    expect(body.data.remainingSeconds).toBeGreaterThan(0);
    expect(body.data.isExpired).toBe(false);
  });

  it("POST /api/v1/twin/auto-mode/stop cleanly disengages Auto Mode", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/auto-mode/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companySlug: testSlug }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.active).toBe(false);

    // Check status confirms inactive
    const statusRes = await fetch(`${baseUrl}/api/v1/twin/auto-mode/status?companySlug=${testSlug}`);
    const statusBody = await statusRes.json();
    expect(statusBody.data.active).toBe(false);
  });
});
