import { Router } from "express";
import { z } from "zod";
import {
  GI_CRAFT_PROFILES,
  verifyGiCraftAuthenticity,
  calculateWeaverWageEscrow,
  generateArtisanExportCertificate,
  type GiCraftId,
} from "../lib/artisan/artisan-gi-engine.js";

export const artisanGiRouter = Router();

const verifySchema = z.object({
  craftId: z.enum([
    "dhakai_jamdani",
    "tangail_saree",
    "rajshahi_silk",
    "rangpur_shatranji",
    "dhakai_muslin",
  ]),
  artisanName: z.string().min(2, "Artisan name is required"),
  artisanNid: z.string().min(10, "Valid NID is required"),
  clusterLocation: z.string().min(2, "Cluster location is required"),
  loomType: z.enum([
    "traditional_pit_loom",
    "throw_shuttle_frame_loom",
    "jacquard_handloom",
    "power_loom",
  ]),
  warpYarnCount: z.number().positive("Warp yarn count must be positive"),
  weftYarnCount: z.number().positive("Weft yarn count must be positive"),
  naturalFiberPercent: z.number().min(0).max(100),
  motifComplexity: z.enum([
    "standard_buti",
    "tercha_floral",
    "jalar_heavy",
    "panna_hazar_royal",
  ]),
});

const escrowSchema = z.object({
  craftId: z.enum([
    "dhakai_jamdani",
    "tangail_saree",
    "rajshahi_silk",
    "rangpur_shatranji",
    "dhakai_muslin",
  ]),
  artisanName: z.string().min(2, "Artisan name is required"),
  artisanWalletNumber: z.string().min(11, "Valid MFS wallet number is required"),
  motifComplexity: z.enum([
    "standard_buti",
    "tercha_floral",
    "jalar_heavy",
    "panna_hazar_royal",
  ]),
  estimatedWeavingDays: z.number().int().positive("Weaving days must be positive integer"),
  rawYarnCostBdt: z.number().nonnegative("Raw yarn cost cannot be negative"),
  buyerBudgetBdt: z.number().positive("Buyer budget must be positive"),
});

const exportCertSchema = z.object({
  craftId: z.enum([
    "dhakai_jamdani",
    "tangail_saree",
    "rajshahi_silk",
    "rangpur_shatranji",
    "dhakai_muslin",
  ]),
  artisanName: z.string().min(2, "Artisan name is required"),
  exporterName: z.string().min(2, "Exporter name is required"),
  destinationCountry: z.string().min(2, "Destination country is required"),
  consignmentUnits: z.number().int().positive("Consignment units must be positive"),
  unitValueFobUsd: z.number().positive("FOB unit value must be positive"),
  giTagNumber: z.string().min(3, "GI tag number is required"),
});

// 1. List All Bangladesh GI Heritage Craft Profiles
artisanGiRouter.get(
  [
    "/trade/artisan-gi/catalog",
    "/v1/trade/artisan-gi/catalog",
    "/api/v1/trade/artisan-gi/catalog",
  ],
  (req, res) => {
    const crafts = Object.values(GI_CRAFT_PROFILES);
    res.json({ success: true, count: crafts.length, crafts });
  }
);

// 2. Technical GI Specification & Yarn Count Verification Audit
artisanGiRouter.post(
  [
    "/trade/artisan-gi/verify",
    "/v1/trade/artisan-gi/verify",
    "/api/v1/trade/artisan-gi/verify",
  ],
  (req, res) => {
    const parseResult = verifySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid GI verification payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = verifyGiCraftAuthenticity(parseResult.data);
      res.json({ success: true, audit: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);

// 3. Fair-Trade Weaver Living Wage Escrow Schedule Calculator
artisanGiRouter.post(
  [
    "/trade/artisan-gi/escrow/calculate",
    "/v1/trade/artisan-gi/escrow/calculate",
    "/api/v1/trade/artisan-gi/escrow/calculate",
  ],
  (req, res) => {
    const parseResult = escrowSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid weaver escrow payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = calculateWeaverWageEscrow(parseResult.data);
      res.json({ success: true, escrow: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);

// 4. Generate EPB / BSCIC Export Certificate of Origin with SHA-256 Seal
artisanGiRouter.post(
  [
    "/trade/artisan-gi/export/certificate",
    "/v1/trade/artisan-gi/export/certificate",
    "/api/v1/trade/artisan-gi/export/certificate",
  ],
  (req, res) => {
    const parseResult = exportCertSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid export certificate payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = generateArtisanExportCertificate(parseResult.data);
      res.json({ success: true, certificate: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);
