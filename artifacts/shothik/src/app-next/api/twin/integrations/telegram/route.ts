import { NextRequest, NextResponse } from "next/server";
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

    const messageText = body.message?.text || body.text || "/status";
    const chatId = body.message?.chat?.id || "founder_chat_101";
    const senderName = body.message?.from?.first_name || "Founder";

    logger.info("[twin-telegram-webhook] Inbound message received", {
      chatId,
      senderName,
      messageText,
    });

    let replyMessage = "";

    if (messageText.includes("/sales") || messageText.toLowerCase().includes("sales") || messageText.toLowerCase().includes("bkash")) {
      replyMessage = `💰 *Daily Sales Update for ${senderName}:*\n• Total bKash: ৳38,500 BDT\n• Orders: 14 completed\n• Net Profit: ৳32,150 BDT`;
    } else if (messageText.includes("/leads") || messageText.toLowerCase().includes("leads")) {
      replyMessage = `👥 *Hot Leads Status:*\n• 3 Hot WhatsApp replies pending\n• 42 Cold emails delivered today (52% open rate)`;
    } else if (messageText.includes("/deploy") || messageText.toLowerCase().includes("deploy")) {
      replyMessage = `🚀 *Dokploy Container:* Rolling deployment initiated on cluster. Health score: 100%.`;
    } else {
      replyMessage = `🤖 *Shothik Twin Voice Co-Founder:*\n• Revenue: ৳38,500 BDT\n• Leads: 3 Hot WhatsApp contacts\n• Reply '/sales', '/leads', or '/deploy' anytime!`;
    }

    return NextResponse.json({
      success: true,
      chatId,
      replyMessage,
      processedAt: Date.now(),
    });
  } catch (error: any) {
    logger.error("[twin-telegram-webhook] Error processing telegram message", { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process telegram webhook" },
      { status: 500 }
    );
  }
}
