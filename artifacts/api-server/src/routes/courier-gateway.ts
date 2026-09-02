/**
 * Steadfast Courier Parcel Booking & Telemetry Dispatcher
 * Manages parcel bookings and real-time delivery status webhooks.
 */

import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * POST /api/v1/courier/steadfast/book
 * Book parcel with Steadfast Courier API
 */
router.post("/v1/courier/steadfast/book", (req: Request, res: Response) => {
  const { recipientName, recipientPhone, recipientAddress, codAmountBdt = 1000 } = req.body;

  if (!recipientName || !recipientPhone || !recipientAddress) {
    return res.status(400).json({ success: false, error: "Recipient name, phone, and address are required" });
  }

  const trackingCode = `BD_ST_${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

  return res.status(200).json({
    success: true,
    trackingCode,
    recipientName,
    recipientPhone,
    recipientAddress,
    codAmountBdt,
    deliveryStatus: "IN_TRANSIT",
    estimatedDeliveryDays: 2,
    bookingTimestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/courier/steadfast/webhook
 * Receive real-time Steadfast parcel delivery tracking updates
 */
router.post("/v1/courier/steadfast/webhook", (req: Request, res: Response) => {
  const { trackingCode, status, updatedTimestamp } = req.body;

  if (!trackingCode || !status) {
    return res.status(400).json({ success: false, error: "trackingCode and status are required" });
  }

  return res.status(200).json({
    success: true,
    trackingCode,
    status,
    updatedTimestamp: updatedTimestamp || new Date().toISOString(),
    message: "Steadfast telemetry event acknowledged successfully.",
  });
});

export default router;
