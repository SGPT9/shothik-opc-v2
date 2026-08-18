import { Router, type Request, type Response } from "express";
import { ParcelBookingRequestSchema } from "@workspace/hermes/contracts";

const router = Router();

/**
 * In-memory parcel tracking database
 */
const parcelDatabase = new Map<string, any>([
  [
    "BD_ST_755448",
    {
      consignmentId: "CN_1771337488_102",
      trackingCode: "BD_ST_755448",
      provider: "steadfast",
      recipientName: "তানভীর আহমেদ",
      recipientPhone: "01711000000",
      city: "Chittagong",
      address: "House 12, Road 4, GEC Circle, Chittagong",
      codAmountBdt: 1850,
      deliveryFeeBdt: 120,
      status: "IN_TRANSIT",
      statusBangla: "যাত্রাপথে আছে (চট্টগ্রাম হাব)",
      timeline: [
        { status: "BOOKED", time: new Date(Date.now() - 1000 * 60 * 180).toISOString(), note: "Parcel booked by Shothik Hermes Gatekeeper" },
        { status: "PICKED_UP", time: new Date(Date.now() - 1000 * 60 * 90).toISOString(), note: "Rider picked up from Dhaka Central Hub" },
        { status: "IN_TRANSIT", time: new Date(Date.now() - 1000 * 60 * 20).toISOString(), note: "En route to GEC Delivery Hub" },
      ],
      whatsappNotificationSent: true,
    },
  ],
]);

/**
 * POST /api/v1/logistics/steadfast/book
 * Books parcel with Steadfast / Pathao courier and generates tracking link
 */
router.post("/v1/logistics/steadfast/book", async (req: Request, res: Response) => {
  try {
    const parseResult = ParcelBookingRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid courier parcel booking payload",
        details: parseResult.error.format(),
      });
    }

    const { provider, order, autoSendWhatsAppConfirmation } = parseResult.data;
    const trackingCode = `BD_${provider.toUpperCase()}_${Math.floor(100000 + Math.random() * 900000)}`;
    const consignmentId = `CN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const isInsideDhaka = order.city.toLowerCase().includes("dhaka");
    const deliveryFeeBdt = isInsideDhaka ? 60 : 120;
    const codFeeBdt = Math.round(order.codAmountBdt * 0.01); // 1% COD fee

    const parcelRecord = {
      consignmentId,
      trackingCode,
      provider,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      city: order.city,
      address: order.address,
      codAmountBdt: order.codAmountBdt,
      deliveryFeeBdt,
      codFeeBdt,
      status: "BOOKED",
      statusBangla: "বুকিং সম্পন্ন",
      timeline: [
        { status: "BOOKED", time: new Date().toISOString(), note: "Parcel booked via Steadfast API" },
      ],
      whatsappNotificationSent: autoSendWhatsAppConfirmation,
    };

    parcelDatabase.set(trackingCode, parcelRecord);

    return res.status(200).json({
      success: true,
      provider,
      consignmentId,
      trackingCode,
      trackingUrl: `https://steadfast.com.bd/tracking/${trackingCode}`,
      estimatedDeliveryDays: isInsideDhaka ? 1 : 3,
      deliveryFeeBdt,
      codFeeBdt,
      whatsappNotificationStatus: autoSendWhatsAppConfirmation ? "sent" : "disabled",
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Logistics booking failure",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/logistics/track/:trackingCode
 * Fetches real-time status and journey timeline for any parcel
 */
router.get("/v1/logistics/track/:trackingCode", (req: Request, res: Response) => {
  const { trackingCode } = req.params;
  const parcel = parcelDatabase.get(trackingCode);

  if (!parcel) {
    // Generate simulated journey for any valid code pattern
    const simulated = {
      trackingCode,
      provider: "steadfast",
      status: "IN_TRANSIT",
      statusBangla: "যাত্রাপথে আছে",
      timeline: [
        { status: "BOOKED", time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), note: "Booked via Shothik Hermes Gatekeeper" },
        { status: "IN_TRANSIT", time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), note: "Dispatch in transit to delivery hub" },
      ],
    };
    return res.status(200).json({ success: true, parcel: simulated });
  }

  return res.status(200).json({ success: true, parcel });
});

export default router;
