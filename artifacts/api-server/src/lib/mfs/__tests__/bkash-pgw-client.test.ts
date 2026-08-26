import { describe, it, expect, vi, beforeEach } from "vitest";
import { BkashPgwClient } from "../bkash-pgw-client.js";

describe("BkashPgwClient", () => {
  let client: BkashPgwClient;

  beforeEach(() => {
    client = new BkashPgwClient({
      appKey: "test_app_key",
      appSecret: "test_app_secret",
      username: "test_user",
      password: "test_password",
    });
    vi.restoreAllMocks();
  });

  it("handles grant token creation", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id_token: "mock_jwt_grant_token",
        expires_in: "3600",
      }),
    } as any);

    const token = await client.getGrantToken();
    expect(token).toBe("mock_jwt_grant_token");
  });

  it("creates payment session and returns gateway URL", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_token: "mock_jwt_grant_token", expires_in: "3600" }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          paymentID: "PAY-12345",
          bkashURL: "https://sandbox.payment.bka.sh/checkout/PAY-12345",
          amount: "550",
          transactionStatus: "Initiated",
          statusCode: "0000",
        }),
      } as any);

    const res = await client.createPayment({
      mode: "0011",
      payerReference: "01700112233",
      callbackURL: "https://shothik-eight.vercel.app/api/mfs/callback",
      amount: "550",
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: "INV-101",
    });

    expect(res.paymentID).toBe("PAY-12345");
    expect(res.transactionStatus).toBe("Initiated");
    expect(res.bkashURL).toContain("PAY-12345");
  });

  it("executes payment and returns TrxID", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_token: "mock_jwt_grant_token", expires_in: "3600" }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          paymentID: "PAY-12345",
          trxID: "TRX998877BK",
          transactionStatus: "Completed",
          amount: "550",
          currency: "BDT",
          statusCode: "0000",
        }),
      } as any);

    const res = await client.executePayment("PAY-12345");
    expect(res.trxID).toBe("TRX998877BK");
    expect(res.transactionStatus).toBe("Completed");
  });
});
