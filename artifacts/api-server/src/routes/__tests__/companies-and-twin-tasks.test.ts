import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Multi-Venture Autonomous Company & Wayfinder Task API", { timeout: 25000 }, () => {
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

  const testCompany = {
    name: "Barishal Agro Direct",
    industry: "F-Commerce & Agriculture",
    businessModel: "Direct-to-Consumer COD",
    problemStatement: "Direct farm logistics to Dhaka retailers with automated COD remittance tracking",
  };

  let createdSlug = "";

  it("POST /api/v1/twin/companies creates a new autonomous company with Wayfinder tasks and PRD", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "usr_test_founder",
      },
      body: JSON.stringify(testCompany),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Barishal Agro Direct");
    expect(body.data.slug).toBe("barishal-agro-direct");
    expect(body.data.domain).toBe("https://barishal-agro-direct.shothikgpt.com");
    expect(body.data.tasks.length).toBeGreaterThan(0);
    expect(body.data.docs.length).toBeGreaterThan(0);

    createdSlug = body.data.slug;
  });

  it("GET /api/v1/twin/companies lists all companies for user", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/companies`, {
      headers: { "x-user-id": "usr_test_founder" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    const found = body.data.find((c: any) => c.slug === createdSlug);
    expect(found).toBeDefined();
  });

  it("GET /api/v1/twin/companies/:slug retrieves specific company state", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/companies/${createdSlug}`, {
      headers: { "x-user-id": "usr_test_founder" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Barishal Agro Direct");
    expect(body.data.email).toBe("founder@barishal-agro-direct.shothik.ai");
  });

  it("PATCH /api/v1/twin/companies/:slug updates metrics and pause state", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/companies/${createdSlug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "usr_test_founder",
      },
      body: JSON.stringify({
        revenueBdt: 89000,
        visitorCount: 450,
        isPaused: true,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.revenueBdt).toBe(89000);
    expect(body.data.visitorCount).toBe(450);
    expect(body.data.isPaused).toBe(true);
  });

  it("POST /api/v1/twin/tasks/execute autonomously runs a single Wayfinder task and generates commit", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/tasks/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companySlug: createdSlug,
        companyName: "Barishal Agro Direct",
        taskId: "task-1",
        title: "Configure Steadfast Courier auto-dispatch webhook",
        category: "Ops",
        urgency: "P0",
        costCredits: 1,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.taskId).toBe("task-1");
    expect(body.data.commitHash).toMatch(/^shk_/);
    expect(body.data.executionSteps.length).toBeGreaterThan(0);
    expect(body.data.standupLog).toContain("Logistics Setup Shipped");
  });

  it("POST /api/v1/twin/tasks/batch-run executes multiple queued tasks in Auto Mode", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/tasks/batch-run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companySlug: createdSlug,
        companyName: "Barishal Agro Direct",
        maxTasks: 2,
        tasks: [
          {
            id: "task-101",
            title: "Wire 1-Tap bKash TrxID listener",
            category: "Finance",
            costCredits: 1,
          },
          {
            id: "task-102",
            title: "Deploy Twitter/X announcement thread",
            category: "Marketing",
            costCredits: 1,
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.completedCount).toBe(2);
    expect(body.data.totalCreditsDeducted).toBe(2);
    expect(body.data.executions.length).toBe(2);
  });
});
