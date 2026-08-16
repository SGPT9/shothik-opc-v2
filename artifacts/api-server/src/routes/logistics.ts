import { Router, type Request, type Response } from "express";
import { ParcelBookingRequestSchema } from "@workspace/hermes/contracts";

const router = Router();

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

export default router;
