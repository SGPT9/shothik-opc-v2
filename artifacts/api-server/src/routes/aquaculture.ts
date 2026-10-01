import { Router } from "express";
import { z } from "zod";
import {
  COASTAL_GHER_PROFILES,
  analyzeWaterQuality,
  gradeHarvestAndCalculateEscrow,
  generateDofPassport,
  type AquacultureSpecies,
} from "../lib/agri/aquaculture-gher-engine.js";

export const aquacultureRouter = Router();

const speciesEnum = z.enum([
  "bagda_black_tiger",
  "golda_giant_freshwater",
  "vannamei_whiteleg",
  "ruhi_carp",
  "tilapia_biofloc",
]);

const telemetrySchema = z.object({
  gherId: z.string().min(2, "Gher ID is required"),
  species: speciesEnum,
  dissolvedOxygenMgL: z.number().min(0, "DO must be non-negative"),
  waterTemperatureCelsius: z.number(),
  salinityPpt: z.number().min(0, "Salinity must be non-negative"),
  phLevel: z.number().min(0).max(14, "pH must be between 0 and 14"),
  unionizedAmmoniaMgL: z.number().min(0, "Ammonia must be non-negative"),
  timestamp: z.string().optional(),
});

const harvestSchema = z.object({
  harvestId: z.string().min(2, "Harvest ID is required"),
  gherId: z.string().min(2, "Gher ID is required"),
  species: speciesEnum,
  totalWeightKg: z.number().positive("Total weight must be positive"),
  gradeCountPerKg: z.enum([
    "U_10",
    "count_16_20",
    "count_21_25",
    "count_31_40",
    "count_41_50",
  ]),
  iceSlurryTemperatureCelsius: z.number(),
  destinationProcessingPlant: z.string().min(2, "Processing plant name is required"),
});

const passportSchema = z.object({
  gherId: z.string().min(2, "Gher ID is required"),
  harvestId: z.string().min(2, "Harvest ID is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  species: speciesEnum,
  totalWeightKg: z.number().positive("Total weight must be positive"),
  antibioticScreeningPassed: z.boolean(),
  destinationCountry: z.string().min(2, "Destination country is required"),
});

// 1. List Coastal Gher registered profiles
aquacultureRouter.get(
  [
    "/agri/aquaculture/ghers",
    "/v1/agri/aquaculture/ghers",
    "/api/v1/agri/aquaculture/ghers",
  ],
  (req, res) => {
    const ghers = Object.values(COASTAL_GHER_PROFILES);
    res.json({ success: true, count: ghers.length, ghers });
  }
);

// 2. Ingest real-time water quality sensor telemetry & evaluate hypoxia
aquacultureRouter.post(
  [
    "/agri/aquaculture/telemetry",
    "/v1/agri/aquaculture/telemetry",
    "/api/v1/agri/aquaculture/telemetry",
  ],
  (req, res) => {
    const parseResult = telemetrySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid aquaculture telemetry payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = analyzeWaterQuality(parseResult.data);
      res.json({ success: true, telemetry: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);

// 3. Harvest Size Grading, Cold-Chain Audit & Processing Escrow
aquacultureRouter.post(
  [
    "/agri/aquaculture/harvest/grade",
    "/v1/agri/aquaculture/harvest/grade",
    "/api/v1/agri/aquaculture/harvest/grade",
  ],
  (req, res) => {
    const parseResult = harvestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid harvest grading payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = gradeHarvestAndCalculateEscrow(parseResult.data);
      res.json({ success: true, harvest: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);

// 4. Generate Official Department of Fisheries (DoF) & EU Export Passport
aquacultureRouter.post(
  [
    "/agri/aquaculture/passport/generate",
    "/v1/agri/aquaculture/passport/generate",
    "/api/v1/agri/aquaculture/passport/generate",
  ],
  (req, res) => {
    const parseResult = passportSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid DoF passport payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = generateDofPassport(parseResult.data);
      res.json({ success: true, passport: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);
