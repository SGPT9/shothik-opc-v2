import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import http from "http";
import { crdtRouter } from "../crdt.js";
import { crdtMeshEngine, compareVectorClocks, mergeVectorClocks } from "../../lib/crdt-mesh-engine.js";

describe("Edge CRDT Mesh Multi-Master Synchronization Engine", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", crdtRouter);

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
    crdtMeshEngine.reset();
  });

  // --- 1. Vector Clock Pure Unit Logic ---
  describe("Vector Clock Mathematics & Causality", () => {
    it("correctly determines identical, ahead, behind, and concurrent states", () => {
      expect(compareVectorClocks({ A: 1, B: 2 }, { A: 1, B: 2 })).toBe("identical");
      expect(compareVectorClocks({ A: 2, B: 2 }, { A: 1, B: 2 })).toBe("ahead");
      expect(compareVectorClocks({ A: 1, B: 1 }, { A: 1, B: 2 })).toBe("behind");
      expect(compareVectorClocks({ A: 2, B: 1 }, { A: 1, B: 2 })).toBe("concurrent");
    });

    it("monotonically merges vector clocks across disparate nodes", () => {
      const clockA = { node_cf_sin: 5, node_local: 2 };
      const clockB = { node_cf_sin: 3, node_local: 4, node_mobile: 1 };
      const merged = mergeVectorClocks(clockA, clockB);

      expect(merged.node_cf_sin).toBe(5);
      expect(merged.node_local).toBe(4);
      expect(merged.node_mobile).toBe(1);
    });
  });

  // --- 2. Peer Registry & Heartbeat Handshakes ---
  describe("P2P Mesh Peer Discovery", () => {
    it("POST /api/v1/crdt/mesh/peers/heartbeat registers Cloudflare Durable Object peer", async () => {
      const res = await fetch(`${baseUrl}/api/v1/crdt/mesh/peers/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peerId: "cf_do_sin_01",
          role: "edge_durable_object",
          region: "singapore_edge",
          clock: { cf_do_sin_01: 12 },
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.peerId).toBe("cf_do_sin_01");
      expect(body.data.role).toBe("edge_durable_object");
      expect(body.data.region).toBe("singapore_edge");
    });

    it("GET /api/v1/crdt/mesh/peers lists active peers in cluster", async () => {
      crdtMeshEngine.registerPeer("peer_local_desktop", "local_node", "dhaka_local");
      crdtMeshEngine.registerPeer("cf_do_frankfurt", "edge_durable_object", "eu_frankfurt");

      const res = await fetch(`${baseUrl}/api/v1/crdt/mesh/peers`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(2);
      const ids = body.data.map((p: any) => p.peerId);
      expect(ids).toContain("peer_local_desktop");
      expect(ids).toContain("cf_do_frankfurt");
    });
  });

  // --- 3. Multi-Master Handshake & Conflict Resolution ---
  describe("Multi-Master Causal Handshake Protocol", () => {
    it("delivers missing operations when peer is behind local master", async () => {
      const docId = "doc_whitepaper_crdt_001";

      // Local master performs 2 mutations
      crdtMeshEngine.applyLocalOperation(docId, "title", "Shothik AgenticOS", "replace", "local_master");
      crdtMeshEngine.applyLocalOperation(docId, "author", "Shothik Core Lab", "replace", "local_master");

      // Remote edge node handshakes with clock 0
      const res = await fetch(`${baseUrl}/api/v1/crdt/mesh/handshake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId,
          peerId: "cf_do_singapore",
          role: "edge_durable_object",
          region: "ap_southeast_1",
          remoteClock: { local_master: 0 },
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.causality).toBe("ahead");
      expect(body.status).toBe("peer_behind");
      expect(body.missingOperationsForPeer.length).toBe(2);
      expect(body.consolidatedState.title).toBe("Shothik AgenticOS");
    });

    it("deterministically converges concurrent multi-master states", async () => {
      const docId = "doc_concurrent_venture_spec";

      // Local master modifies 'companyName'
      crdtMeshEngine.applyLocalOperation(docId, "companyName", "Venture Local Dhaka", "replace", "local_master");

      // Remote Cloudflare Durable Object modifies 'revenueBdt' concurrently
      const res = await fetch(`${baseUrl}/api/v1/crdt/mesh/handshake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId,
          peerId: "cf_do_edge_primary",
          role: "edge_durable_object",
          remoteClock: { cf_do_edge_primary: 3 },
          remoteSnapshot: {
            revenueBdt: 75000,
            tier: "enterprise_scale",
          },
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.causality).toBe("concurrent");
      expect(body.status).toBe("merged_concurrent");

      // Both keys preserved without loss
      expect(body.consolidatedState.companyName).toBe("Venture Local Dhaka");
      expect(body.consolidatedState.revenueBdt).toBe(75000);
      expect(body.consolidatedState.tier).toBe("enterprise_scale");
      expect(body.consolidatedClock.local_master).toBe(1);
      expect(body.consolidatedClock.cf_do_edge_primary).toBe(3);
    });

    it("updates vector clock dynamically when delta is posted", async () => {
      const docId = "doc_delta_track_test";

      const res = await fetch(`${baseUrl}/api/v1/crdt/delta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "op_001",
          docId,
          clientId: "worker_client_alpha",
          clock: 1,
          type: "replace",
          path: "settings.autoMode",
          value: true,
          timestamp: Date.now(),
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.vectorClock.worker_client_alpha).toBe(1);

      // Verify clock route returns updated clock
      const clockRes = await fetch(`${baseUrl}/api/v1/crdt/mesh/clocks/${docId}`);
      expect(clockRes.status).toBe(200);
      const clockBody = await clockRes.json();
      expect(clockBody.vectorClock.worker_client_alpha).toBe(1);
    });
  });
});
