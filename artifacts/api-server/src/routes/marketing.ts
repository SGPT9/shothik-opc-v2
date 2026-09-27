import { Router, type IRouter, type Request, type Response } from "express";
import { metaCapiEngine } from "../lib/marketing/meta-capi-engine.js";

export const marketingRouter: IRouter = Router();

/**
 * POST /api/marketing/capi/event
 * Dispatches a realtime or client-side conversion event to Meta & TikTok CAPI
 */
marketingRouter.post("/marketing/capi/event", async (req: Request, res: Response) => {
  try {
    const { eventName, eventId, userData, customData, channel } = req.body;

    if (!eventName || !customData) {
      res.status(400).json({
        success: false,
        error: "Missing required eventName or customData payload",
      });
      return;
    }

    const deterministicEventId = eventId || `ev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const metaRes = await metaCapiEngine.dispatchMetaEvent({
      eventName,
      eventTime: Math.floor(Date.now() / 1000),
      eventId: deterministicEventId,
      actionSource: "website",
      userData: userData || {},
      customData,
    });

    res.status(200).json({
      success: true,
      metaEventId: metaRes.eventId,
      emq: metaRes.emq,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to dispatch CAPI event",
    });
  }
});

/**
 * POST /api/marketing/capi/offline-attribution
 * Reconciles an offline COD courier delivery or return with original ad campaign
 */
marketingRouter.post("/marketing/capi/offline-attribution", async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      deliveryStatus,
      courier,
      amountBdt,
      customerPhone,
      customerEmail,
      fbclid,
      ttclid,
    } = req.body;

    if (!orderId || !deliveryStatus || !customerPhone || amountBdt === undefined) {
      res.status(400).json({
        success: false,
        error: "Missing required orderId, deliveryStatus, customerPhone, or amountBdt",
      });
      return;
    }

    const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
    const userAgent = req.headers["user-agent"] as string;

    const record = await metaCapiEngine.reconcileOfflineCodDelivery({
      orderId,
      deliveryStatus,
      courier: courier || "Steadfast",
      amountBdt: Number(amountBdt),
      customerPhone,
      customerEmail,
      fbclid,
      ttclid,
      clientIp,
      userAgent,
    });

    res.status(201).json({
      success: true,
      attribution: record,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process offline attribution",
    });
  }
});

/**
 * GET /api/marketing/capi/pixel-health
 * Retrieves Event Match Quality, deduplication health, and ROAS impact ledger
 */
marketingRouter.get("/marketing/capi/pixel-health", (_req: Request, res: Response) => {
  try {
    const health = metaCapiEngine.getPixelHealthMetrics();
    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve pixel health metrics",
    });
  }
});

export default marketingRouter;
