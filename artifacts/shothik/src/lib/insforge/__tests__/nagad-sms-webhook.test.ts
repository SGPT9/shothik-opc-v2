import { describe, it, expect } from "vitest";
import { handleNagadSmsWebhook } from "../../../../../../functions/nagad-sms-webhook/index";

describe("InsForge Edge Function: nagad-sms-webhook", () => {
  it("should parse incoming Nagad SMS notification, verify TxnID, and auto-dispatch Steadfast parcel", async () => {
    const res = await handleNagadSmsWebhook({
      sender: "01800000000",
      messageText: "You have received Tk 1350.00 from 01812345678. TxnID 7129A8K at 13/08/2026",
      timestamp: new Date().toISOString(),
      workspaceId: "ws_polsia_nagad",
    });

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.provider).toBe("nagad");
    expect(body.txnID).toBe("7129A8K");
    expect(body.amountBdt).toBe(1350);
    expect(body.courierTrackingCode).toContain("BD_STEADFAST_NAGAD_");
    expect(body.whatsappNotificationCard).toContain("NAGAD Payment Verified");
  });
});
