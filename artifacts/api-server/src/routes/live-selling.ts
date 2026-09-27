import { Router, Request, Response } from "express";
import { z } from "zod";
import { LiveSellingEngine } from "../lib/live-selling/live-selling-engine.js";

export const liveSellingRouter = Router();

const createSessionSchema = z.object({
  sessionTitle: z.string().min(1, "sessionTitle is required"),
  channel: z.enum(["facebook_live", "tiktok_live", "instagram_live", "youtube_live"]).optional().default("facebook_live"),
  merchantId: z.string().min(1, "merchantId is required"),
});

const parseCommentSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  authorName: z.string().min(1, "authorName is required"),
  rawComment: z.string().min(1, "rawComment is required"),
});

const confirmOrderSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
});

/**
 * GET /v1/live-selling/sessions/active
 */
liveSellingRouter.get("/v1/live-selling/sessions/active", (_req: Request, res: Response) => {
  try {
    const session = LiveSellingEngine.getActiveSession();
    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch active live session",
    });
  }
});

/**
 * POST /v1/live-selling/sessions/create
 */
liveSellingRouter.post("/v1/live-selling/sessions/create", (req: Request, res: Response) => {
  try {
    const parse = createSessionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const session = LiveSellingEngine.createSession(parse.data);
    return res.status(201).json({
      success: true,
      session,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to create live selling session",
    });
  }
});

/**
 * POST /v1/live-selling/comments/parse
 */
liveSellingRouter.post("/v1/live-selling/comments/parse", (req: Request, res: Response) => {
  try {
    const parse = parseCommentSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const { sessionId, authorName, rawComment } = parse.data;
    const order = LiveSellingEngine.parseComment(sessionId, authorName, rawComment);
    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to parse live comment",
    });
  }
});

/**
 * POST /v1/live-selling/orders/confirm
 */
liveSellingRouter.post("/v1/live-selling/orders/confirm", (req: Request, res: Response) => {
  try {
    const parse = confirmOrderSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const result = LiveSellingEngine.confirmOrder(parse.data.orderId);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to confirm live order",
    });
  }
});

/**
 * POST /v1/live-selling/orders/auto-dispatch
 */
liveSellingRouter.post("/v1/live-selling/orders/auto-dispatch", (req: Request, res: Response) => {
  try {
    const { orderId, courierProvider = "steadfast" } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "orderId is required" });
    }

    const result = LiveSellingEngine.autoDispatchCourierPipeline(orderId, courierProvider);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to auto-dispatch live order to courier",
    });
  }
});

/**
 * GET /v1/live-selling/orders
 */
liveSellingRouter.get("/v1/live-selling/orders", (req: Request, res: Response) => {
  try {
    const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : undefined;
    const orders = LiveSellingEngine.listOrders(sessionId);
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list live selling orders",
    });
  }
});
