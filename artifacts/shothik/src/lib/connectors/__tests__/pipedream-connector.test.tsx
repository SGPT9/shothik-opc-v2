/**
 * PipedreamConnector Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { pipedreamConnector } from "../pipedream-connector";
import crypto from "crypto";

describe("PipedreamConnector Service", () => {
  const secret = "shothik_pipedream_sec_99812";
  const payloadStr = JSON.stringify({ eventId: "evt_123", customerName: "Test" });
  const validSignature = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");

  it("verifies HMAC-SHA256 signature correctly", () => {
    const isValid = pipedreamConnector.verifySignature(payloadStr, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it("rejects invalid HMAC-SHA256 signature", () => {
    const isValid = pipedreamConnector.verifySignature(payloadStr, "invalid_sig", secret);
    expect(isValid).toBe(false);
  });

  it("processes valid event and returns bKash link + Steadfast code", async () => {
    const res = await pipedreamConnector.processEvent({
      eventId: "evt_771",
      source: "facebook_live",
      merchantId: "mch_01",
      customerName: "সুলতানা পারভীন",
      phone: "01712345678",
      address: "ঢাকা",
      product: "শাড়ি",
      quantity: 1,
      priceBdt: 3500,
      timestamp: new Date().toISOString(),
    });

    expect(res.success).toBe(true);
    expect(res.bkashLink).toContain("bKash");
    expect(res.steadfastCode).toContain("BD_ST_");
  });

  it("logs invalid phone number event to DLQ", async () => {
    const res = await pipedreamConnector.processEvent({
      eventId: "evt_772",
      source: "facebook_live",
      merchantId: "mch_01",
      customerName: "Unknown",
      phone: "123", // invalid
      address: "Unknown",
      product: "Sample",
      quantity: 1,
      priceBdt: 500,
      timestamp: new Date().toISOString(),
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("INVALID_PHONE_NUMBER");
    expect(res.dlqLogged).toBe(true);
  });
});
