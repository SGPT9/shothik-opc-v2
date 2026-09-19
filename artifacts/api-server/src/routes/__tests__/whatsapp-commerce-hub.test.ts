import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Slice 28: WhatsApp Commerce Hub API & Confidence-Gated Cart Engine", () => {
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

  it("GET /api/v1/whatsapp/webhook verifies Meta webhook subscription handshake", async () => {
    const url = new URL(`${baseUrl}/api/v1/whatsapp/webhook`);
    url.searchParams.set("hub.mode", "subscribe");
    url.searchParams.set("hub.verify_token", "shothik_whatsapp_verify_token_2026");
    url.searchParams.set("hub.challenge", "challenge_code_987654");

    const res = await fetch(url.toString());
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("challenge_code_987654");
  });

  it("GET /api/v1/whatsapp/webhook rejects invalid verify token with 403", async () => {
    const url = new URL(`${baseUrl}/api/v1/whatsapp/webhook`);
    url.searchParams.set("hub.mode", "subscribe");
    url.searchParams.set("hub.verify_token", "wrong_token");
    url.searchParams.set("hub.challenge", "challenge_code_987654");

    const res = await fetch(url.toString());
    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.error).toBe("Verification token mismatch");
  });

  it("POST /api/v1/whatsapp/webhook processes inbound Banglish customer order", async () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_001",
          changes: [
            {
              value: {
                contacts: [{ profile: { name: "Anisur Rahman" } }],
                messages: [
                  {
                    from: "+8801819999888",
                    id: `wamid_test_${Date.now()}`,
                    text: { body: "Bhai 2ta panjabi den black color XL size, Sylhet pathaben" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/v1/whatsapp/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.dispatchedCount).toBe(1);
    expect(body.responses[0].extractedCart.slots.quantity).toBe(2);
    expect(body.responses[0].extractedCart.slots.destinationDistrict).toBe("Sylhet");
    expect(body.responses[0].extractedCart.deliveryFee).toBe(120); // Outside Dhaka
  });

  it("POST /api/v1/whatsapp/cart/extract returns high-confidence DIRECT_BIND when all slots present", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/cart/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText: "1ta pique polo shirt navy color L size, Dhanmondi Dhaka",
        customerPhone: "+8801700112233",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.tier).toBe("DIRECT_BIND");
    expect(body.data.slots.size).toBe("L");
    expect(body.data.slots.color).toBe("Navy");
    expect(body.data.deliveryFee).toBe(60); // Inside Dhaka
    expect(body.data.isSupervised).toBe(false);
  });

  it("POST /api/v1/whatsapp/cart/extract returns INTERACTIVE_MPM with size pills when variant is missing", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/cart/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText: "bhai panjabi koto dam? 2ta nibo",
        customerPhone: "+8801700112244",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.tier).toBe("INTERACTIVE_MPM");
    expect(body.data.disambiguationPills).toBeDefined();
    expect(body.data.disambiguationPills.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/whatsapp/cart/extract triggers Supervised Autonomy gate for orders >= ৳10,000", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/cart/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText: "2ta traditional jamdani silk sharee lagbe red color, Uttara Dhaka",
        customerPhone: "+8801700112255",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.grandTotal).toBeGreaterThanOrEqual(10000);
    expect(body.data.isSupervised).toBe(true);
    expect(body.data.supervisionReason).toContain("10,000 threshold");
  });

  it("GET /api/v1/whatsapp/sessions returns active sessions ledger", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/sessions`);

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.sessions)).toBe(true);
    expect(body.catalog.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/whatsapp/orders/approve allows merchant to approve pending high-value orders", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/orders/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess_wa_chittagong_01",
        merchantNotes: "Add special branded greeting card",
        customDiscountPercent: 5,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.orderId).toContain("ORD_WA_");
    expect(body.session.status).toBe("confirmed");
  });

  it("POST /api/v1/whatsapp/interactive/reply resolves selected size pill into updated cart", async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/interactive/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess_wa_chittagong_01",
        pillId: "size_XXL",
        title: "XXL",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.slots.size).toBe("XXL");
  });
});
