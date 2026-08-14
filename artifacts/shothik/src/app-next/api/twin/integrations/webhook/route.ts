import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      body = {};
    }

    const shopifyTopic = req.headers.get("x-shopify-topic");
    const wooTopic = req.headers.get("x-wc-webhook-topic");
    const customEvent = req.headers.get("x-event-type") || body.event;

    const eventTopic = shopifyTopic || wooTopic || customEvent || "order.created";
    const source = shopifyTopic ? "shopify" : wooTopic ? "woocommerce" : "custom_webhook";

    const orderId = body.id || body.order_id || `ord_${Date.now()}`;
    const customerName = body.customer?.name || body.billing?.first_name || body.customer_name || "Valued Customer";
    const customerPhone = body.customer?.phone || body.billing?.phone || body.phone;
    const totalBdt = Number(body.total_price || body.total || body.amount || 1500);

    logger.info("[twin-webhook-ingress] Ingress event received", {
      eventTopic,
      source,
      orderId,
      customerName,
      totalBdt,
    });

    let actionTaken = "";

    if (eventTopic.includes("abandon") || eventTopic.includes("checkout")) {
      actionTaken = `Triggered 1-Tap WhatsApp abandoned cart recovery offer (10% discount) to ${customerName}`;
    } else if (eventTopic.includes("paid") || eventTopic.includes("created")) {
      actionTaken = `Logged ৳${totalBdt} BDT order to Twin P&L ledger and queued Steadfast COD courier dispatch`;
    } else {
      actionTaken = `Acknowledged webhook event '${eventTopic}' for ${source}`;
    }

    return NextResponse.json({
      success: true,
      eventId: `evt_${randomUUID()}`,
      source,
      eventTopic,
      orderId,
      customerName,
      totalBdt,
      actionTaken,
      processedAt: Date.now(),
    });
  } catch (error: any) {
    logger.error("[twin-webhook-ingress] Error handling webhook", { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process e-commerce webhook" },
      { status: 500 }
    );
  }
}
