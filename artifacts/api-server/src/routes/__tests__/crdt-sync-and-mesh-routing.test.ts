import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("CRDT Delta Synchronization & GORTEX Inference Mesh Subsystems", () => {
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
      // not json
    }

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: json,
    };
  }

  // --- 1. CRDT Real-Time Sync & Prototype Pollution Defense ---
  describe("CRDT Multi-Client Sync Engine", () => {
    const testDocId = `doc_crdt_test_${Date.now()}`;

    it("returns empty document snapshot for newly created document", async () => {
      const res = await request(`/api/v1/crdt/state/${testDocId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.docId).toBe(testDocId);
    });

    it("applies nested cell updates to document snapshot via delta mutations", async () => {
      const deltaRes = await request("/api/v1/crdt/delta", {
        method: "POST",
        body: {
          id: `op_1_${Date.now()}`,
          docId: testDocId,
          clientId: "client_laptop_01",
          clock: 1,
          type: "cell_update",
          path: "sheets.Sheet1.cells.A1",
          value: { formula: "=SUM(B1:B10)", raw: 1500 },
          timestamp: Date.now(),
        },
      });

      expect(deltaRes.status).toBe(200);
      expect(deltaRes.body.success).toBe(true);

      // Verify consolidated snapshot
      const stateRes = await request(`/api/v1/crdt/state/${testDocId}`);
      expect(stateRes.status).toBe(200);
      expect(stateRes.body.state?.sheets?.Sheet1?.cells?.A1?.raw).toBe(1500);
    });

    it("defends against prototype pollution payloads in delta path", async () => {
      const exploitRes = await request("/api/v1/crdt/delta", {
        method: "POST",
        body: {
          id: `op_exploit_${Date.now()}`,
          docId: testDocId,
          clientId: "client_malicious",
          clock: 2,
          type: "insert",
          path: "__proto__.pollutedProperty",
          value: "attacker_controlled_value",
          timestamp: Date.now(),
        },
      });

      expect(exploitRes.status).toBe(200);
      // Assert that global Object prototype is untouched
      expect(({} as any).pollutedProperty).toBeUndefined();
    });
  });

  // --- 2. GORTEX Multi-Tier Inference Mesh ---
  describe("GORTEX Dynamic Inference Mesh", () => {
    it("routes to Tier 0 Needle edge when device is offline or has low memory", async () => {
      const res = await request("/api/v1/mesh/dispatch", {
        method: "POST",
        body: {
          sourceProtocol: "openai_chat",
          targetBackend: "ollama_local",
          prompt: "Summarize this quarterly revenue breakdown offline",
          deviceMemoryGb: 2,
          isOffline: true,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.selectedTier).toBe("tier0_needle_edge");
      expect(res.body.costUsd).toBe(0.0);
    });

    it("routes to Tier 2 Colibri VPS when specified as target backend", async () => {
      const res = await request("/api/v1/mesh/dispatch", {
        method: "POST",
        body: {
          sourceProtocol: "openai_chat",
          targetBackend: "colibri_vps",
          prompt: "Run deep neural vector ranking on regional VPS",
          deviceMemoryGb: 8,
          isOffline: false,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.selectedTier).toBe("tier2_colibri_vps");
      expect(res.body.engine).toContain("Colibri");
    });

    it("routes complex prompts to Tier 4 Cloud Frontier with latency telemetry", async () => {
      const res = await request("/api/v1/mesh/dispatch", {
        method: "POST",
        body: {
          sourceProtocol: "openai_chat",
          targetBackend: "gemini_cloud",
          prompt: "Draft comprehensive legal patent claims for hybrid multi-modal CRDT architecture",
          deviceMemoryGb: 16,
          isOffline: false,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.selectedTier).toBe("tier4_cloud_frontier");
      expect(res.body.costUsd).toBeGreaterThan(0);
    });

    it("connects Cactus Needle 2 (Tier 0 local WASM) for offline Banglish dictionary lookups", async () => {
      const res = await request("/api/v1/mesh/dispatch", {
        method: "POST",
        body: {
          sourceProtocol: "openai_chat",
          targetBackend: "ollama_local",
          prompt: "Lookup Banglish phonetics: 'amar shonar bangla' to Anjali Bangla orthography",
          deviceMemoryGb: 1,
          isOffline: true,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.selectedTier).toBe("tier0_needle_edge");
      expect(res.body.engine).toContain("Cactus Needle 2");
      expect(res.body.costUsd).toBe(0.0);
    });

    it("links Colibri C Engine (Tier 2 VPS) for background PDF compilation & RAG embedding generation", async () => {
      const res = await request("/api/v1/mesh/dispatch", {
        method: "POST",
        body: {
          sourceProtocol: "openai_chat",
          targetBackend: "colibri_vps",
          prompt: "Compile print-ready Nilkhet PDF imposition and generate HNSW vector embeddings",
          deviceMemoryGb: 4,
          isOffline: false,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.selectedTier).toBe("tier2_colibri_vps");
      expect(res.body.engine).toContain("Colibri C Engine");
      expect(res.body.costUsd).toBe(0.0);
    });

    it("enables Cloud Frontier (Tier 4) fallback for complex book translations and deep-search synthesis", async () => {
      const res = await request("/api/v1/mesh/dispatch", {
        method: "POST",
        body: {
          sourceProtocol: "openai_chat",
          targetBackend: "deepseek_cloud",
          prompt: "Perform complete 400-page English to Sadhu/Cholit orthographic book translation with nuance retention",
          deviceMemoryGb: 16,
          isOffline: false,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.selectedTier).toBe("tier4_cloud_frontier");
      expect(res.body.engine).toContain("Gemini 3.7 / DeepSeek V3");
      expect(res.body.costUsd).toBeGreaterThan(0);
    });
  });
});
