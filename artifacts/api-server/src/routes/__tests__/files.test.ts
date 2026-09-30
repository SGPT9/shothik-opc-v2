import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { ragEngine } from "../../lib/rag-engine.js";

describe("Files & Document Ingestion Route Suite (/api/v1/files)", () => {
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

  it("POST /api/v1/files/upload ingests raw text document into vector RAG store", async () => {
    const res = await fetch(`${baseUrl}/api/v1/files/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `idem_file_upload_${Date.now()}`,
      },
      body: JSON.stringify({
        userId: "usr_file_test_1",
        filename: "bKash_payout_guide.md",
        rawContent: "# bKash Payout Guide\n\nAll disbursements require merchant OTP authorization.",
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.documentId).toBeDefined();
    expect(json.title).toBe("bKash_payout_guide.md");
    expect(json.chunksCreated).toBeGreaterThan(0);
  });

  it("POST /api/v1/files/upload parses base64 encoded PDF streams", async () => {
    const samplePdfText = "%PDF-1.4\n1 0 obj\n<< /Length 40 >>\nstream\nBangla Thesis Defense Chapter One Introduction.\nendstream\nendobj\n%%EOF";
    const base64Content = Buffer.from(samplePdfText, "utf8").toString("base64");

    const res = await fetch(`${baseUrl}/api/v1/files/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `idem_pdf_upload_${Date.now()}`,
      },
      body: JSON.stringify({
        userId: "usr_file_test_2",
        filename: "thesis_intro.pdf",
        fileBase64: base64Content,
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.title).toBe("thesis_intro.pdf");
    expect(json.previewMarkdown).toContain("Bangla Thesis Defense");
  });

  it("POST /api/v1/files/batch-upload ingests multiple documents concurrently", async () => {
    const res = await fetch(`${baseUrl}/api/v1/files/batch-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_file_test_3",
        files: [
          { filename: "doc1.txt", rawContent: "Content of Document 1" },
          { filename: "doc2.txt", rawContent: "Content of Document 2" },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBe(2);
    expect(json.documents.length).toBe(2);
  });

  it("GET /api/v1/files and GET /api/v1/files/:docId/content retrieves uploaded documents", async () => {
    // Ingest test document
    const uploadRes = await fetch(`${baseUrl}/api/v1/files/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_file_test_4",
        filename: "contract_memo.txt",
        rawContent: "Confidential milestone agreement details between parties.",
      }),
    });
    const uploadJson = (await uploadRes.json()) as any;
    const docId = uploadJson.documentId;

    // List user documents
    const listRes = await fetch(`${baseUrl}/api/v1/files?userId=usr_file_test_4`);
    expect(listRes.status).toBe(200);
    const listJson = (await listRes.json()) as any;
    expect(listJson.count).toBe(1);
    expect(listJson.documents[0].id).toBe(docId);

    // Fetch individual content
    const contentRes = await fetch(`${baseUrl}/api/v1/files/${docId}/content`, {
      headers: { "x-user-id": "usr_file_test_4" },
    });
    expect(contentRes.status).toBe(200);
    const contentJson = (await contentRes.json()) as any;
    expect(contentJson.document.title).toBe("contract_memo.txt");
    expect(contentJson.document.totalLength).toBeGreaterThan(0);
    expect(contentJson.document.chunkCount).toBeGreaterThan(0);
  });

  it("POST /api/v1/files/ocr extracts structured legal deed metadata with orthography normalization", async () => {
    const rawDeed = `
      গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
      ধানমন্ডি সাব-রেজিস্ট্রি অফিস, ঢাকা
      সাফ-কোবালা দলিল
      আরএস খতিয়ান নং ১২৮/খ, দাগ নং ৯৮২
      জমির পরিমাণ: ৫.৫০ শতাংশ
      পণ টাকা: ৪৫,০০,০০০
      সরকারী গেজেট মোতাবেক ১ম শ্রেণী কর্মকর্তাদের দাবী ও আইনজীবিদের শর্তাবলী প্রযোজ্য।
    `;

    const res = await fetch(`${baseUrl}/api/v1/files/ocr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `idem_ocr_${Date.now()}`,
      },
      body: JSON.stringify({
        userId: "usr_file_test_5",
        filename: "dalil_test.txt",
        rawContent: rawDeed,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.ocrResult.deedMetadata).toBeDefined();
    expect(json.ocrResult.deedMetadata.deedType).toBe("সাফ-কোবালা দলিল");
    expect(json.ocrResult.deedMetadata.subRegistryOffice).toContain("ধানমন্ডি সাব-রেজিস্ট্রি অফিস");
    expect(json.ocrResult.deedMetadata.khatian).toContain("১২৮/খ");
    expect(json.ocrResult.markdown).toContain("সরকারি"); // Normalized from সরকারী
    expect(json.ocrResult.markdown).toContain("শ্রেণি"); // Normalized from শ্রেণী
  });

  it("DELETE /api/v1/files/:docId removes the document from vector store", async () => {
    const uploadRes = await fetch(`${baseUrl}/api/v1/files/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_file_test_6",
        filename: "temp_doc.txt",
        rawContent: "Temporary document for deletion test.",
      }),
    });
    const uploadJson = (await uploadRes.json()) as any;
    const docId = uploadJson.documentId;

    const delRes = await fetch(`${baseUrl}/api/v1/files/${docId}`, {
      method: "DELETE",
      headers: { "x-user-id": "usr_file_test_6" },
    });
    expect(delRes.status).toBe(200);
    const delJson = (await delRes.json()) as any;
    expect(delJson.success).toBe(true);

    // Verify list is now empty
    const listRes = await fetch(`${baseUrl}/api/v1/files?userId=usr_file_test_6`);
    const listJson = (await listRes.json()) as any;
    expect(listJson.count).toBe(0);
  });
});
