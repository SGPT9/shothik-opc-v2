import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { steadfastWebhookGuard, bkashWebhookGuard } from "../../middleware/webhook-security.js";

describe("Webhook HMAC Security & Idempotency Middleware", () => {
  let app: express.Express;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    app.post("/webhooks/steadfast", steadfastWebhookGuard, (req, res) => {
      res.json({ success: true, processed: true, consignmentId: req.body.consignmentId });
    });

    app.post("/webhooks/bkash", bkashWebhookGuard, (req, res) => {
      res.json({ success: true, trxId: req.body.trxId });
    });

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

  it("rejects webhook requests missing the signature header with 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/webhooks/steadfast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consignmentId: "CNG-12345", status: "delivered" }),
    });

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Missing required signature header");
  });

  it("rejects webhook requests with forged or invalid HMAC signature with 401", async () => {
    const res = await fetch(`${baseUrl}/webhooks/steadfast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-steadfast-signature": "forged_invalid_signature_hash",
      },
      body: JSON.stringify({ consignmentId: "CNG-12345", status: "delivered" }),
    });

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Invalid webhook HMAC signature");
  });

  it("accepts legitimate webhook with valid HMAC signature and deduplicates replays", async () => {
    const payload = JSON.stringify({ consignmentId: "CNG-STEADFAST-990", status: "in_transit" });
    const validSignature = createHmac("sha256", "dev_steadfast_token_mock").update(payload).digest("hex");

    // First attempt -> processes successfully
    const res1 = await fetch(`${baseUrl}/webhooks/steadfast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-steadfast-signature": validSignature,
      },
      body: payload,
    });

    expect(res1.status).toBe(200);
    const json1 = await res1.json();
    expect(json1.success).toBe(true);
    expect(json1.processed).toBe(true);

    // Duplicate replay -> idempotent success response without reprocessing
    const res2 = await fetch(`${baseUrl}/webhooks/steadfast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-steadfast-signature": validSignature,
      },
      body: payload,
    });

    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.success).toBe(true);
    expect(json2.message).toContain("Duplicate webhook event already processed");
  });
});
