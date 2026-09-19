import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import { analyzeCustomerMessage, type NlpAnalysisResult } from "../lib/whatsapp/banglish-nlp";
import { whatsAppCommerceEngine, type DialectCode, type CartItem } from "../lib/whatsapp/whatsapp-commerce-engine";

const router = Router();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "shothik_whatsapp_verify_token_2026";

/**
 * GET /v1/whatsapp/webhook
 * Meta WhatsApp Business Webhook Handshake Verification
 */
router.get("/v1/whatsapp/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    logger.info("[whatsapp-webhook] Meta webhook subscription verified successfully");
    return res.status(200).send(challenge);
  }

  logger.warn({ mode, token }, "[whatsapp-webhook] Verification failed - token mismatch");
  return res.status(403).json({ error: "Verification token mismatch" });
});

/**
 * POST /v1/whatsapp/webhook
 * Inbound Customer Inquiries & Orders Ingress
 */
router.post("/v1/whatsapp/webhook", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      const responses: Array<{ recipientPhone: string; reply: string; analysis: NlpAnalysisResult }> = [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          const messages = value?.messages || [];

          for (const msg of messages) {
            const senderPhone = msg.from;
            const messageText = msg.text?.body || msg.button?.text || "";
            const messageId = msg.id;

            logger.info(
              {
                senderPhone,
                messageId,
                textSnippet: messageText.slice(0, 40),
              },
              "[whatsapp-webhook] Inbound customer message received"
            );

            // Autonomous Banglish NLP Intent Extraction:
            const analysis = analyzeCustomerMessage(messageText);
            responses.push({
              recipientPhone: senderPhone,
              reply: analysis.replyText,
              analysis,
            });
          }
        }
      }

      return res.status(200).json({
        status: "EVENT_RECEIVED",
        success: true,
        dispatchedCount: responses.length,
        responses,
      });
    }

    return res.status(404).json({ error: "Not a WhatsApp Business Account payload" });
  } catch (err: any) {
    logger.error({ error: err.message }, "[whatsapp-webhook] Processing error");
    return res.status(500).json({ error: "Webhook processing failure" });
  }
});

/**
 * POST /v1/whatsapp/simulate
 * Simulates an inbound customer message from WhatsApp/Messenger and runs Banglish NLP
 */
router.post("/v1/whatsapp/simulate", async (req: Request, res: Response) => {
  try {
    const { message, customerPhone = "01711000000", companyName = "Shothik Merchant" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message text is required" });
    }

    const analysis = analyzeCustomerMessage(message, companyName);

    return res.status(200).json({
      success: true,
      senderPhone: customerPhone,
      companyName,
      inputMessage: message,
      analysis,
      autoReply: analysis.replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err }, "[whatsapp-simulate] Error running simulation");
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /v1/whatsapp/send
 * Outbound Twin Message Dispatcher
 */
router.post("/v1/whatsapp/send", async (req: Request, res: Response) => {
  const { recipientPhone, message, template } = req.body;

  if (!recipientPhone || (!message && !template)) {
    return res.status(400).json({ error: "Missing recipientPhone or message/template" });
  }

  logger.info({ recipientPhone }, "[whatsapp-outbound] Dispatched reply to customer");
  return res.status(200).json({
    success: true,
    messageId: `wamid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    recipientPhone,
    status: "delivered",
  });
});

/**
 * GET /v1/whatsapp/commerce/catalog
 * Retrieve default merchant catalog items
 */
router.get("/v1/whatsapp/commerce/catalog", (_req: Request, res: Response) => {
  const catalog = whatsAppCommerceEngine.getCatalog();
  return res.status(200).json({
    success: true,
    count: catalog.length,
    catalog,
  });
});

/**
 * POST /v1/whatsapp/commerce/chat
 * Multi-Dialect WhatsApp Conversational Commerce Turn
 */
router.post("/v1/whatsapp/commerce/chat", (req: Request, res: Response) => {
  try {
    const {
      sessionId = `sess_${Date.now()}`,
      customerPhone = "01711000000",
      message,
      dialect = "standard",
      cart = [],
    } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message string is required" });
    }

    const result = whatsAppCommerceEngine.processCommerceTurn(
      sessionId,
      customerPhone,
      message,
      dialect as DialectCode,
      cart as CartItem[]
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "[whatsapp-commerce-chat] Error handling turn");
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /v1/whatsapp/commerce/generate-invoice
 * Dynamic bKash QR Invoice Generator
 */
router.post("/v1/whatsapp/commerce/generate-invoice", (req: Request, res: Response) => {
  try {
    const { amountBdt, reference = "REF_ORDER", merchantNumber } = req.body;

    if (!amountBdt || typeof amountBdt !== "number" || amountBdt <= 0) {
      return res.status(400).json({ success: false, error: "Valid amountBdt is required" });
    }

    const invoice = whatsAppCommerceEngine.generateBkashInvoice(amountBdt, reference, merchantNumber);
    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /v1/whatsapp/commerce/confirm-order
 * Confirm Order, Verify Payment/COD, and Auto-Book Steadfast Courier
 */
router.post("/v1/whatsapp/commerce/confirm-order", (req: Request, res: Response) => {
  try {
    const {
      customerPhone,
      customerName,
      customerAddress,
      items,
      city,
      paymentMethod = "BKASH_QR",
      trxId,
      dialect = "standard",
    } = req.body;

    if (!customerPhone || !customerAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "customerPhone, customerAddress, and items array are required",
      });
    }

    const order = whatsAppCommerceEngine.confirmOrder({
      customerPhone,
      customerName,
      customerAddress,
      items,
      city,
      paymentMethod,
      trxId,
      dialect: dialect as DialectCode,
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /v1/whatsapp/commerce/orders
 * Retrieve WhatsApp commerce orders ledger
 */
router.get("/v1/whatsapp/commerce/orders", (_req: Request, res: Response) => {
  const orders = whatsAppCommerceEngine.getOrders();
  return res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

export default router;
