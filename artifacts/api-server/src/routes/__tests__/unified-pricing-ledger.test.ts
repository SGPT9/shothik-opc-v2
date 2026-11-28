import { describe, it, expect } from "vitest";
import express from "express";
import subscriptionsRouter, { OUTCOME_PASSES, DEFAULT_TIER_LIMITS } from "../subscriptions";
import mfsRouter from "../mfs";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", mfsRouter);
  app.use("/api", subscriptionsRouter);
  app.use(mfsRouter);
  app.use(subscriptionsRouter);
  return app;
}

describe("Unified Pricing, Outcome Passes & Backend Ledger", () => {
  it("exposes all 5 Done-For-You Outcome Micro-Passes including Boi Mela and Audiobook passes", () => {
    expect(Object.keys(OUTCOME_PASSES)).toEqual(
      expect.arrayContaining([
        "THESIS_PLAGIARISM_PASS",
        "AUDIOBOOK_BOOKTOK_PASS",
        "BOI_MELA_PRINT_PASS",
        "PROJECT_VENTURE_PASS",
        "F_COMMERCE_MONTHLY_PASS",
      ])
    );
    expect(OUTCOME_PASSES.BOI_MELA_PRINT_PASS.priceBdt).toBe(199);
    expect(OUTCOME_PASSES.AUDIOBOOK_BOOKTOK_PASS.priceBdt).toBe(149);
  });

  it("defines DEFAULT_TIER_LIMITS for all canonical tiers and aliases without downgrading student or researcher to free", () => {
    expect(DEFAULT_TIER_LIMITS.student.plagiarismChecks).toBe(30);
    expect(DEFAULT_TIER_LIMITS["starter-pass"].plagiarismChecks).toBe(30);
    expect(DEFAULT_TIER_LIMITS.researcher.plagiarismChecks).toBe(100);
    expect(DEFAULT_TIER_LIMITS["pro-operator"].grammarChecks).toBe(-1);
    expect(DEFAULT_TIER_LIMITS["venture-twin"].plagiarismChecks).toBe(-1);
    expect(DEFAULT_TIER_LIMITS["agency-scale"].plagiarismChecks).toBe(-1);
  });

  it("returns all 4 public packages with monthly and yearly plans from GET /api/v1/packages/public", async () => {
    const app = createTestApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/packages/public`);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.map((p: any) => p._id)).toEqual([
        "starter-pass",
        "pro-operator",
        "venture-twin",
        "agency-scale",
      ]);
      expect(body.data[3].plans.length).toBeGreaterThanOrEqual(2);
    } finally {
      server.close();
    }
  });

  it("persists credits across passes:purchase and GET /v1/subscriptions/credits and supports Express stripe checkout", async () => {
    const app = createTestApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;
    const testUser = `usr_test_${Date.now()}`;
    try {
      const passRes = await fetch(`http://127.0.0.1:${port}/api/v1/subscriptions/passes:purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": testUser },
        body: JSON.stringify({ userId: testUser, passId: "BOI_MELA_PRINT_PASS" }),
      });
      const passBody = await passRes.json();
      expect(passRes.status).toBe(200);
      expect(passBody.newCreditsBalance).toBe(700);

      const credRes = await fetch(`http://127.0.0.1:${port}/api/v1/subscriptions/credits`, {
        headers: { "x-user-id": testUser },
      });
      const credBody = await credRes.json();
      expect(credBody.creditsBalance).toBe(700);

      const stripeRes = await fetch(`http://127.0.0.1:${port}/api/stripe/subscription/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "researcher", interval: "year", currency: "usd" }),
      });
      const stripeBody = await stripeRes.json();
      expect(stripeRes.status).toBe(200);
      expect(stripeBody.checkoutUrl).toContain("/pricing/checkout?packageId=pro-operator&planId=yearly");
    } finally {
      server.close();
    }
  });

  it("handles both strict schema and flexible TwinRevenueLedger payloads on POST /api/v1/mfs/verify-trx", async () => {
    const app = createTestApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;
    try {
      const strictRes = await fetch(`http://127.0.0.1:${port}/api/v1/mfs/verify-trx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: "STRICT889900",
          provider: "bkash",
          senderMobileNumber: "01711223344",
          tier: "micro_100_bdt",
          amountBdt: 100,
          userId: "usr_strict_test",
        }),
      });
      const strictBody = await strictRes.json();
      expect(strictRes.status).toBe(200);
      expect(strictBody.creditedAmount).toBe(80);

      const flexRes = await fetch(`http://127.0.0.1:${port}/api/v1/mfs/verify-trx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: "FLEX8899001",
          amountBdt: 500,
          provider: "nagad",
          companyName: "VerifiQ",
        }),
      });
      const flexBody = await flexRes.json();
      expect(flexRes.status).toBe(200);
      expect(flexBody.verified).toBe(true);
      expect(flexBody.creditUpdate.addedCredits).toBe(50);
    } finally {
      server.close();
    }
  });
});
