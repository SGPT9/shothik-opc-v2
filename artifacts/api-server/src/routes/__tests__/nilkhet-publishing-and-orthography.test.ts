import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Nilkhet POD Publishing, Bangla Academy Orthography & Frontier Integrations", { timeout: 25000 }, () => {
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

  // --- 1. Nilkhet Print-on-Demand (POD) Order Lifecycle ---
  describe("Nilkhet Publishing POD Rail", () => {
    it("creates, filters and updates a Nilkhet POD book order", async () => {
      // 1. Create order
      const createRes = await request("/api/v1/publishing/orders", {
        method: "POST",
        body: {
          bookTitle: "Deep-Tech Frontiers of Bengal",
          authorName: "Shothik Research Lab",
          pageCount: 160,
          coverType: "paperback_glossy",
          paperQuality: "80gsm_cream",
          bindingStyle: "perfect_binding",
          colorMode: "bw",
          quantity: 2,
          customerName: "Imran Hossain",
          customerPhone: "01711000000",
          shippingAddress: "Nilkhet Book Market, Dhaka",
          district: "Dhaka",
          deliveryMethod: "steadfast",
          unitPriceBdt: 180,
          totalPriceBdt: 360,
          deliveryFeeBdt: 60,
          totalPayableBdt: 420,
          paymentMethod: "bkash",
          paymentStatus: "pending",
        },
      });

      expect([200, 201]).toContain(createRes.status);
      expect(createRes.body.success).toBe(true);
      const invoiceNumber = createRes.body.invoiceNumber || createRes.body.order?.invoiceNumber;
      expect(invoiceNumber).toBeDefined();

      // 2. Fetch orders list with status filter
      const listRes = await request(`/api/v1/publishing/orders?status=pending`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(Array.isArray(listRes.body.orders)).toBe(true);

      // 3. Update order status to 'printed'
      const updateRes = await request(`/api/v1/publishing/orders/${invoiceNumber}/status`, {
        method: "PATCH",
        body: {
          status: "printed",
          notes: "Dispatched from Nilkhet press shop #14",
        },
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.order.status).toBe("printed");
    });
  });

  // --- 2. Bangla Academy Standardized Orthography ---
  describe("Bangla Academy Standardized Grammar & Orthography", () => {
    it("identifies spelling error based on Anjali short-i rule (শ্রদ্ধাঞ্জলী -> শ্রদ্ধাঞ্জলি)", async () => {
      const res = await request("/api/v1/nlp/grammar:check", {
        method: "POST",
        body: {
          text: "আমরা শ্রদ্ধার সাথে শ্রদ্ধাঞ্জলী জ্ঞাপন করছি।",
          language: "bn",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalIssues).toBeGreaterThan(0);
      const spellingIssue = res.body.data.corrections.find((c: any) => c.error === "শ্রদ্ধাঞ্জলী");
      expect(spellingIssue).toBeDefined();
      expect(spellingIssue.correct).toBe("শ্রদ্ধাঞ্জলি");
    });

    it("identifies Sadhu-Cholit register mixing (করিব -> করব)", async () => {
      const res = await request("/api/v1/nlp/grammar:check", {
        method: "POST",
        body: {
          text: "আমি কাজটি আগামীকাল করিব।",
          language: "bn",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const sadhuIssue = res.body.data.corrections.find((c: any) => c.error === "করিব");
      expect(sadhuIssue).toBeDefined();
      expect(sadhuIssue.correct).toBe("করব");
    });
  });

  // --- 3. Autonomous Twin Workspace Seed Persistence ---
  describe("Autonomous Twin Seed Store & Lifecycle", () => {
    it("persists and retrieves business plan and starter tasks for conversation", async () => {
      const putRes = await request("/api/v1/twin/seed", {
        method: "PUT",
        headers: {
          "x-chat-device-id": "dev_test_device_123",
          origin: "http://localhost",
        },
        body: {
          conversationId: "conv_test_001",
          companyName: "Chittagong MedExpress",
          summary: "On-demand pharmaceutical delivery network.",
          businessPlan: "## Value Proposition\nSub-30 minute prescription delivery across Chittagong.",
          tasks: ["Map local pharmacies", "Hire delivery riders", "Integrate bKash PGW"],
        },
      });

      expect([200, 201]).toContain(putRes.status);
      expect(putRes.body.data).toBeDefined();

      const getRes = await request("/api/v1/twin/seed?conversationId=conv_test_001", {
        headers: {
          "x-chat-device-id": "dev_test_device_123",
          origin: "http://localhost",
        },
      });

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.companyName).toBe("Chittagong MedExpress");
      expect(Array.isArray(getRes.body.data.tasks)).toBe(true);
    });
  });

  // --- 4. Banglish Phonetic Voice Intent Normalizer ---
  describe("Phonetic Regional Voice Engine", () => {
    it("classifies bKash payment verification intent from raw voice transcript", async () => {
      const res = await request("/api/v1/voice/transcribe", {
        method: "POST",
        body: {
          text: "bKash e 500 taka pathaisi TrxID 9K382LP check koro",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.normalizedText).toContain("bKash");
      expect(res.body.intent).toBe("PAYMENT_RECONCILIATION");
      expect(res.body.entities.trxId).toBe("9K382LP");
    });
  });
});
