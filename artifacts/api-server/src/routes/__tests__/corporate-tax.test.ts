import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  corporateTaxEngine,
  CorporateTaxEngine,
} from "../../lib/corporate-tax/corporate-tax-engine.js";

describe("Corporate Tax, Section 82C Minimum Tax & VAT Mushak-9.1 API (/api/v1/corporate-tax/*)", () => {
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

  describe("CorporateTaxEngine Unit Calculations", () => {
    it("calculates standard corporate tax for Private Limited vs One Person Company", () => {
      const engine = new CorporateTaxEngine();

      const pvtLtd = engine.calculateCorporateTax({
        tinNumber: "123456789012",
        companyName: "Acme Tech Ltd.",
        assessmentYear: "2026-2027",
        incomeYear: "2025-2026",
        entityType: "private_limited",
        isCashlessCompliant: false,
        grossTurnoverBdt: 10000000,
        grossRevenueReceiptsBdt: 10000000,
        allowableBusinessExpensesBdt: 6000000,
        depreciationAllowanceBdt: 1000000,
      });

      expect(pvtLtd.applicableTaxRatePercent).toBe(27.5);
      expect(pvtLtd.netTaxableProfitBdt).toBe(3000000);
      expect(pvtLtd.standardTaxOnProfitBdt).toBe(825000); // 3,000,000 * 27.5%

      const opc = engine.calculateCorporateTax({
        tinNumber: "987654321098",
        companyName: "Solopreneur OPC",
        assessmentYear: "2026-2027",
        incomeYear: "2025-2026",
        entityType: "one_person_company",
        isCashlessCompliant: true,
        grossTurnoverBdt: 10000000,
        grossRevenueReceiptsBdt: 10000000,
        allowableBusinessExpensesBdt: 6000000,
        depreciationAllowanceBdt: 1000000,
      });

      expect(opc.applicableTaxRatePercent).toBe(20.0); // 20% for cashless compliant OPC
      expect(opc.standardTaxOnProfitBdt).toBe(600000); // 3,000,000 * 20%
    });

    it("triggers Section 163/82C Minimum Turnover Tax floor when net profit is low or zero", () => {
      const engine = new CorporateTaxEngine();

      const lowProfitCompany = engine.calculateCorporateTax({
        tinNumber: "555666777888",
        companyName: "Low Margin Trading Ltd.",
        assessmentYear: "2026-2027",
        incomeYear: "2025-2026",
        entityType: "private_limited",
        grossTurnoverBdt: 50000000, // 5 Crore turnover
        grossRevenueReceiptsBdt: 50000000,
        allowableBusinessExpensesBdt: 49500000, // Very low profit (5 Lakh)
        depreciationAllowanceBdt: 400000, // Net taxable profit 1 Lakh
      });

      // Net profit = 1,00,000 -> 27.5% = ৳27,500
      // 0.6% on 5,00,00,000 turnover floor = ৳3,00,000
      expect(lowProfitCompany.isMinimumTaxTriggered).toBe(true);
      expect(lowProfitCompany.minimumTurnoverTaxFloorBdt).toBe(300000);
      expect(lowProfitCompany.grossCorporateTaxLiabilityBdt).toBe(300000);
    });

    it("deducts Advance Income Tax (AIT) credits from corporate tax liability", () => {
      const engine = new CorporateTaxEngine();
      const result = engine.calculateCorporateTax({
        tinNumber: "789123456789",
        companyName: "Shothik Technologies Bangladesh Ltd.",
        assessmentYear: "2026-2027",
        incomeYear: "2025-2026",
        entityType: "one_person_company",
        isCashlessCompliant: true,
        grossTurnoverBdt: 18500000,
        grossRevenueReceiptsBdt: 18500000,
        allowableBusinessExpensesBdt: 13200000,
        depreciationAllowanceBdt: 850000,
      });

      expect(result.totalAitCreditedBdt).toBeGreaterThan(0);
      expect(result.netTaxPayableToNBRBdt).toBe(
        Math.max(0, result.grossCorporateTaxLiabilityBdt - result.totalAitCreditedBdt)
      );
    });

    it("correctly calculates VAT Mushak-9.1 net payable and ITC adjustments", () => {
      const engine = new CorporateTaxEngine();
      const mushak = engine.getMushak91Return("2026-09");

      expect(mushak.binNumber).toBe("001234567-0101");
      expect(mushak.totalOutputVatPayableBdt).toBe(675000);
      expect(mushak.totalInputTaxCreditBdt).toBe(465000);
      expect(mushak.netVatPayableToTreasuryBdt).toBe(220000);
    });
  });

  describe("Corporate Tax HTTP Endpoints", () => {
    it("GET /api/v1/corporate-tax/summary returns high-level dashboard metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/corporate-tax/summary`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.currentAssessmentYear).toBe("2026-2027");
      expect(body.data.corporateTaxLiabilityBdt).toBeGreaterThan(0);
      expect(body.data.mushak91Status).toBe("compliant");
    });

    it("POST /api/v1/corporate-tax/calculate returns full tax computation with minimum tax audit", async () => {
      const res = await fetch(`${baseUrl}/api/v1/corporate-tax/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tinNumber: "789123456789",
          companyName: "Test OPC Tech",
          assessmentYear: "2026-2027",
          incomeYear: "2025-2026",
          entityType: "one_person_company",
          isCashlessCompliant: true,
          grossTurnoverBdt: 12000000,
          grossRevenueReceiptsBdt: 12000000,
          allowableBusinessExpensesBdt: 8000000,
          depreciationAllowanceBdt: 500000,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.netTaxableProfitBdt).toBe(3500000);
      expect(body.data.standardTaxOnProfitBdt).toBe(700000);
      expect(body.data.computationHash).toBeDefined();
    });

    it("POST /api/v1/corporate-tax/ait-ledger/add adds a new AIT certificate", async () => {
      const res = await fetch(`${baseUrl}/api/v1/corporate-tax/ait-ledger/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "sec_120_import",
          challanOrCertificateNo: "CUST-AIT-992",
          deductingAuthority: "Chittagong Custom House",
          transactionDate: "2026-09-15",
          baseTransactionAmountBdt: 5000000,
          withholdingRatePercent: 5.0,
          aitDeductedAmountBdt: 250000,
          bankDepositChallanNo: "TR-CH-778811",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.id).toMatch(/^AIT-/);
      expect(body.data.aitDeductedAmountBdt).toBe(250000);
    });

    it("POST /api/v1/corporate-tax/export-e-return returns compliant e-Return payload", async () => {
      const res = await fetch(`${baseUrl}/api/v1/corporate-tax/export-e-return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tinNumber: "789123456789",
          companyName: "Shothik Technologies Bangladesh Ltd.",
          entityType: "one_person_company",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.nbrPortalFormat).toBe("NBR_E_RETURN_V2026");
      expect(body.data.schedule82C).toBeDefined();
      expect(body.data.scheduleAIT).toBeDefined();
    });
  });
});
