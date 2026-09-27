import { Router } from "express";
import { CodIvrEngine, CODOrderInput } from "../lib/ivr/cod-ivr-engine";

export const codIvrRouter = Router();

codIvrRouter.post("/ivr/generate-plan", (req, res) => {
  try {
    const order: CODOrderInput = req.body;
    if (!order.orderId || !order.customerPhone || !order.customerName) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: orderId, customerPhone, customerName",
      });
      return;
    }

    const plan = CodIvrEngine.generateIVRCallPlan({
      orderId: order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items || [{ sku: "SKU-GENERIC", name: "Custom Item", quantity: 1, unitPrice: order.codAmount || 0 }],
      codAmount: Number(order.codAmount || 0),
      rawAddress: order.rawAddress || "Dhaka, Bangladesh",
      dialect: order.dialect,
    });

    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

codIvrRouter.post("/ivr/rto-risk", (req, res) => {
  try {
    const order: CODOrderInput = req.body;
    if (!order.customerPhone || order.codAmount === undefined) {
      res.status(400).json({
        success: false,
        error: "Missing customerPhone or codAmount",
      });
      return;
    }

    const assessment = CodIvrEngine.assessRTORisk({
      orderId: order.orderId || "ORD-TMP",
      customerName: order.customerName || "Customer",
      customerPhone: order.customerPhone,
      items: order.items || [],
      codAmount: Number(order.codAmount),
      rawAddress: order.rawAddress || "",
      pastDeliverySuccessCount: Number(order.pastDeliverySuccessCount || 0),
      pastDeliveryReturnCount: Number(order.pastDeliveryReturnCount || 0),
    });

    res.json({ success: true, assessment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

codIvrRouter.post("/ivr/parse-address", (req, res) => {
  try {
    const { rawAddress } = req.body;
    if (!rawAddress) {
      res.status(400).json({ success: false, error: "rawAddress is required" });
      return;
    }

    const parsed = CodIvrEngine.parseAddress(rawAddress);
    res.json({ success: true, parsedAddress: parsed });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

codIvrRouter.post("/ivr/dispatch-courier", (req, res) => {
  try {
    const { order, courierProvider, confirmedBy } = req.body;
    if (!order || !order.orderId || !order.customerPhone) {
      res.status(400).json({ success: false, error: "Valid order object is required" });
      return;
    }

    const consignment = CodIvrEngine.dispatchCourierConsignment(
      order,
      courierProvider || "steadfast",
      confirmedBy || "voice_ivr"
    );

    res.json({ success: true, consignment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
