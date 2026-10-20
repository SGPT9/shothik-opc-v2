import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { juteRouter } from "../jute.js";
import { JuteExportEngine, BJMC_JUTE_GRADES } from "../../lib/jute/jute-export-engine.js";

const app = express();
app.use(express.json());
app.use("/api", juteRouter);

describe("Autonomous Golden Fiber (Raw Jute & DJG) Export & Subsidy Engine (Slice 91)", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe("JuteExportEngine Unit Logic", () => {
    it("grades raw jute with safe moisture (<=14%) and zero moisture penalties", () => {
      const result = JuteExportEngine.gradeRawJute({
        lotId: "LOT-FARIDPUR-101",
        variety: "Bangla Tossa",
        gradeCode: "BT_SPECIAL",
        grossWeightKg: 10000,
        moisturePercent: 13.5,
        rootCuttingPercent: 5.0,
        aratLocation: "Faridpur",
      });

      expect(result.isMoistureCompliant).toBe(true);
      expect(result.isRejectedForExcessMoisture).toBe(false);
      expect(result.moistureDeductionKg).toBe(0);
      expect(result.rootCuttingDeductionKg).toBe(500);
      expect(result.netMarketableWeightKg).toBe(9500);
      expect(result.puccaExportBalesYield).toBe(Math.floor(9500 / 180));
      expect(result.netPayableBdt).toBe(9500 * 105.0);
      expect(result.qualityCertificateToken).toBeDefined();
    });

    it("applies moisture penalty deduction when moisture > 14%", () => {
      const result = JuteExportEngine.gradeRawJute({
        lotId: "LOT-JESSORE-202",
        variety: "Bangla Tossa",
        gradeCode: "BT_A",
        grossWeightKg: 10000,
        moisturePercent: 18.0, // excess is 4.0% -> penalty is 4.0 * 1.25 = 5.0%
        rootCuttingPercent: 0,
        aratLocation: "Jessore",
      });

      expect(result.isMoistureCompliant).toBe(false);
      expect(result.isRejectedForExcessMoisture).toBe(false);
      expect(result.moistureDeductionKg).toBe(500); // 5% of 10,000 kg
      expect(result.netMarketableWeightKg).toBe(9500);
    });

    it("flags batch as rejected when moisture > 20%", () => {
      const result = JuteExportEngine.gradeRawJute({
        lotId: "LOT-RANGPUR-303",
        variety: "Bangla White",
        gradeCode: "BW_SPECIAL",
        grossWeightKg: 5000,
        moisturePercent: 22.5,
        rootCuttingPercent: 10,
        aratLocation: "Rangpur",
      });

      expect(result.isRejectedForExcessMoisture).toBe(true);
      expect(result.isMoistureCompliant).toBe(false);
    });

    it("computes DJG manufacturing yield and unit costing", () => {
      const result = JuteExportEngine.calculateDjgCosting({
        productType: "DIVERSIFIED_SHOPPING_BAGS",
        targetUnits: 5000,
        rawJuteGradeCode: "BT_B",
        weavingWastagePercent: 8.0,
        directLaborCostPerUnitBdt: 30.0,
        overheadCostPerUnitBdt: 15.0,
      });

      expect(result.targetUnits).toBe(5000);
      expect(result.rawFiberRequiredKg).toBeGreaterThan(2500);
      expect(result.costPerUnitBdt).toBeGreaterThan(0);
      expect(result.localValueAdditionPercent).toBeGreaterThanOrEqual(80.0);
    });

    it("calculates Bangladesh Bank 12% cash subsidy for Diversified Jute Goods (DJG)", () => {
      const result = JuteExportEngine.calculateExportSubsidy({
        invoiceNumber: "EXP-DJG-2026-088",
        fobValueUsd: 50000,
        exchangeRateUsdToBdt: 122.5,
        productCategory: "DIVERSIFIED_JUTE_GOODS",
        localValueAdditionPercent: 85.0,
        hasValidPrc: true,
        hasEpbRegistration: true,
      });

      expect(result.isEligibleForSubsidy).toBe(true);
      expect(result.statutorySubsidyRatePercent).toBe(12.0);
      const expectedGross = Math.round((50000 * 122.5 * 12.0) / 100);
      expect(result.grossCashSubsidyBdt).toBe(expectedGross);
      expect(result.aitDeductionBdt).toBe(Math.round(expectedGross * 0.10));
      expect(result.netCashSubsidyDisbursableBdt).toBe(expectedGross - Math.round(expectedGross * 0.10));
    });

    it("denies subsidy for raw jute or missing PRC", () => {
      const rawJuteResult = JuteExportEngine.calculateExportSubsidy({
        invoiceNumber: "EXP-RAW-001",
        fobValueUsd: 30000,
        exchangeRateUsdToBdt: 122.5,
        productCategory: "RAW_JUTE",
        localValueAdditionPercent: 100,
        hasValidPrc: true,
        hasEpbRegistration: true,
      });
      expect(rawJuteResult.isEligibleForSubsidy).toBe(false);

      const noPrcResult = JuteExportEngine.calculateExportSubsidy({
        invoiceNumber: "EXP-DJG-002",
        fobValueUsd: 20000,
        exchangeRateUsdToBdt: 122.5,
        productCategory: "DIVERSIFIED_JUTE_GOODS",
        localValueAdditionPercent: 85,
        hasValidPrc: false,
        hasEpbRegistration: true,
      });
      expect(noPrcResult.isEligibleForSubsidy).toBe(false);
    });

    it("generates NBR Bonded Warehouse ledger entry with cryptographic SHA-256 seal", () => {
      const result = JuteExportEngine.generateBondedExportDossier({
        shipmentId: "SHP-JUTE-2026-991",
        buyerName: "EcoPackaging UK Ltd.",
        destinationCountry: "United Kingdom",
        portOfLoading: "Chittagong Port",
        hsCode: "6305.10.00",
        productDescription: "100% Biodegradable Jute Sacking Bags",
        totalNetWeightKg: 18000,
        totalPuccaBales: 100,
        fobValueUsd: 45000,
        bondLicenseNumber: "NBR-BOND-LIC-9842/2026",
        rawJuteLotRef: "LOT-FARIDPUR-101",
      });

      expect(result.sha256DossierSeal).toBeDefined();
      expect(result.sha256DossierSeal.length).toBe(64);
      expect(result.nbrCustomsReleaseToken).toContain("NBR-BOND-JUTE");
      expect(result.domesticLeakageRiskScore).toBe(0);
    });
  });

  describe("API Endpoints", () => {
    it("GET /api/v1/trade/jute/grades returns grading catalog", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/jute/grades`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.grades.length).toBeGreaterThan(0);
      expect(json.data.puccaBaleStandardWeightKg).toBe(180);
    });

    it("POST /api/v1/trade/jute/grading validates and grades lot", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/jute/grading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId: "LOT-API-101",
          variety: "Bangla Tossa",
          gradeCode: "BT_SPECIAL",
          grossWeightKg: 7200,
          moisturePercent: 12.5,
          rootCuttingPercent: 0,
          aratLocation: "Tangail",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.puccaExportBalesYield).toBe(40); // 7200 / 180 = 40
      expect(json.data.isMoistureCompliant).toBe(true);
    });

    it("POST /api/v1/trade/jute/costing calculates DJG product costing", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/jute/costing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "HESSIAN_CLOTH",
          targetUnits: 1000,
          rawJuteGradeCode: "BT_SPECIAL",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.totalProductionCostBdt).toBeGreaterThan(0);
    });

    it("POST /api/v1/trade/jute/subsidy validates export cash incentive", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/jute/subsidy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: "INV-API-888",
          fobValueUsd: 10000,
          exchangeRateUsdToBdt: 122.5,
          productCategory: "DIVERSIFIED_JUTE_GOODS",
          localValueAdditionPercent: 90,
          hasValidPrc: true,
          hasEpbRegistration: true,
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.statutorySubsidyRatePercent).toBe(12.0);
    });

    it("POST /api/v1/trade/jute/bonded-dossier produces sealed customs release", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/jute/bonded-dossier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: "SHP-API-999",
          buyerName: "Global Jute Importers LLC",
          destinationCountry: "Germany",
          portOfLoading: "Chittagong Port",
          hsCode: "5307.10.00",
          productDescription: "Jute Yarn Single Ply",
          totalNetWeightKg: 18000,
          totalPuccaBales: 100,
          fobValueUsd: 38000,
          bondLicenseNumber: "BOND-9941/2026",
          rawJuteLotRef: "LOT-API-101",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.nbrCustomsReleaseToken).toBeDefined();
    });
  });
});
