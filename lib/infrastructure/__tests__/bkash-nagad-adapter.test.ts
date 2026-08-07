import { describe, expect, it } from "vitest";
import { BkashNagadPaymentService } from "@/lib/infrastructure/bkash-nagad-adapter";

describe("BkashNagadPaymentService (MFS Regional Gateway)", () => {
  it("creates a 1-click bKash checkout session link", async () => {
    const session = await BkashNagadPaymentService.createCheckoutSession({
      workspaceId: "ws_mfs_test",
      invoiceId: "inv_12345",
      amountBdt: 1500,
      provider: "bkash",
      customerMobile: "01711112222",
    });

    expect(session.paymentId).toContain("mfs_bkash_");
    expect(session.invoiceId).toBe("inv_12345");
    expect(session.amountBdt).toBe(1500);
    expect(session.provider).toBe("bkash");
    expect(session.checkoutUrl).toContain("https://pay.shothik.app/mfs/bkash");
    expect(session.status).toBe("initiated");
  });

  it("creates a 1-click Nagad checkout session link", async () => {
    const session = await BkashNagadPaymentService.createCheckoutSession({
      workspaceId: "ws_mfs_test",
      invoiceId: "inv_nagad_99",
      amountBdt: 850,
      provider: "nagad",
    });

    expect(session.paymentId).toContain("mfs_nagad_");
    expect(session.provider).toBe("nagad");
    expect(session.checkoutUrl).toContain("https://pay.shothik.app/mfs/nagad");
  });

  it("verifies bKash transaction status by paymentId", async () => {
    const verification = await BkashNagadPaymentService.verifyTransaction(
      "mfs_bkash_98765",
      "bkash"
    );

    expect(verification.verified).toBe(true);
    expect(verification.paymentId).toBe("mfs_bkash_98765");
    expect(verification.provider).toBe("bkash");
    expect(verification.trxID).toContain("TRX_BKASH_");
    expect(verification.status).toBe("completed");
  });

  it("verifies Nagad transaction status by paymentId", async () => {
    const verification = await BkashNagadPaymentService.verifyTransaction(
      "mfs_nagad_43210",
      "nagad"
    );

    expect(verification.verified).toBe(true);
    expect(verification.paymentId).toBe("mfs_nagad_43210");
    expect(verification.provider).toBe("nagad");
    expect(verification.trxID).toContain("TRX_NAGAD_");
  });
});
