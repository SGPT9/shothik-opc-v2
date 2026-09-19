import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Phase 26: WhatsApp Multi-Dialect Commerce Bot & bKash QR Invoicing", () => {
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

  it("1. GET /api/v1/whatsapp/commerce/catalog returns merchant products", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/catalog`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(5);
    expect(body.catalog.some((p: any) => p.id === "prod_jamdani_01")).toBe(true);
  });

  describe("2. Multi-Dialect Conversational Sales Replies", () => {
    it("synthesizes Dhakaiya street greeting ('মামা/ভাই')", async () => {
      const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "সালাম ভাই, কেমন আছেন?",
          dialect: "dhakaiya",
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.intent).toBe("GREETING");
      expect(body.replyText).toContain("মামা");
    });

    it("synthesizes Sylheti polite greeting ('বালা আছেন নি')", async () => {
      const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Hi, আছেন নি?",
          dialect: "sylheti",
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.intent).toBe("GREETING");
      expect(body.replyText).toContain("বালা আছেন নি");
    });

    it("synthesizes Chatgaya port merchant greeting ('অনরে ছালাম')", async () => {
      const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "কেমন আছেন?",
          dialect: "chatgaya",
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.intent).toBe("GREETING");
      expect(body.replyText).toContain("অনরে ছালাম");
    });
  });

  it("3. calculates accurate Steadfast delivery fees (Dhaka vs Outside)", async () => {
    // Dhaka inside
    const resDhaka = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "ঢাকা ধানমন্ডি ডেলিভারি চার্জ কত?",
        dialect: "standard",
      }),
    });
    expect(resDhaka.status).toBe(200);
    const bodyDhaka = (await resDhaka.json()) as any;
    expect(bodyDhaka.deliveryDetails?.deliveryFeeBdt).toBe(60);

    // Outside Dhaka (Chittagong)
    const resCtg = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "চিটাগাং কুরিয়ার চার্জ কত?",
        dialect: "standard",
      }),
    });
    expect(resCtg.status).toBe(200);
    const bodyCtg = (await resCtg.json()) as any;
    expect(bodyCtg.deliveryDetails?.deliveryFeeBdt).toBe(130);
  });

  it("4. identifies product price inquiry, updates cart, and emits dynamic bKash QR invoice", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess_test_cart_01",
        customerPhone: "01811223344",
        message: "জামদানি শাড়ি কত?",
        dialect: "dhakaiya",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.intent).toBe("PRODUCT_PRICE_INQUIRY");
    expect(body.cart.length).toBeGreaterThan(0);
    expect(body.subtotalBdt).toBe(3800);
    expect(body.invoice).toBeDefined();
    expect(body.invoice.qrSvgDataUri).toContain("data:image/svg+xml");
    expect(body.invoice.deepLink).toContain("bkash://payment");
    expect(body.replyText).toContain("৳3800");
  });

  it("5. POST /api/v1/whatsapp/commerce/generate-invoice generates instant bKash QR payload", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/generate-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountBdt: 4500,
        reference: "INV_TEST_99",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.invoice.amountBdt).toBe(4500);
    expect(body.invoice.reference).toBe("INV_TEST_99");
    expect(body.invoice.qrSvgDataUri).toContain("data:image/svg+xml");
    expect(new Date(body.invoice.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("6. verifies TrxID submission and auto-books Steadfast courier consignment", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess_trx_verify_99",
        customerPhone: "01755667788",
        message: "বিকাশ TrxID 9K28A77123 দিয়েছি",
        dialect: "sylheti",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.intent).toBe("TRX_VERIFIED");
    expect(body.order).toBeDefined();
    expect(body.order.paymentStatus).toBe("PAID");
    expect(body.order.trxId).toBe("9K28A77123");
    expect(body.order.consignment).toBeDefined();
    expect(body.order.consignment.trackingCode).toMatch(/BD_ST_\d+/);
    expect(body.replyText).toContain("9K28A77123");
  });

  it("7. POST /api/v1/whatsapp/commerce/confirm-order creates order and books courier", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/confirm-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerPhone: "01999887766",
        customerName: "Rashid Chowdhury",
        customerAddress: "GEC Circle, Chittagong",
        city: "Chittagong",
        items: [
          {
            productId: "prod_panjabi_02",
            name: "Royal Platinum Cotton Panjabi",
            quantity: 2,
            unitPriceBdt: 2200,
            totalBdt: 4400,
          },
        ],
        paymentMethod: "COD",
        dialect: "chatgaya",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.order.orderId).toBeDefined();
    expect(body.order.subtotalBdt).toBe(4400);
    expect(body.order.deliveryFeeBdt).toBe(130);
    expect(body.order.totalBdt).toBe(4530);
    expect(body.order.paymentStatus).toBe("COD_UNPAID");
    expect(body.order.consignment.status).toBe("BOOKED");
  });

  it("8. enforces Supervised Autonomy flag when order exceeds ৳10,000 threshold", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/commerce/confirm-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerPhone: "01700112233",
        customerName: "B2B Boutique Wholesale",
        customerAddress: "Banani 11, Dhaka",
        city: "Dhaka",
        items: [
          {
            productId: "prod_jamdani_01",
            name: "Dhakai Jamdani Saree",
            quantity: 4,
            unitPriceBdt: 3800,
            totalBdt: 15200,
          },
        ],
        paymentMethod: "BKASH_QR",
        dialect: "standard",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.order.totalBdt).toBeGreaterThan(10000);
    expect(body.order.requiresHumanReview).toBe(true);
    expect(body.order.humanReviewReason).toContain("10,000");
  });
});
