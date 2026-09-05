import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { canaryTrafficDirectorEngine } from "../../lib/canary-traffic-director.js";

describe("Autonomous Self-Healing Canary & Traffic Director (/api/v1/traffic/canary)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    canaryTrafficDirectorEngine.resetToBaseline();
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

  it("1. GET /api/v1/traffic/canary/status returns active canary deployment, blue/green split, and SLO metrics", async () => {
    const res = await fetch(`${baseUrl}/api/v1/traffic/canary/status`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.stableVersion).toBe("v2.4.0");
    expect(json.trafficSplit.stablePercent).toBe(90);
    expect(json.trafficSplit.canaryPercent).toBe(10);
    expect(json.activeDeployment).toBeDefined();
    expect(json.activeDeployment.status).toBe("CANARY_ROUTING");
    expect(json.sloThresholds.maxErrorRatePercent).toBe(1.5);
    expect(json.sloThresholds.maxP95LatencyMs).toBe(250);
  });

  it("2. POST /api/v1/traffic/canary/deploy provisions a new canary candidate and validates payload", async () => {
    // Missing candidateVersion should return 400
    const invalidRes = await fetch(`${baseUrl}/api/v1/traffic/canary/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(invalidRes.status).toBe(400);

    // Valid deployment
    const res = await fetch(`${baseUrl}/api/v1/traffic/canary/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateVersion: "v2.5.0-rc1",
        targetService: "api-server-mesh",
        commitSha: "a1b2c3d4",
        initialWeight: 15,
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.deployment.candidateVersion).toBe("v2.5.0-rc1");
    expect(json.deployment.trafficWeightPercent).toBe(15);
    expect(json.deployment.status).toBe("CANARY_ROUTING");
  });

  it("3. POST /api/v1/traffic/canary/adjust-weight dynamically shifts traffic weight between Blue and Green", async () => {
    const res = await fetch(`${baseUrl}/api/v1/traffic/canary/adjust-weight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: 35 }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.deployment.trafficWeightPercent).toBe(35);

    // Verify status reflects updated split
    const statusRes = await fetch(`${baseUrl}/api/v1/traffic/canary/status`);
    const statusJson = (await statusRes.json()) as any;
    expect(statusJson.trafficSplit.canaryPercent).toBe(35);
    expect(statusJson.trafficSplit.stablePercent).toBe(65);
  });

  it("4. POST /api/v1/traffic/canary/promote promotes canary to 100% production baseline", async () => {
    const res = await fetch(`${baseUrl}/api/v1/traffic/canary/promote`, {
      method: "POST",
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.deployment.status).toBe("PROMOTED");
    expect(json.deployment.trafficWeightPercent).toBe(100);

    // Verify candidate became the new stable baseline
    const statusRes = await fetch(`${baseUrl}/api/v1/traffic/canary/status`);
    const statusJson = (await statusRes.json()) as any;
    expect(statusJson.stableVersion).toBe("v2.4.1-rc1");
  });

  it("5. POST /api/v1/traffic/canary/rollback instantly drops canary traffic to 0%", async () => {
    const res = await fetch(`${baseUrl}/api/v1/traffic/canary/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Manual operator sanity check rollback" }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.deployment.status).toBe("ROLLED_BACK");
    expect(json.deployment.trafficWeightPercent).toBe(0);

    // Check status reflects 100% stable traffic
    const statusRes = await fetch(`${baseUrl}/api/v1/traffic/canary/status`);
    const statusJson = (await statusRes.json()) as any;
    expect(statusJson.trafficSplit.canaryPercent).toBe(0);
    expect(statusJson.trafficSplit.stablePercent).toBe(100);
    expect(statusJson.recentRollbacks.length).toBeGreaterThanOrEqual(1);
  });

  it("6. Autonomous Self-Healing: POST /api/v1/traffic/canary/simulate-anomaly triggers circuit breaker rollback", async () => {
    // Inactive or active canary with 10% traffic
    const res = await fetch(`${baseUrl}/api/v1/traffic/canary/simulate-anomaly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ERROR_SPIKE" }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.circuitBreakerTriggered).toBe(true);
    expect(json.rollbackEvent).toBeDefined();
    expect(json.rollbackEvent.trigger).toBe("ERROR_RATE_SPIKE");
    expect(json.rollbackEvent.newWeight).toBe(0);

    // Verify deployment is rolled back
    const statusRes = await fetch(`${baseUrl}/api/v1/traffic/canary/status`);
    const statusJson = (await statusRes.json()) as any;
    expect(statusJson.activeDeployment.status).toBe("ROLLED_BACK");
    expect(statusJson.trafficSplit.canaryPercent).toBe(0);
    expect(statusJson.trafficSplit.stablePercent).toBe(100);
  });

  it("7. GET /api/v1/traffic/canary/telemetry returns historical SLO metrics", async () => {
    const res = await fetch(`${baseUrl}/api/v1/traffic/canary/telemetry?limit=15`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBeGreaterThanOrEqual(10);
    expect(json.history[0].requestsPerSec).toBeGreaterThan(0);
  });
});
