import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { teaAuctionRouter } from "../tea-auction.js";

const app = express();
app.use(express.json());
app.use("/api", teaAuctionRouter);

describe("Autonomous Tea Estate Auction Bidding, Leaf Grade Quality Index & Chittagong/Sreemangal Tea Auction Clearing Engine (Slice 90)", () => {
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

  describe("GET /api/v1/agri/tea/estates", () => {
    it("returns pre-seeded registered tea estates across Sylhet, Chittagong, and Panchagarh", async () => {
      const res = await fetch(`${baseUrl}/api/v1/agri/tea/estates`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(6);

      const finlay = json.estates.find((e: any) => e.estateId === "finlay_sreemangal");
      expect(finlay).toBeDefined();
      expect(finlay.estateNameBangla).toContain("জেমস ফিনলে");
      expect(finlay.region).toBe("sylhet_sreemangal");
      expect(finlay.auctionCenter).toBe("sreemangal_auction_center");
      expect(finlay.btbLicenseNumber).toContain("BTB-EST");

      const kazi = json.estates.find((e: any) => e.estateId === "kazi_panchagarh");
      expect(kazi).toBeDefined();
      expect(kazi.gardenMark).toBe("KK_ORGANIC");
      expect(kazi.primaryGrades).toContain("FTGFOP");
    });
  });

  describe("POST /api/v1/agri/tea/taster-appraisal", () => {
    it("appraises prime export whole-leaf lot with high sensory scores", async () => {
      const payload = {
        estateId: "kazi_panchagarh",
        leafGrade: "FTGFOP",
        leafAppearanceScore: 24,
        infusedAromaScore: 23,
        liquorColorScore: 24,
        brisknessStrengthScore: 23,
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/tea/taster-appraisal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.appraisal.ttqiScore).toBe(94);
      expect(json.appraisal.qualityTier).toBe("prime_export");
      expect(json.appraisal.exportEligible).toBe(true);
      expect(json.appraisal.recommendedReservePriceBdtPerKg).toBeGreaterThan(500);
      expect(json.appraisal.appraisalId).toContain("TTQI-");
    });

    it("appraises standard commercial broken CTC lot with moderate scores", async () => {
      const payload = {
        estateId: "ntc_patrokhola",
        leafGrade: "BOP",
        leafAppearanceScore: 16,
        infusedAromaScore: 16,
        liquorColorScore: 17,
        brisknessStrengthScore: 18,
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/tea/taster-appraisal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.appraisal.ttqiScore).toBe(67);
      expect(json.appraisal.qualityTier).toBe("standard_commercial");
      expect(json.appraisal.exportEligible).toBe(false);
      expect(json.appraisal.recommendedReservePriceBdtPerKg).toBe(225);
    });

    it("rejects invalid appraisal scores outside 0-25 range", async () => {
      const payload = {
        estateId: "ntc_patrokhola",
        leafGrade: "BOP",
        leafAppearanceScore: 35, // invalid
        infusedAromaScore: 16,
        liquorColorScore: 17,
        brisknessStrengthScore: 18,
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/tea/taster-appraisal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/v1/agri/tea/auction/bid", () => {
    it("accepts valid competitive bid exceeding current high bid by required increment", async () => {
      const payload = {
        lotId: "LOT-CTG-2026-0891",
        estateId: "ispahani_mirzapore",
        leafGrade: "OF",
        totalWeightKg: 2400,
        currentHighBidBdtPerKg: 230.0,
        newBidBdtPerKg: 235.0,
        bidderName: "Meghna Tea Blenders Ltd.",
        bidderBtbLicense: "BTB-BLD-092-CTG",
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/tea/auction/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.bidResult.bidAccepted).toBe(true);
      expect(json.bidResult.highBidBdtPerKg).toBe(235.0);
      expect(json.bidResult.projectedGrossHammerBdt).toBe(235.0 * 2400);
      expect(json.bidResult.projectedStatutoryCessBdt).toBe(2400 * 1.50);
      expect(json.bidResult.projectedTotalPayableBdt).toBeGreaterThan(json.bidResult.projectedGrossHammerBdt);
    });

    it("rejects bid failing minimum increment threshold (BDT 2.00/kg)", async () => {
      const payload = {
        lotId: "LOT-CTG-2026-0891",
        estateId: "ispahani_mirzapore",
        leafGrade: "OF",
        totalWeightKg: 2400,
        currentHighBidBdtPerKg: 230.0,
        newBidBdtPerKg: 231.0, // only +1.00 BDT increment
        bidderName: "Meghna Tea Blenders Ltd.",
        bidderBtbLicense: "BTB-BLD-092-CTG",
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/tea/auction/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.bidResult.bidAccepted).toBe(false);
      expect(json.bidResult.rejectionReason).toContain("below minimum required bid");
    });
  });

  describe("POST /api/v1/agri/tea/auction/clear-lot", () => {
    it("clears final hammer sale, calculates statutory deductions and generates Delivery Order", async () => {
      const payload = {
        lotId: "LOT-SRE-2026-0312",
        estateId: "finlay_sreemangal",
        auctionCenter: "sreemangal_auction_center",
        leafGrade: "GBOP",
        totalWeightKg: 3000,
        finalHammerPriceBdtPerKg: 245.0,
        buyerName: "Abul Khair Consumer Goods Ltd.",
        buyerBtbLicense: "BTB-BLD-011-SRE",
        bondedWarehouseName: "Sreemangal Central Tea Warehouse Depot #2",
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/tea/auction/clear-lot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const clr = json.clearance;
      expect(clr.clearanceId).toContain("CLR-SRE-");
      expect(clr.grossHammerBdt).toBe(245.0 * 3000);
      expect(clr.statutoryTeaCessBdt).toBe(3000 * 1.50);
      expect(clr.warehouseHandlingBdt).toBe(3000 * 0.75);
      expect(clr.brokerCommissionBdt).toBe(Math.round(clr.grossHammerBdt * 0.0125));
      expect(clr.deliveryOrderToken).toBeDefined();
      expect(clr.deliveryOrderToken.length).toBe(64); // SHA-256
      expect(clr.qrReleasePayload).toContain("PAID_READY_FOR_DISPATCH");
    });
  });

  describe("POST /api/v1/agri/tea/smallholder/fair-price", () => {
    it("calculates fair green leaf MSP price for Panchagarh small growers", async () => {
      const payload = {
        averageAuctionMadeTeaPriceBdtPerKg: 215.0,
        greenLeafKg: 4500,
        leafMoistureQualityPercent: 75,
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/tea/smallholder/fair-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.fairPrice.factoryConversionRatio).toBe(4.5);
      expect(json.fairPrice.fairPricePerKgBdt).toBeGreaterThan(40);
      expect(json.fairPrice.totalFarmerPayoutBdt).toBeGreaterThan(180000);
      expect(json.fairPrice.complianceCheckBangla).toContain("বাংলাদেশ চা বোর্ডের ন্যূনতম");
    });
  });
});
