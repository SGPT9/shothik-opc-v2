import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("WebGPU Local Embedding & Reranking API (/api/v1/compute/webgpu)", () => {
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

  it("1. GET /api/v1/compute/webgpu/status returns device profile, VRAM headroom, and cache stats", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/status`);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.profile.mode).toBe("WEBGPU_SHADER_F16");
    expect(data.profile.activeModel).toContain("BGE-m3");
    expect(data.profile.modelDimension).toBe(384);
    expect(data.profile.maxBufferSizeMB).toBeGreaterThan(1000);
    expect(data.profile.freeVramMB).toBeGreaterThan(1000);
    expect(data.cacheSize).toBeGreaterThanOrEqual(4);
    expect(data.hitRatePercent).toBeGreaterThan(0);
  });

  it("2. POST /api/v1/compute/webgpu/embed computes normalized on-device embedding vector", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Dhaka Metro courier logistics unit economics",
        dimension: 384,
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.dimension).toBe(384);
    expect(data.embedding.length).toBe(384);
    expect(data.modeUsed).toBe("WEBGPU_SHADER_F16");
  });

  it("3. POST /api/v1/compute/webgpu/embed rejects missing text with 400", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dimension: 384 }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.success).toBe(false);
  });

  it("4. POST /api/v1/compute/webgpu/cache/lookup detects semantic cache hit for known query", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/cache/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "What is the read latency of Dhaka BDIX edge replication?",
        threshold: 0.85,
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.hit).toBe(true);
    expect(data.similarity).toBeGreaterThanOrEqual(0.85);
    expect(data.entry.cachedResponse).toContain("6.4ms P95");
    expect(data.latencyMs).toBeLessThan(100);
  });

  it("5. POST /api/v1/compute/webgpu/cache/insert inserts new response into semantic cache", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/cache/insert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "How fast is WebGPU shader execution on Apple Silicon M3?",
        response: "Apple M3 WebGPU shader dispatch executes 384-dim tensor dot products in 0.85ms.",
        domain: "HARDWARE_BENCHMARK",
        tokensSaved: 400,
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.entry.queryText).toContain("Apple Silicon M3");
    expect(data.entry.embedding.length).toBe(384);
  });

  it("6. POST /api/v1/compute/webgpu/rerank reorders candidates by cross-encoder cosine similarity", async () => {
    const candidates = [
      {
        id: "doc_1",
        title: "Random Recipe for Biryani",
        content: "Traditional Dhaka kacchi biryani spices and basmati rice.",
      },
      {
        id: "doc_2",
        title: "BDIX Network Architecture & Peering",
        content: "Direct peering at Dhaka BDIX exchanges achieves sub-10ms packet transmission.",
      },
      {
        id: "doc_3",
        title: "Unrelated Weather Report",
        content: "Monsoon rainfall forecast for Chittagong port.",
      },
    ];

    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/rerank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "BDIX network latency and packet transmission",
        candidates,
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.reranked.length).toBe(3);
    // Highest score candidate should be doc_2
    expect(data.reranked[0].id).toBe("doc_2");
    expect(data.reranked[0].rerankedScore).toBeGreaterThan(data.reranked[2].rerankedScore);
  });

  it("7. POST /api/v1/compute/webgpu/benchmark runs simulated tensor shader benchmark", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/benchmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numVectors: 500 }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.numVectors).toBe(500);
    expect(data.vectorsPerSecond).toBeGreaterThan(100);
    expect(data.durationMs).toBeGreaterThan(0);
  });

  it("8. POST /api/v1/compute/webgpu/cache/clear resets cache to baseline", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/webgpu/cache/clear`, {
      method: "POST",
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);

    const statusRes = await fetch(`${baseUrl}/api/v1/compute/webgpu/status`);
    const statusData = (await statusRes.json()) as any;
    expect(statusData.cacheSize).toBeGreaterThanOrEqual(4);
  });
});
