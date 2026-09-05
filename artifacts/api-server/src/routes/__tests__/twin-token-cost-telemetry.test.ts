import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import http from "http";
import twinTasksRouter from "../twin-tasks.js";
import { tokenCostTracker, USD_TO_BDT_RATE } from "../../lib/token-cost-tracker.js";

describe("Twin Token & Cost Telemetry Engine", () => {
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

  beforeEach(() => {
    tokenCostTracker.reset();
  });

  it("calculates 0 cost and positive savings for Tier 1 WebGPU on-device execution", () => {
    const record = tokenCostTracker.recordUsage({
      modelOrTier: "tier1_webgpu",
      promptTokens: 1000,
      completionTokens: 500,
      twinId: "marketing_twin",
    });

    expect(record.costUsd).toBe(0);
    expect(record.costBdt).toBe(0);
    expect(record.savedUsd).toBeGreaterThan(0);
    expect(record.savedBdt).toBeGreaterThan(0);

    const summary = tokenCostTracker.getSummary();
    expect(summary.totalTokens).toBe(1500);
    expect(summary.promptTokens).toBe(1000);
    expect(summary.completionTokens).toBe(500);
    expect(summary.totalCostBdt).toBe(0);
    expect(summary.totalSavedBdt).toBeGreaterThan(0);
    expect(summary.byTwin["marketing_twin"]).toBeDefined();
    expect(summary.byTwin["marketing_twin"].tokens).toBe(1500);
  });

  it("calculates cloud cost accurately for Tier 4 Frontier models", () => {
    const record = tokenCostTracker.recordUsage({
      modelOrTier: "tier4_frontier",
      promptTokens: 10000,
      completionTokens: 2000,
      twinId: "finance_twin",
    });

    // 10,000 / 1,000,000 * 1.50 = $0.015
    // 2,000 / 1,000,000 * 3.50 = $0.007
    // Total = $0.022
    expect(record.costUsd).toBeCloseTo(0.022, 3);
    expect(record.costBdt).toBeCloseTo(0.022 * USD_TO_BDT_RATE, 1);
    expect(record.savedUsd).toBe(0); // No savings when using frontier cloud

    const summary = tokenCostTracker.getSummary();
    expect(summary.totalTokens).toBe(12000);
    expect(summary.totalCostUsd).toBeCloseTo(0.022, 3);
  });

  it("GET /api/v1/twin/telemetry/cost returns real-time cost telemetry", async () => {
    tokenCostTracker.recordUsage({
      modelOrTier: "tier1_webgpu",
      promptTokens: 500,
      completionTokens: 250,
      twinId: "sales_twin",
    });

    const res = await fetch(`${baseUrl}/api/v1/twin/telemetry/cost`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalTokens).toBe(750);
    expect(body.data.totalSavedBdt).toBeGreaterThan(0);
    expect(body.data.byTier.tier1_webgpu.tokens).toBe(750);
  });

  it("POST /api/v1/twin/telemetry/cost/record ingests external/client usage", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/telemetry/cost/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelOrTier: "tier3_vast",
        promptTokens: 5000,
        completionTokens: 2000,
        twinId: "content_twin",
        taskId: "task_blog_post",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.recorded.costUsd).toBeGreaterThan(0);
    expect(body.data.summary.totalTokens).toBe(7000);
    expect(body.data.summary.byTwin["content_twin"].tokens).toBe(7000);
  });

  it("POST /api/v1/twin/specialized-twins/dispatch returns costTelemetry", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/specialized-twins/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        twinId: "marketing_twin",
        companySlug: "fintech_dhaka",
        taskTitle: "Launch Telegram Community Drop",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.costTelemetry).toBeDefined();
    expect(body.data.costTelemetry.savedBdt).toBeGreaterThanOrEqual(0);
  });
});
