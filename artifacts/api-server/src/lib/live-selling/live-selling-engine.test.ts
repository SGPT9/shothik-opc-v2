import { describe, it, expect, beforeEach } from "vitest";
import { LiveSellingEngine } from "./live-selling-engine.js";

describe("LiveSellingEngine (Slice 33: Autonomous Social Commerce Live-Selling)", () => {
  beforeEach(() => {
    LiveSellingEngine._reset();
  });

  it("creates an active live selling session with initial state", () => {
    const session = LiveSellingEngine.createSession({
      sessionTitle: "Weekend Eid Flash Sale Live",
      channel: "facebook_live",
      merchantId: "merch_dhk_01",
    });

    expect(session.sessionId).toMatch(/^SESSION_LIVE_/);
    expect(session.status).toBe("live");
    expect(session.ordersCapturedCount).toBe(0);
    expect(session.totalGmvCapturedBdt).toBe(0);
  });

  it("extracts SKU, size, color, phone, and district from raw Banglish comment", () => {
    const session = LiveSellingEngine.createSession({
      sessionTitle: "Weekend Eid Flash Sale Live",
      channel: "facebook_live",
      merchantId: "merch_dhk_01",
    });

    const comment = "Black Panjabi XL lagbe 2 ta, 01711223344, Dhanmondi bKash korbo";
    const order = LiveSellingEngine.parseComment(session.sessionId, "Rashid Khan", comment);

    expect(order.extractedSku).toBe("SKU-PANJABI-BLK");
    expect(order.extractedQuantity).toBe(2);
    expect(order.extractedSize).toBe("XL");
    expect(order.extractedColor).toBe("Black");
    expect(order.extractedPhone).toBe("01711223344");
    expect(order.extractedDistrict).toBe("Dhanmondi");
    expect(order.paymentMethod).toBe("bkash");
    expect(order.totalAmountBdt).toBe(7000); // 3500 * 2
    expect(order.checkoutUrl).toContain("pay.shothikgpt.com/checkout/live");
    expect(order.confidenceScore).toBeGreaterThanOrEqual(0.8);
    expect(order.status).toBe("payment_link_sent");

    // Verify session inventory lock
    const updatedSession = LiveSellingEngine.getSession(session.sessionId);
    expect(updatedSession?.activeSkuLocks["SKU-PANJABI-BLK"]).toBe(2);
    expect(updatedSession?.totalGmvCapturedBdt).toBe(7000);
  });

  it("handles COD orders with partial details and drafts an order", () => {
    const session = LiveSellingEngine.createSession({
      sessionTitle: "TikTok Live Night Sale",
      channel: "tiktok_live",
      merchantId: "merch_dhk_01",
    });

    const comment = "TWS Earbuds 1 pcs pathan COD Chittagong 01822334455";
    const order = LiveSellingEngine.parseComment(session.sessionId, "Sumaiya Akter", comment);

    expect(order.extractedSku).toBe("SKU-EARBUDS-TWS");
    expect(order.extractedQuantity).toBe(1);
    expect(order.extractedPhone).toBe("01822334455");
    expect(order.extractedDistrict).toBe("Chittagong");
    expect(order.paymentMethod).toBe("cod");
    expect(order.totalAmountBdt).toBe(2400);
  });

  it("confirms a drafted live order and finalizes catalog inventory", () => {
    const session = LiveSellingEngine.createSession({
      sessionTitle: "Flash Sale",
      channel: "facebook_live",
      merchantId: "merch_dhk_01",
    });

    const comment = "Charger 1 ta nibo 01911223344 bKash";
    const order = LiveSellingEngine.parseComment(session.sessionId, "Farhan", comment);

    const result = LiveSellingEngine.confirmOrder(order.orderId);
    expect(result.success).toBe(true);
    expect(result.order?.status).toBe("confirmed");

    // Locked inventory in session should now be released/finalized
    const updatedSession = LiveSellingEngine.getSession(session.sessionId);
    expect(updatedSession?.activeSkuLocks["SKU-CHARGER-65W"]).toBe(0);
  });
});
