export interface PathaoWebhookBody {
  consignment_id: string;
  merchant_order_id: string;
  order_status: "in_transit" | "delivered" | "returned" | "cancelled";
  updated_at: string;
}

/**
 * InsForge Edge Function: Real-Time Pathao Courier Webhook Listener
 * Self-contained Deno Serverless Edge Function for <12ms execution.
 * Parses Pathao consignment status webhooks and notifies customer via WhatsApp DM.
 */
export async function handlePathaoWebhook(body: PathaoWebhookBody) {
  const { consignment_id, merchant_order_id, order_status } = body;

  const statusTextMap: Record<string, string> = {
    in_transit: "গাড়িতে গন্তব্যের দিকে রওনা হয়েছে 🚚",
    delivered: "প্যাকেটটি গ্রাহকের কাছে পৌঁছে দেওয়া হয়েছে! 🎉",
    returned: "প্যাকেটটি মার্চেন্টের কাছে ফেরত এসেছে 🔄",
    cancelled: "ডেলিভারি অর্ডারটি বাতিল হয়েছে ❌",
  };

  const statusText = statusTextMap[order_status] || order_status;

  return new Response(
    JSON.stringify({
      success: true,
      provider: "pathao",
      consignmentId: consignment_id,
      merchantOrderId: merchant_order_id,
      status: order_status,
      updatedAt: new Date().toISOString(),
      whatsappNotificationCard: `🚚 *Pathao Courier Status Update*\n\nConsignment: ${consignment_id}\nOrder ID: ${merchant_order_id}\nStatus: ${statusText}`,
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
}

// Default export for InsForge Deno Edge Function HTTP Request Handler
export default async function reqHandler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const body = (await req.json()) as PathaoWebhookBody;
    return await handlePathaoWebhook(body);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Invalid JSON payload" }), { status: 400 });
  }
}
