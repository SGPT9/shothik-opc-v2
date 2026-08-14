import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("E-Commerce Webhook Ingress Route (POST /api/twin/integrations/webhook)", () => {
  it("processes WooCommerce order.created webhook and updates P&L ledger", async () => {
    const request = new NextRequest("http://localhost:3000/api/twin/integrations/webhook", {
      method: "POST",
      headers: {
        "x-wc-webhook-topic": "order.created",
      },
      body: JSON.stringify({
        id: 99120,
        billing: {
          first_name: "Mahmudul",
          phone: "01700000000",
        },
        total: "4500",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.source).toBe("woocommerce");
    expect(data.eventTopic).toBe("order.created");
    expect(data.totalBdt).toBe(4500);
    expect(data.actionTaken).toContain("Logged ৳4500 BDT order");
  });

  it("handles Shopify checkouts/abandon and triggers WhatsApp recovery", async () => {
    const request = new NextRequest("http://localhost:3000/api/twin/integrations/webhook", {
      method: "POST",
      headers: {
        "x-shopify-topic": "checkouts/abandon",
      },
      body: JSON.stringify({
        id: "chk_8819",
        customer: {
          name: "Farhana Islam",
          phone: "01811223344",
        },
        total_price: "2200",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.source).toBe("shopify");
    expect(data.actionTaken).toContain("Triggered 1-Tap WhatsApp abandoned cart recovery");
  });
});
