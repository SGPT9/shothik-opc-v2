import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  PlatformElevatorEngine,
  type MerchantElevatorMetrics,
} from "../lib/growth/elevator-engine.js";

export const growthRouter = Router();

const evaluateElevatorSchema = z.object({
  merchantId: z.string().min(1, "merchantId is required"),
  merchantName: z.string().min(1, "merchantName is required"),
  monthlyGmvBdt: z.number().nonnegative("monthlyGmvBdt must be >= 0"),
  totalOrdersDispatched: z.number().int().nonnegative("totalOrdersDispatched must be >= 0"),
  ordersDeliveredSuccessfully: z.number().int().nonnegative("ordersDeliveredSuccessfully must be >= 0"),
  avgFulfillmentHours: z.number().nonnegative("avgFulfillmentHours must be >= 0"),
  binVerified: z.boolean().default(false),
  nidVerified: z.boolean().default(false),
});

const claimReferralSchema = z.object({
  referrerCode: z.string().min(1, "referrerCode is required"),
  refereeId: z.string().min(1, "refereeId is required"),
  refereeName: z.string().min(1, "refereeName is required"),
});

const createSourcingPoolSchema = z.object({
  productTitle: z.string().min(1, "productTitle is required"),
  hsCode: z.string().min(1, "hsCode is required"),
  targetQuantity: z.number().int().positive("targetQuantity must be positive"),
  initialQuantity: z.number().int().positive("initialQuantity must be positive"),
  unitPriceUsd: z.number().positive("unitPriceUsd must be positive"),
  estimatedFreightSavingsPct: z.number().optional().default(35),
  portOfEntry: z.string().optional().default("Chittagong Seaport (LCL)"),
  poolMasterMerchantId: z.string().min(1, "poolMasterMerchantId is required"),
  poolMasterName: z.string().min(1, "poolMasterName is required"),
});

const joinSourcingPoolSchema = z.object({
  poolId: z.string().min(1, "poolId is required"),
  merchantId: z.string().min(1, "merchantId is required"),
  merchantName: z.string().min(1, "merchantName is required"),
  quantity: z.number().int().positive("quantity must be positive"),
});

const generateViralReceiptSchema = z.object({
  merchantId: z.string().min(1, "merchantId is required"),
  invoiceNo: z.string().min(1, "invoiceNo is required"),
  grandTotalBdt: z.number().positive("grandTotalBdt must be positive"),
});

/**
 * GET /v1/growth/elevator/profile
 */
growthRouter.get("/v1/growth/elevator/profile", (req: Request, res: Response) => {
  try {
    const merchantId = (typeof req.query.merchantId === "string" ? req.query.merchantId : "merch_shothik_dhaka_01");
    let profile = PlatformElevatorEngine.getMerchantProfile(merchantId);
    if (!profile) {
      // Auto-register fallback profile for seamless experience
      profile = PlatformElevatorEngine.registerOrUpdateMerchant({
        merchantId,
        merchantName: "Shothik Lifestyle & Electronics",
        monthlyGmvBdt: 385000,
        totalOrdersDispatched: 240,
        ordersDeliveredSuccessfully: 231,
        avgFulfillmentHours: 3.5,
        binVerified: true,
        nidVerified: true,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to retrieve merchant elevator profile",
    });
  }
});

/**
 * POST /v1/growth/elevator/evaluate
 */
growthRouter.post("/v1/growth/elevator/evaluate", (req: Request, res: Response) => {
  try {
    const parse = evaluateElevatorSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const profile = PlatformElevatorEngine.registerOrUpdateMerchant(parse.data);
    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to evaluate elevator metrics",
    });
  }
});

/**
 * POST /v1/growth/referrals/claim
 */
growthRouter.post("/v1/growth/referrals/claim", (req: Request, res: Response) => {
  try {
    const parse = claimReferralSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const result = PlatformElevatorEngine.claimReferral(parse.data);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to claim referral code",
    });
  }
});

/**
 * GET /v1/growth/referrals/ledger
 */
growthRouter.get("/v1/growth/referrals/ledger", (req: Request, res: Response) => {
  try {
    const referralCode = typeof req.query.referralCode === "string" ? req.query.referralCode : "SHOTHIK-HAKA_01";
    const ledger = PlatformElevatorEngine.getReferralLedger(referralCode);
    return res.status(200).json({
      success: true,
      referralCode,
      count: ledger.length,
      ledger,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to retrieve referral ledger",
    });
  }
});

/**
 * POST /v1/growth/sourcing-pools/create
 */
growthRouter.post("/v1/growth/sourcing-pools/create", (req: Request, res: Response) => {
  try {
    const parse = createSourcingPoolSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const pool = PlatformElevatorEngine.createSourcingPool(parse.data);
    return res.status(201).json({
      success: true,
      pool,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to create sourcing pool",
    });
  }
});

/**
 * POST /v1/growth/sourcing-pools/join
 */
growthRouter.post("/v1/growth/sourcing-pools/join", (req: Request, res: Response) => {
  try {
    const parse = joinSourcingPoolSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const result = PlatformElevatorEngine.joinSourcingPool(parse.data);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to join sourcing pool",
    });
  }
});

/**
 * GET /v1/growth/sourcing-pools
 */
growthRouter.get("/v1/growth/sourcing-pools", (_req: Request, res: Response) => {
  try {
    const pools = PlatformElevatorEngine.listSourcingPools();
    return res.status(200).json({
      success: true,
      count: pools.length,
      pools,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list sourcing pools",
    });
  }
});

/**
 * GET /v1/growth/trust-badge/:merchantId
 */
growthRouter.get("/v1/growth/trust-badge/:merchantId", (req: Request, res: Response) => {
  try {
    const merchantId = String(req.params.merchantId);
    const badge = PlatformElevatorEngine.generateTrustBadge(merchantId);
    if (!badge) {
      return res.status(404).json({
        success: false,
        error: `Merchant ${merchantId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      badge,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate trust badge",
    });
  }
});

/**
 * POST /v1/growth/viral-receipt/generate
 */
growthRouter.post("/v1/growth/viral-receipt/generate", (req: Request, res: Response) => {
  try {
    const parse = generateViralReceiptSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const watermark = PlatformElevatorEngine.generateViralReceiptWatermark(parse.data);
    return res.status(200).json({
      success: true,
      watermark,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate viral receipt watermark",
    });
  }
});
