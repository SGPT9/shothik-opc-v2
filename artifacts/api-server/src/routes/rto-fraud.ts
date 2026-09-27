import { Router, Request, Response } from "express";
import { z } from "zod";
import { RtoFraudEngine, FraudCategory } from "../lib/logistics/rto-fraud-engine.js";

export const rtoFraudRouter = Router();

const checkFraudSchema = z.object({
  phone: z.string().min(6, "Phone number is required"),
});

const reportFraudSchema = z.object({
  phone: z.string().min(6, "Phone number is required"),
  category: z.enum([
    "FAKE_ORDER",
    "PHONE_SWITCHED_OFF",
    "REFUSED_ON_ARRIVAL",
    "HARASSMENT",
    "DAMAGED_RETURN_FRAUD",
  ]),
  reporterMerchant: z.string().min(1, "reporterMerchant is required"),
  orderRef: z.string().optional(),
  notes: z.string().optional(),
});

const predictRtoSchema = z.object({
  phone: z.string().min(6, "Phone number is required"),
  codAmountBdt: z.number().nonnegative("codAmountBdt must be non-negative"),
  district: z.string().optional(),
  deliveryAddress: z.string().optional(),
  orderRef: z.string().optional(),
});

/**
 * POST /api/v1/logistics/fraud/check
 * Quick multi-carrier delivery credibility and blacklist status lookup
 */
rtoFraudRouter.post(
  ["/api/v1/logistics/fraud/check", "/v1/logistics/fraud/check"],
  (req: Request, res: Response) => {
    try {
      const parse = checkFraudSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const { isValid, normalized, operator } = RtoFraudEngine.normalizeBdPhone(parse.data.phone);
      const blacklistCheck = RtoFraudEngine.checkBlacklist(parse.data.phone);
      const history = RtoFraudEngine.getMultiCarrierHistory(normalized);

      const totalOrders = history.reduce((acc, c) => acc + c.totalOrders, 0);
      const totalDelivered = history.reduce((acc, c) => acc + c.deliveredOrders, 0);
      const totalReturned = history.reduce((acc, c) => acc + c.returnedOrders, 0);
      const overallDsr =
        totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 90;

      return res.status(200).json({
        success: true,
        phone: parse.data.phone,
        normalizedPhone: normalized,
        isValid,
        operator,
        isBlacklisted: blacklistCheck.isBlacklisted,
        blacklistReports: blacklistCheck.reports,
        overallDsrPercent: overallDsr,
        totalHistoricalOrders: totalOrders,
        totalHistoricalDelivered: totalDelivered,
        totalHistoricalReturned: totalReturned,
        carrierHistory: history,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to check customer fraud status",
      });
    }
  }
);

/**
 * POST /api/v1/logistics/fraud/report
 * Report a customer phone number to community blacklist
 */
rtoFraudRouter.post(
  ["/api/v1/logistics/fraud/report", "/v1/logistics/fraud/report"],
  (req: Request, res: Response) => {
    try {
      const parse = reportFraudSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const result = RtoFraudEngine.reportFraud({
        phone: parse.data.phone,
        category: parse.data.category as FraudCategory,
        reporterMerchant: parse.data.reporterMerchant,
        orderRef: parse.data.orderRef,
        notes: parse.data.notes,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error?.message || "Failed to report fraud",
      });
    }
  }
);

/**
 * GET /api/v1/logistics/fraud/blacklist
 * Query community blacklist entries
 */
rtoFraudRouter.get(
  ["/api/v1/logistics/fraud/blacklist", "/v1/logistics/fraud/blacklist"],
  (_req: Request, res: Response) => {
    try {
      const list = RtoFraudEngine.listBlacklist();
      return res.status(200).json({
        success: true,
        count: list.length,
        blacklist: list,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to fetch fraud blacklist",
      });
    }
  }
);

/**
 * DELETE /api/v1/logistics/fraud/blacklist/:phone
 * Whitelist or remove false positive from blacklist
 */
rtoFraudRouter.delete(
  ["/api/v1/logistics/fraud/blacklist/:phone", "/v1/logistics/fraud/blacklist/:phone"],
  (req: Request, res: Response) => {
    try {
      const phone = Array.isArray(req.params.phone) ? req.params.phone[0] : String(req.params.phone || "");
      if (!phone) {
        return res.status(400).json({ success: false, error: "Phone parameter is required" });
      }

      const result = RtoFraudEngine.removeFromBlacklist(phone);
      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: `Phone number ${phone} not found on fraud blacklist`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Removed ${phone} from fraud blacklist`,
        removedCount: result.removedCount,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to remove from blacklist",
      });
    }
  }
);

/**
 * POST /api/v1/logistics/rto/predict
 * Comprehensive RTO probability evaluation with dynamic advance recommendation
 */
rtoFraudRouter.post(
  ["/api/v1/logistics/rto/predict", "/v1/logistics/rto/predict"],
  (req: Request, res: Response) => {
    try {
      const parse = predictRtoSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const prediction = RtoFraudEngine.predictRTORisk(parse.data);
      return res.status(200).json({
        success: true,
        ...prediction,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to predict RTO risk",
      });
    }
  }
);

/**
 * POST /api/v1/logistics/rto/advance-policy
 * Generate bKash/Nagad advance payment requirement & WhatsApp template
 */
rtoFraudRouter.post(
  ["/api/v1/logistics/rto/advance-policy", "/v1/logistics/rto/advance-policy"],
  (req: Request, res: Response) => {
    try {
      const parse = predictRtoSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const prediction = RtoFraudEngine.predictRTORisk(parse.data);
      return res.status(200).json({
        success: true,
        phone: prediction.phone,
        riskTier: prediction.riskTier,
        rtoProbabilityPercent: prediction.rtoProbabilityPercent,
        advancePolicy: prediction.advancePolicy,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to generate advance policy",
      });
    }
  }
);
