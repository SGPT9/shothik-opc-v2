import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import http from "http";
import twinTasksRouter from "../twin-tasks.js";

describe("Twin Specialized Swarm & OPC Workers Test Suite", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", twinTasksRouter);

    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("GET /api/v1/twin/specialized-twins returns the complete 10 Specialized Twins roster", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/specialized-twins?companySlug=fintech-dhaka`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(10);

    const ids = body.data.map((t: any) => t.id);
    expect(ids).toContain("marketing_twin");
    expect(ids).toContain("sales_twin");
    expect(ids).toContain("customer_support_twin");
    expect(ids).toContain("crm_twin");
    expect(ids).toContain("finance_twin");
    expect(ids).toContain("operations_twin");
    expect(ids).toContain("content_twin");
    expect(ids).toContain("analytics_twin");
    expect(ids).toContain("administration_twin");
    expect(ids).toContain("developer_twin");

    for (const twin of body.data) {
      expect(twin.companySlug).toBe("fintech-dhaka");
      expect(twin.capabilities.length).toBeGreaterThan(0);
      expect(["idle", "observing", "executing", "learning"]).toContain(twin.status);
    }
  });

  it("POST /api/v1/twin/specialized-twins/dispatch executes targeted autonomous cycle for customer_support_twin", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/specialized-twins/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        twinId: "customer_support_twin",
        companySlug: "fintech-dhaka",
        taskTitle: "Triage Sylheti remittance inquiry on WhatsApp",
        customDirective: "Use Sylheti dialect adapter and reassure delivery timeline",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.twinId).toBe("customer_support_twin");
    expect(body.data.twinName).toBe("Customer Support Twin");
    expect(body.data.status).toBe("completed");
    expect(body.data.executionLog).toContain("Customer Support Twin");
    expect(body.data.cycleResult).toBeDefined();
    expect(body.data.cycleResult.cycleId).toBeDefined();
  });

  it("POST /api/v1/twin/specialized-twins/dispatch returns 404 for invalid twinId", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/specialized-twins/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        twinId: "non_existent_super_twin",
        companySlug: "fintech-dhaka",
      }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("not found");
  });
});
