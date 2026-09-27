import { describe, it, expect, beforeEach } from "vitest";
import { RedxClient } from "../redx-client.js";
import { PaperflyClient } from "../paperfly-client.js";
import { CourierArbitrageEngine } from "../courier-arbitrage-engine.js";

describe("Slice 74: RedX & Paperfly Live Courier API Connectors with Multi-Carrier Fallback", () => {
  beforeEach(() => {
    CourierArbitrageEngine._reset();
  });

  describe("RedX Client", () => {
    it("creates parcel in test/simulation mode when unconfigured", async () => {
      const client = new RedxClient();
      expect(client.isConfigured()).toBe(false);

      const res = await client.createParcel({
        customerName: "Mahmud Hasan",
        customerPhone: "01711223344",
        deliveryArea: "Uttara, Dhaka",
        customerAddress: "Sector 3, Road 4, House 12",
        merchantInvoiceId: "INV_SHOTHIK_REDX_101",
        cashCollectionAmount: 1850,
        parcelWeightGrams: 500,
      });

      expect(res.trackingId).toContain("REDX_");
      expect(res.trackingUrl).toContain("redx.com.bd/track-parcel");
      expect(res.status).toBe("ready_for_pickup");
    });

    it("tracks parcel status", async () => {
      const client = new RedxClient();
      const tracking = await client.trackParcel("REDX_12345678");

      expect(tracking.trackingId).toBe("REDX_12345678");
      expect(tracking.status).toBe("in_transit");
      expect(tracking.history.length).toBeGreaterThan(0);
    });
  });

  describe("Paperfly Client", () => {
    it("registers new order in test/simulation mode when unconfigured", async () => {
      const client = new PaperflyClient();
      expect(client.isConfigured()).toBe(false);

      const res = await client.newOrder({
        merOrderRef: "INV_PAPERFLY_202",
        customerName: "Ayesha Rahman",
        customerPhone: "01899887766",
        customerAddress: "GEC Circle, Chittagong",
        customerDistrict: "Chittagong",
        maxWeightKg: 1.0,
        productPrice: 3200,
      });

      expect(res.trackingNumber).toContain("PAP_");
      expect(res.status).toBe("success");
    });

    it("tracks order timeline", async () => {
      const client = new PaperflyClient();
      const tracking = await client.trackOrder("PAP_789012");

      expect(tracking.trackingNumber).toBe("PAP_789012");
      expect(tracking.status).toBe("in_transit");
      expect(tracking.history.length).toBeGreaterThan(0);
    });
  });

  describe("Multi-Carrier Auto Fallback & Live Dispatcher", () => {
    it("dispatches consignment with optimal carrier and fallback resiliency", async () => {
      const res = await CourierArbitrageEngine.dispatchWithLiveFallback({
        orderRef: "ORD_FALLBACK_555",
        customerName: "Kabir Hossain",
        customerPhone: "01912345678",
        deliveryAddress: "Khatunganj, Chittagong",
        district: "chittagong",
        codAmountBdt: 4500,
        weightKg: 1.5,
      });

      expect(res.success).toBe(true);
      expect(res.consignment.orderRef).toBe("ORD_FALLBACK_555");
      expect(["steadfast", "pathao", "redx", "paperfly"]).toContain(res.consignment.carrier);
      expect(res.consignment.trackingCode).toBeDefined();
      expect(res.consignment.status).toBe("booked");
    });
  });
});
