import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  debtRecoveryEngine,
  DebtRecoveryEngine,
} from "../../lib/recovery/debt-recovery-engine.js";

describe("B2B Trade Credit Insurance & NI Act 138 Cheque Recovery API (/api/v1/recovery/*)", () => {
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

  describe("DebtRecoveryEngine Unit Logic", () => {
    it("issues trade credit insurance policy with 90% indemnity cap and risk premium", () => {
      const engine = new DebtRecoveryEngine();

      const policy = engine.issuePolicy({
        invoiceId: "INV-2026-TEST",
        mushak63No: "MUSHAK-6.3-99120",
        sellerCompanyName: "Shothik Agritech Ltd.",
        buyerName: "PRAN-RFL Group",
        buyerTier: "tier_1_aaa",
        insuredInvoiceAmountBdt: 1000000,
      });

      expect(policy.policyId).toMatch(/^POL-/);
      expect(policy.indemnityRatePercent).toBe(90);
      expect(policy.maxCoveredIndemnityBdt).toBe(900000);
      expect(policy.premiumRatePercent).toBe(0.45);
      expect(policy.premiumAmountBdt).toBe(4500);
      expect(policy.status).toBe("active");
    });

    it("logs dishonored cheque, sets 30-day statutory limitation deadline and compiles legal notices", () => {
      const engine = new DebtRecoveryEngine();

      const record = engine.logDishonoredCheque({
        chequeNumber: "EBL-CHQ-102938",
        bankName: "Eastern Bank PLC",
        branchName: "Gulshan Branch",
        routingNumber: "095261100",
        chequeAmountBdt: 800000,
        chequeDate: "2026-08-15",
        dishonorMemoDate: "2026-08-25",
        dishonorReason: "insufficient_funds",
        debtorCompanyName: "Apex Retails Ltd.",
        debtorSignatoryName: "Syed Kamrul Hasan",
        creditorCompanyName: "Shothik Technologies Bangladesh Ltd.",
      });

      expect(record.id).toMatch(/^CHQ-/);
      expect(record.legalNoticeServed).toBe(true);
      expect(record.statutoryNoticeDeadline).toBe("2026-09-24");
      expect(record.legalNoticeContentBangla).toContain("ধারা ১৩৮");
      expect(record.legalNoticeContentEnglish).toContain("SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT");
      expect(record.noticeVerificationHash).toBeDefined();
    });

    it("submits insurance claim and disburses 90% indemnity payout", () => {
      const engine = new DebtRecoveryEngine();
      const policy = engine.issuePolicy({
        invoiceId: "INV-CLAIM-1",
        mushak63No: "MUSHAK-6.3-55110",
        sellerCompanyName: "Delta Textile",
        buyerName: "Square Pharmaceuticals PLC",
        buyerTier: "tier_1_aaa",
        insuredInvoiceAmountBdt: 2000000,
      });

      const claim = engine.submitClaim({
        policyId: policy.policyId,
        disbursementChannel: "beftn_bank",
        accountOrMfsNumber: "EBL-1029384756",
      });

      expect(claim.claimId).toMatch(/^CLM-/);
      expect(claim.indemnityPayoutBdt).toBe(1800000); // 90% of 2,000,000
      expect(claim.status).toBe("disbursed");
      expect(policy.status).toBe("claimed");
    });

    it("exports court evidence dossier for Artha Rin Adalat & CIB reporting", () => {
      const engine = new DebtRecoveryEngine();
      const record = engine.logDishonoredCheque({
        chequeNumber: "BRAC-CHQ-778899",
        bankName: "BRAC Bank PLC",
        branchName: "Dhanmondi Branch",
        routingNumber: "060261122",
        chequeAmountBdt: 1200000,
        chequeDate: "2026-08-10",
        dishonorMemoDate: "2026-08-20",
        dishonorReason: "account_closed",
        debtorCompanyName: "Dhaka Mega Superstore Ltd.",
        debtorSignatoryName: "Mahbubur Rahman",
        creditorCompanyName: "Shothik Technologies Bangladesh Ltd.",
      });

      const dossier = engine.exportCourtDossier(record.id);
      expect(dossier.statutoryGoverningAct).toContain("Negotiable Instruments Act 1881");
      expect(dossier.cibDelinquencyReporting.reportingCode).toBe("CIB-NI138-DEF");
    });
  });

  describe("Debt Recovery HTTP Endpoints", () => {
    it("GET /api/v1/recovery/summary returns dashboard KPI summary metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/recovery/summary`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.totalInsuredPortfolioBdt).toBeGreaterThan(0);
      expect(body.data.statutorySuccessRatePercent).toBe(94.5);
    });

    it("GET /api/v1/recovery/policies returns active insurance policies", async () => {
      const res = await fetch(`${baseUrl}/api/v1/recovery/policies`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("POST /api/v1/recovery/policies/issue issues new policy certificate", async () => {
      const res = await fetch(`${baseUrl}/api/v1/recovery/policies/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mushak63No: "MUSHAK-6.3-NEW-99",
          buyerName: "PRAN-RFL Group",
          buyerTier: "tier_1_aaa",
          insuredInvoiceAmountBdt: 1500000,
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.policyId).toMatch(/^POL-/);
      expect(body.data.maxCoveredIndemnityBdt).toBe(1350000);
    });

    it("POST /api/v1/recovery/cheques/dishonor logs dishonored cheque and generates notice", async () => {
      const res = await fetch(`${baseUrl}/api/v1/recovery/cheques/dishonor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chequeNumber: "CITY-CHQ-112233",
          bankName: "City Bank PLC",
          branchName: "Banani Branch",
          chequeAmountBdt: 750000,
          dishonorMemoDate: "2026-09-10",
          dishonorReason: "insufficient_funds",
          debtorCompanyName: "Dhaka Retail Distro",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.id).toMatch(/^CHQ-/);
      expect(body.data.legalNoticeServed).toBe(true);
    });
  });
});
