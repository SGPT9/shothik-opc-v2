import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { aquacultureRouter } from "../aquaculture.js";

const app = express();
app.use(express.json());
app.use("/api", aquacultureRouter);

describe("Autonomous Coastal Aquaculture, Shrimp Gher Telemetry & Seafood Escrow Engine (Slice 89)", () => {
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

  describe("GET /api/v1/agri/aquaculture/ghers", () => {
    it("returns pre-seeded coastal shrimp gher profiles across Satkhira, Khulna, and Bagerhat", async () => {
      const res = await fetch(`${baseUrl}/api/v1/agri/aquaculture/ghers`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(4);

      const shyamnagar = json.ghers.find(
        (g: any) => g.gherId === "gher_satkhira_shyamnagar"
      );
      expect(shyamnagar).toBeDefined();
      expect(shyamnagar.gherNameBangla).toContain("শ্যামনগর");
      expect(shyamnagar.district).toBe("satkhira");
      expect(shyamnagar.primarySpecies).toBe("bagda_black_tiger");
      expect(shyamnagar.dofRegistrationNumber).toContain("DOF-SAT-SHY");
      expect(shyamnagar.averageSalinityPpt).toBe(18.0);
    });
  });

  describe("POST /api/v1/agri/aquaculture/telemetry", () => {
    it("ingests optimal water quality sensors and confirms safe parameters", async () => {
      const payload = {
        gherId: "gher_satkhira_shyamnagar",
        species: "bagda_black_tiger",
        dissolvedOxygenMgL: 6.2,
        waterTemperatureCelsius: 28.5,
        salinityPpt: 16.0,
        phLevel: 7.8,
        unionizedAmmoniaMgL: 0.02,
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/aquaculture/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.telemetry.waterQualityRisk).toBe("normal");
      expect(json.telemetry.emergencyActionRequired).toBe(false);
      expect(json.telemetry.aerationRecommended).toBe(false);
      expect(json.telemetry.advisoryBangla).toContain("স্বাভাবিক পর্যায়ে");
    });

    it("triggers critical hypoxia alert when dissolved oxygen drops below 3.5 mg/L", async () => {
      const payload = {
        gherId: "gher_khulna_paikgachha",
        species: "bagda_black_tiger",
        dissolvedOxygenMgL: 2.8, // Critical hypoxia!
        waterTemperatureCelsius: 29.0,
        salinityPpt: 14.0,
        phLevel: 7.5,
        unionizedAmmoniaMgL: 0.03,
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/aquaculture/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.telemetry.waterQualityRisk).toBe("hypoxia_kill_risk");
      expect(json.telemetry.emergencyActionRequired).toBe(true);
      expect(json.telemetry.aerationRecommended).toBe(true);
      expect(json.telemetry.advisoryBangla).toContain("চরম বিপদ সংকেত: দ্রবীভূত অক্সিজেন (DO) ৩.৫ mg/L এর নিচে");
      expect(json.telemetry.advisoryEnglish).toContain("CRITICAL HYPOXIA HAZARD");
    });

    it("rejects invalid telemetry payload with 400 validation error", async () => {
      const payload = {
        gherId: "G",
        species: "invalid_shrimp",
        dissolvedOxygenMgL: -5,
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/aquaculture/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/v1/agri/aquaculture/harvest/grade", () => {
    it("grades U-10 Jumbo Black Tiger harvest with compliant cold chain and locks escrow", async () => {
      const payload = {
        harvestId: "HRV-SAT-2026-901",
        gherId: "gher_satkhira_shyamnagar",
        species: "bagda_black_tiger",
        totalWeightKg: 850,
        gradeCountPerKg: "U_10",
        iceSlurryTemperatureCelsius: 2.5, // <= 4°C compliant!
        destinationProcessingPlant: "Rupsha Seafoods Export Ltd, Khulna",
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/aquaculture/harvest/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const harvest = json.harvest;
      expect(harvest.basePricePerKgBdt).toBe(1450); // U-10 Jumbo rate
      // Gross: 850 * 1450 = 1,232,500 BDT
      expect(harvest.coldChainCompliant).toBe(true);
      expect(harvest.qualityDeductionBdt).toBe(0);
      expect(harvest.netHarvestValueBdt).toBe(1232500);
      expect(harvest.milestones.length).toBe(3);
      expect(harvest.milestones[0].percentage).toBe(30);
      expect(harvest.milestones[1].percentage).toBe(40);
      expect(harvest.milestones[2].percentage).toBe(30);
      expect(harvest.summaryBangla).toContain("কোল্ড চেইন মানসম্মত");
    });

    it("applies 15% quality deduction when ice slurry temperature breaches 4°C", async () => {
      const payload = {
        harvestId: "HRV-BAG-2026-442",
        gherId: "gher_bagerhat_rampal",
        species: "golda_giant_freshwater",
        totalWeightKg: 500,
        gradeCountPerKg: "count_16_20",
        iceSlurryTemperatureCelsius: 7.5, // Broken cold chain > 4.0°C!
        destinationProcessingPlant: "Apex Seafoods Ltd, Chittagong",
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/aquaculture/harvest/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const harvest = json.harvest;
      expect(harvest.basePricePerKgBdt).toBe(1180);
      // Gross: 500 * 1180 = 590,000 BDT
      // 15% penalty = 88,500 BDT
      expect(harvest.coldChainCompliant).toBe(false);
      expect(harvest.qualityDeductionBdt).toBe(88500);
      expect(harvest.netHarvestValueBdt).toBe(501500);
      expect(harvest.summaryBangla).toContain("১৫% কোয়ালিটি পেনাল্টি কর্তন");
    });
  });

  describe("POST /api/v1/agri/aquaculture/passport/generate", () => {
    it("generates official Department of Fisheries (DoF) EU traceability passport", async () => {
      const payload = {
        gherId: "gher_satkhira_shyamnagar",
        harvestId: "HRV-SAT-2026-901",
        ownerName: "Haji Anisur Rahman",
        species: "bagda_black_tiger",
        totalWeightKg: 850,
        antibioticScreeningPassed: true,
        destinationCountry: "Germany",
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/aquaculture/passport/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const passport = json.passport;
      expect(passport.passportId).toContain("DOF-EU-PASSPORT-");
      expect(passport.dofRegistrationNumber).toBe("DOF-SAT-SHY-2026-081");
      expect(passport.antibioticScreeningPassed).toBe(true);
      expect(passport.euHealthCertificateApproved).toBe(true);
      expect(passport.sha256VerificationSeal).toBeDefined();
      expect(passport.sha256VerificationSeal.length).toBe(64);
    });
  });
});
