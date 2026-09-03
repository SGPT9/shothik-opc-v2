import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("MFS Settlement, Steadfast Logistics & Human-in-the-Loop Governance", () => {
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

  // --- 1. MFS Settlement & TrxID Verification ---
  describe("MFS Settlement Rail (bKash & Nagad)", () => {
    const uniqueTrx = `BK${Math.floor(10000000 + Math.random() * 90000000)}`;

    it("verifies and credits a valid bKash TrxID transaction", async () => {
      const res = await request("/api/v1/mfs/verify-trx", {
        method: "POST",
        body: {
          trxId: uniqueTrx,
          provider: "bkash",
          senderMobileNumber: "01712345678",
          tier: "pro_750_bdt",
          amountBdt: 750,
          userId: "usr_finance_test",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.trxId).toBe(uniqueTrx);
      expect(res.body.provider).toBe("bkash");
    });

    it("enforces idempotency on duplicate TrxID submissions to prevent double-crediting", async () => {
      const duplicateRes = await request("/api/v1/mfs/verify-trx", {
        method: "POST",
        body: {
          trxId: uniqueTrx,
          provider: "bkash",
          senderMobileNumber: "01712345678",
          tier: "pro_750_bdt",
          amountBdt: 750,
          userId: "usr_finance_test",
        },
      });

      expect(duplicateRes.body.status).toBe("already_processed");
      expect(duplicateRes.body.idempotent).toBe(true);
    });

    it("parses raw SMS notification into structured transaction details", async () => {
      const res = await request("/api/v1/mfs/parse-sms", {
        method: "POST",
        body: {
          smsText: "You have received Tk 1,500.00 from 01712345678. Fee Tk 0.00. Balance Tk 4,820.00. TrxID BK48566110 at 01/09/2026 15:30.",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.parsed.trxId).toBe("BK48566110");
      expect(res.body.parsed.amountBdt).toBe(1500);
      expect(res.body.parsed.senderPhone).toBe("01712345678");
      expect(res.body.parsed.provider).toBe("bkash");
    });

    it("disburses creator earnings to bKash with 10% NBR TDS tax withholding", async () => {
      const res = await request("/api/v1/mfs/payout", {
        method: "POST",
        body: {
          userId: "usr_creator_801",
          payoutAmountBdt: 2000,
          mfsProvider: "bkash",
          walletNumber: "01812345678",
          creatorNote: "Course & Prompt Marketplace Payout",
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.grossRequestedBdt).toBe(2000);
      expect(res.body.nbrTdsDeductedBdt).toBe(200); // 10% TDS
      expect(res.body.netDisbursedBdt).toBe(1800); // Net 1800 BDT
      expect(res.body.status).toBe("DISBURSED");
      expect(res.body.payoutTrxId).toBeDefined();
    });
  });


  // --- 2. Steadfast & Pathao Courier Logistics ---
  describe("Logistics & Courier Rail", () => {
    it("books a Steadfast parcel and computes dynamic Dhaka delivery fees", async () => {
      const res = await request("/api/v1/logistics/steadfast/book", {
        method: "POST",
        body: {
          provider: "steadfast",
          order: {
            source: "manual",
            customerName: "Rashidul Islam",
            customerPhone: "01812345678",
            deliveryAddress: "Road 10, Dhanmondi",
            city: "Dhaka",
            items: [
              {
                sku: "SKU-NLK-001",
                title: "Shothik Deep Tech Guide",
                quantity: 1,
                unitPriceBdt: 1450,
              },
            ],
            codAmountBdt: 1450,
          },
          autoSendWhatsAppConfirmation: true,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.trackingCode).toBeDefined();
      expect(res.body.deliveryFeeBdt).toBe(60); // Inside Dhaka fee
      expect(res.body.whatsappNotificationStatus).toBe("sent");
    });
  });

  // --- 3. Human-in-the-Loop Governance & Approvals ---
  describe("Human-in-the-Loop Approval Queue", () => {
    it("fetches pending approvals and commits approved items", async () => {
      const queueRes = await request("/api/v1/approvals/queue");
      expect(queueRes.status).toBe(200);
      expect(queueRes.body.success).toBe(true);
      expect(Array.isArray(queueRes.body.items)).toBe(true);

      // Commit one approval item
      const commitRes = await request("/api/v1/approvals/commit", {
        method: "POST",
        body: {
          all: true,
        },
      });

      expect(commitRes.status).toBe(200);
      expect(commitRes.body.success).toBe(true);
      expect(typeof commitRes.body.committedCount).toBe("number");
    });

    it("evaluates execution safety using Gatekeeper tool guardrails", async () => {
      const evalRes = await request("/api/v1/gatekeeper/evaluate-tool", {
        method: "POST",
        body: {
          toolName: "database_drop_table",
          args: { query: "DROP TABLE users" },
        },
      });

      expect(evalRes.status).toBe(200);
      expect(evalRes.body.allowed).toBe(false);
      expect(evalRes.body.requiresUserConfirmation).toBe(true);
      expect(evalRes.body.reason).toMatch(/destructive/i);
    });
  });
});
