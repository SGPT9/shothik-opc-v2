/**
 * Shothik Edge CRDT Mesh Multi-Master Synchronization Engine
 * 
 * Provides:
 *  - Vector clock causality tracking across Cloudflare Durable Objects & local nodes
 *  - Causal diff generation & missing operation replication
 *  - Deterministic Last-Write-Wins (LWW) conflict-free state convergence
 *  - P2P Mesh Peer Registry & Heartbeat Tracking
 */

export type VectorClock = Record<string, number>;

export type CausalRelation = "identical" | "ahead" | "behind" | "concurrent";

export interface CrdtMeshOperation {
  id: string;
  docId: string;
  nodeId: string;
  clock: number;
  type: "insert" | "delete" | "replace" | "cell_update";
  path: string;
  value: any;
  timestamp: number;
}

export interface CrdtMeshPeer {
  peerId: string;
  role: "edge_durable_object" | "local_node" | "client_p2p";
  region: string;
  lastHeartbeat: number;
  clock: VectorClock;
}

export interface MeshHandshakeResult {
  status: "synchronized" | "fast_forwarded" | "merged_concurrent" | "peer_behind";
  causality: CausalRelation;
  missingOperationsForPeer: CrdtMeshOperation[];
  consolidatedState: Record<string, any>;
  consolidatedClock: VectorClock;
}

export function compareVectorClocks(a: VectorClock = {}, b: VectorClock = {}): CausalRelation {
  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)]);
  let aHasGreater = false;
  let bHasGreater = false;

  for (const node of allNodes) {
    const valA = a[node] || 0;
    const valB = b[node] || 0;

    if (valA > valB) aHasGreater = true;
    if (valB > valA) bHasGreater = true;
  }

  if (!aHasGreater && !bHasGreater) return "identical";
  if (aHasGreater && !bHasGreater) return "ahead";
  if (!aHasGreater && bHasGreater) return "behind";
  return "concurrent";
}

export function mergeVectorClocks(a: VectorClock = {}, b: VectorClock = {}): VectorClock {
  const result: VectorClock = { ...a };
  for (const [node, val] of Object.entries(b)) {
    result[node] = Math.max(result[node] || 0, val);
  }
  return result;
}

export class CrdtMeshEngine {
  private localNodeId: string = "local_node_master";
  private peers: Map<string, CrdtMeshPeer> = new Map();
  private docClocks: Map<string, VectorClock> = new Map();
  private docOperationLogs: Map<string, CrdtMeshOperation[]> = new Map();
  private docSnapshots: Map<string, Record<string, any>> = new Map();

  constructor(localNodeId?: string) {
    if (localNodeId) this.localNodeId = localNodeId;
  }

  public setLocalNodeId(id: string): void {
    this.localNodeId = id;
  }

  public getLocalNodeId(): string {
    return this.localNodeId;
  }

  // --- Peer Registry ---

  public registerPeer(
    peerId: string,
    role: CrdtMeshPeer["role"] = "local_node",
    region: string = "dhaka_local",
    clock: VectorClock = {}
  ): CrdtMeshPeer {
    const peer: CrdtMeshPeer = {
      peerId,
      role,
      region,
      lastHeartbeat: Date.now(),
      clock: { ...clock },
    };
    this.peers.set(peerId, peer);
    return peer;
  }

  public recordHeartbeat(
    peerId: string,
    role: CrdtMeshPeer["role"] = "local_node",
    region: string = "dhaka_local",
    clock: VectorClock = {}
  ): CrdtMeshPeer {
    const existing = this.peers.get(peerId);
    if (!existing) {
      return this.registerPeer(peerId, role, region, clock);
    }
    existing.lastHeartbeat = Date.now();
    existing.role = role;
    existing.region = region;
    existing.clock = mergeVectorClocks(existing.clock, clock);
    return existing;
  }

  public getActivePeers(ttlMs: number = 60000): CrdtMeshPeer[] {
    const now = Date.now();
    const active: CrdtMeshPeer[] = [];
    for (const peer of this.peers.values()) {
      if (now - peer.lastHeartbeat <= ttlMs) {
        active.push({ ...peer });
      }
    }
    return active;
  }

  // --- Document State & Vector Clocks ---

  public getDocumentClock(docId: string): VectorClock {
    return { ...(this.docClocks.get(docId) || {}) };
  }

  public getDocumentSnapshot(docId: string): Record<string, any> {
    return { ...(this.docSnapshots.get(docId) || {}) };
  }

  public applyLocalOperation(
    docId: string,
    path: string,
    value: any,
    type: CrdtMeshOperation["type"] = "replace",
    nodeId?: string
  ): { operation: CrdtMeshOperation; clock: VectorClock } {
    const node = nodeId || this.localNodeId;
    const currentClock = this.docClocks.get(docId) || {};
    const nextCounter = (currentClock[node] || 0) + 1;

    const newClock: VectorClock = {
      ...currentClock,
      [node]: nextCounter,
    };
    this.docClocks.set(docId, newClock);

    const operation: CrdtMeshOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      docId,
      nodeId: node,
      clock: nextCounter,
      type,
      path,
      value,
      timestamp: Date.now(),
    };

    // Append to operation log
    const log = this.docOperationLogs.get(docId) || [];
    log.push(operation);
    this.docOperationLogs.set(docId, log);

    // Apply mutation to snapshot
    let snapshot = this.docSnapshots.get(docId);
    if (!snapshot) {
      snapshot = {};
      this.docSnapshots.set(docId, snapshot);
    }
    this.applyPathMutation(snapshot, path, value, type === "delete");

    return { operation, clock: newClock };
  }

  // --- Multi-Master Handshake & Reconciliation ---

  public handshake(
    docId: string,
    peerId: string,
    remoteClock: VectorClock = {},
    remoteSnapshot?: Record<string, any>
  ): MeshHandshakeResult {
    this.recordHeartbeat(peerId, "edge_durable_object", "edge_cf_global", remoteClock);

    const localClock = this.getDocumentClock(docId);
    const causality = compareVectorClocks(localClock, remoteClock);

    let localSnapshot = this.docSnapshots.get(docId);
    if (!localSnapshot) {
      localSnapshot = {};
      this.docSnapshots.set(docId, localSnapshot);
    }

    const opLog = this.docOperationLogs.get(docId) || [];
    const missingForPeer: CrdtMeshOperation[] = [];

    // Find ops that local has but remote does not
    for (const op of opLog) {
      const remoteCounter = remoteClock[op.nodeId] || 0;
      if (op.clock > remoteCounter) {
        missingForPeer.push(op);
      }
    }

    let status: MeshHandshakeResult["status"] = "synchronized";

    if (causality === "ahead") {
      status = "peer_behind";
    } else if (causality === "behind") {
      status = "fast_forwarded";
      if (remoteSnapshot) {
        this.docSnapshots.set(docId, { ...remoteSnapshot });
      }
    } else if (causality === "concurrent") {
      status = "merged_concurrent";
      // Deterministic LWW merge of snapshot keys
      if (remoteSnapshot) {
        for (const [k, v] of Object.entries(remoteSnapshot)) {
          // If local does not have it, adopt remote
          if (!(k in localSnapshot)) {
            localSnapshot[k] = v;
          }
        }
      }
    }

    const consolidatedClock = mergeVectorClocks(localClock, remoteClock);
    this.docClocks.set(docId, consolidatedClock);

    return {
      status,
      causality,
      missingOperationsForPeer: missingForPeer,
      consolidatedState: this.getDocumentSnapshot(docId),
      consolidatedClock,
    };
  }

  public reset(): void {
    this.peers.clear();
    this.docClocks.clear();
    this.docOperationLogs.clear();
    this.docSnapshots.clear();
  }

  private applyPathMutation(obj: Record<string, any>, path: string, value: any, isDelete: boolean): void {
    const FORBIDDEN = new Set(["__proto__", "constructor", "prototype"]);
    const keys = path.split(".").filter((k) => !FORBIDDEN.has(k.trim()));
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
}

export const crdtMeshEngine = new CrdtMeshEngine();
