import { describe, it, expect } from "vitest";
import { handlePathaoWebhook } from "../../../../../../functions/pathao-courier-webhook/index";

describe("InsForge Edge Function: pathao-courier-webhook", () => {
  it("should parse Pathao delivery update webhook and return WhatsApp status card", async () => {
    const res = await handlePathaoWebhook({
      consignment_id: "PTH_881923",
      merchant_order_id: "ORD_POLSIA_101",
      order_status: "delivered",
      updated_at: new Date().toISOString(),
    });

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.provider).toBe("pathao");
    expect(body.consignmentId).toBe("PTH_881923");
    expect(body.status).toBe("delivered");
    expect(body.whatsappNotificationCard).toContain("প্যাকেটটি গ্রাহকের কাছে পৌঁছে দেওয়া হয়েছে");
  });
});
