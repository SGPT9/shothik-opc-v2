import { Router, Request, Response } from "express";
import { logger } from "../lib/logger";
import { crdtMeshEngine } from "../lib/crdt-mesh-engine.js";
import { wasmCrdtEngine } from "../lib/wasm-crdt-bindings.js";

export interface CRDTOperationPayload {
  id: string;
  docId: string;
  clientId: string;
  clock: number;
  type: "insert" | "delete" | "replace" | "cell_update";
  path: string;
  value: any;
  timestamp: number;
}

// In-memory active SSE client connections grouped by docId
const activeDocumentClients = new Map<string, Set<Response>>();
// In-memory document snapshots
const documentSnapshots = new Map<string, Record<string, any>>();

export const crdtRouter = Router();

/**
 * GET /api/v1/crdt/stream/:docId
 * Connects a client device or browser tab to a real-time SSE CRDT sync stream.
 */
crdtRouter.get("/v1/crdt/stream/:docId", (req: Request, res: Response): void => {
  const docId = String(req.params.docId || "");
  if (!docId) {
    res.status(400).json({ success: false, error: "Missing docId" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  if (!activeDocumentClients.has(docId)) {
    activeDocumentClients.set(docId, new Set());
  }
  const clientSet = activeDocumentClients.get(docId)!;
  clientSet.add(res);

  logger.info({ docId, activeClients: clientSet.size }, "[crdt-relay] Client connected to document stream");

  // Send initial connected handshake with current state
  const currentState = documentSnapshots.get(docId) || {};
  res.write(`data: ${JSON.stringify({ type: "INIT_STATE", docId, state: currentState })}\n\n`);

  // Heartbeat to keep stream alive
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clientSet.delete(res);
    if (clientSet.size === 0) {
      activeDocumentClients.delete(docId);
    }
    logger.info({ docId, remaining: clientSet.size }, "[crdt-relay] Client disconnected from document stream");
  });
});

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function safeSetNestedPath(obj: Record<string, any>, path: string, value: any, isDelete: boolean = false): void {
  const keys = path.split(".").filter((k) => !FORBIDDEN_KEYS.has(k.trim()));
  if (keys.length === 0) return;

  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== "object" || current[k] === null) {
      current[k] = {};
    }
    current = current[k];
  }

  const lastKey = keys[keys.length - 1];
  if (isDelete) {
    delete current[lastKey];
  } else {
    current[lastKey] = value;
  }
}

/**
 * POST /api/v1/crdt/delta
 * Broadcasts an incoming CRDT delta operation to all other connected client devices.
 */
crdtRouter.post("/v1/crdt/delta", (req: Request, res: Response): void => {
  const op: CRDTOperationPayload = req.body;

  if (!op || typeof op.docId !== "string" || typeof op.id !== "string" || typeof op.path !== "string") {
    res.status(400).json({ success: false, error: "Invalid CRDT operation payload" });
    return;
  }

  // Update backend memory snapshot with prototype pollution protection
  let currentDoc = documentSnapshots.get(op.docId);
  if (!currentDoc) {
    currentDoc = Object.create(null) as Record<string, any>;
    documentSnapshots.set(op.docId, currentDoc);
  }

  safeSetNestedPath(currentDoc, op.path, op.value, op.type === "delete");

  // Track in multi-master mesh vector engine
  const meshResult = crdtMeshEngine.applyLocalOperation(
    op.docId,
    op.path,
    op.value,
    op.type,
    op.clientId
  );

  // Broadcast delta to all other subscribers on this document
  const subscribers = activeDocumentClients.get(op.docId);
  if (subscribers && subscribers.size > 0) {
    const message = `data: ${JSON.stringify({ type: "CRDT_DELTA", op })}\n\n`;
    const deadClients: Response[] = [];

    subscribers.forEach((clientRes) => {
      try {
        const ok = clientRes.write(message);
        if (!ok) deadClients.push(clientRes);
      } catch {
        deadClients.push(clientRes);
      }
    });

    // Prune dead client sockets immediately
    deadClients.forEach((dead) => subscribers.delete(dead));
  }

  res.json({
    success: true,
    docId: op.docId,
    broadcastTo: subscribers?.size || 0,
    vectorClock: meshResult.clock,
  });
});

/**
 * GET /api/v1/crdt/state/:docId
 * Returns the current consolidated server snapshot for a document.
 */
crdtRouter.get("/v1/crdt/state/:docId", (req: Request, res: Response): void => {
  const docId = String(req.params.docId || "");
  const state = documentSnapshots.get(docId) || crdtMeshEngine.getDocumentSnapshot(docId);
  const vectorClock = crdtMeshEngine.getDocumentClock(docId);
  res.json({ success: true, docId, state, vectorClock });
});

/**
 * POST /api/v1/crdt/mesh/handshake
 * Edge & P2P Multi-Master handshake protocol
 */
crdtRouter.post(["/v1/crdt/mesh/handshake", "/api/v1/crdt/mesh/handshake"], (req: Request, res: Response): void => {
  try {
    const { docId, peerId, role = "edge_durable_object", region = "edge_cf_global", remoteClock = {}, remoteSnapshot = {} } = req.body || {};

    if (!docId || !peerId) {
      res.status(400).json({ success: false, error: "docId and peerId are required for mesh handshake" });
      return;
    }

    crdtMeshEngine.registerPeer(peerId, role, region, remoteClock);
    const result = crdtMeshEngine.handshake(docId, peerId, remoteClock, remoteSnapshot);

    // Sync snapshot back into in-memory store
    if (result.consolidatedState && Object.keys(result.consolidatedState).length > 0) {
      documentSnapshots.set(docId, { ...(documentSnapshots.get(docId) || {}), ...result.consolidatedState });
    }

    res.json({
      success: true,
      docId,
      peerId,
      ...result,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to execute CRDT mesh handshake");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/crdt/mesh/peers
 * Returns active registered peers across edge nodes, local masters, and P2P clients
 */
crdtRouter.get(["/v1/crdt/mesh/peers", "/api/v1/crdt/mesh/peers"], (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: crdtMeshEngine.getActivePeers(),
  });
});

/**
 * POST /api/v1/crdt/mesh/peers/heartbeat
 * Heartbeat registration from an Edge Durable Object or mobile client
 */
crdtRouter.post(["/v1/crdt/mesh/peers/heartbeat", "/api/v1/crdt/mesh/peers/heartbeat"], (req: Request, res: Response): void => {
  const { peerId, role = "edge_durable_object", region = "edge_cf_global", clock = {} } = req.body || {};
  if (!peerId) {
    res.status(400).json({ success: false, error: "peerId is required" });
    return;
  }

  const peer = crdtMeshEngine.recordHeartbeat(peerId, role, region, clock);
  res.json({
    success: true,
    data: peer,
  });
});

/**
 * GET /api/v1/crdt/mesh/clocks/:docId
 * Returns current vector clock for a document
 */
crdtRouter.get(["/v1/crdt/mesh/clocks/:docId", "/api/v1/crdt/mesh/clocks/:docId"], (req: Request, res: Response): void => {
  const docId = String(req.params.docId || "");
  res.json({
    success: true,
    docId,
    vectorClock: crdtMeshEngine.getDocumentClock(docId),
  });
});

/**
 * GET /api/v1/crdt/wasm/benchmark
 * Evaluates throughput and compression delta between JSON and Wasm binary format
 */
crdtRouter.get(["/v1/crdt/wasm/benchmark", "/api/v1/crdt/wasm/benchmark"], (req: Request, res: Response): void => {
  try {
    const sampleSize = Math.min(1000, Math.max(10, Number(req.query.samples) || 200));
    const result = wasmCrdtEngine.benchmarkThroughput(sampleSize);
    res.json({
      success: true,
      engine: "WebAssembly Edge CRDT Binary Codec (v1)",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/crdt/wasm/state-vector/:docId
 * Returns compact binary State Vector (Base64) for ultra-low latency differential synchronization
 */
crdtRouter.get(["/v1/crdt/wasm/state-vector/:docId", "/api/v1/crdt/wasm/state-vector/:docId"], (req: Request, res: Response): void => {
  try {
    const docId = String(req.params.docId || "");
    const clock = crdtMeshEngine.getDocumentClock(docId);
    const binaryVector = wasmCrdtEngine.encodeStateVector(clock);
    const base64Vector = Buffer.from(binaryVector).toString("base64");

    res.json({
      success: true,
      docId,
      base64Vector,
      byteLength: binaryVector.length,
      clock,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/crdt/wasm/sync-binary
 * High-throughput binary delta replication endpoint
 */
crdtRouter.post(["/v1/crdt/wasm/sync-binary", "/api/v1/crdt/wasm/sync-binary"], (req: Request, res: Response): void => {
  try {
    const { base64Delta } = req.body || {};

    if (!base64Delta || typeof base64Delta !== "string") {
      res.status(400).json({ success: false, error: "base64Delta binary string is required" });
      return;
    }

    const binaryBuffer = new Uint8Array(Buffer.from(base64Delta, "base64"));
    const decoded = wasmCrdtEngine.decodeBinaryDelta(binaryBuffer);

    let targetSnapshot = documentSnapshots.get(decoded.docId);
    if (!targetSnapshot) {
      targetSnapshot = {};
      documentSnapshots.set(decoded.docId, targetSnapshot);
    }

    // Apply all operations to the mesh engine
    const appliedOps: any[] = [];
    for (const op of decoded.operations) {
      crdtMeshEngine.recordHeartbeat(decoded.peerId, "edge_durable_object", "edge_wasm_mesh", { [op.nodeId]: op.clock });
      // update state snapshot
      safeSetNestedPath(
        targetSnapshot,
        op.path,
        op.value,
        op.type === "delete"
      );
      appliedOps.push(op);
    }

    const updatedClock = crdtMeshEngine.getDocumentClock(decoded.docId);
    const updatedStateVector = wasmCrdtEngine.encodeStateVector(updatedClock);

    res.json({
      success: true,
      docId: decoded.docId,
      peerId: decoded.peerId,
      operationsApplied: appliedOps.length,
      checksumVerified: true,
      checksum: decoded.checksum,
      updatedClock,
      base64UpdatedStateVector: Buffer.from(updatedStateVector).toString("base64"),
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to process Wasm binary CRDT sync");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/crdt/wasm/encode-delta
 * Utility to encode an array of operations into a binary delta frame
 */
crdtRouter.post(["/v1/crdt/wasm/encode-delta", "/api/v1/crdt/wasm/encode-delta"], (req: Request, res: Response): void => {
  try {
    const { docId, peerId = "edge_peer_01", operations = [] } = req.body || {};

    if (!docId || !Array.isArray(operations)) {
      res.status(400).json({ success: false, error: "docId and operations array are required" });
      return;
    }

    const binaryBytes = wasmCrdtEngine.encodeBinaryDelta(docId, peerId, operations);
    const base64 = Buffer.from(binaryBytes).toString("base64");
    const checksum = wasmCrdtEngine.calculateChecksum(binaryBytes.subarray(0, binaryBytes.length - 4));

    res.json({
      success: true,
      docId,
      peerId,
      byteLength: binaryBytes.length,
      checksum,
      base64,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
