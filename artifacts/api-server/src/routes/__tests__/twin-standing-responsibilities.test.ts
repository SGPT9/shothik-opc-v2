import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Capability 5: Standing Responsibilities Registry per Specialized Twin", { timeout: 25000 }, () => {
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

  it("GET /api/v1/twin/responsibilities lists all standing responsibilities", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/responsibilities`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(10);
    expect(body.data.some((r: any) => r.id === "resp_finance_vat_mfs")).toBe(true);
  });

  it("GET /api/v1/twin/responsibilities?twinId=finance_twin filters by specialized twin", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/responsibilities?twinId=finance_twin`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.every((r: any) => r.twinId === "finance_twin")).toBe(true);
    expect(body.data[0].id).toBe("resp_finance_vat_mfs");
  });

  it("POST /api/v1/twin/responsibilities/:id/toggle toggles enabled state", async () => {
    const toggleRes = await fetch(`${baseUrl}/api/v1/twin/responsibilities/resp_logistics_rto_fraud/toggle`, {
      method: "POST",
    });
    expect(toggleRes.status).toBe(200);
    const toggleBody = await toggleRes.json();
    expect(toggleBody.success).toBe(true);
    const originalState = toggleBody.data.enabled;

    // Toggle back
    const restoreRes = await fetch(`${baseUrl}/api/v1/twin/responsibilities/resp_logistics_rto_fraud/toggle`, {
      method: "POST",
    });
    const restoreBody = await restoreRes.json();
    expect(restoreBody.data.enabled).toBe(!originalState);
  });

  it("POST /api/v1/twin/responsibilities/:id/trigger executes standing responsibility", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/responsibilities/resp_developer_ci_vuln/trigger`, {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.executionLog).toContain("Continuous Git/CI Integrity");
    expect(body.data.id).toBe("resp_developer_ci_vuln");
    expect(body.data.lastStatus).toBe("healthy");
    expect(body.data.consecutiveFailures).toBe(0);
  });

  it("GET /api/v1/twin/specialized-twins includes standingResponsibilities on each twin", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/specialized-twins?companySlug=fintech-dhaka`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const financeTwin = body.data.find((t: any) => t.id === "finance_twin");
    expect(financeTwin).toBeDefined();
    expect(financeTwin.standingResponsibilities).toBeDefined();
    expect(financeTwin.standingResponsibilities.length).toBeGreaterThanOrEqual(1);
    expect(financeTwin.standingResponsibilities[0].id).toBe("resp_finance_vat_mfs");
  });
});
