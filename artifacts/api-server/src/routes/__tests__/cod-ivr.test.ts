import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { CodIvrEngine } from "../../lib/ivr/cod-ivr-engine.js";

describe("Slice 59: Autonomous Banglish Voice IVR, COD Verification & Courier Return Minimization", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
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

  describe("CodIvrEngine Unit Logic", () => {
    it("generates natural Banglish voice IVR dialogue plan and fallback WhatsApp script", () => {
      const plan = CodIvrEngine.generateIVRCallPlan({
        orderId: "ORD-9912",
        customerName: "Rahim Uddin",
        customerPhone: "+8801712345678",
        items: [{ sku: "TSHIRT-01", name: "Cotton Polo", quantity: 2, unitPrice: 650 }],
        codAmount: 1300,
        rawAddress: "House 45, Road 7, Block D, Mirpur 10, Dhaka 1216",
        dialect: "dhaka_standard",
      });

      expect(plan.callId).toMatch(/^IVR-/);
      expect(plan.greetingScript).toContain("Rahim Uddin");
      expect(plan.greetingScript).toContain("1300");
      expect(plan.dialogueSteps.length).toBeGreaterThanOrEqual(2);
      expect(plan.dialogueSteps[0].dtmfOptions?.["1"]).toBe("CONFIRM_ORDER");
      expect(plan.fallbackWhatsAppMessage).toContain("ORD-9912");
    });

    it("evaluates RTO fraud risk accurately for safe vs high-risk orders", () => {
      // Safe order
      const safeAssessment = CodIvrEngine.assessRTORisk({
        orderId: "ORD-SAFE-1",
        customerName: "Tanvir Ahmed",
        customerPhone: "01819998877",
        items: [{ sku: "BOOK-01", name: "Python Handbook", quantity: 1, unitPrice: 450 }],
        codAmount: 450,
        rawAddress: "Flat 4A, House 12, Road 4, Dhanmondi, Dhaka",
        pastDeliverySuccessCount: 5,
        pastDeliveryReturnCount: 0,
      });

      expect(safeAssessment.riskTier).toBe("LOW");
      expect(safeAssessment.requiresPartialAdvancePayment).toBe(false);

      // Risky order with invalid phone, vague address, and high COD amount
      const riskyAssessment = CodIvrEngine.assessRTORisk({
        orderId: "ORD-RISK-1",
        customerName: "Anonymous",
        customerPhone: "12345", // Invalid BD format
        items: [{ sku: "GOLD-01", name: "Smart Watch Ultra", quantity: 3, unitPrice: 3500 }],
        codAmount: 10500, // High COD
        rawAddress: "near station", // Vague address
        pastDeliverySuccessCount: 0,
        pastDeliveryReturnCount: 4, // 100% past return rate
      });

      expect(["HIGH", "BLOCKED"]).toContain(riskyAssessment.riskTier);
      expect(riskyAssessment.riskScore).toBeGreaterThanOrEqual(50);
      expect(riskyAssessment.requiresPartialAdvancePayment).toBe(true);
    });

    it("normalizes unstructured Bangladeshi addresses into structured zones and rates", () => {
      // Inside Dhaka
      const dhakaAddress = CodIvrEngine.parseAddress("Flat 3B, House 15, Road 27, Gulshan 1, Dhaka 1212");
      expect(dhakaAddress.district).toBe("Dhaka");
      expect(dhakaAddress.thana).toBe("Gulshan");
      expect(dhakaAddress.zoneType).toBe("inside_dhaka");
      expect(dhakaAddress.standardDeliveryChargeBDT).toBe(70);

      // Outside Dhaka
      const chittagongAddress = CodIvrEngine.parseAddress("Shop 4, GEC Circle, Agrabad, Chittagong 4000");
      expect(chittagongAddress.district).toBe("Chittagong");
      expect(chittagongAddress.zoneType).toBe("outside_dhaka");
      expect(chittagongAddress.standardDeliveryChargeBDT).toBe(130);
    });

    it("dispatches courier consignment with SHA-256 verification hash seal", () => {
      const consignment = CodIvrEngine.dispatchCourierConsignment(
        {
          orderId: "ORD-1002",
          customerName: "Nusrat Jahan",
          customerPhone: "01755443322",
          items: [{ sku: "DRESS-01", name: "Lawn Kurti", quantity: 1, unitPrice: 1800 }],
          codAmount: 1800,
          rawAddress: "House 10, Road 5, Uttara Sector 3, Dhaka",
        },
        "steadfast",
        "voice_ivr"
      );

      expect(consignment.consignmentId).toMatch(/^CNG-STEADFAST-/);
      expect(consignment.status).toBe("booked_ready_for_pickup");
      expect(consignment.verificationHashSha256).toHaveLength(64);
    });
  });

  describe("API Endpoints", () => {
    it("POST /api/ivr/generate-plan returns IVR dialogue plan", async () => {
      const res = await fetch(`${baseUrl}/api/ivr/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORD-API-01",
          customerName: "Sakib Al Hasan",
          customerPhone: "01711223344",
          codAmount: 2500,
          rawAddress: "Banani DOHS, Dhaka",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.plan.orderId).toBe("ORD-API-01");
      expect(json.plan.dialogueSteps.length).toBeGreaterThanOrEqual(2);
    });

    it("POST /api/ivr/rto-risk evaluates fraud risk score", async () => {
      const res = await fetch(`${baseUrl}/api/ivr/rto-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORD-API-02",
          customerPhone: "01999888777",
          codAmount: 1200,
          rawAddress: "Sector 7, Uttara, Dhaka",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.assessment.riskScore).toBeDefined();
    });

    it("POST /api/ivr/parse-address extracts structured district and thana", async () => {
      const res = await fetch(`${baseUrl}/api/ivr/parse-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawAddress: "House 12, Road 4, Dhanmondi, Dhaka 1205",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.parsedAddress.district).toBe("Dhaka");
      expect(json.parsedAddress.thana).toBe("Dhanmondi");
    });

    it("POST /api/ivr/dispatch-courier returns booked consignment with seal", async () => {
      const res = await fetch(`${baseUrl}/api/ivr/dispatch-courier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            orderId: "ORD-API-03",
            customerName: "Ayesha Siddiqua",
            customerPhone: "01811223344",
            codAmount: 1500,
            rawAddress: "GEC Circle, Chittagong",
          },
          courierProvider: "steadfast",
          confirmedBy: "voice_ivr",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.consignment.trackingCode).toBeDefined();
      expect(json.consignment.verificationHashSha256).toHaveLength(64);
    });
  });
});
