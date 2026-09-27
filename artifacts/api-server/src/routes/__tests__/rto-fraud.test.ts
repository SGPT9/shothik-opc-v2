import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Slice 77: Autonomous Steadfast & Pathao RTO Prediction & Fraud Blacklist Sync Routes", () => {
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

  it("POST /api/v1/logistics/fraud/check returns multi-carrier delivery metrics and operator", async () => {
    const res = await fetch(`${baseUrl}/api/v1/logistics/fraud/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "01711002233" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.normalizedPhone).toBe("01711002233");
    expect(data.operator).toBe("Grameenphone");
    expect(data.carrierHistory.length).toBeGreaterThanOrEqual(3);
    expect(data.overallDsrPercent).toBeGreaterThanOrEqual(80);
  });

  it("POST /api/v1/logistics/rto/predict evaluates COD basket, tier and advance requirement", async () => {
    const res = await fetch(`${baseUrl}/api/v1/logistics/rto/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "01899112233",
        codAmountBdt: 3600,
        district: "Dhaka",
        deliveryAddress: "Sector 11, Uttara, Dhaka",
        orderRef: "ORD_PREDICT_99",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.riskTier).toBe("TIER_HIGH_RISK");
    expect(data.advancePolicy.requiresAdvance).toBe(true);
    expect(data.advancePolicy.recommendedAdvanceAmountBdt).toBe(80); // Inside Dhaka
    expect(data.advancePolicy.paymentLink).toContain("ORD_PREDICT_99");
  });

  it("POST /api/v1/logistics/fraud/report and GET /api/v1/logistics/fraud/blacklist", async () => {
    const testPhone = "01977665544";

    // 1. Report fraud
    const reportRes = await fetch(`${baseUrl}/api/v1/logistics/fraud/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: testPhone,
        category: "PHONE_SWITCHED_OFF",
        reporterMerchant: "Sylhet Organic Honey",
        orderRef: "ORD_SYL_001",
        notes: "Customer confirmed on phone but switched off during Pathao rider arrival.",
      }),
    });

    expect(reportRes.status).toBe(201);
    const reportData = await reportRes.json();
    expect(reportData.success).toBe(true);
    expect(reportData.report.phone).toBe(testPhone);

    // 2. Query blacklist
    const listRes = await fetch(`${baseUrl}/api/v1/logistics/fraud/blacklist`);
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.success).toBe(true);
    expect(listData.blacklist.some((b: any) => b.phone === testPhone)).toBe(true);

    // 3. Remove / whitelist
    const delRes = await fetch(`${baseUrl}/api/v1/logistics/fraud/blacklist/${testPhone}`, {
      method: "DELETE",
    });
    expect(delRes.status).toBe(200);
    const delData = await delRes.json();
    expect(delData.success).toBe(true);
  });

  it("POST /api/v1/logistics/rto/advance-policy generates WhatsApp copy and payment token", async () => {
    const res = await fetch(`${baseUrl}/api/v1/logistics/rto/advance-policy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "01899112233",
        codAmountBdt: 5500,
        district: "Chittagong",
        orderRef: "ORD_ADV_44",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.advancePolicy.requiresAdvance).toBe(true);
    expect(data.advancePolicy.recommendedAdvanceAmountBdt).toBe(150); // Outside Dhaka
    expect(data.advancePolicy.whatsappTemplate).toContain("বিকাশ/নগদে প্রদান করতে হবে");
  });
});
