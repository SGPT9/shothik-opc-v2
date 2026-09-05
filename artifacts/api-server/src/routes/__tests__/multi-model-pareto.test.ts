import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { multiModelParetoEngine } from "../../lib/multi-model-pareto-optimizer.js";

describe("Autonomous Multi-Model Cost & Accuracy Pareto Optimizer (/api/v1/models/pareto)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    multiModelParetoEngine.setStrategy("PARETO_OPTIMAL");
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

  it("1. GET /api/v1/models/pareto/status returns status, models, savings, and frontier coordinates", async () => {
    const res = await fetch(`${baseUrl}/api/v1/models/pareto/status`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.status).toBe("ACTIVE");
    expect(json.activeStrategy).toBe("PARETO_OPTIMAL");
    expect(json.models).toBeInstanceOf(Array);
    expect(json.models.length).toBe(4);

    const modelIds = json.models.map((m: any) => m.id);
    expect(modelIds).toContain("gemini-2.5-flash");
    expect(modelIds).toContain("deepseek-v3");
    expect(modelIds).toContain("claude-3-7-sonnet");
    expect(modelIds).toContain("ollama-local-qwen");

    expect(json.frontierCoordinates).toBeInstanceOf(Array);
    expect(json.frontierCoordinates.length).toBe(4);
    expect(json.savingsPercent).toBeGreaterThanOrEqual(50);
  });

  it("2. POST /api/v1/models/pareto/route routes complex code query to Claude 3.7 Sonnet under PARETO_OPTIMAL", async () => {
    const res = await fetch(`${baseUrl}/api/v1/models/pareto/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Write a high-throughput CRDT vector clock engine in TypeScript: ```typescript interface VectorClock { [peer: string]: number; } export class LamportClock { ... } ``` with formal verification.",
      }),
    });
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.detectedComplexity).toBe("CRITICAL_SYSTEMS_CODE");
    expect(json.selectedModel.id).toBe("claude-3-7-sonnet");
    expect(json.projectedCostUsd).toBeGreaterThan(0);
    expect(json.alternativeModels.length).toBe(3);
  });

  it("3. POST /api/v1/models/pareto/route routes standard task to Gemini Flash or Ollama with significant savings", async () => {
    const res = await fetch(`${baseUrl}/api/v1/models/pareto/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Summarize this quarterly financial report in 3 bullet points.",
      }),
    });
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(["gemini-2.5-flash", "ollama-local-qwen"]).toContain(json.selectedModel.id);
    expect(json.projectedSavingsPercent).toBeGreaterThanOrEqual(80);
    expect(json.projectedSavingsUsd).toBeGreaterThan(0);
  });

  it("4. POST /api/v1/models/pareto/route enforces OFFLINE_SOVEREIGN strategy to air-gapped local model", async () => {
    const res = await fetch(`${baseUrl}/api/v1/models/pareto/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Classified internal intelligence memo regarding private keys.",
        strategy: "OFFLINE_SOVEREIGN",
      }),
    });
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.selectedModel.id).toBe("ollama-local-qwen");
    expect(json.selectedModel.isLocal).toBe(true);
    expect(json.projectedCostUsd).toBe(0);
  });

  it("5. POST /api/v1/models/pareto/set-strategy updates active strategy and validates input", async () => {
    // Valid strategy update
    const validRes = await fetch(`${baseUrl}/api/v1/models/pareto/set-strategy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy: "COST_MINIMIZER" }),
    });
    expect(validRes.status).toBe(200);
    const validJson = (await validRes.json()) as any;
    expect(validJson.success).toBe(true);
    expect(validJson.strategy).toBe("COST_MINIMIZER");

    // Invalid strategy rejected
    const invalidRes = await fetch(`${baseUrl}/api/v1/models/pareto/set-strategy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy: "INVALID_STRATEGY" }),
    });
    expect(invalidRes.status).toBe(400);
  });

  it("6. POST /api/v1/models/pareto/calibrate runs synthetic benchmark calibration", async () => {
    const res = await fetch(`${baseUrl}/api/v1/models/pareto/calibrate`, {
      method: "POST",
    });
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.modelsCalibrated).toBe(4);
    expect(json.calibrationDurationMs).toBeGreaterThan(0);
  });

  it("7. GET /api/v1/models/pareto/telemetry returns historical routing log", async () => {
    const res = await fetch(`${baseUrl}/api/v1/models/pareto/telemetry`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.telemetry).toBeInstanceOf(Array);
    expect(json.telemetry.length).toBeGreaterThan(0);
    expect(json.telemetry[0].modelId).toBeDefined();
    expect(json.telemetry[0].tokens).toBeDefined();
  });
});
