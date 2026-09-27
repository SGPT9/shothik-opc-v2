import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { EarlyLiquidityEngine, globalFactoringEngine } from "../../lib/factoring/early-liquidity-engine.js";

describe("Slice 60: Autonomous B2B Micro-Factoring & Early Liquidity Engine", () => {
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

  describe("EarlyLiquidityEngine Unit Logic", () => {
    it("evaluates B2B buyer credit tiers and assigns differential APR haircuts", () => {
      const engine = new EarlyLiquidityEngine();
      const pranCredit = engine.evaluateBuyerCredit("BUYER-PRAN");
      expect(pranCredit.buyer.creditTier).toBe("AAA");
      expect(pranCredit.maxAdvanceRate).toBe(0.90);
      expect(pranCredit.apr).toBe(12.0);

      const wholesalerCredit = engine.evaluateBuyerCredit("BUYER-LOCAL-WHOLESALER");
      expect(wholesalerCredit.buyer.creditTier).toBe("BBB");
      expect(wholesalerCredit.maxAdvanceRate).toBe(0.75);
      expect(wholesalerCredit.apr).toBe(19.5);
    });

    it("calculates accounts receivable aging buckets and projected cashflow", () => {
      const engine = new EarlyLiquidityEngine();
      const aging = engine.analyzeAgingRadar();

      expect(aging.totalReceivablesBDT).toBeGreaterThan(0);
      expect(aging.weightedDSO).toBeGreaterThan(0);
      expect(aging.expected30DayRecoveryBDT).toBeGreaterThan(0);
    });

    it("generates early liquidity factoring offer with contract lien and SHA-256 seal", () => {
      const engine = new EarlyLiquidityEngine();
      const offer = engine.calculateFactoringOffer("INV-2026-081", 85, "bkash_enterprise");

      expect(offer.offerId).toMatch(/^FACT-/);
      expect(offer.invoiceFaceValueBDT).toBe(450000);
      expect(offer.grossAdvanceAmountBDT).toBe(Math.round(450000 * 0.85));
      expect(offer.netMerchantPayoutBDT).toBeLessThan(offer.grossAdvanceAmountBDT);
      expect(offer.legalContractText).toContain("Bangladesh Contract Act 1872");
      expect(offer.verificationSealSha256).toHaveLength(64);
    });
  });

  describe("API Endpoints", () => {
    it("GET /api/factoring/buyers returns seeded corporate buyers", async () => {
      const res = await fetch(`${baseUrl}/api/factoring/buyers`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.buyers.length).toBeGreaterThanOrEqual(4);
    });

    it("GET /api/factoring/invoices returns outstanding receivable invoices", async () => {
      const res = await fetch(`${baseUrl}/api/factoring/invoices`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.invoices.length).toBeGreaterThanOrEqual(3);
    });

    it("GET /api/factoring/aging-radar calculates portfolio metrics", async () => {
      const res = await fetch(`${baseUrl}/api/factoring/aging-radar`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.radar.totalReceivablesBDT).toBeDefined();
    });

    it("POST /api/factoring/calculate-offer returns computed advance payout and hash", async () => {
      const res = await fetch(`${baseUrl}/api/factoring/calculate-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: "INV-2026-082",
          requestedAdvanceRatePercent: 85,
          channel: "bkash_enterprise",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.offer.netMerchantPayoutBDT).toBeGreaterThan(0);
      expect(json.offer.verificationSealSha256).toHaveLength(64);
    });
  });
});
