import { Router, Request, Response } from "express";
import { z } from "zod";
import { CrossBorderCustomsEngine } from "../lib/customs/cross-border-engine";

export const customsRouter = Router();

const calculateLandedCostSchema = z.object({
  productTitle: z.string().min(1, "Product title is required"),
  sourcePlatform: z.enum(["1688", "taobao", "aliexpress", "direct_factory", "other"]).optional().default("1688"),
  sourceUrl: z.string().optional(),
  currency: z.enum(["USD", "CNY", "EUR", "BDT"]).default("USD"),
  unitPrice: z.number().positive("Unit price must be positive"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  totalWeightKg: z.number().positive("Total weight must be positive"),
  shippingMethod: z.enum(["air_express", "air_cargo", "sea_freight_lcl", "sea_freight_fcl"]).default("air_express"),
  hsCode: z.string().min(1, "HS code is required"),
  portOfEntry: z.enum(["chittagong_seaport", "dhaka_airport_cargo", "benapole_land_port", "mongla_seaport"]).optional().default("dhaka_airport_cargo"),
  importerBin: z.string().optional(),
});

const generateBriefSchema = z.object({
  calculationResult: z.any(),
  consigneeName: z.string().optional().default("Shothik Merchant Enterprises"),
});

/**
 * POST /api/v1/customs/calculate-landed-cost
 */
customsRouter.post("/v1/customs/calculate-landed-cost", (req: Request, res: Response) => {
  try {
    const parseResult = calculateLandedCostSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(", "),
      });
    }

    const result = CrossBorderCustomsEngine.calculateLandedCost(parseResult.data);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to calculate customs landed cost",
    });
  }
});

/**
 * GET /api/v1/customs/hs-codes
 */
customsRouter.get("/v1/customs/hs-codes", (req: Request, res: Response) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q : undefined;
    const catalog = CrossBorderCustomsEngine.getHsCodeCatalog(query);
    return res.status(200).json({
      success: true,
      count: catalog.length,
      data: catalog,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to retrieve HS codes",
    });
  }
});

/**
 * GET /api/v1/customs/exchange-rates
 */
customsRouter.get("/v1/customs/exchange-rates", (_req: Request, res: Response) => {
  try {
    const rates = CrossBorderCustomsEngine.getExchangeRates();
    return res.status(200).json({
      success: true,
      data: rates,
      reference: "Bangladesh Bank / Commercial Forex Reference Rate",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to retrieve exchange rates",
    });
  }
});

/**
 * POST /api/v1/customs/generate-cf-brief
 */
customsRouter.post("/v1/customs/generate-cf-brief", (req: Request, res: Response) => {
  try {
    const parseResult = generateBriefSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(", "),
      });
    }

    const { calculationResult, consigneeName } = parseResult.data;
    if (!calculationResult || !calculationResult.dutyBreakdown) {
      return res.status(400).json({
        success: false,
        error: "Valid calculationResult is required to compile C&F brief",
      });
    }

    const brief = CrossBorderCustomsEngine.generateCfClearingBrief(calculationResult, consigneeName);
    return res.status(200).json({
      success: true,
      data: brief,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate C&F brief",
    });
  }
});
