import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("Telegram Founder Bot Webhook Route (POST /api/twin/integrations/telegram)", () => {
  it("processes /sales command and returns bKash P&L summary", async () => {
    const request = new NextRequest("http://localhost:3000/api/twin/integrations/telegram", {
      method: "POST",
      body: JSON.stringify({
        message: {
          chat: { id: "chat_99" },
          from: { first_name: "Tanvir" },
          text: "/sales",
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.replyMessage).toContain("Total bKash: ৳38,500 BDT");
  });

  it("handles /leads and /deploy commands correctly", async () => {
    const request = new NextRequest("http://localhost:3000/api/twin/integrations/telegram", {
      method: "POST",
      body: JSON.stringify({
        message: {
          chat: { id: "chat_99" },
          text: "/leads",
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.replyMessage).toContain("3 Hot WhatsApp replies pending");
  });
});
