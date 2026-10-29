import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Pricing & Subscriptions Endpoints", { timeout: 25000 }, () => {
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

  it("GET /api/plans/public returns public pricing plans", async () => {
    const res = await fetch(`${baseUrl}/api/plans/public`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(2);
    expect(json.data[0]._id).toBe("monthly");
  });

  it("GET /api/packages/public returns public packages and pricing details", async () => {
    const res = await fetch(`${baseUrl}/api/packages/public`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    const starter = json.data.find((p: any) => p._id === "starter-pass");
    expect(starter).toBeDefined();
    expect(starter.price.BDT).toBe(100);
    expect(starter.price.USD).toBe(0.85);
  });

  it("initiates and verifies a checkout transaction idempotently", async () => {
    // 1. Initiate checkout
    const initRes = await fetch(`${baseUrl}/api/payment-transactions/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: "pro-operator",
        plan: "monthly",
        payment_method: "bkash",
        customer_email: "operator@shothik.ai",
      }),
    });
    expect(initRes.status).toBe(200);
    const initJson = await initRes.json();
    expect(initJson.success).toBe(true);
    const trxId = initJson.data.payment_transaction._id;
    expect(trxId).toBeDefined();
    expect(initJson.data.payment_transaction.credits).toBe(550);

    // 2. First verify
    const verifyRes = await fetch(`${baseUrl}/api/payment-transactions/${trxId}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "usr_test_pricing_1",
      },
    });
    expect(verifyRes.status).toBe(200);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.success).toBe(true);
    expect(verifyJson.data.verified).toBe(true);
    expect(verifyJson.data.creditedAmount).toBe(550);

    // 3. Second verify (idempotent, must not re-credit)
    const secondVerifyRes = await fetch(`${baseUrl}/api/payment-transactions/${trxId}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "usr_test_pricing_1",
      },
    });
    expect(secondVerifyRes.status).toBe(200);
    const secondVerifyJson = await secondVerifyRes.json();
    expect(secondVerifyJson.success).toBe(true);
    expect(secondVerifyJson.message).toContain("already verified");

    // 4. Verify wallet credit balance
    const credRes = await fetch(`${baseUrl}/api/v1/subscriptions/credits`, {
      headers: { "x-user-id": "usr_test_pricing_1" },
    });
    expect(credRes.status).toBe(200);
    const credJson = await credRes.json();
    expect(credJson.success).toBe(true);
    // Initial 500 + 550 = 1050
    expect(credJson.creditsBalance).toBe(1050);
  });

  it("POST /api/v1/mfs/verify-trx verifies MFS TrxID and credits user wallet", async () => {
    const trxId = `BK${Math.floor(10000000 + Math.random() * 90000000)}`;
    const res = await fetch(`${baseUrl}/api/v1/mfs/verify-trx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trxId,
        amountBdt: 750,
        provider: "bkash",
        senderMobileNumber: "01712345678",
        tier: "pro_750_bdt",
        userId: "usr_mfs_merchant_1",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.trxId).toBe(trxId);
    expect(json.provider).toBe("bkash");
    expect(json.creditedAmount).toBe(750);
  });

  it("GET /api/v1/subscriptions/passes/catalog returns micro-passes", async () => {
    const res = await fetch(`${baseUrl}/api/v1/subscriptions/passes/catalog`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.currency).toBe("BDT");
    expect(json.passes.length).toBe(3);
  });
});
