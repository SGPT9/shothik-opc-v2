import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  voiceCommerceEngine,
  VoiceCommerceEngine,
} from "../../lib/voice-commerce/voice-commerce-engine.js";

describe("Vernacular Voice Commerce & WebRTC Banglish Agent API (/api/v1/voice-commerce/*)", () => {
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

  describe("VoiceCommerceEngine Unit Logic", () => {
    it("parses spoken Banglish order intent and extracts product, address, and MFS slots", () => {
      const engine = new VoiceCommerceEngine();

      const parsed = engine.parseVoiceIntent(
        "Bhai amake 2 ta black panjabi pathan Dhanmondi 27 e, bKash korbo, 01711223344"
      );

      expect(parsed.intent).toBe("order_product");
      expect(parsed.slots.productName).toBe("Premium Silk Panjabi");
      expect(parsed.slots.quantity).toBe(2);
      expect(parsed.slots.color).toBe("Black");
      expect(parsed.slots.district).toBe("Dhaka");
      expect(parsed.slots.paymentMethod).toBe("bkash");
      expect(parsed.slots.customerPhone).toBe("01711223344");
      expect(parsed.deliveryFeeBdt).toBe(60); // inside Dhaka
      expect(parsed.paymentLinkUrl).toContain("https://shothik.com/pay/bkash/");
    });

    it("correctly identifies Sylheti dialect and computes outside-Dhaka courier fee", () => {
      const engine = new VoiceCommerceEngine();

      const parsed = engine.parseVoiceIntent(
        "Duta kalo panjabi zindabazar Sylhet pathai deu, nagad e dibo, 01899887766"
      );

      expect(parsed.dialect).toBe("sylheti");
      expect(parsed.slots.district).toBe("Sylhet");
      expect(parsed.slots.paymentMethod).toBe("nagad");
      expect(parsed.deliveryFeeBdt).toBe(120); // outside Dhaka
    });

    it("creates voice order record and dispatches 1-click payment SMS", () => {
      const engine = new VoiceCommerceEngine();
      const parsed = engine.parseVoiceIntent(
        "1 ta Jamdani Saree pathan GEC Circle Chittagong e bKash korbo, 01911998877"
      );

      const order = engine.createVoiceOrder(parsed, "Anika Tabassum");
      expect(order.orderId).toMatch(/^VORD-/);
      expect(order.courierConsignmentId).toMatch(/^STF-PARCEL-/);
      expect(order.smsDispatched).toBe(true);

      const smsResult = engine.dispatchPaymentSms(order.orderId);
      expect(smsResult.ok).toBe(true);
      expect(smsResult.smsPayload).toContain("1-Click bKash/Nagad");
    });
  });

  describe("Voice Commerce HTTP Endpoints", () => {
    it("GET /api/v1/voice-commerce/summary returns performance KPI metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/voice-commerce/summary`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.totalVoiceOrdersCount).toBeGreaterThan(0);
      expect(body.data.avgParseLatencyMs).toBeLessThan(200);
    });

    it("POST /api/v1/voice-commerce/parse-intent processes raw audio transcript", async () => {
      const res = await fetch(`${baseUrl}/api/v1/voice-commerce/parse-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "2 ta black panjabi Uttara sector 4 e pathan bKash korbo 01712345678",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.slots.quantity).toBe(2);
      expect(body.data.slots.district).toBe("Dhaka");
      expect(body.data.paymentLinkUrl).toBeDefined();
    });

    it("GET /api/v1/voice-commerce/orders returns historical voice orders", async () => {
      const res = await fetch(`${baseUrl}/api/v1/voice-commerce/orders`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("POST /api/v1/voice-commerce/create-order creates verified voice consignment", async () => {
      const parseRes = await fetch(`${baseUrl}/api/v1/voice-commerce/parse-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "1 ta Polo tshirt Mirpur 10 e COD te pathan 01811223344",
        }),
      });
      const parsed = (await parseRes.json()).data;

      const orderRes = await fetch(`${baseUrl}/api/v1/voice-commerce/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsed,
          customerName: "Sakib Al Hasan",
        }),
      });

      expect(orderRes.status).toBe(201);
      const orderBody = await orderRes.json();
      expect(orderBody.ok).toBe(true);
      expect(orderBody.data.orderId).toMatch(/^VORD-/);
      expect(orderBody.data.paymentMethod).toBe("cod");
    });
  });
});
