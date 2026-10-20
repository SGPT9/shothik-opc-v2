import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  JuteExportEngine,
  BJMC_JUTE_GRADES,
} from "../lib/jute/jute-export-engine.js";

export const juteRouter = Router();

const rawJuteGradingSchema = z.object({
  lotId: z.string().min(2, "Lot ID is required"),
  variety: z.enum(["Bangla Tossa", "Bangla White"]),
  gradeCode: z.string().min(2, "Grade code is required"),
  grossWeightKg: z.number().positive("Gross weight must be positive"),
  moisturePercent: z.number().min(0).max(100, "Moisture percent must be between 0 and 100"),
  rootCuttingPercent: z.number().min(0).max(25, "Root cutting percent must be between 0 and 25"),
  aratLocation: z.string().min(2, "Arat location is required"),
});

const djgCostingSchema = z.object({
  productType: z.enum([
    "HESSIAN_CLOTH",
    "SACKING_BAGS",
    "CARPET_BACKING_CLOTH",
    "DIVERSIFIED_SHOPPING_BAGS",
    "GEO_TEXTILES",
    "JUTE_ESPADRILLES",
  ]),
  targetUnits: z.number().int().positive("Target units must be positive integer"),
  rawJuteGradeCode: z.string().min(2, "Raw jute grade code is required"),
  yarnCountLbsPerSpindle: z.number().optional(),
  weavingWastagePercent: z.number().min(0).max(30).optional(),
  batchingOilCostPerKg: z.number().min(0).optional(),
  directLaborCostPerUnitBdt: z.number().min(0).optional(),
  overheadCostPerUnitBdt: z.number().min(0).optional(),
});

const exportSubsidySchema = z.object({
  invoiceNumber: z.string().min(2, "Invoice number is required"),
  fobValueUsd: z.number().positive("FOB value USD must be positive"),
  exchangeRateUsdToBdt: z.number().positive("Exchange rate must be positive"),
  productCategory: z.enum([
    "DIVERSIFIED_JUTE_GOODS",
    "JUTE_YARN_TWINE",
    "TRADITIONAL_JUTE_GOODS",
    "RAW_JUTE",
  ]),
  localValueAdditionPercent: z.number().min(0).max(100),
  hasValidPrc: z.boolean(),
  hasEpbRegistration: z.boolean(),
});

const bondedDossierSchema = z.object({
  shipmentId: z.string().min(2, "Shipment ID is required"),
  buyerName: z.string().min(2, "Buyer name is required"),
  destinationCountry: z.string().min(2, "Destination country is required"),
  portOfLoading: z.string().min(2, "Port of loading is required"),
  hsCode: z.string().min(4, "HS code is required"),
  productDescription: z.string().min(2, "Product description is required"),
  totalNetWeightKg: z.number().positive("Total net weight must be positive"),
  totalPuccaBales: z.number().int().min(0),
  fobValueUsd: z.number().positive("FOB value USD must be positive"),
  bondLicenseNumber: z.string().min(2, "Bond license number is required"),
  rawJuteLotRef: z.string().min(2, "Raw jute lot ref is required"),
});

/**
 * GET /api/v1/trade/jute/grades
 * Returns registered BJMC/BJMA raw jute grading catalog and base market pricing.
 */
juteRouter.get("/v1/trade/jute/grades", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      grades: Object.values(BJMC_JUTE_GRADES),
      safeMoistureEquilibriumPercent: 14.0,
      maxMoistureRejectPercent: 20.0,
      puccaBaleStandardWeightKg: 180.0,
      kutchaBaleStandardWeightKg: 135.0,
      arats: ["Faridpur", "Jessore", "Rangpur", "Tangail", "Narsingdi", "Sirajganj"],
    },
  });
});

/**
 * POST /api/v1/trade/jute/grading
 * Evaluates raw jute lot quality, moisture penalties, net marketable weight, and bale count.
 */
juteRouter.post("/v1/trade/jute/grading", (req: Request, res: Response) => {
  const parse = rawJuteGradingSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid raw jute grading parameters",
        details: parse.error.issues,
      },
    });
  }

  const result = JuteExportEngine.gradeRawJute(parse.data);
  return res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/v1/trade/jute/costing
 * Computes manufacturing yield, wastage, and cost per unit for Diversified Jute Goods (DJG).
 */
juteRouter.post("/v1/trade/jute/costing", (req: Request, res: Response) => {
  const parse = djgCostingSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid DJG costing parameters",
        details: parse.error.issues,
      },
    });
  }

  const result = JuteExportEngine.calculateDjgCosting(parse.data);
  return res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/v1/trade/jute/subsidy
 * Calculates Bangladesh Bank FE Circular export cash subsidy eligibility and deductions.
 */
juteRouter.post("/v1/trade/jute/subsidy", (req: Request, res: Response) => {
  const parse = exportSubsidySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid export subsidy parameters",
        details: parse.error.issues,
      },
    });
  }

  const result = JuteExportEngine.calculateExportSubsidy(parse.data);
  return res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/v1/trade/jute/bonded-dossier
 * Generates NBR Bonded Warehouse ledger entry and SHA-256 sealed export shipment dossier.
 */
juteRouter.post("/v1/trade/jute/bonded-dossier", (req: Request, res: Response) => {
  const parse = bondedDossierSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid bonded warehouse dossier parameters",
        details: parse.error.issues,
      },
    });
  }

  const result = JuteExportEngine.generateBondedExportDossier(parse.data);
  return res.json({
    success: true,
    data: result,
  });
});
