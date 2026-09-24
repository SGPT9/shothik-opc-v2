import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  tenderBidEngine,
  TenderBidEngine,
} from "../../lib/tenders/tender-bid-engine.js";

describe("Slice 55: Autonomous AI B2B Tender & Government e-GP Bid Response Generator", () => {
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

  describe("TenderBidEngine Unit Logic", () => {
    it("screens contractor eligibility against CPTU/PPR 2008 qualification criteria", () => {
      const engine = new TenderBidEngine();
      const passed = engine.screenEligibility({
        requiredAnnualTurnoverBdt: 5000000,
        contractorAnnualTurnoverBdt: 7500000,
        requiredLiquidAssetsBdt: 2000000,
        contractorLiquidAssetsBdt: 3000000,
        requiredSimilarExperienceYears: 3,
        contractorExperienceYears: 4,
        hasValidTaxClearance: true,
        hasValidTradeLicense: true,
        hasValidMushakBin: true,
      });

      expect(passed.isEligible).toBe(true);
      expect(passed.overallScorePercent).toBe(100);
      expect(passed.discrepancies).toHaveLength(0);

      const failed = engine.screenEligibility({
        requiredAnnualTurnoverBdt: 10000000,
        contractorAnnualTurnoverBdt: 4000000, // Deficit
        requiredLiquidAssetsBdt: 2000000,
        contractorLiquidAssetsBdt: 3000000,
        requiredSimilarExperienceYears: 3,
        contractorExperienceYears: 1, // Deficit
        hasValidTaxClearance: true,
        hasValidTradeLicense: true,
        hasValidMushakBin: true,
      });

      expect(failed.isEligible).toBe(false);
      expect(failed.discrepancies.length).toBeGreaterThan(0);
      expect(failed.recommendedMitigations.length).toBeGreaterThan(0);
    });

    it("calculates BOQ unit rates with statutory 7.5% VAT and 5% AIT deductions", () => {
      const engine = new TenderBidEngine();
      const calc = engine.calculateBoq({
        items: [
          {
            itemNo: "01",
            description: "Industrial Solar Inverter 50kW",
            unit: "Set",
            quantity: 5,
            materialCost: 400000,
            laborCost: 20000,
            overheadCost: 10000,
            profitMarginPercent: 12,
            vatRatePercent: 7.5,
            aitRatePercent: 5.0,
          },
        ],
      });

      expect(calc.totalBaseCostBdt).toBe(2150000); // 430,000 * 5
      expect(calc.totalVatBdt).toBeGreaterThan(0);
      expect(calc.totalAitBdt).toBeGreaterThan(0);
      expect(calc.totalQuotedBidAmountBdt).toBeGreaterThan(2150000);
    });

    it("generates e-GP bid record with tender security calculation and SHA-256 seal", () => {
      const engine = new TenderBidEngine();
      const bid = engine.generateBid({
        tenderId: "eGP-CPTU-2026-881920",
        tenderTitle: "Installation of Municipal LED Streetlighting",
        procuringEntity: "Dhaka North City Corporation (DNCC)",
        tenderType: "egp_government_cptu",
        stdDocumentType: "PW2_WORKS_SMALL",
        estimatedValueBdt: 5000000,
        quotedTotalValueBdt: 4800000,
        contractorName: "SolarPower Infra Ltd.",
        contractorBin: "0019283746192",
      });

      expect(bid.id).toContain("BID-2026-");
      expect(bid.tenderSecurityAmountBdt).toBe(120000); // 2.5% of 4.8M
      expect(bid.performanceSecurityAmountBdt).toBe(480000); // 10% of 4.8M
      expect(bid.digitalSealHash).toHaveLength(64);
      expect(bid.status).toBe("submitted");
    });
  });

  describe("Tender Bid Express API Endpoints", () => {
    it("GET /api/v1/tenders/summary returns summary stats", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tenders/summary`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.totalBidsTracked).toBeGreaterThan(0);
    });

    it("GET /api/v1/tenders/bids returns bids list", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tenders/bids`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("POST /api/v1/tenders/screen-eligibility validates contractor criteria", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tenders/screen-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredAnnualTurnoverBdt: 5000000,
          contractorAnnualTurnoverBdt: 6000000,
          requiredLiquidAssetsBdt: 2000000,
          contractorLiquidAssetsBdt: 2500000,
          requiredSimilarExperienceYears: 2,
          contractorExperienceYears: 3,
          hasValidTaxClearance: true,
          hasValidTradeLicense: true,
          hasValidMushakBin: true,
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.isEligible).toBe(true);
    });

    it("POST /api/v1/tenders/calculate-boq computes rate analysis breakdown", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tenders/calculate-boq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              itemNo: "01",
              description: "Fiber Optic Cable Core Splice",
              unit: "Km",
              quantity: 10,
              materialCost: 50000,
              laborCost: 10000,
              overheadCost: 5000,
              profitMarginPercent: 15,
            },
          ],
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.totalBaseCostBdt).toBe(650000);
    });
  });
});
