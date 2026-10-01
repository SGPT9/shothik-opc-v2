import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { rmgRouter } from "../rmg.js";

const app = express();
app.use(express.json());
app.use("/api", rmgRouter);

describe("Autonomous RMG Merchandising & Fabric Consumption Engine (Slice 85)", () => {
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

  describe("POST /api/v1/apparel/rmg/consumption", () => {
    it("calculates body, sleeve, and total fabric consumption per dozen with roll counts", async () => {
      const payload = {
        garmentType: "basic_tshirt",
        orderQuantityPcs: 1200, // 100 dozens
        fabricGsm: 180,
        bodyLengthCm: 70,
        halfChestCm: 52,
        sleeveLengthCm: 22,
        markerEfficiencyPercent: 86,
        wastageAllowancePercent: 7,
      };

      const res = await fetch(`${baseUrl}/api/v1/apparel/rmg/consumption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.bodyConsumptionKgPerDozen).toBeGreaterThan(1.5);
      expect(json.result.sleeveConsumptionKgPerDozen).toBeGreaterThan(0.2);
      expect(json.result.grossConsumptionKgPerDozen).toBeGreaterThan(json.result.netConsumptionKgPerDozen);
      expect(json.result.totalFabricRequiredKg).toBeGreaterThan(200);
      expect(json.result.standardFabricRollsCount).toBeGreaterThan(8);
      expect(json.result.yarnRequirementKg).toBeGreaterThan(json.result.totalFabricRequiredKg);
      expect(json.result.calculationSealSha256).toMatch(/^[a-f0-9]{64}$/);
    });

    it("rejects invalid consumption payload with negative dimensions", async () => {
      const res = await fetch(`${baseUrl}/api/v1/apparel/rmg/consumption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garmentType: "basic_tshirt", bodyLengthCm: -10 }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/v1/apparel/rmg/tech-pack", () => {
    it("generates graded tech pack with POM tolerances and Bill of Materials", async () => {
      const payload = {
        styleCode: "TS-MIRPUR-2026",
        styleName: "Summer Organic Crewneck",
        garmentType: "basic_tshirt",
        fabricComposition: "100% Combed Ringspun Cotton",
        fabricGsm: 180,
        yarnCount: "30s/1 Ne",
        orderQuantityPcs: 2400, // 200 dozens
        cmCostPerDozenBdt: 450, // ৳450/dozen Cost of Making
        factoryName: "Narayanganj Knitworks Ltd",
      };

      const res = await fetch(`${baseUrl}/api/v1/apparel/rmg/tech-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.techPackId).toContain("TP-TS-MIRPUR-2026");
      expect(json.result.totalCmContractBdt).toBe(200 * 450); // 90,000 BDT
      expect(json.result.measurements.length).toBe(5);
      expect(json.result.measurements[0].sizeValuesCm.M).toBe(70);
      expect(json.result.billOfMaterials.length).toBeGreaterThanOrEqual(5);
      expect(json.result.techPackSealSha256).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("POST /api/v1/apparel/rmg/contracts/milestone-escrow", () => {
    it("creates 4-tier milestone escrow agreement (25/35/25/15) with escrow references", async () => {
      const techPack = {
        techPackId: "TP-TEST-001",
        styleCode: "POLO-CTG-01",
        orderQuantityPcs: 1200,
        totalCmContractBdt: 100000,
      };

      const res = await fetch(`${baseUrl}/api/v1/apparel/rmg/contracts/milestone-escrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techPack,
          subcontractorName: "Bismillah Stitching Unit 4, Narayanganj",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.milestones.length).toBe(4);
      expect(json.result.milestones[0].percentage).toBe(25);
      expect(json.result.milestones[0].amountBdt).toBe(25000);
      expect(json.result.milestones[0].status).toBe("FUNDED");
      expect(json.result.milestones[1].percentage).toBe(35);
      expect(json.result.milestones[1].amountBdt).toBe(35000);
      expect(json.result.milestones[2].percentage).toBe(25);
      expect(json.result.milestones[3].percentage).toBe(15);
      expect(json.result.contractSealSha256).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("POST /api/v1/apparel/rmg/mushak-43/declaration", () => {
    it("compiles NBR Mushak-4.3 statutory input-output declaration with FOB USD margins", async () => {
      const techPack = {
        styleCode: "TSHIRT-EXP-01",
        garmentType: "basic_tshirt",
        cmCostPerDozenBdt: 480,
      };
      const consumption = {
        grossConsumptionKgPerDozen: 2.8,
        yarnRequirementKg: 294,
        orderQuantityDozens: 100,
      };

      const res = await fetch(`${baseUrl}/api/v1/apparel/rmg/mushak-43/declaration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techPack, consumption }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.declarationId).toContain("MUSHAK-4.3-DECL");
      expect(json.result.costBreakdownBdt.rawFabricCost).toBe(Math.round(2.8 * 550));
      expect(json.result.exportPricing.exchangeRateBdtPerUsd).toBe(120);
      expect(json.result.exportPricing.suggestedFobPerDozenUsd).toBeGreaterThan(15);
      expect(json.result.nbrDigitalSeal).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
