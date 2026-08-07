import { NextRequest, NextResponse } from "next/server";
import { getInsforgePublicConfig } from "@/lib/insforge/config";

export const runtime = "nodejs";

/**
 * GET Handler: Webhook Verification for Meta (WhatsApp/Instagram/Messenger) & Telegram
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "shothik_chatbotx_secret_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🟢 ChatbotX Webhook Verified Successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ status: "ChatbotX Multi-Channel Gateway Active", channel: "WhatsApp/Instagram/Telegram" });
}

/**
 * POST Handler: Process Incoming Messages from WhatsApp, Instagram, Messenger, Telegram
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("📥 Incoming ChatbotX Webhook Payload:", JSON.stringify(payload, null, 2));

    // Extract sender & message text (Meta / WhatsApp / Instagram / Telegram format)
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const messageObj = changes?.messages?.[0];

    const senderId = messageObj?.from || payload?.message?.chat?.id || "guest_user";
    const userText = messageObj?.text?.body || payload?.message?.text || "Hello";
    const channel = payload?.object || (payload?.message ? "telegram" : "whatsapp");

    // Call InsForge LLM Engine / Gemini Flash Gateway to generate automated response
    const insforgeConfig = getInsforgePublicConfig();
    const systemPrompt = `You are ChatbotX 8-Channel Automated Customer Responder for Shothik Web. Respond politely, concisely, and helpfully to the buyer in their language (Bangla or English).`;

    const aiRes = await fetch(`${insforgeConfig.baseUrl}/ai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${insforgeConfig.anonKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
      }),
    });

    let aiReply = "Thank you for reaching out! A human representative will assist you shortly.";
    if (aiRes.ok) {
      const data = await aiRes.json();
      aiReply = data.choices?.[0]?.message?.content || aiReply;
    }

    return NextResponse.json({
      status: "SUCCESS",
      channel,
      senderId,
      userText,
      reply: aiReply,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("ChatbotX Backend Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
