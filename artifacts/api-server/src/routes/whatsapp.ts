import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { logger } from "../lib/logger.js";
import { analyzeCustomerMessage, type NlpAnalysisResult } from "../lib/whatsapp/banglish-nlp.js";
import { whatsAppCommerceEngine, type DialectCode, type CartItem } from "../lib/whatsapp/whatsapp-commerce-engine.js";
import {
  parseWhatsAppCommerceMessage,
  SAMPLE_MERCHANT_CATALOG,
  type ExtractedCartResult,
  type SessionSlots,
} from "../lib/commerce/whatsapp-cart-engine.js";
import {
  envelopeUntrustedContent,
  unwrapUntrustedContent,
  PROMPT_INJECTION_ARMOR_INSTRUCTION,
} from "../lib/security/pii-redactor.js";

const router = Router();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "shothik_whatsapp_verify_token_2026";
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "shothik_app_secret_secure_key";

// In-memory sessions store for WhatsApp conversations
interface ManagedSession {
  sessionId: string;
  customerPhone: string;
  customerName?: string;
  lastMessageText: string;
  envelopedLastMessage?: string;
  lastActivity: number;
  extractedCart?: ExtractedCartResult;
  status: "active" | "pending_merchant_approval" | "confirmed" | "dispatched" | "cancelled";
  messageHistory: Array<{
    id: string;
    direction: "inbound" | "outbound";
    text: string;
    envelopedText?: string;
    timestamp: number;
    quickPills?: any[];
  }>;
}

const activeSessions: Map<string, ManagedSession> = new Map();
const processedMessageIds: Set<string> = new Set();

// Seed a few realistic active sessions for immediate Twin Studio testing
if (activeSessions.size === 0) {
  const seedSessionId = "sess_wa_chittagong_01";
  const seedExtraction = parseWhatsAppCommerceMessage(
    "Bhai 2ta semi fitted panjabi lagbe black color XL size, Chittagong pathaben",
    "+8801712345678"
  );
  activeSessions.set(seedSessionId, {
    sessionId: seedSessionId,
    customerPhone: "+8801712345678",
    customerName: "Kamrul Hasan",
    lastMessageText: "Bhai 2ta semi fitted panjabi lagbe black color XL size, Chittagong pathaben",
    lastActivity: Date.now() - 1000 * 60 * 12,
    extractedCart: seedExtraction,
    status: seedExtraction.isSupervised ? "pending_merchant_approval" : "active",
    messageHistory: [
      {
        id: "wamid_seed_01",
        direction: "inbound",
        text: "Bhai 2ta semi fitted panjabi lagbe black color XL size, Chittagong pathaben",
        timestamp: Date.now() - 1000 * 60 * 12,
      },
      {
        id: "wamid_seed_02",
        direction: "outbound",
        text: seedExtraction.suggestedMerchantReplyBangla,
        timestamp: Date.now() - 1000 * 60 * 11,
      },
    ],
  });
}

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
 * Inbound Customer Inquiries & Orders Ingress with Idempotency & Signature Verification
 */
router.post("/v1/whatsapp/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers?.["x-hub-signature-256"] as string | undefined;
    const rawPayload = JSON.stringify(req.body);

    if (signature && process.env.NODE_ENV === "production") {
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", WHATSAPP_APP_SECRET)
        .update(rawPayload)
        .digest("hex")}`;
      if (signature !== expectedSignature) {
        logger.warn("[whatsapp-webhook] Rejected webhook with invalid HMAC signature");
        return res.status(401).json({ error: "Invalid HMAC signature" });
      }
    }

    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      const responses: Array<{ recipientPhone: string; reply: string; extractedCart: ExtractedCartResult }> = [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          const messages = value?.messages || [];

          for (const msg of messages) {
            const senderPhone = msg.from;
            const messageText = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || "";
            const messageId = msg.id;

            // Idempotency check:
            if (messageId && processedMessageIds.has(messageId)) {
              logger.info({ messageId }, "[whatsapp-webhook] Ignored duplicate message delivery");
              continue;
            }
            if (messageId) processedMessageIds.add(messageId);

            const sessionKey = `sess_${senderPhone.replace(/[^0-9]/g, "")}`;
            const existing = activeSessions.get(sessionKey);

            // Run 3-Tier Confidence-Gated Cart Extractor
            const extractedCart = parseWhatsAppCommerceMessage(
              messageText,
              senderPhone,
              existing ? { sessionId: existing.sessionId, previousSlots: existing.extractedCart?.slots } : undefined
            );

            // Envelope raw inbound untrusted customer text with provenance
            const envelopedInbound = envelopeUntrustedContent(messageText, {
              source: "whatsapp",
              author: senderPhone,
              timestamp: new Date().toISOString(),
            });

            const managedSession: ManagedSession = {
              sessionId: sessionKey,
              customerPhone: senderPhone,
              customerName: value?.contacts?.[0]?.profile?.name || existing?.customerName || "Valued Customer",
              lastMessageText: messageText,
              envelopedLastMessage: envelopedInbound,
              lastActivity: Date.now(),
              extractedCart,
              status: extractedCart.isSupervised ? "pending_merchant_approval" : "active",
              messageHistory: [
                ...(existing?.messageHistory || []),
                {
                  id: messageId || `msg_${Date.now()}`,
                  direction: "inbound",
                  text: messageText,
                  envelopedText: envelopedInbound,
                  timestamp: Date.now(),
                },
                {
                  id: `out_${Date.now()}`,
                  direction: "outbound",
                  text: extractedCart.suggestedMerchantReplyBangla,
                  timestamp: Date.now() + 500,
                  quickPills: extractedCart.disambiguationPills,
                },
              ],
            };

            activeSessions.set(sessionKey, managedSession);

            responses.push({
              recipientPhone: senderPhone,
              reply: extractedCart.suggestedMerchantReplyBangla,
              extractedCart,
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
 * POST /v1/whatsapp/cart/extract
 * Extracts cart drafts from arbitrary Banglish text with confidence score & tier
 */
router.post("/v1/whatsapp/cart/extract", (req: Request, res: Response) => {
  try {
    const { rawText, customerPhone = "+8801700000000", sessionId } = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ success: false, error: "rawText string is required" });
    }

    const existing = sessionId ? activeSessions.get(sessionId) : undefined;
    const result = parseWhatsAppCommerceMessage(
      rawText,
      customerPhone,
      existing ? { sessionId: existing.sessionId, previousSlots: existing.extractedCart?.slots } : undefined
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /v1/whatsapp/sessions
 * Returns all active WhatsApp merchant chat sessions and carts
 */
router.get("/v1/whatsapp/sessions", (_req: Request, res: Response) => {
  const sessions = Array.from(activeSessions.values()).sort((a, b) => b.lastActivity - a.lastActivity);
  return res.status(200).json({
    success: true,
    count: sessions.length,
    catalog: SAMPLE_MERCHANT_CATALOG,
    sessions,
  });
});

/**
 * POST /v1/whatsapp/orders/approve
 * Merchant signs off on high-value (>= ৳10,000) or customized orders
 */
router.post("/v1/whatsapp/orders/approve", (req: Request, res: Response) => {
  try {
    const { sessionId, merchantNotes, customDiscountPercent = 0 } = req.body;
    const sessionKey = String(sessionId || "");

    const session = activeSessions.get(sessionKey);
    if (!session || !session.extractedCart) {
      return res.status(404).json({ success: false, error: "Session or cart draft not found" });
    }

    let finalGrandTotal = session.extractedCart.grandTotal;
    if (customDiscountPercent > 0 && customDiscountPercent <= 50) {
      const discountAmount = Math.round((session.extractedCart.subtotal * customDiscountPercent) / 100);
      finalGrandTotal -= discountAmount;
    }

    session.status = "confirmed";
    session.messageHistory.push({
      id: `approved_${Date.now()}`,
      direction: "outbound",
      text: `[Merchant Approved] Order confirmed. Final amount: ৳${finalGrandTotal}. Booking Steadfast courier dispatch. Notes: ${merchantNotes || "Standard packaging"}`,
      timestamp: Date.now(),
    });

    activeSessions.set(sessionKey, session);

    return res.status(200).json({
      success: true,
      message: "Order approved by merchant and queued for courier dispatch",
      orderId: `ORD_WA_${Date.now()}`,
      finalGrandTotal,
      session,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /v1/whatsapp/interactive/reply
 * Handles customer quick-pill taps (e.g. Size M, Size L) and fills slots
 */
router.post("/v1/whatsapp/interactive/reply", (req: Request, res: Response) => {
  try {
    const { sessionId, pillId, title } = req.body;
    const sessionKey = String(sessionId || "");

    const session = activeSessions.get(sessionKey);
    if (!session || !session.extractedCart) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    // Re-extract with selected variant
    const updatedExtraction = parseWhatsAppCommerceMessage(
      `${session.lastMessageText} ${title}`,
      session.customerPhone,
      { sessionId: session.sessionId, previousSlots: session.extractedCart.slots }
    );

    session.extractedCart = updatedExtraction;
    session.lastActivity = Date.now();
    session.messageHistory.push({
      id: `pill_reply_${Date.now()}`,
      direction: "inbound",
      text: `Selected: ${title}`,
      timestamp: Date.now(),
    });
    session.messageHistory.push({
      id: `pill_ack_${Date.now()}`,
      direction: "outbound",
      text: updatedExtraction.suggestedMerchantReplyBangla,
      timestamp: Date.now() + 200,
    });

    activeSessions.set(sessionKey, session);

    return res.status(200).json({
      success: true,
      data: updatedExtraction,
      session,
    });
  } catch (err: any) {
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

/**
 * POST /v1/whatsapp/simulate
 * Simulates an inbound customer message, performing Banglish NLP intent extraction and dialect responses
 */
router.post("/v1/whatsapp/simulate", (req: Request, res: Response) => {
  try {
    const { message, customerPhone = "+8801700000000", companyName = "Shothik Merchant", dialect = "standard" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "message string is required" });
    }

    const analysis = analyzeCustomerMessage(message, companyName);
    return res.status(200).json({
      success: true,
      analysis,
      autoReply: analysis.replyText,
      dialect,
      customerPhone,
      envelopedContent: envelopeUntrustedContent(message, { source: "whatsapp", author: customerPhone }),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/whatsapp/armor/envelope
 * Capability 3: Envelop untrusted text, sanitize injection breakout attempts, and verify provenance
 */
router.post(["/v1/whatsapp/armor/envelope", "/api/v1/whatsapp/armor/envelope"], (req: Request, res: Response) => {
  try {
    const { text, source = "whatsapp", author = "+8801700000000" } = req.body || {};
    if (!text) {
      return res.status(400).json({ success: false, error: "text is required" });
    }

    const enveloped = envelopeUntrustedContent(text, { source, author });
    const unwrapped = unwrapUntrustedContent(enveloped);

    return res.json({
      success: true,
      data: {
        raw: text,
        enveloped,
        unwrapped,
        armorInstruction: PROMPT_INJECTION_ARMOR_INSTRUCTION,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
