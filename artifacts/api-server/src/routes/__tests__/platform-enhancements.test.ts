import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Platform Enhancements Suite (Files, Connectors, Task Credits)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // --- 1. File Upload Enhancements ---
  describe("File Upload & Ingestion", () => {
    it("POST /api/v1/files/upload parses text document, computes SHA-256 and indexes into RAG", async () => {
      const res = await fetch(`${baseUrl}/api/v1/files/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "architecture_spec.md",
          rawContent: "# Shothik Agentic Architecture\n\nDeep-tech multi-agent consensus and execution.",
          userId: "usr_test_files",
        }),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.documentId).toMatch(/^doc_/);
      expect(json.fileHash).toBeDefined();
      expect(json.fileHash.length).toBe(64); // SHA-256 hex string
      expect(json.chunksCreated).toBeGreaterThanOrEqual(1);
    });

    it("POST /api/v1/files/batch-upload ingests multiple documents in a single request", async () => {
      const res = await fetch(`${baseUrl}/api/v1/files/batch-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_test_files",
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



    it("POST /api/v1/files/ocr normalizes Bangla Academy spelling and extracts legal deed metadata", async () => {

      const res = await fetch(`${baseUrl}/api/v1/files/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "dhanmondi_land_deed.pdf",
          rawContent: "সাফ-কোবালা দলিল। ধানমন্ডি সাব-রেজিস্ট্রি অফিস, ঢাকা। আরএস খতিয়ান নং ৪৫০, দাগ নং ৯৮২। জমির পরিমাণ ৫.৫০ শতাংশ। দলিলের মূল্য ৳৪৫,০০,০০০ টাকা। সরকারী নিয়ম অনুযায়ী ও দাবী ত্যাগ পূর্বক সম্পাদিত।",
          userId: "usr_lawyer_1",
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.ocrResult.deedMetadata).toBeDefined();
      expect(json.ocrResult.deedMetadata.deedType).toBe("সাফ-কোবালা দলিল");
      expect(json.ocrResult.deedMetadata.subRegistryOffice).toContain("ধানমন্ডি সাব-রেজিস্ট্রি অফিস");
      expect(json.ocrResult.markdown).toContain("সরকারি"); // Normalized from সরকারী
      expect(json.ocrResult.markdown).toContain("দাবি"); // Normalized from দাবী
    });
  });


  // --- 2. Connectors & Model Verification ---
  describe("Connectors & Verification", () => {
    it("POST /api/v1/connectors/test verifies OpenAI connector and returns capability metadata", async () => {
      const res = await fetch(`${baseUrl}/api/v1/connectors/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
          apiKey: "sk-proj-test-mock-key",
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.provider).toBe("openai");
      expect(json.category).toBe("llm");
      expect(json.capabilities.supportsVision).toBe(true);
      expect(json.capabilities.contextWindow).toBe(128000);
    });

    it("POST /api/v1/connectors/verify verifies Dokploy PaaS connector", async () => {
      const res = await fetch(`${baseUrl}/api/v1/connectors/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "dokploy",
          apiKey: "dokploy_admin_token",
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.category).toBe("paas");
    });
  });

  // --- 3. Task Credit Deduction & Wallet Ledger ---
  describe("Task Credit Economy & Deductions", () => {
    it("GET /api/v1/subscriptions/credits retrieves the live credit balance", async () => {
      const res = await fetch(`${baseUrl}/api/v1/subscriptions/credits?userId=usr_credit_tester`);
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.creditsBalance).toBe(500);
      expect(json.canExecuteAutonomousTask).toBe(true);
    });

    it("POST /api/v1/subscriptions/deduct-credits decrements balance upon task execution", async () => {
      const res = await fetch(`${baseUrl}/api/v1/subscriptions/deduct-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_credit_tester",
          amount: 2,
          taskId: "task_test_909",
          taskTitle: "Tax Clearance Report Generation",
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.deducted).toBe(2);
      expect(json.remainingCredits).toBe(498);
      expect(json.transactionId).toMatch(/^TX_CR_/);
    });

    it("POST /api/v1/subscriptions/deduct-credits returns 402 when balance is insufficient", async () => {
      const res = await fetch(`${baseUrl}/api/v1/subscriptions/deduct-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_broke_founder",
          amount: 9999, // Exceeds 500 default balance
        }),
      });

      expect(res.status).toBe(402);
      const json = (await res.json()) as any;
      expect(json.success).toBe(false);
      expect(json.topupRequired).toBe(true);
    });

    it("POST /api/v1/subscriptions/topup-credits tops up wallet balance", async () => {
      const res = await fetch(`${baseUrl}/api/v1/subscriptions/topup-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_broke_founder",
          amount: 1000,
          trxId: "TRX_BKASH_998877",
          paymentMethod: "bkash",
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.addedCredits).toBe(1000);
      expect(json.creditsBalance).toBe(1500);
    });
  });
});
