import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { ragEngine } from "../../lib/rag-engine.js";

describe("RAG Document Ingestion & Hybrid Vector Search (/api/v1/rag)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    ragEngine.clearStore();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    ragEngine.clearStore();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("POST /api/v1/rag/ingest chunks and vectorizes long document text", async () => {
    const res = await fetch(`${baseUrl}/api/v1/rag/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_rag_test_1",
        title: "bKash & Nagad MFS Integration Architecture",
        content: `
          The Shothik payment gateway provides direct integration with bKash and Nagad.
          All bKash transactions require a 10-character alphanumeric TrxID starting with 7, 8, 9, B, or C.
          Steadfast courier logistics automates next-day parcel delivery across Bangladesh.
          The backend API gateway runs on Express 5 with Docker deployment on Hostinger VPS.
        `,
        sourceType: "markdown",
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.document.title).toBe("bKash & Nagad MFS Integration Architecture");
    expect(json.chunksCreated).toBeGreaterThan(0);
  });

  it("POST /api/v1/rag/query retrieves relevant chunks with hybrid cosine scoring", async () => {
    // Ingest 2 separate documents
    await ragEngine.ingestDocument({
      userId: "usr_rag_test_2",
      title: "Logistics Guide",
      content: "Steadfast courier handles parcel booking, automated tracking, and cash on delivery settlement.",
    });

    await ragEngine.ingestDocument({
      userId: "usr_rag_test_2",
      title: "Database Architecture",
      content: "PostgreSQL with pgvector and Redis caching stores user embeddings and semantic memory traces.",
    });

    const res = await fetch(`${baseUrl}/api/v1/rag/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_rag_test_2",
        query: "How does Steadfast courier tracking work?",
        topK: 2,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.results.length).toBeGreaterThan(0);
    expect(json.results[0].title).toBe("Logistics Guide");
    expect(json.results[0].score).toBeGreaterThan(0);
  });

  it("GET /api/v1/rag/documents lists user ingested documents", async () => {
    await ragEngine.ingestDocument({
      userId: "usr_rag_test_3",
      title: "Doc Alpha",
      content: "Sample content alpha",
    });

    const res = await fetch(`${baseUrl}/api/v1/rag/documents?userId=usr_rag_test_3`, {
      method: "GET",
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBe(1);
    expect(json.documents[0].title).toBe("Doc Alpha");
  });

  it("DELETE /api/v1/rag/documents/:docId removes document and chunks", async () => {
    const doc = await ragEngine.ingestDocument({
      userId: "usr_rag_test_4",
      title: "Doc to delete",
      content: "Temporary content",
    });

    const res = await fetch(`${baseUrl}/api/v1/rag/documents/${doc.document.id}?userId=usr_rag_test_4`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.deletedDocId).toBe(doc.document.id);

    const checkList = ragEngine.listDocuments("usr_rag_test_4");
    expect(checkList.length).toBe(0);
  });
});
