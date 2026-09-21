import { Router, Request, Response } from "express";
import { z } from "zod";
import { CourierArbitrageEngine, CourierProvider } from "../lib/logistics/courier-arbitrage-engine.js";

export const courierArbitrageRouter = Router();

const evaluateArbitrageSchema = z.object({
  district: z.string().min(1, "District is required"),
  codAmountBdt: z.number().nonnegative("COD amount must be non-negative"),
  weightKg: z.number().positive().optional(),
  customerPhone: z.string().optional(),
});

const dispatchConsignmentSchema = z.object({
  orderRef: z.string().min(1, "orderRef is required"),
  carrier: z.enum(["steadfast", "pathao", "redx", "paperfly"]).optional(),
  customerName: z.string().min(1, "customerName is required"),
  customerPhone: z.string().min(1, "customerPhone is required"),
  deliveryAddress: z.string().min(1, "deliveryAddress is required"),
  district: z.string().min(1, "district is required"),
  codAmountBdt: z.number().nonnegative("codAmountBdt must be non-negative"),
  weightKg: z.number().positive().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    "booked",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "rto_risk",
    "returned",
  ]),
});

/**
 * POST /v1/logistics/arbitrage/evaluate
 */
courierArbitrageRouter.post("/v1/logistics/arbitrage/evaluate", (req: Request, res: Response) => {
  try {
    const parse = evaluateArbitrageSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const evaluation = CourierArbitrageEngine.evaluateArbitrage(parse.data);
    return res.status(200).json({
      success: true,
      evaluation,
      ...evaluation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to evaluate courier arbitrage",
    });
  }
});

/**
 * GET /v1/logistics/carriers/matrix and /v1/logistics/arbitrage/matrix
 */
courierArbitrageRouter.get(
  ["/v1/logistics/carriers/matrix", "/v1/logistics/arbitrage/matrix"],
  (_req: Request, res: Response) => {
    try {
      const matrix = CourierArbitrageEngine.getDistrictMatrix();
      return res.status(200).json({
        success: true,
        count: matrix.length,
        matrix,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to fetch district performance matrix",
      });
    }
  }
);

/**
 * GET /v1/logistics/rto/alerts
 */
courierArbitrageRouter.get("/v1/logistics/rto/alerts", (_req: Request, res: Response) => {
  try {
    const consignments = CourierArbitrageEngine.listConsignments();
    const rtoAlerts = consignments.filter((c) => c.status === "rto_risk");
    return res.status(200).json({
      success: true,
      count: rtoAlerts.length,
      alerts: rtoAlerts,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch RTO alerts",
    });
  }
});

/**
 * POST /v1/logistics/consignments/dispatch and /v1/logistics/consignments/book
 */
courierArbitrageRouter.post(
  ["/v1/logistics/consignments/dispatch", "/v1/logistics/consignments/book", "/v1/logistics/consignments"],
  (req: Request, res: Response) => {
    try {
      const parse = dispatchConsignmentSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const result = CourierArbitrageEngine.dispatchConsignment(parse.data);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to dispatch consignment",
      });
    }
  }
);

/**
 * GET /v1/logistics/consignments
 */
courierArbitrageRouter.get("/v1/logistics/consignments", (_req: Request, res: Response) => {
  try {
    const consignments = CourierArbitrageEngine.listConsignments();
    return res.status(200).json({
      success: true,
      count: consignments.length,
      consignments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list consignments",
    });
  }
});

/**
 * PATCH /v1/logistics/consignments/:id/status
 */
courierArbitrageRouter.patch("/v1/logistics/consignments/:id/status", (req: Request, res: Response) => {
  try {
    const consignmentId = String(req.params.id || "");
    const parse = updateStatusSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const result = CourierArbitrageEngine.updateConsignmentStatus(consignmentId, parse.data.status);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to update consignment status",
    });
  }
});
