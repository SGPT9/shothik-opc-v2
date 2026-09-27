import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { metaCapiEngine } from "../../lib/marketing/meta-capi-engine.js";

describe("Slice 73: Autonomous Meta & TikTok CAPI with Offline COD Attribution", () => {
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

  it("normalizes and hashes customer phone and email with SHA-256", () => {
    const rawPhone = "01712-345678";
    const normalized = metaCapiEngine.normalizeBdPhone(rawPhone);
    expect(normalized).toBe("+8801712345678");

    const hashed = metaCapiEngine.hashSha256(normalized);
    expect(hashed).toHaveLength(64);
    expect(typeof hashed).toBe("string");
  });

  it("calculates high Event Match Quality (EMQ) when full user data is provided", () => {
    const emq = metaCapiEngine.calculateMatchQuality({
      phone: "+8801712345678",
      email: "tanvir@fcommerce.com",
      fbc: "fb.1.123.456",
      clientIp: "103.205.71.1",
      userAgent: "Mozilla/5.0 Android",
    });

    expect(emq).toBeGreaterThanOrEqual(8.5);
  });

  it("POST /api/marketing/capi/event dispatches realtime conversion event", async () => {
    const response = await fetch(`${baseUrl}/api/marketing/capi/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "InitiateCheckout",
        userData: {
          phone: "01811223344",
          email: "buyer@dhaka.com",
        },
        customData: {
          currency: "BDT",
          value: 2450,
          contentName: "Handicrafts Jamdani Saree",
        },
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.metaEventId).toBeDefined();
    expect(body.emq).toBeGreaterThan(5.0);
  });

  it("POST /api/marketing/capi/offline-attribution reconciles COD parcel delivery with ad attribution", async () => {
    const response = await fetch(`${baseUrl}/api/marketing/capi/offline-attribution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ORD_DHAKA_7890",
        deliveryStatus: "delivered",
        courier: "Steadfast",
        amountBdt: 3500,
        customerPhone: "01799887766",
        customerEmail: "cust_7890@gmail.com",
        fbclid: "IwAR123abcXYZ",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.attribution.orderId).toBe("ORD_DHAKA_7890");
    expect(body.attribution.status).toBe("delivered");
    expect(body.attribution.metaEventId).toContain("ORD_DHAKA_7890");
  });

  it("GET /api/marketing/capi/pixel-health returns match quality and attribution ledger", async () => {
    const response = await fetch(`${baseUrl}/api/marketing/capi/pixel-health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("healthy");
    expect(body.data.averageEmq).toBeGreaterThanOrEqual(8.0);
    expect(body.data.supportedCouriers).toContain("Steadfast");
  });
});
