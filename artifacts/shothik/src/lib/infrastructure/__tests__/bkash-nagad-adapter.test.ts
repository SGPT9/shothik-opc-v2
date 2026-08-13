import { describe, it, expect } from "vitest";
import { BkashNagadPaymentService } from "../bkash-nagad-adapter";

describe("BkashNagadPaymentService", () => {
  it("should create bKash checkout session", async () => {
    const session = await BkashNagadPaymentService.createCheckoutSession({
      workspaceId: "ws_123",
      invoiceId: "inv_456",
      amountBdt: 1350,
      provider: "bkash",
    });

    expect(session.checkoutUrl).toContain("pay.shothik.app");
    expect(session.status).toBe("initiated");
  });

  it("should verify bKash transaction and auto-dispatch Steadfast parcel delivery", async () => {
    const verification = await BkashNagadPaymentService.verifyTransaction("mfs_bkash_789", "bkash", {
      customerName: "Tanvir Hossain",
      customerPhone: "01712345678",
      deliveryAddress: "House 45, Road 11, Banani, Dhaka",
      productName: "Winter Jacket",
    });

    expect(verification.verified).toBe(true);
    expect(verification.courierBooking).toBeDefined();
    expect((verification.courierBooking as { trackingCode: string }).trackingCode).toContain("BD_STEADFAST_");
  });
});
