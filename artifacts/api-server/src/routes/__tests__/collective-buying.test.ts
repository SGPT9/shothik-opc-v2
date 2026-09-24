import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  collectiveBuyingEngine,
  CollectiveBuyingEngine,
} from "../../lib/commerce/collective-buying-engine.js";

describe("Slice 54: Autonomous Micro-Merchant B2B Collective Buying & Bulk Freight Pooling Engine", () => {
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

  describe("CollectiveBuyingEngine Unit Logic", () => {
    it("calculates CBM freight allocation, duty sharing and landed cost savings", () => {
      const engine = new CollectiveBuyingEngine();
      const calc = engine.calculateFreightAllocation({
        totalPoolUnits: 5000,
        totalCbm: 10,
        totalWeightKg: 1000,
        fobPriceUsdPerUnit: 2.5,
        freightRatePerCbmUsd: 140,
        freightRatePerKgUsd: 1.8,
        dutyRatePercent: 25,
        exchangeRateBdtPerUsd: 120,
        hubHandlingFeePerUnitBdt: 15,
      });

      expect(calc.unitProductCostBdt).toBe(300); // $2.5 * 120 = 300
      expect(calc.unitFreightBdt).toBeGreaterThan(0);
      expect(calc.unitTariffBdt).toBe(75); // 25% of 300
      expect(calc.totalLandedCostPerUnitBdt).toBeGreaterThan(375);
      expect(calc.wholesaleSavingsPercentVsIndividual).toBeGreaterThan(20);
    });

    it("creates a new collective buying pool with SHA-256 digital integrity seal", () => {
      const engine = new CollectiveBuyingEngine();
      const pool = engine.createPool({
        poolTitle: "Yiwu High-Precision Jewelry Scales",
        productName: "Digital Gram Scales (0.01g)",
        productCategory: "Electronics & Instruments",
        productHsCode: "8423.81.00",
        sourceOrigin: "yiwu_market",
        shippingMode: "air_express",
        targetMoqUnits: 2000,
        unitPriceBdt: 450,
      });

      expect(pool.id).toContain("POOL-2026-");
      expect(pool.status).toBe("open_for_pooling");
      expect(pool.targetMoqUnits).toBe(2000);
      expect(pool.digitalSealHash).toHaveLength(64);
    });

    it("allows micro-merchant to join pool and updates pledged threshold", () => {
      const engine = new CollectiveBuyingEngine();
      const pool = engine.createPool({
        poolTitle: "1688 Organic Jute Burlap Fabric",
        productName: "Heavyweight Jute Burlap",
        productCategory: "Textiles",
        productHsCode: "5310.10.00",
        sourceOrigin: "1688_guangzhou",
        shippingMode: "sea_lcl",
        targetMoqUnits: 1000,
        unitPriceBdt: 200,
      });

      const { pool: updatedPool, participant } = engine.joinPool({
        poolId: pool.id,
        merchantId: "MERCH-999",
        merchantName: "Dhaka Craft Store",
        merchantBinOrPhone: "01799887766",
        unitsRequested: 1000,
        deliveryAddress: "Tejgaon, Dhaka",
      });

      expect(updatedPool.currentPledgedUnits).toBe(1000);
      expect(updatedPool.status).toBe("threshold_met");
      expect(participant.escrowDepositPaidBdt).toBeGreaterThan(0);
      expect(participant.paymentStatus).toBe("escrow_locked");
    });
  });

  describe("Collective Buying Express API Endpoints", () => {
    it("GET /api/v1/collective-buying/summary returns aggregated pool metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/collective-buying/summary`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.totalActivePools).toBeGreaterThan(0);
      expect(body.data.totalCollectiveVolumeBdt).toBeGreaterThan(0);
    });

    it("GET /api/v1/collective-buying/pools returns all pools", async () => {
      const res = await fetch(`${baseUrl}/api/v1/collective-buying/pools`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("POST /api/v1/collective-buying/calculate-freight computes landed cost breakdown", async () => {
      const res = await fetch(`${baseUrl}/api/v1/collective-buying/calculate-freight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPoolUnits: 5000,
          totalCbm: 8,
          totalWeightKg: 800,
          fobPriceUsdPerUnit: 2.0,
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.unitProductCostBdt).toBe(240); // 2.0 * 120
      expect(body.data.wholesaleSavingsPercentVsIndividual).toBeGreaterThan(0);
    });

    it("POST /api/v1/collective-buying/join-pool adds participant to pool", async () => {
      const poolsRes = await fetch(`${baseUrl}/api/v1/collective-buying/pools`);
      const poolsBody = await poolsRes.json();
      const firstPoolId = poolsBody.data[0].id;

      const res = await fetch(`${baseUrl}/api/v1/collective-buying/join-pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: firstPoolId,
          merchantName: "Banani Boutique",
          merchantBinOrPhone: "01711223344",
          unitsRequested: 100,
          deliveryAddress: "Banani Road 11, Dhaka",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.participant.merchantName).toBe("Banani Boutique");
    });
  });
});
