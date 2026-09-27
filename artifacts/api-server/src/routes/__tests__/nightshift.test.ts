import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Nightshift Autonomous 2:00 AM Swarm Engine Suite", () => {
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

  it("POST /api/v1/nightshift/run-cycle executes all 5 nocturnal pipelines and returns a CEO Morning Digest", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nightshift/run-cycle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_ceo_test",
        projectName: "VerifiQ AI Ecosystem",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.cycleId).toMatch(/^ns_cycle_/);
    expect(json.skillsExecutedCount).toBe(5);
    expect(json.overallHealthScore).toBeGreaterThanOrEqual(90);
    expect(json.topActionItems.length).toBeGreaterThan(0);
    expect(json.digest.markdownReport).toContain("CEO Morning Briefing");
  });

  it("GET /api/v1/nightshift/latest-digest retrieves the latest morning digest", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nightshift/latest-digest`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.digest).toBeDefined();
    expect(json.digest.skillsExecuted.length).toBe(5);
  });

  it("GET /api/v1/nightshift/status returns scheduler state and 2:00 AM countdown", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nightshift/status`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.status.active).toBe(true);
    expect(json.status.scheduleDescription).toContain("02:00 AM");
    expect(json.status.totalRuns).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/v1/nightshift/history returns historical execution logs", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nightshift/history`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.history)).toBe(true);
  });
});
