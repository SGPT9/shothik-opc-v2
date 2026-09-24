import { Router, Request, Response } from "express";
import { voiceCommerceEngine } from "../lib/voice-commerce/voice-commerce-engine.js";

export const voiceCommerceRouter = Router();

// GET /api/v1/voice-commerce/summary
voiceCommerceRouter.get("/v1/voice-commerce/summary", (_req: Request, res: Response) => {
  try {
    const summary = voiceCommerceEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/voice-commerce/parse-intent
voiceCommerceRouter.post("/v1/voice-commerce/parse-intent", (req: Request, res: Response) => {
  try {
    const { transcript, fallbackPhone } = req.body;
    if (!transcript) {
      return res.status(400).json({ ok: false, error: "transcript is required" });
    }

    const parsed = voiceCommerceEngine.parseVoiceIntent(transcript, fallbackPhone);
    return res.json({ ok: true, data: parsed });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/voice-commerce/create-order
voiceCommerceRouter.post("/v1/voice-commerce/create-order", (req: Request, res: Response) => {
  try {
    const { parsed, customerName } = req.body;
    if (!parsed || !parsed.slots) {
      return res.status(400).json({ ok: false, error: "parsed voice intent is required" });
    }

    const order = voiceCommerceEngine.createVoiceOrder(parsed, customerName);
    return res.status(201).json({ ok: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/voice-commerce/orders
voiceCommerceRouter.get("/v1/voice-commerce/orders", (_req: Request, res: Response) => {
  try {
    const orders = voiceCommerceEngine.getOrders();
    return res.json({ ok: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/voice-commerce/dispatch-sms
voiceCommerceRouter.post("/v1/voice-commerce/dispatch-sms", (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ ok: false, error: "orderId is required" });
    }

    const result = voiceCommerceEngine.dispatchPaymentSms(orderId);
    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
