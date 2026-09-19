import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { OutboundCallingEngine } from "../../lib/telephony/outbound-calling-engine.js";
import telephonyRouter from "../telephony.js";

describe("Slice 29: Autonomous AI Outbound Calling & COD Order Verification Hub", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", telephonyRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // 1. Phone number validation and E.164 conversion
  it("validates and formats Bangladeshi phone numbers correctly", () => {
    expect(OutboundCallingEngine.validateAndFormatPhone("01711223344")).toBe("+8801711223344");
    expect(OutboundCallingEngine.validateAndFormatPhone("+8801811223344")).toBe("+8801811223344");
    expect(OutboundCallingEngine.validateAndFormatPhone("8801911223344")).toBe("+8801911223344");
    expect(OutboundCallingEngine.validateAndFormatPhone("12345")).toBeNull();
    expect(OutboundCallingEngine.validateAndFormatPhone("")).toBeNull();
  });

  // 2. BTRC Operating Window Check
  it("evaluates BTRC calling window and statutory notices", () => {
    // 10:00 UTC = 16:00 BST (within 09:00 - 20:00 BST)
    const daytime = new Date("2026-09-18T10:00:00Z");
    expect(OutboundCallingEngine.isWithinBtrcOperatingWindow(daytime)).toBe(true);

    // 18:00 UTC = 00:00 BST midnight (outside window)
    const midnight = new Date("2026-09-18T18:00:00Z");
    expect(OutboundCallingEngine.isWithinBtrcOperatingWindow(midnight)).toBe(false);
  });

  // 3. POST /api/v1/telephony/outbound/initiate
  it("POST /api/v1/telephony/outbound/initiate creates a new call session with statutory recording notice", async () => {
    const res = await fetch(`${baseUrl}/api/v1/telephony/outbound/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ord_cod_test_101",
        customerPhone: "01755667788",
        customerName: "Kamal Uddin",
        itemsSummary: "Semi-Fitted Panjabi (Maroon, L)",
        itemCount: 1,
        grandTotalBdt: 1850,
        deliveryAddress: "Road 11, Banani, Dhaka",
        dialect: "dhakaiya",
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.session.callId).toMatch(/^call_out_/);
    expect(body.session.customerPhone).toBe("+8801755667788");
    expect(body.session.dialogState).toBe("ORDER_AND_AMOUNT_CONFIRM");
    expect(body.session.statutoryNoticePlayed).toBe(true);
    expect(body.session.transcript[0].text).toContain("রেকর্ড করা হচ্ছে");
  });

  // 4. Affirmative speech turn -> CONFIRMED & Steadfast Auto-booking
  it("POST /api/v1/telephony/outbound/transcribe-turn confirms order and books Steadfast courier", async () => {
    // Initiate first
    const init = OutboundCallingEngine.initiateCall({
      orderId: "ord_affirm_test",
      customerPhone: "01855667788",
      customerName: "Rashid Ali",
      itemsSummary: "Dhakai Jamdani Saree",
      itemCount: 1,
      grandTotalBdt: 3860,
      deliveryAddress: "Mirpur 10, Dhaka",
    });

    const res = await fetch(`${baseUrl}/api/v1/telephony/outbound/transcribe-turn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callId: init.callId,
        customerSpeechText: "Ji bhai, order confirm korlam. Mirpur e pathaye den.",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.isTerminated).toBe(true);
    expect(body.session.disposition).toBe("CONFIRMED");
    expect(body.session.callStatus).toBe("completed");
    expect(body.session.courierTrackingCode).toMatch(/^BD_STEADFAST_/);
    expect(body.agentReply).toContain("Steadfast Courier");
  });

  // 5. Cancellation speech turn -> CANCELLED
  it("POST /api/v1/telephony/outbound/transcribe-turn handles customer cancellation", async () => {
    const init = OutboundCallingEngine.initiateCall({
      orderId: "ord_cancel_test",
      customerPhone: "01955667788",
      customerName: "Abul Kalam",
      itemsSummary: "Leather Wallet",
      itemCount: 1,
      grandTotalBdt: 1250,
      deliveryAddress: "Agrabad, Chittagong",
      dialect: "chatgaya",
    });

    const res = await fetch(`${baseUrl}/api/v1/telephony/outbound/transcribe-turn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callId: init.callId,
        customerSpeechText: "Bhai bhul kore click porse, order cancel koren, lagbe na.",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.session.disposition).toBe("CANCELLED");
    expect(body.session.callStatus).toBe("completed");
    expect(body.session.courierTrackingCode).toBeUndefined();
  });

  // 6. Reschedule / Busy turn -> RETRY_SCHEDULED with exponential backoff
  it("POST /api/v1/telephony/outbound/transcribe-turn schedules retry on busy response", async () => {
    const init = OutboundCallingEngine.initiateCall({
      orderId: "ord_busy_test",
      customerPhone: "01655667788",
      customerName: "Sadia Rahman",
      itemsSummary: "Thesis Monograph",
      itemCount: 1,
      grandTotalBdt: 710,
      deliveryAddress: "Dhanmondi, Dhaka",
    });

    const res = await fetch(`${baseUrl}/api/v1/telephony/outbound/transcribe-turn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callId: init.callId,
        customerSpeechText: "Ami meeting e busy achi, pore phone den.",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.session.disposition).toBe("RETRY_SCHEDULED");
    expect(body.session.callStatus).toBe("queued");
    expect(body.session.attemptNumber).toBe(2);
    expect(body.session.nextRetryTimestamp).toBeGreaterThan(Date.now());
  });

  // 7. GET /api/v1/telephony/outbound/sessions
  it("GET /api/v1/telephony/outbound/sessions lists all call logs and transcripts", async () => {
    const res = await fetch(`${baseUrl}/api/v1/telephony/outbound/sessions`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.sessions)).toBe(true);
  });

  // 8. POST /api/v1/telephony/outbound/override (Supervised Autonomy Manual Override)
  it("POST /api/v1/telephony/outbound/override allows merchant manual dispatch approval", async () => {
    const init = OutboundCallingEngine.initiateCall({
      orderId: "ord_high_val_test",
      customerPhone: "01799887766",
      customerName: "Farid VIP",
      itemsSummary: "5x Premium Jamdani Sarees",
      itemCount: 5,
      grandTotalBdt: 19000,
      deliveryAddress: "Gulshan 2, Dhaka",
    });

    expect(init.isSupervised).toBe(true);

    const res = await fetch(`${baseUrl}/api/v1/telephony/outbound/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callId: init.callId,
        action: "APPROVE_DISPATCH",
        notes: "Customer verified directly via WhatsApp VIP chat",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.session.disposition).toBe("CONFIRMED");
    expect(body.session.courierTrackingCode).toMatch(/^BD_STEADFAST_/);
  });
});
