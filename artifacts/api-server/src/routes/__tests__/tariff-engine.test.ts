import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { CustomsTariffEngine, globalTariffEngine } from "../../lib/customs/tariff-engine.js";

describe("Slice 57: Autonomous HS Code Classification, Customs Tariff & CIPL Engine", () => {
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

  describe("CustomsTariffEngine Unit Logic", () => {
    it("classifies products to 8-digit NBR HS codes with confidence", () => {
      const engine = new CustomsTariffEngine();
      const result = engine.classifyHsCode("smartphones and cellular devices");
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].hsCode).toBe("8517.13.00");
      expect(result.matches[0].category).toBe("Electronics");
    });

    it("calculates statutory compounding customs tax incidence correctly", () => {
      const engine = new CustomsTariffEngine();
      const breakdown = engine.calculateTaxIncidence({
        assessableValueBdt: 100000,
        hsCode: "8517.13.00",
      });

      // CD = 25% of 100,000 = 25,000
      expect(breakdown.cdAmount).toBe(25000);
      // RD = 3% of 100,000 = 3,000
      expect(breakdown.rdAmount).toBe(3000);
      // Base for SD = 100,000 + 25,000 + 3,000 = 128,000; SD = 20% of 128,000 = 25,600
      expect(breakdown.sdAmount).toBe(25600);
      // Base for VAT = 128,000 + 25,600 = 153,600; VAT = 15% of 153,600 = 23,040
      expect(breakdown.vatAmount).toBe(23040);
      // AIT = 5% of 100,000 = 5,000
      expect(breakdown.aitAmount).toBe(5000);
      // AT = 5% of 153,600 = 7,680
      expect(breakdown.atAmount).toBe(7680);
      // Total Duty = 25k + 3k + 25.6k + 23.04k + 5k + 7.68k = 89,320
      expect(breakdown.totalDutyBdt).toBe(89320);
      expect(breakdown.totalTaxIncidencePercent).toBe(89.32);
    });

    it("screens Import Policy Order (IPO) restrictions & mandatory certificates", () => {
      const engine = new CustomsTariffEngine();
      const compliance = engine.screenIpoCompliance("3304.99.00", "France");
      expect(compliance.compliant).toBe(true);
      expect(compliance.requiredClearances.some((c) => c.includes("BSTI"))).toBe(true);
    });
  });

  describe("API Endpoints", () => {
    it("GET /api/customs/classify returns HS code matches", async () => {
      const res = await fetch(`${baseUrl}/api/customs/classify?q=laptop`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.matches[0].hsCode).toBe("8471.30.00");
    });

    it("POST /api/customs/calculate-tax returns tax incidence breakdown", async () => {
      const res = await fetch(`${baseUrl}/api/customs/calculate-tax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessableValueBdt: 200000, hsCode: "8471.30.00" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.breakdown.assessableValueBdt).toBe(200000);
      expect(data.breakdown.cdAmount).toBe(0); // Laptops have 0% CD
    });

    it("POST /api/customs/generate-invoice generates ASYCUDA CIPL with SHA-256 seal", async () => {
      const res = await fetch(`${baseUrl}/api/customs/generate-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exporter: { name: "Guangzhou Textile Sourcing", address: "Guangzhou", country: "China" },
          importer: { name: "Dhaka Fashion OPC", binNumber: "009876543-0101", tinNumber: "123456789012", address: "Dhaka" },
          portOfEntry: "Chittagong Port",
          items: [
            {
              itemDescription: "Cotton Knitted T-Shirts",
              hsCode: "6109.10.00",
              quantity: 500,
              unit: "PCS",
              unitPriceUsd: 4.5,
              totalPriceUsd: 2250,
            },
          ],
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.invoice.invoiceNumber).toContain("INV-");
      expect(data.invoice.signedHashSeal).toHaveLength(64);
      expect(data.invoice.totalUsd).toBe(2250);
    });
  });
});
