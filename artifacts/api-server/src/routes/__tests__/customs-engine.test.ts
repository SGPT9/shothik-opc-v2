import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { CrossBorderCustomsEngine } from "../../lib/customs/cross-border-engine.js";
import { customsRouter } from "../customs.js";

describe("Cross-Border Sourcing & Bangladesh Customs Declaration Engine", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", customsRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("computes accurate statutory NBR customs tariff and landed cost for TWS Earbuds (8518.30.00)", async () => {
    const payload = {
      productTitle: "Wireless Bluetooth TWS Earbuds (ANC)",
      sourcePlatform: "1688",
      sourceUrl: "https://detail.1688.com/offer/7123456789.html",
      currency: "USD",
      unitPrice: 12.0, // $12.00
      quantity: 100, // 100 units = $1,200 FOB
      totalWeightKg: 15.0, // 15 kg
      shippingMethod: "air_express", // $8.5/kg
      hsCode: "8518.30.00",
      portOfEntry: "dhaka_airport_cargo",
      importerBin: "001234567-0101",
    };

    const res = await fetch(`${baseUrl}/api/v1/customs/calculate-landed-cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.success).toBe(true);

    const data = body.data;
    expect(data.hsCodeDetails.hsCode).toBe("8518.30.00");
    expect(data.dutyBreakdown.fobValueBdt).toBe(147000); // 12 * 100 * 122.5
    expect(data.dutyBreakdown.freightBdt).toBe(15619); // 15 * 8.5 * 122.5
    expect(data.dutyBreakdown.assessableValueBdt).toBeGreaterThan(160000);
    expect(data.dutyBreakdown.customsDutyBdt).toBeGreaterThan(0);
    expect(data.dutyBreakdown.regulatoryDutyBdt).toBeGreaterThan(0);
    expect(data.dutyBreakdown.supplementaryDutyBdt).toBeGreaterThan(0);
    expect(data.dutyBreakdown.vatBdt).toBeGreaterThan(0);
    expect(data.dutyBreakdown.aitBdt).toBeGreaterThan(0);
    expect(data.dutyBreakdown.advanceTaxBdt).toBeGreaterThan(0);
    expect(data.dutyBreakdown.unitLandedCostBdt).toBeGreaterThan(1800);
    expect(data.regulatoryWarnings.length).toBeGreaterThan(0);
    expect(data.regulatoryWarnings[0]).toContain("BTRC");
  });

  it("calculates landed cost directly using the library module with CNY input", () => {
    const result = CrossBorderCustomsEngine.calculateLandedCost({
      productTitle: "GaN Fast Charger 65W",
      currency: "CNY",
      unitPrice: 35.0, // 35 CNY
      quantity: 50,
      totalWeightKg: 8.0,
      shippingMethod: "air_cargo",
      hsCode: "8504.40.90",
      portOfEntry: "chittagong_seaport",
    });

    expect(result.dutyBreakdown.fobValueBdt).toBe(30100); // 35 * 50 * 17.2
    expect(result.hsCodeDetails.cdRate).toBe(0.15);
    expect(result.hsCodeDetails.sdRate).toBe(0.0);
    expect(result.dutyBreakdown.unitLandedCostBdt).toBeGreaterThan(700);
    expect(result.suggestedRetailPriceBdt.margin40Percent).toBeGreaterThan(result.dutyBreakdown.unitLandedCostBdt);
  });

  it("returns 400 validation error when required fields are missing", async () => {
    const res = await fetch(`${baseUrl}/api/v1/customs/calculate-landed-cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productTitle: "",
        unitPrice: -5,
      }),
    });

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it("searches and autocompletes NBR 8-digit HS codes", async () => {
    const res = await fetch(`${baseUrl}/api/v1/customs/hs-codes?q=phone`);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(body.data[0].hsCode).toBeDefined();
  });

  it("fetches reference exchange rates", async () => {
    const res = await fetch(`${baseUrl}/api/v1/customs/exchange-rates`);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.USD).toBe(122.5);
    expect(body.data.CNY).toBe(17.2);
  });

  it("compiles a certified C&F clearance brief", async () => {
    const calcResult = CrossBorderCustomsEngine.calculateLandedCost({
      productTitle: "Kids STEM Educational Building Blocks",
      currency: "USD",
      unitPrice: 8.5,
      quantity: 200,
      totalWeightKg: 40.0,
      shippingMethod: "sea_freight_lcl",
      hsCode: "9503.00.90",
      portOfEntry: "chittagong_seaport",
      importerBin: "009876543-0202",
    });

    const res = await fetch(`${baseUrl}/api/v1/customs/generate-cf-brief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calculationResult: calcResult,
        consigneeName: "Bengal Trading House Ltd",
      }),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.success).toBe(true);

    const brief = body.data;
    expect(brief.briefId).toContain("CF_BRIEF_");
    expect(brief.importerBin).toBe("009876543-0202");
    expect(brief.portOfEntry).toBe("CHITTAGONG SEAPORT");
    expect(brief.requiredDocuments.length).toBeGreaterThanOrEqual(5);
    expect(brief.specialInstructions.length).toBeGreaterThanOrEqual(4);
  });
});
