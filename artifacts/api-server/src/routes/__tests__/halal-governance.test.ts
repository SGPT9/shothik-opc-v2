import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  halalGovernanceEngine,
  HalalGovernanceEngine,
} from "../../lib/shariah/halal-governance-engine.js";

describe("Slice 53: Autonomous Halal Certification & Islamic Shariah Governance Engine", () => {
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

  describe("HalalGovernanceEngine Unit Logic", () => {
    it("screens ingredients for Halal, Haram, and Mushbooh status against E-Number database", () => {
      const engine = new HalalGovernanceEngine();
      const result = engine.screenIngredients(["E100", "E120", "E471", "Sugar"]);

      expect(result.totalIngredients).toBe(4);
      expect(result.halalCount).toBe(2); // E100, Sugar
      expect(result.haramCount).toBe(1); // E120 Carmine
      expect(result.mushboohCount).toBe(1); // E471
      expect(result.overallStatus).toBe("haram");
      expect(result.bstiBds1907Compliance).toBe(false);
      expect(result.criticalIssues.length).toBe(2);
      expect(result.recommendedSubstitutions.length).toBe(2);
    });

    it("verifies 100% Halal clean ingredient list", () => {
      const engine = new HalalGovernanceEngine();
      const result = engine.screenIngredients(["E100", "E330", "E621", "Pure Cane Sugar"]);

      expect(result.overallStatus).toBe("halal");
      expect(result.bstiBds1907Compliance).toBe(true);
      expect(result.haramCount).toBe(0);
      expect(result.mushboohCount).toBe(0);
      expect(result.criticalIssues).toHaveLength(0);
    });

    it("audits corporate financials according to AAOIFI Shariah Standard No. 21", () => {
      const engine = new HalalGovernanceEngine();
      const auditCompliant = engine.auditFinancials({
        companyName: "Halal Agro Ltd.",
        totalAssetsBdt: 100000000,
        totalInterestBearingDebtBdt: 20000000, // 20% <= 33%
        interestBearingSecuritiesBdt: 15000000, // 15% <= 33%
        totalRevenueBdt: 50000000,
        impermissibleRevenueBdt: 500000, // 1% <= 5%
      });

      expect(auditCompliant.isDebtCompliant).toBe(true);
      expect(auditCompliant.isSecuritiesCompliant).toBe(true);
      expect(auditCompliant.isRevenueCompliant).toBe(true);
      expect(auditCompliant.overallShariahStatus).toBe("requires_purification");
      expect(auditCompliant.purificationAmountBdt).toBe(500000);

      const auditNonCompliant = engine.auditFinancials({
        companyName: "High Debt Traders Ltd.",
        totalAssetsBdt: 100000000,
        totalInterestBearingDebtBdt: 45000000, // 45% > 33%
        interestBearingSecuritiesBdt: 10000000,
        totalRevenueBdt: 50000000,
        impermissibleRevenueBdt: 0,
      });

      expect(auditNonCompliant.isDebtCompliant).toBe(false);
      expect(auditNonCompliant.overallShariahStatus).toBe("non_compliant");
    });

    it("generates Halal certification with SHA-256 digital seal hash", () => {
      const engine = new HalalGovernanceEngine();
      const cert = engine.generateCertificate({
        companyName: "Deshi Dairy Products Ltd.",
        companyBin: "0019283746192",
        productName: "Full Cream Pasteurized Milk",
        productCategory: "Dairy & Livestock",
        certificationType: "product_halal",
        standardApplied: "BSTI BDS 1907:2016",
        auditResult: "compliant",
      });

      expect(cert.id).toContain("HL-2026-");
      expect(cert.certificateNumber).toContain("BSTI-HALAL-2026-");
      expect(cert.digitalSealHash).toHaveLength(64);
      expect(cert.auditResult).toBe("compliant");
      expect(cert.validUntil).toBeDefined();
    });
  });

  describe("Halal Governance Express API Endpoints", () => {
    it("GET /api/v1/shariah/summary returns high level metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/shariah/summary`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.totalCertifications).toBeGreaterThan(0);
      expect(body.data.activeHalalProducts).toBeGreaterThan(0);
    });

    it("GET /api/v1/shariah/certifications returns certification records", async () => {
      const res = await fetch(`${baseUrl}/api/v1/shariah/certifications`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("GET /api/v1/shariah/e-numbers returns E-Number database", async () => {
      const res = await fetch(`${baseUrl}/api/v1/shariah/e-numbers`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.some((e: any) => e.eNumber === "E120")).toBe(true);
    });

    it("POST /api/v1/shariah/screen-ingredients screens input list", async () => {
      const res = await fetch(`${baseUrl}/api/v1/shariah/screen-ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ["E100", "E120", "Citric Acid"] }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.overallStatus).toBe("haram");
      expect(body.data.bstiBds1907Compliance).toBe(false);
    });

    it("POST /api/v1/shariah/audit-financials performs AAOIFI ratio check", async () => {
      const res = await fetch(`${baseUrl}/api/v1/shariah/audit-financials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "Padma Trading House",
          totalAssetsBdt: 50000000,
          totalInterestBearingDebtBdt: 5000000,
          interestBearingSecuritiesBdt: 2000000,
          totalRevenueBdt: 25000000,
          impermissibleRevenueBdt: 100000,
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.isDebtCompliant).toBe(true);
      expect(body.data.overallShariahStatus).toBe("requires_purification");
    });

    it("POST /api/v1/shariah/certifications/generate creates new certification", async () => {
      const res = await fetch(`${baseUrl}/api/v1/shariah/certifications/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "Meghna Spices Ltd.",
          companyBin: "0012938471920",
          productName: "Chili Powder & Turmeric Blend",
          productCategory: "Spices & Seasonings",
          certificationType: "product_halal",
          standardApplied: "BSTI BDS 1907:2016",
          auditResult: "compliant",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.ok).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.digitalSealHash).toHaveLength(64);
    });
  });
});
