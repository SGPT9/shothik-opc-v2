import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import http from "http";
import connectorsRouter from "../connectors.js";
import { ragEngine } from "../../lib/rag-engine.js";

describe("Live Swarm Connectors & Vector Sync Test Suite", () => {
  let app: express.Express;
  let server: http.Server;
  let baseUrl: string;
  const testUserId = "usr_live_sync_tester";

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(connectorsRouter);

    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });

    ragEngine.clearStore();
  });

  afterAll(async () => {
    ragEngine.clearStore();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("POST /v1/connectors/notion/sync synchronizes workspace pages into RAG vector store", async () => {
    const res = await fetch(`${baseUrl}/v1/connectors/notion/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: testUserId,
        databaseId: "notion_db_engineering",
        pageLimit: 5,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.provider).toBe("notion");
    expect(json.syncedCount).toBeGreaterThanOrEqual(3);
    expect(json.pages.length).toBeGreaterThanOrEqual(3);
    expect(json.pages[0].docId).toBeDefined();
  });

  it("POST /v1/connectors/gdrive/sync synchronizes Google Docs & Sheets into RAG vector store", async () => {
    const res = await fetch(`${baseUrl}/v1/connectors/gdrive/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: testUserId,
        folderId: "gdrive_finance_ops",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.provider).toBe("google_drive");
    expect(json.syncedCount).toBeGreaterThanOrEqual(2);
    expect(json.files[0].title).toContain("Logistics");
  });

  it("POST /v1/connectors/github/sync parses repository markdown and code into RAG store", async () => {
    const res = await fetch(`${baseUrl}/v1/connectors/github/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: testUserId,
        repo: "SGPT9/shothik-opc-v2",
        branch: "main",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.provider).toBe("github");
    expect(json.syncedCount).toBe(3);
    expect(json.items[0].title).toContain("README.md");
  });

  it("GET /v1/connectors/status returns aggregated status and document counts", async () => {
    const res = await fetch(`${baseUrl}/v1/connectors/status?userId=${testUserId}`);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.totalIndexedDocuments).toBeGreaterThanOrEqual(8);
    const notionStatus = json.connectors.find((c: any) => c.provider === "notion");
    expect(notionStatus).toBeDefined();
    expect(notionStatus.status).toBe("connected");
    expect(notionStatus.itemsIndexed).toBeGreaterThanOrEqual(3);
  });

  it("GET /v1/connectors/github/items lists specific provider synced assets", async () => {
    const res = await fetch(`${baseUrl}/v1/connectors/github/items?userId=${testUserId}`);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.provider).toBe("github");
    expect(json.count).toBeGreaterThanOrEqual(3);
    expect(json.items.length).toBeGreaterThanOrEqual(3);
  });
});
