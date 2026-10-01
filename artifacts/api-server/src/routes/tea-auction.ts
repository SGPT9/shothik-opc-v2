import { Router } from "express";
import { z } from "zod";
import {
  TEA_ESTATE_PROFILES,
  appraiseTeaSensoryQuality,
  processAuctionBid,
  clearAuctionLot,
  calculateSmallholderGreenLeafFairPrice,
  type TeaLeafGrade,
  type AuctionCenter,
} from "../lib/agri/tea-auction-engine.js";

export const teaAuctionRouter = Router();

const leafGradeEnum = z.enum([
  "BOP",
  "GBOP",
  "FBOP",
  "OF",
  "PF",
  "FOF",
  "PD",
  "RD",
  "D",
  "CD",
  "FTGFOP",
  "GREEN_TEA_SENCHA",
]);

const auctionCenterEnum = z.enum([
  "chittagong_auction_center",
  "sreemangal_auction_center",
  "panchagarh_auction_center",
]);

const appraisalSchema = z.object({
  estateId: z.string().min(2, "Estate ID is required"),
  leafGrade: leafGradeEnum,
  leafAppearanceScore: z.number().min(0).max(25, "Leaf appearance score must be between 0 and 25"),
  infusedAromaScore: z.number().min(0).max(25, "Infused aroma score must be between 0 and 25"),
  liquorColorScore: z.number().min(0).max(25, "Liquor color score must be between 0 and 25"),
  brisknessStrengthScore: z.number().min(0).max(25, "Briskness score must be between 0 and 25"),
});

const bidSchema = z.object({
  lotId: z.string().min(2, "Lot ID is required"),
  estateId: z.string().min(2, "Estate ID is required"),
  leafGrade: leafGradeEnum,
  totalWeightKg: z.number().positive("Total weight must be positive"),
  currentHighBidBdtPerKg: z.number().nonnegative("Current bid must be non-negative"),
  newBidBdtPerKg: z.number().positive("New bid must be positive"),
  bidderName: z.string().min(2, "Bidder name is required"),
  bidderBtbLicense: z.string().min(2, "Bidder BTB license is required"),
});

const clearanceSchema = z.object({
  lotId: z.string().min(2, "Lot ID is required"),
  estateId: z.string().min(2, "Estate ID is required"),
  auctionCenter: auctionCenterEnum,
  leafGrade: leafGradeEnum,
  totalWeightKg: z.number().positive("Total weight must be positive"),
  finalHammerPriceBdtPerKg: z.number().positive("Final hammer price must be positive"),
  buyerName: z.string().min(2, "Buyer name is required"),
  buyerBtbLicense: z.string().min(2, "Buyer BTB license is required"),
  bondedWarehouseName: z.string().min(2, "Bonded warehouse name is required"),
});

const smallholderFairPriceSchema = z.object({
  averageAuctionMadeTeaPriceBdtPerKg: z.number().positive("Auction average price must be positive"),
  greenLeafKg: z.number().positive("Green leaf quantity must be positive"),
  leafMoistureQualityPercent: z.number().min(50).max(95).optional(),
});

// 1. List registered tea estates and auction center affiliations
teaAuctionRouter.get(
  [
    "/agri/tea/estates",
    "/v1/agri/tea/estates",
    "/api/v1/agri/tea/estates",
  ],
  (req, res) => {
    const estates = Object.values(TEA_ESTATE_PROFILES);
    res.json({ success: true, count: estates.length, estates });
  }
);

// 2. Sensory Tea Taster Quality Index (TTQI) Appraisal
teaAuctionRouter.post(
  [
    "/agri/tea/taster-appraisal",
    "/v1/agri/tea/taster-appraisal",
    "/api/v1/agri/tea/taster-appraisal",
  ],
  (req, res) => {
    const parsed = appraisalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.issues });
      return;
    }

    const result = appraiseTeaSensoryQuality(parsed.data);
    res.status(200).json({ success: true, appraisal: result });
  }
);

// 3. Competitive Auction Lot Bidding
teaAuctionRouter.post(
  [
    "/agri/tea/auction/bid",
    "/v1/agri/tea/auction/bid",
    "/api/v1/agri/tea/auction/bid",
  ],
  (req, res) => {
    const parsed = bidSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.issues });
      return;
    }

    const result = processAuctionBid(parsed.data);
    if (!result.bidAccepted) {
      res.status(409).json({ success: false, bidResult: result });
      return;
    }

    res.status(200).json({ success: true, bidResult: result });
  }
);

// 4. Clear Auction Lot & Issue Bonded Warehouse Delivery Order (DO)
teaAuctionRouter.post(
  [
    "/agri/tea/auction/clear-lot",
    "/v1/agri/tea/auction/clear-lot",
    "/api/v1/agri/tea/auction/clear-lot",
  ],
  (req, res) => {
    const parsed = clearanceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.issues });
      return;
    }

    const clearance = clearAuctionLot(parsed.data);
    res.status(200).json({ success: true, clearance });
  }
);

// 5. Calculate Smallholder Flatland Tea Grower Fair Price
teaAuctionRouter.post(
  [
    "/agri/tea/smallholder/fair-price",
    "/v1/agri/tea/smallholder/fair-price",
    "/api/v1/agri/tea/smallholder/fair-price",
  ],
  (req, res) => {
    const parsed = smallholderFairPriceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.issues });
      return;
    }

    const calculation = calculateSmallholderGreenLeafFairPrice(parsed.data);
    res.status(200).json({ success: true, fairPrice: calculation });
  }
);
