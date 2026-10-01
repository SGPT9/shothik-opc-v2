import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { artisanGiRouter } from "../artisan-gi.js";

const app = express();
app.use(express.json());
app.use("/api", artisanGiRouter);

describe("Autonomous Cottage Artisan Handloom & GI Certification Engine (Slice 88)", () => {
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

  describe("GET /api/v1/trade/artisan-gi/catalog", () => {
    it("returns pre-seeded official Bangladesh GI Heritage Craft profiles", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/artisan-gi/catalog`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(5);

      const jamdani = json.crafts.find((c: any) => c.craftId === "dhakai_jamdani");
      expect(jamdani).toBeDefined();
      expect(jamdani.giRegistrationNo).toBe("BD/GI-01/DPDT");
      expect(jamdani.nameBangla).toContain("ঢাকাই জামদানি");
      expect(jamdani.clusterRegionEnglish).toContain("Rupganj");
      expect(jamdani.minimumWarpCount).toBe(80);
      expect(jamdani.allowedLoomTypes).toContain("traditional_pit_loom");
      expect(jamdani.hsCode).toBe("5208.51.10");

      const silk = json.crafts.find((c: any) => c.craftId === "rajshahi_silk");
      expect(silk).toBeDefined();
      expect(silk.hsCode).toBe("5007.20.00");
    });
  });

  describe("POST /api/v1/trade/artisan-gi/verify", () => {
    it("certifies authentic pit-loom Dhakai Jamdani meeting 84s count threshold", async () => {
      const payload = {
        craftId: "dhakai_jamdani",
        artisanName: "Abdul Matin Ustad",
        artisanNid: "19842691234567890",
        clusterLocation: "Noapara, Tarabo, Rupganj, Narayanganj",
        loomType: "traditional_pit_loom",
        warpYarnCount: 84,
        weftYarnCount: 84,
        naturalFiberPercent: 100,
        motifComplexity: "tercha_floral",
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/artisan-gi/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.audit.certificationStatus).toBe("certified_gi_authentic");
      expect(json.audit.authenticityScorePercent).toBe(100);
      expect(json.audit.giTagNumber).toContain("GI-DHA-");
      expect(json.audit.verdictBangla).toContain("প্রমাণিত ঐতিহ্যবাহী জিআই কারুশিল্প");
    });

    it("rejects machine power-loom copies as counterfeit", async () => {
      const payload = {
        craftId: "dhakai_jamdani",
        artisanName: "Industrial Synthetic Loom",
        artisanNid: "19902690000000000",
        clusterLocation: "Industrial Zone, Narayanganj",
        loomType: "power_loom",
        warpYarnCount: 60,
        weftYarnCount: 60,
        naturalFiberPercent: 70,
        motifComplexity: "standard_buti",
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/artisan-gi/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.audit.certificationStatus).toBe("rejected_counterfeit_machine_made");
      expect(json.audit.giTagNumber).toBe("VOID-COUNTERFEIT");
      expect(json.audit.verdictEnglish).toContain("Machine-loom fabrication detected");
    });

    it("returns 400 validation error on malformed payload", async () => {
      const payload = {
        craftId: "invalid_craft",
        artisanName: "X",
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/artisan-gi/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/v1/trade/artisan-gi/escrow/calculate", () => {
    it("computes 3-stage Fair-Trade living wage escrow for complex Jamdani saree", async () => {
      const payload = {
        craftId: "dhakai_jamdani",
        artisanName: "Rabeya Begum & Master Weaver",
        artisanWalletNumber: "01712345678",
        motifComplexity: "panna_hazar_royal", // 2.1x multiplier
        estimatedWeavingDays: 30, // 30 days
        rawYarnCostBdt: 12000,
        buyerBudgetBdt: 75000,
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/artisan-gi/escrow/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const escrow = json.escrow;
      // 30 * 950 * 2.1 = 59,850 BDT fair labor wage
      expect(escrow.fairLaborWageBdt).toBe(59850);
      // Total craft cost: 59850 + 12000 = 71,850 BDT
      expect(escrow.totalCraftCostBdt).toBe(71850);
      expect(escrow.fairTradeCompliant).toBe(true);
      expect(escrow.milestones.length).toBe(3);
      expect(escrow.milestones[0].percentage).toBe(30);
      expect(escrow.milestones[1].percentage).toBe(40);
      expect(escrow.milestones[2].percentage).toBe(30);
      expect(escrow.summaryBangla).toContain("ন্যায্য মজুরি নিশ্চিত");
    });
  });

  describe("POST /api/v1/trade/artisan-gi/export/certificate", () => {
    it("compiles EPB Certificate of Origin with HS code and SHA-256 seal", async () => {
      const payload = {
        craftId: "rajshahi_silk",
        artisanName: "Bholahat Silk Weavers Society",
        exporterName: "Shothik Heritage Fashion Ltd",
        destinationCountry: "United Kingdom",
        consignmentUnits: 50,
        unitValueFobUsd: 180, // $9,000 USD
        giTagNumber: "GI-RAJ-881204",
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/artisan-gi/export/certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const cert = json.certificate;
      expect(cert.certificateId).toContain("EPB-GI-CO-RAJSHAHI_SILK");
      expect(cert.hsCode).toBe("5007.20.00");
      expect(cert.totalConsignmentValueUsd).toBe(9000);
      expect(cert.totalConsignmentValueBdt).toBe(1102500); // 9000 * 122.5
      // Duty drawback at 12%: 1,102,500 * 0.12 = 132,300 BDT
      expect(cert.estimatedDutyDrawbackBdt).toBe(132300);
      expect(cert.sha256VerificationSeal).toBeDefined();
      expect(cert.sha256VerificationSeal.length).toBe(64);
    });
  });
});
