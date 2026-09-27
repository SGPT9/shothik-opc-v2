import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { MemoryTaskStore, LeasedTaskWorker } from "../../../../../lib/hermes/leased-task-worker.js";
import { globalActionEngine } from "../../lib/actions/action-proposal-engine.js";
import { globalBrowserEngine } from "../../lib/browser/browser-takeover-engine.js";
import { globalPdfFormEngine } from "../../../../../lib/office-engine/pdf-form-engine.js";

describe("Sprint 56: OpenMuse Agentic Compute, Persistent Browser & CAS Leased Engine", () => {
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

  // 1. HERMES LEASED TASK WORKER UNIT & CAS TESTS
  describe("Ticket 56.1: Hermes Distributed Leased Task Worker & CAS", () => {
    it("should acquire CAS lease and renew heartbeat without dropping tasks", async () => {
      const store = new MemoryTaskStore();
      let executed = false;

      const worker = new LeasedTaskWorker(
        store,
        async (owner, task, ctx) => {
          await ctx.event("step", "Step 1", "Doing work");
          await ctx.checkpoint({ state: { progress: 50 } });
          executed = true;
          return { status: "succeeded", result: "Completed" };
        },
        { leaseMs: 1000, pollMs: 50 },
      );

      await store.put("user-1", "tasks", {
        id: "task-test-01",
        title: "Test Task",
        prompt: "Run analysis",
        kind: "agent",
        status: "queued",
        plan: [],
        input: {},
        state: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attempts: 0,
        artifactIds: [],
      });

      await worker.tick();
      expect(executed).toBe(true);

      const finalTask = await store.get<any>("user-1", "tasks", "task-test-01");
      expect(finalTask?.status).toBe("succeeded");
      expect(finalTask?.state.progress).toBe(50);
      expect(finalTask?.leaseId).toBeNull();
    });

    it("should handle /api/tasks API endpoints", async () => {
      const res = await fetch(`${baseUrl}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Reconcile Steadfast COD returns", kind: "courier" }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.task.status).toBe("queued");
      const taskId = data.task.id;

      const getRes = await fetch(`${baseUrl}/api/tasks/${taskId}`);
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.task.id).toBe(taskId);

      const cancelRes = await fetch(`${baseUrl}/api/tasks/${taskId}/cancel`, { method: "POST" });
      expect(cancelRes.status).toBe(200);
      const cancelData = await cancelRes.json();
      expect(cancelData.success).toBe(true);
    });
  });

  // 2. PROTECTED ACTION PROPOSAL TESTS
  describe("Ticket 56.2: Protected Action Proposal & Review State Machine", () => {
    it("should create action proposal in awaiting_review with SHA-256 seal", async () => {
      const res = await fetch(`${baseUrl}/api/action-proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "bkash.payout",
          data: {
            recipientPhone: "01712345678",
            amount: 15000,
            reference: "SUPPLIER_PAY_99",
          },
          title: "Authorize Supplier Payout",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.proposal.status).toBe("awaiting_review");
      expect(data.proposal.hash).toHaveLength(64);

      const proposalId = data.proposal.id;

      // Approve proposal
      const approveRes = await fetch(`${baseUrl}/api/action-proposals/${proposalId}/approve`, {
        method: "POST",
      });
      expect(approveRes.status).toBe(200);
      const approveData = await approveRes.json();
      expect(approveData.proposal.status).toBe("succeeded");
    });

    it("should reject invalid proposal payloads", async () => {
      const res = await fetch(`${baseUrl}/api/action-proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "bkash.payout",
          data: {
            recipientPhone: "invalid-phone",
            amount: -100,
          },
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it("should allow explicit denial of action proposal", async () => {
      const proposal = globalActionEngine.createProposal("owner-1", {
        kind: "whatsapp.broadcast",
        data: {
          audienceSegment: "VIP Merchants",
          recipientCount: 50,
          messageTemplate: "Flash Sale Alert",
          previewSample: "Get 20% off today",
        },
      });

      const denyRes = await fetch(`${baseUrl}/api/action-proposals/${proposal.id}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Unscheduled broadcast blocked" }),
      });

      expect(denyRes.status).toBe(200);
      const denyData = await denyRes.json();
      expect(denyData.proposal.status).toBe("denied");
    });
  });

  // 3. BROWSER TAKEOVER & SSRF SECURITY TESTS
  describe("Ticket 56.3: Browser Takeover & SSRF Protection", () => {
    it("should block SSRF requests to localhost and private subnets", () => {
      expect(() => globalBrowserEngine.validatePublicUrl("http://localhost:8080")).toThrow(/SSRF Block/);
      expect(() => globalBrowserEngine.validatePublicUrl("http://127.0.0.1:3000")).toThrow(/SSRF Block/);
      expect(() => globalBrowserEngine.validatePublicUrl("http://169.254.169.254/latest/meta-data")).toThrow(/SSRF Block/);
      expect(() => globalBrowserEngine.validatePublicUrl("http://192.168.1.1")).toThrow(/SSRF Block/);
      expect(() => globalBrowserEngine.validatePublicUrl("http://10.0.0.1")).toThrow(/SSRF Block/);
    });

    it("should permit valid public URLs and execute remote input actions", async () => {
      const res = await fetch(`${baseUrl}/api/browser/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://news.ycombinator.com" }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      const sessionId = data.session.id;

      // Simulate click
      const clickRes = await fetch(`${baseUrl}/api/browser/sessions/${sessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "click", x: 640, y: 400 }),
      });

      expect(clickRes.status).toBe(200);
      const clickData = await clickRes.json();
      expect(clickData.message).toContain("Simulated click at coordinates (640, 400)");

      // Simulate text input
      const textRes = await fetch(`${baseUrl}/api/browser/sessions/${sessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", text: "Search Query" }),
      });

      expect(textRes.status).toBe(200);
      const textData = await textRes.json();
      expect(textData.message).toContain("Typed 'Search Query'");
    });
  });

  // 4. NILKHET PDF FORM ENGINE TESTS
  describe("Ticket 56.4: Nilkhet Interactive PDF Form Extraction & Receipts", () => {
    it("should list templates and extract AcroForm fields", async () => {
      const res = await fetch(`${baseUrl}/api/pdf-forms/templates`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.count).toBeGreaterThan(0);
      const templateId = data.documents[0].id;

      // Fill form
      const fillRes = await fetch(`${baseUrl}/api/pdf-forms/templates/${templateId}/fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: {
            business_name: "Dhaka Digital OPC Ltd.",
            proprietor_name: "Shofiul Alam",
            nid_number: "1992269201928374",
            declaration_accepted: "true",
          },
        }),
      });

      expect(fillRes.status).toBe(200);
      const fillData = await fillRes.json();
      expect(fillData.document.isCompleted).toBe(true);

      // Generate signed receipt
      const receiptRes = await fetch(`${baseUrl}/api/pdf-forms/templates/${templateId}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: "Shofiul Alam", channel: "nilkhet_print" }),
      });

      expect(receiptRes.status).toBe(200);
      const receiptData = await receiptRes.json();
      expect(receiptData.receipt.receiptId).toContain("RCPT-");
      expect(receiptData.receipt.signedHash).toHaveLength(64);
    });
  });
});
