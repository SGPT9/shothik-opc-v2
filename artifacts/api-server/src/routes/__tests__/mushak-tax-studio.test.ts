import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { MushakTaxEngine } from "../../lib/tax/mushak-tax-engine.js";

describe("Phase 27: NBR Mushak-6.3 Statutory VAT & TDS Settlement Studio API", () => {
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

  describe("1. MushakTaxEngine Unit Calculation Logic", () => {
    it("validates 13-digit Bangladeshi Business Identification Numbers (BIN)", () => {
      expect(MushakTaxEngine.validateBin("001928374-0101")).toBe(true);
      expect(MushakTaxEngine.validateBin("0019283740101")).toBe(true);
      expect(MushakTaxEngine.validateBin("12345")).toBe(false);
      expect(MushakTaxEngine.validateBin("")).toBe(false);
      expect(MushakTaxEngine.validateBin("abcdef1234567")).toBe(false);
    });

    it("calculates accurate VAT (15%) and TDS for software services", () => {
      const item = {
        id: "item_test_1",
        itemDescription: "Custom AI Agent Workflow Deployment",
        quantity: 2,
        unit: "service" as const,
        unitPriceBdt: 10000,
        vatRatePercent: 15,
        tdsCategory: "it_software_2pct" as const
      };

      const calculated = MushakTaxEngine.calculateLineItem(item, true);
      expect(calculated.rawPriceBdt).toBe(20000);
      expect(calculated.vatAmountBdt).toBe(3000); // 15% of 20,000
      expect(calculated.grossTotalBdt).toBe(23000);
      expect(calculated.tdsRatePercent).toBe(2);
      expect(calculated.tdsAmountBdt).toBe(400); // 2% of 20,000
      expect(calculated.netPayableAfterTdsBdt).toBe(22600); // 23000 - 400
    });

    it("calculates Supplementary Duty (SD) and tiered VAT correctly", () => {
      const item = {
        id: "item_test_sd",
        itemDescription: "Premium Imported Book Binding Board",
        quantity: 10,
        unit: "pcs" as const,
        unitPriceBdt: 500,
        supplementaryDutyRatePercent: 20,
        vatRatePercent: 15
      };

      const calculated = MushakTaxEngine.calculateLineItem(item, false);
      expect(calculated.rawPriceBdt).toBe(5000);
      expect(calculated.supplementaryDutyBdt).toBe(1000); // 20% of 5000
      expect(calculated.priceAfterSdBdt).toBe(6000);
      expect(calculated.vatAmountBdt).toBe(900); // 15% of 6000
      expect(calculated.grossTotalBdt).toBe(6900);
    });
  });

  describe("2. REST Endpoints", () => {
    it("GET /api/v1/tax/mushak/status returns OPC profile and return metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tax/mushak/status`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.opcProfile.bin).toBe("001928374-0101");
      expect(body.data.monthlySummary).toBeDefined();
      expect(body.data.monthlySummary.treasuryChallanCode).toBe("1-1133-0006-0311");
    });

    it("POST /api/v1/tax/mushak/calculate computes multi-item totals", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tax/mushak/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBuyerWithholdingEntity: true,
          items: [
            {
              id: "item_1",
              itemDescription: "Nilkhet Offset Printing Service",
              quantity: 100,
              unit: "copies",
              unitPriceBdt: 150,
              vatRatePercent: 7.5,
              tdsCategory: "printing_publishing_3pct"
            }
          ]
        })
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.totals.totalRawPriceBdt).toBe(15000);
      expect(body.data.totals.totalVatAmountBdt).toBe(1125); // 7.5% of 15000
      expect(body.data.totals.totalTdsWithheldBdt).toBe(450); // 3% of 15000
      expect(body.data.totals.netPayableBdt).toBe(15675); // (15000 + 1125) - 450
      expect(body.data.isSupervisedAutonomyFlagged).toBe(true); // > 10,000
    });

    it("POST /api/v1/tax/mushak/generate-invoice rejects invalid buyer BIN", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tax/mushak/generate-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerInfo: {
            name: "Faulty Buyer",
            bin: "invalid_bin_123",
            address: "Dhanmondi, Dhaka",
            isTaxWithholdingEntity: false
          },
          items: [
            {
              id: "item_01",
              itemDescription: "Consulting",
              quantity: 1,
              unit: "hours",
              unitPriceBdt: 2000,
              vatRatePercent: 15
            }
          ]
        })
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as any;
      expect(body.success).toBe(false);
      expect(body.error).toContain("13-digit");
    });

    it("POST /api/v1/tax/mushak/generate-invoice creates authentic statutory invoice", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tax/mushak/generate-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerInfo: {
            name: "Rafiqul Islam",
            companyName: "Meghna Digital Solutions",
            bin: "002948172-0301",
            address: "Agrabad C/A, Chittagong",
            isTaxWithholdingEntity: true
          },
          items: [
            {
              id: "item_dev_01",
              itemDescription: "Shothik Developer Twin Enterprise License",
              quantity: 1,
              unit: "service",
              unitPriceBdt: 25000,
              vatRatePercent: 15,
              tdsCategory: "it_software_2pct"
            }
          ]
        })
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.serialNumber).toMatch(/^M63-\d{6}-\d{5}$/);
      expect(body.data.qrVerificationToken).toBeDefined();
      expect(body.data.qrVerificationUrl).toContain("vat.nbr.gov.bd");
      expect(body.data.isSupervisedAutonomyFlagged).toBe(true);
      expect(body.data.totals.grossTotalBdt).toBe(28750); // 25000 + 3750 VAT
      expect(body.data.totals.totalTdsWithheldBdt).toBe(500); // 2% of 25000
    });

    it("GET /api/v1/tax/mushak/invoices/:invoiceId/html returns printable HTML", async () => {
      const invoices = MushakTaxEngine.listInvoices();
      const testInvoice = invoices[0];

      const res = await fetch(`${baseUrl}/api/v1/tax/mushak/invoices/${testInvoice.invoiceId}/html`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/html");
      const text = await res.text();
      expect(text).toContain("মূসক-৬.৩");
      expect(text).toContain(testInvoice.serialNumber);
      expect(text).toContain("কর চালানপত্র");
    });

    it("GET /api/v1/tax/mushak/mushak-91-summary aggregates monthly VAT return", async () => {
      const res = await fetch(`${baseUrl}/api/v1/tax/mushak/mushak-91-summary`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.fiscalMonth).toMatch(/^\d{4}-\d{2}$/);
      expect(body.data.totalOutputVatBdt).toBeGreaterThanOrEqual(0);
      expect(body.data.treasuryChallanCode).toBe("1-1133-0006-0311");
      expect(body.data.filingDeadline).toMatch(/^\d{4}-\d{2}-15$/);
    });
  });
});
