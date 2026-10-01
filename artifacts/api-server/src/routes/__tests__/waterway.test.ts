import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { waterwayRouter } from "../waterway.js";

const app = express();
app.use(express.json());
app.use("/api", waterwayRouter);

describe("Autonomous Inland Waterway Cargo & River Vessel Telemetry Engine (Slice 87)", () => {
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

  describe("GET /api/v1/logistics/waterway/corridors", () => {
    it("returns pre-seeded BIWTA inland waterway corridors", async () => {
      const res = await fetch(`${baseUrl}/api/v1/logistics/waterway/corridors`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(5);

      const meghna = json.corridors.find(
        (c: any) => c.corridorId === "chittagong_dhaka_meghna"
      );
      expect(meghna).toBeDefined();
      expect(meghna.corridorNameBangla).toContain("মেঘনা-ঢাকা");
      expect(meghna.riverDistanceKm).toBe(275);
      expect(meghna.classificationClass).toBe("Class-I");
      expect(meghna.minimumNavigableDepthMeters).toBe(3.9);
      expect(meghna.primaryGhats).toContain("Sadarghat");
    });
  });

  describe("POST /api/v1/logistics/waterway/telemetry", () => {
    it("ingests safe cruising AIS telemetry and returns standard clearance", async () => {
      const payload = {
        vesselId: "MV-TITAS-EXPRESS",
        corridorId: "chittagong_dhaka_meghna",
        latitude: 23.456,
        longitude: 90.678,
        speedKnots: 8.5,
        headingDegrees: 180,
        riverKilometerMarker: 142.5,
        currentWaterDepthMeters: 4.8,
        currentDraftMeters: 3.2,
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/waterway/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.telemetry.draftClearanceMeters).toBe(1.6);
      expect(json.telemetry.groundingRiskStatus).toBe("safe");
      expect(json.telemetry.speedRecommendationKnots).toBe(8.5);
    });

    it("triggers critical grounding hazard warning when clearance is under 0.3m", async () => {
      const payload = {
        vesselId: "MV-PADMA-CARRIER",
        corridorId: "paturia_daulatdia_padma",
        latitude: 23.75,
        longitude: 89.85,
        speedKnots: 7.0,
        headingDegrees: 90,
        riverKilometerMarker: 48.0,
        currentWaterDepthMeters: 2.9,
        currentDraftMeters: 2.7, // Clearance 0.2m! Under 0.3m threshold
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/waterway/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.telemetry.draftClearanceMeters).toBe(0.2);
      expect(json.telemetry.groundingRiskStatus).toBe("critical_grounding_risk");
      expect(json.telemetry.speedRecommendationKnots).toBe(3);
      expect(json.telemetry.navigationalAdvisoryBangla).toContain("জরুরী সতর্কতা");
    });

    it("rejects invalid telemetry with 400 validation error", async () => {
      const payload = {
        vesselId: "X",
        corridorId: "invalid_corridor",
        latitude: 200, // Invalid latitude
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/waterway/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Invalid telemetry payload");
    });
  });

  describe("POST /api/v1/logistics/waterway/laytime/audit", () => {
    it("calculates demurrage penalty when discharge exceeds free laytime", async () => {
      const norDate = new Date("2026-10-01T06:00:00.000Z");
      // 120 hours elapsed - 12 hours storm signal = 108 billable hours
      // 1,500 MT cargo free laytime = (1500 / 500) * 24 = 72 hours
      // Overrun = 36 hours (1.5 days) => 1.5 * 25,000 = ৳37,500
      const dischargeDate = new Date(norDate.getTime() + 120 * 60 * 60 * 1000);

      const payload = {
        consignmentId: "CON-CEMENT-CLK-991",
        vesselId: "MV-MEGHNA-BULK-02",
        cargoType: "cement_clinker",
        cargoQuantityMt: 1500,
        dischargePortGhat: "Mukterpur River Ghat, Munshiganj",
        norAcceptedAt: norDate.toISOString(),
        dischargeCompletedAt: dischargeDate.toISOString(),
        weatherExceptionHours: 12,
        demurrageDailyRateBdt: 25000,
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/waterway/laytime/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.laytimeAudit.totalElapsedHours).toBe(120);
      expect(json.laytimeAudit.weatherExceptionHours).toBe(12);
      expect(json.laytimeAudit.netBillableLaytimeHours).toBe(108);
      expect(json.laytimeAudit.contractualFreeLaytimeHours).toBe(72);
      expect(json.laytimeAudit.demurrageHours).toBe(36);
      expect(json.laytimeAudit.demurrageFeeBdt).toBe(37500);
      expect(json.laytimeAudit.settlementStatus).toBe("demurrage_due");
      expect(json.laytimeAudit.summaryBangla).toContain("মোট ডেমারেজ বিল: ৳37,500");
    });

    it("calculates despatch incentive rebate when discharge completes early", async () => {
      const norDate = new Date("2026-10-01T06:00:00.000Z");
      // 1,000 MT cargo => 48 hours contractual laytime
      // Completed in 24 hours (24 hours ahead) => 1 day * 12,500 = ৳12,500 rebate
      const dischargeDate = new Date(norDate.getTime() + 24 * 60 * 60 * 1000);

      const payload = {
        consignmentId: "CON-UREA-FERT-501",
        vesselId: "MV-SURMA-CARGO",
        cargoType: "fertilizer_urea",
        cargoQuantityMt: 1000,
        dischargePortGhat: "Ashuganj Inland Port Ghat",
        norAcceptedAt: norDate.toISOString(),
        dischargeCompletedAt: dischargeDate.toISOString(),
        weatherExceptionHours: 0,
        despatchDailyRateBdt: 12500,
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/waterway/laytime/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.laytimeAudit.despatchHours).toBe(24);
      expect(json.laytimeAudit.despatchRebateBdt).toBe(12500);
      expect(json.laytimeAudit.settlementStatus).toBe("despatch_payable");
    });
  });

  describe("POST /api/v1/logistics/waterway/biwta/receipt", () => {
    it("generates statutory BIWTA receipt with conservation toll, berthing, and SHA-256 seal", async () => {
      const payload = {
        vesselId: "MV-KARNAPHULI-EXPRESS",
        vesselName: "M.V. Karnaphuli Express",
        registrationNo: "BIWTA-C-8821",
        deadweightTonnage: 1200,
        corridorId: "chittagong_dhaka_meghna",
        berthingDays: 3,
        requiresPilotage: true,
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/waterway/biwta/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const receipt = json.receipt;
      expect(receipt.receiptId).toContain("BIWTA-TOLL-MV-KARNAPHULI-EXPRESS");
      // River toll: 1200 * 14.5 = 17,400 BDT
      expect(receipt.riverConservationTollBdt).toBe(17400);
      // Berthing: max(1500, 1200 * 1.25 = 1500) * 3 = 4,500 BDT
      expect(receipt.berthingChargesBdt).toBe(4500);
      // Pilotage: > 1000 DWT on Class-I corridor = 5,500 BDT
      expect(receipt.pilotageFeeBdt).toBe(5500);
      // Subtotal: 17400 + 4500 + 5500 = 27,400 BDT
      expect(receipt.subtotalBdt).toBe(27400);
      // VAT 5%: 1,370 BDT
      expect(receipt.vat5PercentBdt).toBe(1370);
      // Grand Total: 28,770 BDT
      expect(receipt.grandTotalBdt).toBe(28770);
      // SHA-256 Seal
      expect(receipt.sha256VerificationSeal).toBeDefined();
      expect(receipt.sha256VerificationSeal.length).toBe(64);
    });
  });
});
