import { describe, it, expect } from "vitest";
import { handleSmsWebhook } from "../../../../../../functions/bkash-sms-webhook/index";

describe("InsForge Edge Function: bkash-sms-webhook", () => {
  it("should parse incoming bKash SMS notification, verify TrxID, and auto-dispatch Steadfast parcel", async () => {
    const res = await handleSmsWebhook({
      sender: "01712345678",
      messageText: "You have received Tk 1350.00 from 01700000000. TrxID TRX_BKASH_991823 at 13/08/2026",
      timestamp: new Date().toISOString(),
      workspaceId: "ws_polsia_merchant",
    });

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.trxID).toBe("TRX_BKASH_991823");
    expect(body.amountBdt).toBe(1350);
    expect(body.courierTrackingCode).toContain("BD_STEADFAST_");
    expect(body.whatsappNotificationCard).toContain("bKash Payment Verified");
  });
});
