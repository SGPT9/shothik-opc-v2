import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { wasmVectorIndexEngine } from "../../lib/wasm-vector-index.js";

describe("Autonomous Edge WebAssembly Linear CRDT Vector Indices API (/api/v1/crdt/vectors)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    wasmVectorIndexEngine.clear();
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

  it("1. GET /api/v1/crdt/vectors/status returns linear memory metrics and capacity", async () => {
    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/status`);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.status).toBeDefined();
    expect(data.status.initialized).toBe(true);
    expect(data.status.vectorDimension).toBe(384);
    expect(data.status.linearMemoryPages).toBeGreaterThanOrEqual(2);
    expect(data.status.linearMemoryBytes).toBeGreaterThanOrEqual(131072);
    expect(data.status.indexMode).toBe("WASM_LINEAR_MEMORY_ZERO_COPY");
    expect(data.status.clusterClock).toHaveProperty("dhaka_bdix_edge_node");
  });

  it("2. GET /api/v1/crdt/vectors/entries returns default seeded knowledge vectors", async () => {
    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/entries`);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(5);
    expect(data.entries[0]).toHaveProperty("slotIndex");
    expect(data.entries[0]).toHaveProperty("metadata");
    expect(data.entries[0].metadata).toHaveProperty("crdtClock");
  });

  it("3. POST /api/v1/crdt/vectors/insert packs vector into linear memory and advances CRDT clock", async () => {
    const payload = {
      id: "vec_test_mirpur_hub",
      documentId: "doc_logistics_mirpur",
      textExcerpt: "Mirpur 10 Steadfast courier distribution hub with 1200 parcel deliveries daily.",
      tags: ["mirpur", "courier", "hub"],
      peerOrigin: "dhaka_bdix_edge_node",
    };

    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/insert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("vec_test_mirpur_hub");
    expect(data.data.crdtClock.dhaka_bdix_edge_node).toBeGreaterThan(0);

    // Verify it is searchable
    const searchRes = await fetch(`${baseUrl}/api/v1/crdt/vectors/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Mirpur courier parcel deliveries", topK: 3 }),
    });

    expect(searchRes.status).toBe(200);
    const searchData = (await searchRes.json()) as any;
    expect(searchData.results.some((r: any) => r.id === "vec_test_mirpur_hub")).toBe(true);
  });

  it("4. POST /api/v1/crdt/vectors/insert rejects requests missing textExcerpt", async () => {
    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/insert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "vec_invalid" }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.success).toBe(false);
    expect(data.error).toContain("textExcerpt");
  });

  it("5. POST /api/v1/crdt/vectors/query executes nearest neighbor search with Cosine metric", async () => {
    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "bKash MFS payment gateway with webhook verification",
        topK: 2,
        metric: "COSINE",
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.results).toHaveLength(2);
    expect(data.results[0].similarityScore).toBeGreaterThanOrEqual(data.results[1].similarityScore);
    expect(data.searchLatencyMs).toBeGreaterThan(0);
    expect(data.evaluatedCount).toBeGreaterThanOrEqual(5);
  });

  it("6. POST /api/v1/crdt/vectors/query executes nearest neighbor search with Euclidean L2 metric", async () => {
    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Nilkhet Print-on-Demand book signature imposition",
        topK: 3,
        metric: "EUCLIDEAN_L2",
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.results[0]).toHaveProperty("l2Distance");
    expect(typeof data.results[0].l2Distance).toBe("number");
  });

  it("7. POST /api/v1/crdt/vectors/delta exports and merges CRDT state deltas across edge nodes", async () => {
    // 1. Export delta
    const exportRes = await fetch(`${baseUrl}/api/v1/crdt/vectors/delta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "export" }),
    });

    expect(exportRes.status).toBe(200);
    const exportData = (await exportRes.json()) as any;
    expect(exportData.action).toBe("export");
    expect(exportData.delta.operations.length).toBeGreaterThanOrEqual(5);

    // 2. Merge external peer delta
    const incomingDelta = {
      version: 1,
      sourcePeer: "singapore_sg1_peer",
      timestamp: new Date().toISOString(),
      operations: [
        {
          type: "INSERT",
          id: "vec_singapore_foreign_remittance",
          documentId: "doc_remittance_sg",
          textExcerpt: "Diaspora remittance exchange corridor routing BDT through verified bank settlements.",
          tags: ["remittance", "singapore", "bdt"],
          crdtClock: { singapore_sg1_peer: 44 },
        },
      ],
    };

    const mergeRes = await fetch(`${baseUrl}/api/v1/crdt/vectors/delta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "merge", delta: incomingDelta }),
    });

    expect(mergeRes.status).toBe(200);
    const mergeData = (await mergeRes.json()) as any;
    expect(mergeData.action).toBe("merge");
    expect(mergeData.mergedCount).toBe(1);

    // Verify presence of merged vector
    const statusRes = await fetch(`${baseUrl}/api/v1/crdt/vectors/status`);
    const statusData = (await statusRes.json()) as any;
    expect(statusData.status.clusterClock.singapore_sg1_peer).toBeGreaterThan(0);
  });

  it("8. POST /api/v1/crdt/vectors/benchmark runs high-throughput linear memory query test", async () => {
    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/benchmark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleQueries: 100 }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.benchmark.totalQueries).toBe(100);
    expect(data.benchmark.queriesPerSecond).toBeGreaterThan(0);
    expect(data.benchmark.averageLatencyMs).toBeGreaterThan(0);
    expect(data.benchmark.memoryBandwidthMBps).toBeGreaterThan(0);
  });

  it("9. POST /api/v1/crdt/vectors/clear resets linear memory index and re-seeds default knowledge vectors", async () => {
    const res = await fetch(`${baseUrl}/api/v1/crdt/vectors/clear`, {
      method: "POST",
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);

    const entriesRes = await fetch(`${baseUrl}/api/v1/crdt/vectors/entries`);
    const entriesData = (await entriesRes.json()) as any;
    expect(entriesData.count).toBe(5);
  });
});
