import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  dutyDrawbackEngine,
  DutyDrawbackEngine,
} from "../../lib/customs/duty-drawback-engine.js";

describe("Slice 52: NBR Customs Duty Drawback & DEC Engine", () => {
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

  describe("DutyDrawbackEngine Unit Logic", () => {
    it("calculates statutory DEDO flat rate drawback for export FOB", () => {
      const engine = new DutyDrawbackEngine();
      const calc = engine.calculateDrawback({
        claimMode: "dedo_flat_rate",
        fobValueBdt: 10000000,
        flatRatePercent: 4.5,
      });

      expect(calc.totalDrawbackBdt).toBe(450000);
      expect(calc.breakdown.cdRefundBdt).toBe(270000);
      expect(calc.effectiveDrawbackRatePercent).toBe(4.5);
      expect(calc.statutoryRule).toContain("Section 33");
    });

    it("calculates actual costing drawback based on consumed imported raw materials", () => {
      const engine = new DutyDrawbackEngine();
      const calc = engine.calculateDrawback({
        claimMode: "actual_costing_bom",
        fobValueBdt: 5000000,
        importedInputs: [
          {
            assessableValueBdt: 2000000,
            cdRate: 15,
            rdRate: 3,
            sdRate: 10,
            vatRate: 15,
            consumptionRatio: 0.9,
          },
        ],
      });

      // Consumed = 2,000,000 * 0.9 = 1,800,000
      // Duties = 15% (270k) + 3% (54k) + 10% (180k) + 15% (270k) = 774,000
      expect(calc.totalDrawbackBdt).toBe(774000);
      expect(calc.breakdown.cdRefundBdt).toBe(270000);
      expect(calc.statutoryRule).toContain("Section 34");
    });

    it("reconciles Import B/E, Export B/E, and Bangladesh Bank Form-EXP", () => {
      const engine = new DutyDrawbackEngine();

      const success = engine.reconcileBills("C-1984210", "EXP-CTG-2026-44120", "EXP-BB-2026-091823");
      expect(success.isMatched).toBe(true);
      expect(success.reconciliationScorePercent).toBe(100);

      const failed = engine.reconcileBills("", "EXP-CTG-2026-44120", "EXP-BB-2026-091823");
      expect(failed.isMatched).toBe(false);
      expect(failed.discrepancies.length).toBeGreaterThan(0);
    });

    it("generates DEDO claim with cryptographic SHA-256 integrity seal", () => {
      const engine = new DutyDrawbackEngine();
      const claim = engine.generateClaim({
        exporterName: "Apex Footwear Ltd.",
        exporterBin: "0019283746192",
        exporterErc: "ERC-EXP-881923",
        claimMode: "dedo_flat_rate",
        exportProduct: {
          productName: "Leather Shoes",
          exportHsCode: "6403.51.00",
          exportQuantityUnits: 1000,
          fobValueUsd: 20000,
          fobValueBdt: 2400000,
          billOfExportNumber: "EXP-DAC-2026-112",
          billOfExportDate: "2026-08-10",
          formExpNumber: "EXP-BB-2026-55412",
          repatriationStatus: "repatriated",
          statutoryFlatRatePercent: 5.0,
        },
        importedInputs: [],
        flatRatePercent: 5.0,
      });

      expect(claim.id).toContain("DRW-2026-");
      expect(claim.totalClaimableDrawbackBdt).toBe(120000); // 5% of 2.4M
      expect(claim.digitalSealHash).toHaveLength(64);
      expect(claim.status).toBe("submitted");
    });
  });

  describe("Duty Drawback Express API Endpoints", () => {
    it("GET /api/v1/duty-drawback/summary returns metric stats", async () => {
      const res = await fetch(`${baseUrl}/api/v1/duty-drawback/summary`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.totalClaimsCount).toBeGreaterThan(0);
      expect(body.data.totalClaimedValueBdt).toBeGreaterThan(0);
    });

    it("GET /api/v1/duty-drawback/claims returns array of claims", async () => {
      const res = await fetch(`${baseUrl}/api/v1/duty-drawback/claims`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("POST /api/v1/duty-drawback/calculate computes drawback breakdown", async () => {
      const res = await fetch(`${baseUrl}/api/v1/duty-drawback/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimMode: "dedo_flat_rate",
          fobValueBdt: 10000000,
          flatRatePercent: 4.5,
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.totalDrawbackBdt).toBe(450000);
    });

    it("POST /api/v1/duty-drawback/reconcile-bills validates ASYCUDA and Form-EXP matching", async () => {
      const res = await fetch(`${baseUrl}/api/v1/duty-drawback/reconcile-bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importBeNumber: "C-1984210",
          billOfExportNumber: "EXP-CTG-2026-44120",
          formExpNumber: "EXP-BB-2026-091823",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.isMatched).toBe(true);
    });
  });
});
