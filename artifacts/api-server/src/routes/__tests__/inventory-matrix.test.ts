import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { InventoryMatrixEngine, globalInventoryEngine } from "../../lib/inventory/inventory-matrix-engine.js";

describe("Slice 58: Autonomous Multi-Channel Inventory Matrix & Prediction Engine", () => {
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

  describe("InventoryMatrixEngine Unit Logic", () => {
    it("updates multi-channel stock allocation and re-sums total stock", () => {
      const engine = new InventoryMatrixEngine();
      const updated = engine.updateChannelAllocation("SHOTHIK-TSHIRT-BLK-M", {
        daraz: 150,
        shopify: 100,
        woocommerce: 50,
        whatsapp: 50,
        darkHubReserve: 50,
      });

      expect(updated.totalStock).toBe(400);
      expect(updated.channels.daraz).toBe(150);
    });

    it("predicts stock-out run-rate and flags critical reorders", () => {
      const engine = new InventoryMatrixEngine();
      // 18 units in stock, past 30 days sold 90 units (3 units/day velocity) -> 6 days remaining. Lead time is 10 days -> CRITICAL_STOCKOUT
      const prediction = engine.predictStockOut("SHOTHIK-SMART-CHG-65W", 90);

      expect(prediction.dailySalesVelocity).toBe(3);
      expect(prediction.daysRemaining).toBe(6);
      expect(prediction.status).toBe("CRITICAL_STOCKOUT");
      expect(prediction.recommendedReorderQty).toBeGreaterThan(0);
    });

    it("computes dark store rebalancing transfer recommendations", () => {
      const engine = new InventoryMatrixEngine();
      const result = engine.rebalanceDarkStores("SHOTHIK-TSHIRT-BLK-M");

      expect(result.hubs.length).toBe(4);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0].targetHubId).toBe("HUB_DHANMONDI");
    });
  });

  describe("API Endpoints", () => {
    it("GET /api/inventory/items lists catalog SKUs", async () => {
      const res = await fetch(`${baseUrl}/api/inventory/items`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    it("POST /api/inventory/items/:sku/channels updates channel allocation", async () => {
      const res = await fetch(`${baseUrl}/api/inventory/items/SHOTHIK-BAG-LTH-01/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daraz: 20,
          shopify: 15,
          woocommerce: 10,
          whatsapp: 10,
          darkHubReserve: 5,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.item.totalStock).toBe(60);
    });

    it("POST /api/inventory/purchase-orders creates wholesale PO with SHA-256 seal", async () => {
      const res = await fetch(`${baseUrl}/api/inventory/purchase-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: "SHOTHIK-TSHIRT-BLK-M",
          quantity: 200,
          deliveryHub: "Tejgaon Central Hub",
          advancePercent: 30,
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.purchaseOrder.poNumber).toContain("PO-");
      expect(data.purchaseOrder.totalAmountBdt).toBe(56000); // 200 * 280
      expect(data.purchaseOrder.advancePaymentBdt).toBe(16800); // 30% of 56000
      expect(data.purchaseOrder.signedHashSeal).toHaveLength(64);
    });
  });
});
