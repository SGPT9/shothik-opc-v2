import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  invoiceFactoringEngine,
  InvoiceFactoringEngine,
} from "../../lib/factoring/invoice-factoring-engine.js";

describe("B2B Invoice Factoring & Islamic Murabaha Cash Advance API (/api/v1/factoring/*)", () => {
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

  describe("InvoiceFactoringEngine Unit Calculations", () => {
    it("generates accurate Murabaha cost-plus markup quote for Tier-1 Blue Chip debtor", () => {
      const engine = new InvoiceFactoringEngine();

      const quote = engine.generateQuote({
        invoiceGrossBdt: 1000000,
        buyerName: "PRAN-RFL Group",
        tenorDays: 60,
        financingMode: "islamic_murabaha",
      });

      expect(quote.buyerTier).toBe("tier_1_aaa");
      expect(quote.ltvPercent).toBe(85);
      expect(quote.grossAdvanceBdt).toBe(850000);
      expect(quote.retainedReserveBdt).toBe(150000);
      // 60 days = 2 months @ 1.0%/mo = 2.0% markup on 8,50,000 = 17,000
      expect(quote.financingFeeBdt).toBe(17000);
      expect(quote.platformFeeBdt).toBe(5000); // 0.5% on 1,000,000
      expect(quote.netDisbursedToSellerBdt).toBe(850000 - 17000 - 5000);
      expect(quote.quoteHash).toBeDefined();
    });

    it("generates accurate Conventional Bill Discounting quote with SMART rate + spread", () => {
      const engine = new InvoiceFactoringEngine();

      const quote = engine.generateQuote({
        invoiceGrossBdt: 2000000,
        buyerName: "Walton Hi-Tech Industries PLC",
        tenorDays: 90,
        financingMode: "conventional_discounting",
      });

      expect(quote.buyerTier).toBe("tier_2_aplus");
      expect(quote.ltvPercent).toBe(80);
      expect(quote.grossAdvanceBdt).toBe(1600000);
      expect(quote.effectiveAnnualRatePercent).toBe(11.5 + 3.0); // SMART 11.5% + 3.0% spread = 14.5%
      expect(quote.financingFeeBdt).toBeGreaterThan(0);
    });

    it("submits application, generates SHA-256 escrow lien, and disburses advance", () => {
      const engine = new InvoiceFactoringEngine();

      const item = engine.applyForFactoring({
        mushak63No: "MUSHAK-6.3-55990",
        poNumber: "PO-BEXIMCO-2026",
        sellerCompanyName: "Delta Textile Mills",
        buyerName: "Square Pharmaceuticals PLC",
        invoiceGrossBdt: 3000000,
        issueDate: "2026-09-10",
        dueDate: "2026-11-10",
        tenorDays: 60,
        financingMode: "islamic_murabaha",
        disbursementChannel: "beftn_bank",
        accountOrMfsNumber: "EBL-1029384756",
      });

      expect(item.id).toMatch(/^FAC-/);
      expect(item.status).toBe("disbursed");
      expect(item.escrowLienHash).toBeDefined();
      expect(item.grossAdvanceBdt).toBe(2550000); // 85% of 3,000,000
    });

    it("settles receivable when debtor pays into escrow and releases retained reserve", () => {
      const engine = new InvoiceFactoringEngine();
      const item = engine.applyForFactoring({
        mushak63No: "MUSHAK-6.3-99120",
        poNumber: "PO-TEST-1",
        sellerCompanyName: "Dhaka Suppliers",
        buyerName: "PRAN-RFL Group",
        invoiceGrossBdt: 1000000,
        issueDate: "2026-08-01",
        dueDate: "2026-10-01",
        tenorDays: 60,
        financingMode: "islamic_murabaha",
        disbursementChannel: "bkash_corporate",
        accountOrMfsNumber: "01712345678",
      });

      const settled = engine.settleInvoice(item.id, 1000000);
      expect(settled.status).toBe("settled");
      expect(settled.finalReserveReleasedBdt).toBe(item.retainedReserveBdt);
      expect(settled.settledAmountBdt).toBe(1000000);
    });
  });

  describe("Invoice Factoring HTTP Endpoints", () => {
    it("GET /api/v1/factoring/summary returns KPI portfolio metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/factoring/summary`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.totalFactoredReceivablesBdt).toBeGreaterThan(0);
      expect(body.data.activeOutstandingAdvancesBdt).toBeGreaterThan(0);
    });

    it("POST /api/v1/factoring/quote returns live financing comparison quote", async () => {
      const res = await fetch(`${baseUrl}/api/v1/factoring/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceGrossBdt: 1500000,
          buyerName: "PRAN-RFL Group",
          tenorDays: 60,
          financingMode: "islamic_murabaha",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.grossAdvanceBdt).toBe(1275000);
      expect(body.data.retainedReserveBdt).toBe(225000);
    });

    it("GET /api/v1/factoring/invoices returns active and settled receivables", async () => {
      const res = await fetch(`${baseUrl}/api/v1/factoring/invoices`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("POST /api/v1/factoring/apply creates new factoring record with lien lock", async () => {
      const res = await fetch(`${baseUrl}/api/v1/factoring/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mushak63No: "MUSHAK-6.3-AUTO-11",
          poNumber: "PO-WALTON-88",
          sellerCompanyName: "Component Supply BD",
          buyerName: "Walton Hi-Tech Industries PLC",
          invoiceGrossBdt: 1800000,
          issueDate: "2026-09-12",
          dueDate: "2026-11-25",
          tenorDays: 75,
          financingMode: "islamic_murabaha",
          disbursementChannel: "bkash_corporate",
          accountOrMfsNumber: "01799887766",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.id).toMatch(/^FAC-/);
      expect(body.data.status).toBe("disbursed");
    });
  });
});
