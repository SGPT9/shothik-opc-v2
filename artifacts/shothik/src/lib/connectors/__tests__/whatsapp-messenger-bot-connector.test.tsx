/**
 * WhatsAppMessengerBotConnector Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { whatsAppMessengerBotConnector } from "../whatsapp-messenger-bot-connector";

describe("WhatsAppMessengerBotConnector Service", () => {
  it("dispatches bKash payment invoice via WhatsApp", async () => {
    const res = await whatsAppMessengerBotConnector.sendBkashPaymentInvoice({
      platform: "whatsapp",
      recipientPhone: "01712345678",
      customerName: "সুলতানা পারভীন",
      orderId: "ORD_9912",
      bkashCheckoutUrl: "https://shothik.ai/pay/bKash/bk_9912",
      amountBdt: 3850,
      productName: "প্রিমিয়াম কাতান শাড়ি (নীল)",
    });

    expect(res.success).toBe(true);
    expect(res.platform).toBe("whatsapp");
    expect(res.status).toBe("DELIVERED");
    expect(res.messageId).toContain("msg_bkash_");
  });

  it("dispatches Steadfast tracking update via Messenger", async () => {
    const res = await whatsAppMessengerBotConnector.sendSteadfastTrackingCode({
      platform: "messenger",
      recipientPhone: "01898765432",
      customerName: "তানভীর আহমেদ",
      orderId: "ORD_9913",
      steadfastTrackingCode: "BD_ST_881235",
      deliveryHubBangla: "ধানমন্ডি ডেলিভারি হাব",
    });

    expect(res.success).toBe(true);
    expect(res.platform).toBe("messenger");
    expect(res.status).toBe("DELIVERED");
    expect(res.messageId).toContain("msg_track_");
  });

  it("throws error for invalid phone number", async () => {
    await expect(
      whatsAppMessengerBotConnector.sendBkashPaymentInvoice({
        platform: "whatsapp",
        recipientPhone: "123", // invalid
        customerName: "Unknown",
        orderId: "ORD_0000",
        bkashCheckoutUrl: "https://shothik.ai/pay/bKash/bk_0000",
        amountBdt: 100,
        productName: "Item",
      })
    ).rejects.toThrow("Invalid recipient phone number");
  });
});
