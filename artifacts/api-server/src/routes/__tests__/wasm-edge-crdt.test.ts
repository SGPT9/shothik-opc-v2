import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import {
  wasmCrdtEngine,
  WASM_CRDT_MAGIC,
  WASM_CRDT_VERSION,
  type WasmBinaryDelta,
} from "../../lib/wasm-crdt-bindings";
import type { CrdtMeshOperation } from "../../lib/crdt-mesh-engine";

describe("WebAssembly Edge CRDT Bindings & High-Throughput Binary Codec", { timeout: 25000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server) {
      server.closeAllConnections?.();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 15000);

  async function request(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) {
    const { method = "GET", body, headers = {} } = options;
    const reqHeaders: Record<string, string> = { ...headers };
    if (body) {
      reqHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // ignore non-json
    }

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: json,
    };
  }

  // --- 1. Direct Wasm Binary Engine Unit Tests ---
  describe("WasmCrdtEngine Core Codec", () => {
    it("encodes and decodes vector clocks into binary state vectors with zero data loss", () => {
      const clocks = {
        "node_edge_cf_lon": 142,
        "node_edge_cf_sin": 89,
        "client_dhaka_mobile": 210,
        "cloud_relay_fra": 45,
      };

      const binary = wasmCrdtEngine.encodeStateVector(clocks);
      expect(binary).toBeInstanceOf(Uint8Array);
      expect(binary[0]).toBe(WASM_CRDT_MAGIC[0]);
      expect(binary[1]).toBe(WASM_CRDT_MAGIC[1]);
      expect(binary[2]).toBe(WASM_CRDT_MAGIC[2]);
      expect(binary[3]).toBe(WASM_CRDT_MAGIC[3]);
      expect(binary[4]).toBe(WASM_CRDT_VERSION);

      const decoded = wasmCrdtEngine.decodeStateVector(binary);
      expect(decoded).toEqual(clocks);
    });

    it("compares binary state vectors directly to establish causal order", () => {
      const vecBase = wasmCrdtEngine.encodeStateVector({ nodeA: 10, nodeB: 5 });
      const vecIdentical = wasmCrdtEngine.encodeStateVector({ nodeA: 10, nodeB: 5 });
      const vecAhead = wasmCrdtEngine.encodeStateVector({ nodeA: 11, nodeB: 5 });
      const vecBehind = wasmCrdtEngine.encodeStateVector({ nodeA: 9, nodeB: 4 });
      const vecConcurrent = wasmCrdtEngine.encodeStateVector({ nodeA: 12, nodeB: 3 });

      expect(wasmCrdtEngine.compareBinaryStateVectors(vecBase, vecIdentical)).toBe("identical");
      expect(wasmCrdtEngine.compareBinaryStateVectors(vecAhead, vecBase)).toBe("ahead");
      expect(wasmCrdtEngine.compareBinaryStateVectors(vecBehind, vecBase)).toBe("behind");
      expect(wasmCrdtEngine.compareBinaryStateVectors(vecConcurrent, vecBase)).toBe("concurrent");
    });

    it("encodes and decodes complex operations in binary delta frames with CRC32 verification", () => {
      const docId = "doc_canvas_test_101";
      const peerId = "peer_client_macbook";
      const operations: CrdtMeshOperation[] = [
        {
          id: "op_001",
          docId,
          nodeId: "client_macbook",
          clock: 1,
          type: "cell_update",
          path: "sheet.cells.B4",
          value: { formula: "=SUM(A1:A10)", result: 45000 },
          timestamp: 1788573000000,
        },
        {
          id: "op_002",
          docId,
          nodeId: "client_macbook",
          clock: 2,
          type: "insert",
          path: "canvas.elements",
          value: "Brand Logo SVG vector node",
          timestamp: 1788573001000,
        },
        {
          id: "op_003",
          docId,
          nodeId: "client_macbook",
          clock: 3,
          type: "delete",
          path: "canvas.elements.old_rect",
          value: null,
          timestamp: 1788573002000,
        },
      ];

      const binary = wasmCrdtEngine.encodeBinaryDelta(docId, peerId, operations);
      expect(binary.byteLength).toBeGreaterThan(50);

      const decoded: WasmBinaryDelta = wasmCrdtEngine.decodeBinaryDelta(binary);
      expect(decoded.docId).toBe(docId);
      expect(decoded.peerId).toBe(peerId);
      expect(decoded.operations.length).toBe(3);
      expect(decoded.operations[0].path).toBe("sheet.cells.B4");
      expect(decoded.operations[0].value).toEqual({ formula: "=SUM(A1:A10)", result: 45000 });
      expect(decoded.operations[1].type).toBe("insert");
      expect(decoded.operations[2].type).toBe("delete");
      expect(decoded.checksum).toBeGreaterThan(0);
    });

    it("verifies throughput benchmark returns substantial payload compression vs JSON", () => {
      const bench = wasmCrdtEngine.benchmarkThroughput(100);
      expect(bench.sampleOperations).toBe(100);
      expect(bench.roundtripFidelity).toBe(true);
      expect(bench.wasmSizeBytes).toBeLessThan(bench.jsonSizeBytes);
      expect(bench.compressionPercent).toBeGreaterThan(0);
    });
  });

  // --- 2. REST Endpoints ---
  describe("Wasm Edge CRDT REST Routes", () => {
    it("GET /api/v1/crdt/wasm/benchmark returns throughput benchmark metrics", async () => {
      const res = await request("/api/v1/crdt/wasm/benchmark?samples=150");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sampleOperations).toBe(150);
      expect(res.body.data.roundtripFidelity).toBe(true);
      expect(res.body.data.compressionPercent).toBeGreaterThan(15);
    });

    it("GET /api/v1/crdt/wasm/state-vector/:docId returns base64 state vector bytes", async () => {
      const res = await request("/api/v1/crdt/wasm/state-vector/doc_financial_model_01");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.docId).toBe("doc_financial_model_01");
      expect(res.body.base64Vector).toBeDefined();
      expect(res.body.byteLength).toBeGreaterThanOrEqual(8);
    });

    it("POST /api/v1/crdt/wasm/encode-delta encodes operations to base64 binary buffer", async () => {
      const res = await request("/api/v1/crdt/wasm/encode-delta", {
        method: "POST",
        body: {
          docId: "doc_test_canvas",
          peerId: "edge_peer_frankfurt",
          operations: [
            {
              id: "op_delta_1",
              nodeId: "edge_peer_frankfurt",
              clock: 5,
              type: "replace",
              path: "layers.header.title",
              value: "Shothik Edge Mesh Autonomous Workspace",
            },
          ],
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.base64).toBeDefined();
      expect(res.body.byteLength).toBeGreaterThan(30);
      expect(res.body.checksum).toBeGreaterThan(0);
    });

    it("POST /api/v1/crdt/wasm/sync-binary decodes binary delta and applies changes to server mesh state", async () => {
      const docId = `doc_wasm_sync_${Date.now()}`;
      const peerId = "edge_do_singapore";

      // 1. Encode binary delta on client side
      const testOps: CrdtMeshOperation[] = [
        {
          id: `op_init_${Date.now()}`,
          docId,
          nodeId: peerId,
          clock: 1,
          type: "cell_update",
          path: "dashboard.kpi.mrr",
          value: 1250000,
          timestamp: Date.now(),
        },
      ];

      const binaryBytes = wasmCrdtEngine.encodeBinaryDelta(docId, peerId, testOps);
      const base64Delta = Buffer.from(binaryBytes).toString("base64");

      // 2. Transmit to sync-binary endpoint
      const syncRes = await request("/api/v1/crdt/wasm/sync-binary", {
        method: "POST",
        body: { base64Delta },
      });

      expect(syncRes.status).toBe(200);
      expect(syncRes.body.success).toBe(true);
      expect(syncRes.body.docId).toBe(docId);
      expect(syncRes.body.operationsApplied).toBe(1);
      expect(syncRes.body.checksumVerified).toBe(true);
      expect(syncRes.body.base64UpdatedStateVector).toBeDefined();

      // 3. Verify state retrieval
      const stateRes = await request(`/api/v1/crdt/state/${docId}`);
      expect(stateRes.status).toBe(200);
      expect(stateRes.body.state.dashboard?.kpi?.mrr).toBe(1250000);
    });

    it("rejects malformed sync payload", async () => {
      const res = await request("/api/v1/crdt/wasm/sync-binary", {
        method: "POST",
        body: {},
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("base64Delta binary string is required");
    });
  });
});
