import { Router, Request, Response } from "express";
import { logger } from "../lib/logger";

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

  res.json({ success: true, docId: op.docId, broadcastTo: subscribers?.size || 0 });
});

/**
 * GET /api/v1/crdt/state/:docId
 * Returns the current consolidated server snapshot for a document.
 */
crdtRouter.get("/v1/crdt/state/:docId", (req: Request, res: Response): void => {
  const docId = String(req.params.docId || "");
  const state = documentSnapshots.get(docId) || {};
  res.json({ success: true, docId, state });
});
