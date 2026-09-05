import { describe, it, expect, vi, beforeEach } from "vitest";
import { WasmCrdtAdapter, type WasmCrdtOperation } from "../wasm-crdt-adapter";

describe("WasmCrdtAdapter (WebAssembly Edge Client Sync Codec)", () => {
  let adapter: WasmCrdtAdapter;

  beforeEach(() => {
    adapter = new WasmCrdtAdapter();
    vi.restoreAllMocks();
  });

  it("encodes and decodes client vector clocks into binary state vectors", () => {
    const clocks = {
      client_web_1: 42,
      edge_node_lon: 108,
      peer_mobile_dhaka: 15,
    };

    const binary = adapter.encodeStateVector(clocks);
    expect(binary).toBeInstanceOf(Uint8Array);
    expect(binary.length).toBeGreaterThan(10);

    const decoded = adapter.decodeStateVector(binary);
    expect(decoded).toEqual(clocks);
  });

  it("encodes binary delta frames with CRC32 integrity checksums", () => {
    const docId = "doc_canvas_board_01";
    const ops: WasmCrdtOperation[] = [
      {
        id: "op_crdt_1",
        docId,
        nodeId: "client_laptop",
        clock: 1,
        type: "insert",
        path: "canvas.shapes.shape_1",
        value: { kind: "rectangle", width: 240, height: 180 },
        timestamp: Date.now(),
      },
      {
        id: "op_crdt_2",
        docId,
        nodeId: "client_laptop",
        clock: 2,
        type: "cell_update",
        path: "canvas.shapes.shape_1.fill",
        value: "#6366f1",
        timestamp: Date.now() + 10,
      },
    ];

    const binary = adapter.encodeBinaryDelta(docId, ops);
    expect(binary).toBeInstanceOf(Uint8Array);
    expect(binary.byteLength).toBeGreaterThan(40);

    const checksum = adapter.calculateChecksum(binary.subarray(0, binary.length - 4));
    expect(checksum).toBeGreaterThan(0);
  });

  it("synchronizes binary deltas with edge mesh successfully", async () => {
    const docId = "doc_sync_test";
    const ops: WasmCrdtOperation[] = [
      {
        id: "op_10",
        docId,
        nodeId: "client_node",
        clock: 1,
        type: "replace",
        path: "title",
        value: "Edge Sync Ready",
        timestamp: Date.now(),
      },
    ];

    const mockResponse = {
      success: true,
      docId,
      peerId: adapter.getClientId(),
      operationsApplied: 1,
      checksumVerified: true,
      updatedClock: { [adapter.getClientId()]: 1 },
      base64UpdatedStateVector: "U0dQVAEB",
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const result = await adapter.syncWithEdgeMesh(docId, ops);
    expect(result.success).toBe(true);
    expect(result.docId).toBe(docId);
    expect(result.operationsApplied).toBe(1);
    expect(result.checksumVerified).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("handles network failure gracefully with safe fallback", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network disconnect"));

    const result = await adapter.syncWithEdgeMesh("doc_offline_fallback", []);
    expect(result.success).toBe(false);
    expect(result.operationsApplied).toBe(0);
    expect(result.checksumVerified).toBe(false);
  });
});
