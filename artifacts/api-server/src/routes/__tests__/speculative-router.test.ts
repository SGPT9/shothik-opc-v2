import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { speculativeSystem1Engine } from "../../lib/router/speculative-system1-engine";

describe("Pillar 4: Dual-Engine Speculative System-1 Edge Inference", { timeout: 25000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    speculativeSystem1Engine.resetMetrics();
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

  it("resolves courier tracking query via System-1 Edge fast path in sub-50ms at $0 cost", async () => {
    const res = await fetch(`${baseUrl}/api/v1/router/speculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Amar parcel STDF_98124 kothay ache? Delivery rider status jante chai",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const data = body.data;

    expect(data.engineUsed).toBe("system1_edge");
    expect(data.intent).toBe("courier_tracking");
    expect(data.targetTwin).toBe("operations_twin");
    expect(data.parameters.consignmentId).toBe("STDF_98124");
    expect(data.costBdt).toBe(0);
    expect(data.tokensSaved).toBeGreaterThan(0);
    expect(data.latencyMs).toBeLessThan(50);
  });

  it("extracts MFS payout and wallet via System-1 Edge fast path", async () => {
    const res = await fetch(`${baseUrl}/api/v1/router/speculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Customer ke 2500 taka bKash refund disburse koro 01799887766 number e",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const data = body.data;

    expect(data.engineUsed).toBe("system1_edge");
    expect(data.intent).toBe("mfs_payout_query");
    expect(data.targetTwin).toBe("finance_twin");
    expect(data.parameters.amount).toBe(2500);
    expect(data.parameters.walletNumber).toBe("01799887766");
    expect(data.costBdt).toBe(0);
  });

  it("resolves academic thesis plagiarism check via System-1 Edge fast path", async () => {
    const res = await fetch(`${baseUrl}/api/v1/router/speculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Amar master thesis er plagiarism and similarity report check korte hobe",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.engineUsed).toBe("system1_edge");
    expect(body.data.intent).toBe("academic_plagiarism_check");
    expect(body.data.targetTwin).toBe("content_twin");
  });

  it("escalates ambiguous or complex queries to System-2 Cloud LLM", async () => {
    const res = await fetch(`${baseUrl}/api/v1/router/speculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "What is the existential philosophy of poetry in 19th century Bengal renaissance?",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const data = body.data;

    expect(data.engineUsed).toBe("system2_escalated");
    expect(data.explanation).toContain("below ambiguity threshold");
    expect(data.speculativeDraft).toBeDefined();
    expect(data.speculativeDraft.acceptedBySystem2).toBe(true);
  });

  it("tracks and accumulates speculative router telemetry and token savings", async () => {
    // 1. Run two fast-path queries
    await fetch(`${baseUrl}/api/v1/router/speculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Parcel status kothay CN_123" }),
    });

    await fetch(`${baseUrl}/api/v1/router/speculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Stock inventory check koro mal ache kina" }),
    });

    // 2. Run one ambiguous query
    await fetch(`${baseUrl}/api/v1/router/speculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Write a haiku about the rain in Sylhet tea gardens" }),
    });

    // 3. Check metrics
    const metricsRes = await fetch(`${baseUrl}/api/v1/router/metrics`);
    expect(metricsRes.status).toBe(200);
    const metrics = (await metricsRes.json()).data;

    expect(metrics.totalQueries).toBe(3);
    expect(metrics.system1FastPathHits).toBe(2);
    expect(metrics.system2Escalations).toBe(1);
    expect(metrics.fastPathHitRatio).toBeCloseTo(0.667, 2);
    expect(metrics.cumulativeSavedTokens).toBe(700);
    expect(metrics.cumulativeSavedCostBdt).toBeCloseTo(0.10, 2);
  });
});
