import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { LiveSellingEngine } from "../../lib/live-selling/live-selling-engine.js";

describe("Live Selling & Comment-to-Courier Pipeline Suite", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    LiveSellingEngine._reset();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("parses Banglish live stream comment, extracts phone/size/color and auto-dispatches courier consignment", async () => {
    // 1. Create live session
    const sessionRes = await fetch(`${baseUrl}/api/v1/live-selling/sessions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionTitle: "Eid Silk Panjabi Live Sale",
        merchantId: "merch_dhk_01",
      }),
    });
    const sessionJson = await sessionRes.json();
    const sessionId = sessionJson.session.sessionId;

    // 2. Parse live customer comment with Banglish intent
    const commentRes = await fetch(`${baseUrl}/api/v1/live-selling/comments/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        authorName: "Tanvir Rahman",
        rawComment: "Panjabi black color 1 ta lagbe size L, 01712345678, Dhanmondi Dhaka COD",
      }),
    });
    expect(commentRes.status).toBe(201);
    const commentJson = await commentRes.json();
    expect(commentJson.success).toBe(true);
    expect(commentJson.order.extractedPhone).toBe("01712345678");
    const orderId = commentJson.order.orderId;

    // 3. Auto-dispatch to Steadfast logistics
    const dispatchRes = await fetch(`${baseUrl}/api/v1/live-selling/orders/auto-dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        courierProvider: "steadfast",
      }),
    });

    expect(dispatchRes.status).toBe(200);
    const dispatchJson = await dispatchRes.json();
    expect(dispatchJson.success).toBe(true);
    expect(dispatchJson.consignment.trackingCode).toBeDefined();
    expect(dispatchJson.consignment.verificationHashSha256).toHaveLength(64);
  });
});
