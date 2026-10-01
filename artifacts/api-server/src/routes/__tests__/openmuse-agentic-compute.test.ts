import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { tasksRouter } from "../tasks.js";
import { actionProposalsRouter } from "../action-proposals.js";
import { browserTakeoverRouter } from "../browser-takeover.js";
import { pdfFormsRouter } from "../pdf-forms.js";

const app = express();
app.use(express.json());
app.use("/api", tasksRouter);
app.use("/api", actionProposalsRouter);
app.use("/api", browserTakeoverRouter);
app.use("/api", pdfFormsRouter);

describe("OpenMuse Agentic Compute, Persistent Browser Takeover & CAS Leased Task Engine (Slice 81)", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  // --- SUITE 1: CAS LEASED TASK WORKER (TICKET 56.1) ---
  describe("CAS Leased Task Worker API", () => {
    let createdTaskId: string;

    it("GET /api/v1/tasks returns task listing and active worker status", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tasks?owner=test-owner`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.tasks)).toBe(true);
      expect(typeof json.workerRunning).toBe("boolean");
    });

    it("POST /api/v1/tasks queues a task and triggers leased execution", async () => {
      const payload = {
        owner: "test-owner",
        title: "Steadfast COD Payout Reconciliation",
        prompt: "Reconcile daily COD settlements against bank deposits and flag discrepancies",
        kind: "agent",
        plan: [
          { id: "step-1", title: "Fetch Steadfast Courier API status", status: "pending" },
          { id: "step-2", title: "Match invoice amounts against bKash deposits", status: "pending" },
        ],
      };

      const res = await fetch(`${baseUrl}/api/v1/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.task.id).toBeDefined();
      expect(json.task.title).toBe(payload.title);
      expect(json.task.status).toBe("queued");
      createdTaskId = json.task.id;
    });

    it("GET /api/v1/tasks/:id retrieves individual task details", async () => {
      expect(createdTaskId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/v1/tasks/${createdTaskId}`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.task.id).toBe(createdTaskId);
    });

    it("POST /api/v1/tasks/:id/cancel cancels an existing task", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tasks/${createdTaskId}/cancel`, {
        method: "POST",
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.task.status).toBe("cancelled");
    });
  });

  // --- SUITE 2: PROTECTED ACTION PROPOSAL & STORED REVIEW (TICKET 56.2) ---
  describe("Protected Action Proposal Engine API", () => {
    let bkashProposalId: string;

    it("POST /api/v1/action-proposals creates and cryptographically hashes a bKash payout proposal", async () => {
      const payload = {
        owner: "founder-01",
        kind: "bkash.payout",
        title: "Vendor Advance for Nilkhet Print Run",
        data: {
          recipientPhone: "01712345678",
          amount: 35000,
          reference: "NILKHET_ADV_89",
          notes: "35,000 BDT advance for 100 paperback copies",
        },
        expiresInMinutes: 30,
      };

      const res = await fetch(`${baseUrl}/api/v1/action-proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.proposal.id).toBeDefined();
      expect(json.proposal.kind).toBe("bkash.payout");
      expect(json.proposal.status).toBe("awaiting_review");
      expect(json.proposal.hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 integrity hash
      bkashProposalId = json.proposal.id;
    });

    it("rejects invalid Bangladeshi phone number with 400 Bad Request", async () => {
      const payload = {
        owner: "founder-01",
        kind: "bkash.payout",
        data: {
          recipientPhone: "123456", // Invalid phone
          amount: 5000,
        },
      };

      const res = await fetch(`${baseUrl}/api/v1/action-proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("POST /api/v1/action-proposals/:id/approve executes the proposal", async () => {
      expect(bkashProposalId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/v1/action-proposals/${bkashProposalId}/approve`, {
        method: "POST",
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.proposal.status).toBe("succeeded");
      expect(json.proposal.result).toContain("Action bkash.payout executed successfully");
    });

    it("creates and denies a courier dispatch proposal with reason", async () => {
      const createRes = await fetch(`${baseUrl}/api/v1/action-proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: "founder-01",
          kind: "courier.dispatch",
          title: "Dispatch High-Value COD Parcel",
          data: {
            courier: "steadfast",
            recipientName: "Rahim Chowdhury",
            recipientPhone: "01812345678",
            deliveryAddress: "House 12, Road 4, Dhanmondi, Dhaka",
            codAmount: 18500,
            itemDescription: "2x Mechanical Keyboards",
          },
        }),
      });

      const createJson = await createRes.json();
      const proposalId = createJson.proposal.id;

      const denyRes = await fetch(`${baseUrl}/api/v1/action-proposals/${proposalId}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Customer requested delivery address modification" }),
      });

      expect(denyRes.status).toBe(200);
      const denyJson = await denyRes.json();
      expect(denyJson.success).toBe(true);
      expect(denyJson.proposal.status).toBe("denied");
      expect(denyJson.proposal.error).toContain("Customer requested delivery address modification");
    });
  });

  // --- SUITE 3: EGRESS-PROXIED BROWSER WORKER & TAKEOVER (TICKET 56.3) ---
  describe("Egress-Proxied Browser Worker API", () => {
    let activeSessionId: string;

    it("blocks SSRF loopback, private networks, and cloud metadata endpoints", async () => {
      const maliciousUrls = [
        "http://localhost:8080/admin",
        "http://127.0.0.1:3000/secret",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/internal",
        "http://192.168.1.1/router-login",
      ];

      for (const url of maliciousUrls) {
        const res = await fetch(`${baseUrl}/api/v1/browser/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error).toContain("SSRF Block");
      }
    });

    it("POST /api/v1/browser/sessions creates valid session for public URL", async () => {
      const res = await fetch(`${baseUrl}/api/v1/browser/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: "test-user",
          url: "https://news.ycombinator.com",
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.session.id).toBeDefined();
      expect(json.session.status).toBe("active");
      expect(json.session.viewport).toEqual({ width: 1280, height: 800 });
      activeSessionId = json.session.id;
    });

    it("POST /api/v1/browser/sessions/:id/action executes click with normalized coordinates", async () => {
      expect(activeSessionId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/v1/browser/sessions/${activeSessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "click",
          x: 450,
          y: 220,
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.action.type).toBe("click");
      expect(json.session.lastScreenshotBase64).toBeDefined();
    });

    it("POST /api/v1/browser/sessions/:id/action executes text entry and scroll", async () => {
      const textRes = await fetch(`${baseUrl}/api/v1/browser/sessions/${activeSessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          text: "Search Query: Nilkhet Press",
        }),
      });
      expect(textRes.status).toBe(200);

      const scrollRes = await fetch(`${baseUrl}/api/v1/browser/sessions/${activeSessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "scroll",
          deltaY: 350,
        }),
      });
      expect(scrollRes.status).toBe(200);
    });

    it("POST /api/v1/browser/sessions/:id/close closes browser session", async () => {
      const res = await fetch(`${baseUrl}/api/v1/browser/sessions/${activeSessionId}/close`, {
        method: "POST",
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.session.status).toBe("closed");
    });
  });

  // --- SUITE 4: NILKHET INTERACTIVE PDF FORM EXTRACTION & RECEIPT (TICKET 56.4) ---
  describe("Nilkhet Interactive PDF Form Extraction API", () => {
    let templateId: string;
    let receiptId: string;

    it("GET /api/v1/pdf-forms/templates returns seeded Nilkhet government & trade templates", async () => {
      const res = await fetch(`${baseUrl}/api/v1/pdf-forms/templates`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBeGreaterThanOrEqual(1);
      expect(json.documents[0].fields.length).toBeGreaterThanOrEqual(4);
      templateId = json.documents[0].id;
    });

    it("POST /api/v1/pdf-forms/templates/:id/fill validates submitted fields and updates SHA-256 seal", async () => {
      expect(templateId).toBeDefined();

      const res = await fetch(`${baseUrl}/api/v1/pdf-forms/templates/${templateId}/fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: {
            business_name: "Nilkhet Digital Press & Publishing Ltd.",
            proprietor_name: "Mahmud Hasan",
            nid_number: "19902692512345678",
            tin_number: "782390123456",
            trade_type: "Software / ICT Service",
            declaration_accepted: "true",
          },
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.missingFields).toHaveLength(0);
      expect(json.document.isCompleted).toBe(true);
      expect(json.document.sha256Seal).toMatch(/^[a-f0-9]{64}$/);
    });

    it("POST /api/v1/pdf-forms/templates/:id/receipt issues cryptographic print/delivery receipt", async () => {
      const res = await fetch(`${baseUrl}/api/v1/pdf-forms/templates/${templateId}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: "Mahmud Hasan",
          channel: "nilkhet_print",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.receipt.receiptId).toMatch(/^RCPT-[A-Z0-9]{8}$/);
      expect(json.receipt.signedHash).toMatch(/^[a-f0-9]{64}$/);
      expect(json.receipt.recipient).toBe("Mahmud Hasan");
      receiptId = json.receipt.receiptId;
    });

    it("GET /api/v1/pdf-forms/receipts/:receiptId verifies signed receipt", async () => {
      expect(receiptId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/v1/pdf-forms/receipts/${receiptId}`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.receipt.receiptId).toBe(receiptId);
    });
  });
});
