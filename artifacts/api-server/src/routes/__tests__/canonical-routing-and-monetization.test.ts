import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Deep-Tech Standard: Canonical Routing, Deprecation & Outcome Passes", () => {
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

  // --- 1. NLP Canonicalization & RFC 8594 Deprecation Headers ---
  describe("API Gateway Canonicalization (RFC 8594)", () => {
    it("successfully invokes canonical /api/v1/nlp/paraphrase", async () => {
      const res = await request("/api/v1/nlp/paraphrase", {
        method: "POST",
        body: { text: "The quick brown fox jumps over the lazy dog", mode: "standard" },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paraphrasedText).toBeDefined();
    });

    it("attaches RFC 8594 Deprecation, Sunset, and Link headers when accessing legacy /api/paraphrase", async () => {
      const res = await request("/api/paraphrase", {
        method: "POST",
        body: { text: "This is a test sentence.", mode: "standard" },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["deprecation"]).toBe("true");
      expect(res.headers["sunset"]).toBeDefined();
      expect(res.headers["link"]).toContain('rel="successor-version"');
    });

    it("attaches RFC 8594 headers when accessing legacy /api/humanizerV5", async () => {
      const res = await request("/api/humanizerV5", {
        method: "POST",
        body: { text: "Furthermore, we must commence the operation." },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["deprecation"]).toBe("true");
      expect(res.headers["link"]).toContain("/api/v1/nlp/humanize");
      expect(res.body.humanizedText).toContain("Also,");
    });
  });

  // --- 2. Outcome-Based Micro-Passes & Financial Idempotency ---
  describe("Outcome-Based Micro-Pass Monetization & Ledger", () => {
    it("returns the public catalog of outcome-based passes (Thesis, Project, F-Commerce)", async () => {
      const res = await request("/api/v1/subscriptions/passes/catalog");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.currency).toBe("BDT");

      const passIds = res.body.passes.map((p: any) => p.id);
      expect(passIds).toContain("THESIS_PLAGIARISM_PASS");
      expect(passIds).toContain("PROJECT_VENTURE_PASS");
      expect(passIds).toContain("F_COMMERCE_MONTHLY_PASS");

      const thesisPass = res.body.passes.find((p: any) => p.id === "THESIS_PLAGIARISM_PASS");
      expect(thesisPass.priceBdt).toBe(49);
    });

    it("activates an outcome pass idempotently via POST /api/v1/subscriptions/passes:purchase", async () => {
      const idempotencyKey = `pass_idem_${Date.now()}_${Math.random()}`;
      const userId = `usr_student_${Date.now()}`;

      // First purchase
      const res1 = await request("/api/v1/subscriptions/passes:purchase", {
        method: "POST",
        headers: { "idempotency-key": idempotencyKey },
        body: {
          userId,
          passId: "THESIS_PLAGIARISM_PASS",
          trxId: "BK99281720",
        },
      });

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.passId).toBe("THESIS_PLAGIARISM_PASS");
      expect(res1.body.priceBdt).toBe(49);
      const initialBalance = res1.body.newCreditsBalance;

      // Replay with identical Idempotency-Key
      const res2 = await request("/api/v1/subscriptions/passes:purchase", {
        method: "POST",
        headers: { "idempotency-key": idempotencyKey },
        body: {
          userId,
          passId: "THESIS_PLAGIARISM_PASS",
          trxId: "BK99281720",
        },
      });

      expect(res2.status).toBe(200);
      expect(res2.headers["x-cache-lookup"]).toBe("HIT");
      expect(res2.headers["idempotency-replay"]).toBe("true");
      expect(res2.body.newCreditsBalance).toBe(initialBalance); // No double-crediting
    }, 15000);

    it("atomically deducts task credits via canonical /api/v1/subscriptions/ledger:deduct", async () => {
      const idempotencyKey = `deduct_idem_${Date.now()}_${Math.random()}`;
      const userId = `usr_merchant_${Date.now()}`;

      const res = await request("/api/v1/subscriptions/ledger:deduct", {
        method: "POST",
        headers: { "idempotency-key": idempotencyKey },
        body: {
          userId,
          amount: 2,
          taskId: "TASK_COURIER_NOTIF_102",
          taskTitle: "Steadfast Parcel In-Transit WhatsApp Dispatch",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deducted).toBe(2);
      expect(res.body.remainingCredits).toBe(498);
    });
  });

  // --- 3. Nilkhet Print-on-Demand (POD) Dispatch ---
  describe("Nilkhet Print-on-Demand (POD) Dispatch", () => {
    it("estimates live print & delivery costs in BDT", async () => {
      const res = await request("/api/v1/publishing/estimate-cost", {
        method: "POST",
        body: {
          pageCount: 160,
          copyCount: 2,
          paperType: "70gsm_offset",
          bindingType: "paperback_glue",
          deliveryCity: "Dhaka",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.breakdown.totalPayableBdt).toBeGreaterThan(100);
    });

    it("calculates exact book spine thickness and cover dimensions", async () => {
      const res = await request("/api/v1/publishing/calculate-spine", {
        method: "POST",
        body: { pageCount: 200, paperType: "80gsm_cream" },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.spineWidthMm).toBeGreaterThan(5);
      expect(res.body.coverDimensions.dpi).toBe(300);
    });

    it("creates a Nilkhet POD order idempotently with Steadfast courier dispatch", async () => {
      const idempotencyKey = `pod_idem_${Date.now()}_${Math.random()}`;

      const res = await request("/api/v1/publishing/nilkhet/orders", {
        method: "POST",
        headers: { "idempotency-key": idempotencyKey },
        body: {
          userId: "usr_author_101",
          bookTitle: "Deep Tech in Dhaka",
          pageCount: 150,
          copyCount: 1,
          totalPriceBdt: 380,
          recipientName: "Tanvir Ahmed",
          recipientPhone: "01712345678",
          deliveryAddress: "Dhanmondi 27",
          city: "Dhaka",
        },
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.trackingCode).toBeDefined();
      expect(res.body.invoiceNumber).toBeDefined();
      expect(res.body.status).toBe("PROCESSING_PRINT");
    }, 15000);
  });
});
