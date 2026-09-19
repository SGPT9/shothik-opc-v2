import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger.js";
import {
  OutboundCallingEngine,
  type InitiateCallParams,
} from "../lib/telephony/outbound-calling-engine.js";

const router = Router();

// Seed initial realistic verification sessions for immediate Twin Studio testing
if (OutboundCallingEngine.listSessions().length === 0) {
  try {
    OutboundCallingEngine.initiateCall({
      orderId: "ord_cod_banani_01",
      customerPhone: "+8801712345678",
      customerName: "Md. Tanvir Hasan",
      itemsSummary: "Royal Platinum Panjabi (Black, XL)",
      itemCount: 1,
      grandTotalBdt: 2310,
      deliveryDistrict: "Dhaka",
      deliveryAddress: "House 14, Road 7, Block F, Banani, Dhaka-1213",
      dialect: "standard",
    });

    OutboundCallingEngine.initiateCall({
      orderId: "ord_cod_sylhet_02",
      customerPhone: "+8801898765432",
      customerName: "Syed Farhan Ahmed",
      itemsSummary: "2x Pure Sundarban Honey + Boi Mela Monograph",
      itemCount: 3,
      grandTotalBdt: 3670,
      deliveryDistrict: "Sylhet",
      deliveryAddress: "Zindabazar, Amberkhana Road, Sylhet",
      dialect: "sylheti",
    });
  } catch (err: any) {
    logger.warn({ error: err.message }, "[telephony] Seed data initiation warning");
  }
}

/**
 * POST /v1/telephony/outbound/initiate
 * Dispatches an outbound voice verification call for a COD order
 */
router.post("/v1/telephony/outbound/initiate", (req: Request, res: Response) => {
  try {
    const {
      orderId,
      customerPhone,
      customerName,
      itemsSummary,
      itemCount = 1,
      grandTotalBdt,
      deliveryDistrict,
      deliveryAddress,
      dialect = "standard",
    } = req.body;

    if (!orderId || !customerPhone || !itemsSummary || !grandTotalBdt || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: "orderId, customerPhone, itemsSummary, grandTotalBdt, and deliveryAddress are required",
      });
    }

    const session = OutboundCallingEngine.initiateCall({
      orderId,
      customerPhone,
      customerName,
      itemsSummary,
      itemCount,
      grandTotalBdt,
      deliveryDistrict,
      deliveryAddress,
      dialect,
    });

    return res.status(201).json({
      success: true,
      session,
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[telephony] Call initiation failure");
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /v1/telephony/outbound/transcribe-turn
 * Ingests customer conversational speech turn, updates dialog state & returns agent speech response
 */
router.post("/v1/telephony/outbound/transcribe-turn", (req: Request, res: Response) => {
  try {
    const { callId, customerSpeechText } = req.body;

    if (!callId || typeof customerSpeechText !== "string") {
      return res.status(400).json({
        success: false,
        error: "callId and customerSpeechText string are required",
      });
    }

    const result = OutboundCallingEngine.processCustomerTurn(callId, customerSpeechText);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return res.status(404).json({ success: false, error: err.message });
  }
});

/**
 * GET /v1/telephony/outbound/sessions
 * Lists all active and recent outbound calling sessions
 */
router.get("/v1/telephony/outbound/sessions", (_req: Request, res: Response) => {
  const sessions = OutboundCallingEngine.listSessions();
  return res.status(200).json({
    success: true,
    count: sessions.length,
    sessions,
  });
});

/**
 * GET /v1/telephony/outbound/sessions/:callId
 * Retrieves a specific call session by ID
 */
router.get("/v1/telephony/outbound/sessions/:callId", (req: Request, res: Response) => {
  const callId = req.params.callId as string;
  const session = OutboundCallingEngine.getSession(callId);
  if (!session) {
    return res.status(404).json({ success: false, error: `Session ${callId} not found` });
  }
  return res.status(200).json({
    success: true,
    session,
  });
});

/**
 * POST /v1/telephony/outbound/override
 * Merchant 1-click manual override for Supervised Autonomy review
 */
router.post("/v1/telephony/outbound/override", (req: Request, res: Response) => {
  try {
    const { callId, action, notes } = req.body;

    if (!callId || !["APPROVE_DISPATCH", "CANCEL_ORDER", "SCHEDULE_RETRY"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "callId and valid action (APPROVE_DISPATCH | CANCEL_ORDER | SCHEDULE_RETRY) are required",
      });
    }

    const session = OutboundCallingEngine.manualOverride(callId, action, notes);
    return res.status(200).json({
      success: true,
      session,
    });
  } catch (err: any) {
    return res.status(404).json({ success: false, error: err.message });
  }
});

/**
 * POST /v1/telephony/outbound/simulate
 * Simulates an end-to-end multi-turn phone call for automated testing
 */
router.post("/v1/telephony/outbound/simulate", (req: Request, res: Response) => {
  try {
    const {
      orderId = `ord_sim_${Date.now()}`,
      customerPhone = "+8801700112233",
      customerName = "Simulated Buyer",
      grandTotalBdt = 1650,
      deliveryAddress = "Dhanmondi, Dhaka",
      turns = ["ji bhai, order confirm koren, pathaye den"],
      dialect = "standard",
    } = req.body;

    const session = OutboundCallingEngine.initiateCall({
      orderId,
      customerPhone,
      customerName,
      itemsSummary: "Dhakai Jamdani Saree",
      itemCount: 1,
      grandTotalBdt,
      deliveryAddress,
      dialect,
    });

    let lastResult: any = null;
    for (const turnText of turns) {
      lastResult = OutboundCallingEngine.processCustomerTurn(session.callId, turnText);
    }

    return res.status(200).json({
      success: true,
      callId: session.callId,
      finalSession: lastResult ? lastResult.session : session,
      finalReply: lastResult ? lastResult.agentReply : session.transcript[0].text,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
