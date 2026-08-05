import { describe, it, expect } from "vitest";
import { BkashNagadPaymentService } from "../bkash-nagad-adapter";

describe("BkashNagadPaymentService South Asian MFS Payments", () => {
  it("should create 1-click bKash checkout session URL", async () => {
    const session = await BkashNagadPaymentService.createCheckoutSession({
      workspaceId: "ws_mfs_test_1",
      invoiceId: "inv_998877",
      amountBdt: 1500,
      provider: "bkash",
    });

    expect(session.paymentId).toBeDefined();
    expect(session.checkoutUrl).toContain("pay.shothik.app/mfs/bkash");
    expect(session.amountBdt).toBe(1500);
    expect(session.status).toBe("initiated");
  });

  it("should verify Nagad payment transaction status", async () => {
    const result = await BkashNagadPaymentService.verifyTransaction("mfs_nagad_123", "nagad");

    expect(result.verified).toBe(true);
    expect(result.trxID).toContain("TRX_NAGAD_");
    expect(result.provider).toBe("nagad");
    expect(result.status).toBe("completed");
  });
});
