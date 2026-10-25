import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { capabilityLeashEngine } from "../../lib/security/capability-leash";

describe("Pillar 2: Cryptographic Capability Attenuation & Spend Leash (Macaroons)", { timeout: 25000 }, () => {
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

  it("mints a root capability token with spend budget and district boundary", async () => {
    const res = await fetch(`${baseUrl}/api/v1/security/leash/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scopes: ["mfs:disburse", "logistics:book", "vat:issue"],
        maxAmountBdt: 10000,
        districts: ["Dhaka", "Chittagong"],
        validUntilEpochMs: Date.now() + 3600 * 1000,
        delegatee: "finance_twin",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toContain("shothik_macaroon_v1.");
    expect(body.data.remainingBudgetBdt).toBe(10000);
    expect(body.data.parsed.caveats.length).toBe(5);
  });

  it("verifies a valid transaction against capability token", async () => {
    const mintRes = await fetch(`${baseUrl}/api/v1/security/leash/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scopes: ["mfs:disburse", "logistics:book"],
        maxAmountBdt: 5000,
        districts: ["Dhaka"],
      }),
    });
    const { token } = (await mintRes.json()).data;

    const verifyRes = await fetch(`${baseUrl}/api/v1/security/leash/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        actionScope: "logistics:book",
        amountBdt: 1500,
        district: "Dhaka",
      }),
    });

    expect(verifyRes.status).toBe(200);
    const body = await verifyRes.json();
    expect(body.success).toBe(true);
    expect(body.data.valid).toBe(true);
    expect(body.data.code).toBe("VALID");
    expect(body.data.remainingBudgetBdt).toBe(5000);
  });

  it("rejects unauthorized action scope", async () => {
    const mintRes = await fetch(`${baseUrl}/api/v1/security/leash/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scopes: ["logistics:book"],
        maxAmountBdt: 2000,
      }),
    });
    const { token } = (await mintRes.json()).data;

    const verifyRes = await fetch(`${baseUrl}/api/v1/security/leash/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        actionScope: "mfs:disburse", // Unauthorized!
        amountBdt: 500,
      }),
    });

    expect(verifyRes.status).toBe(403);
    const body = await verifyRes.json();
    expect(body.success).toBe(false);
    expect(body.data.code).toBe("SCOPE_UNAUTHORIZED");
  });

  it("rejects transaction outside permitted geographical district", async () => {
    const mintRes = await fetch(`${baseUrl}/api/v1/security/leash/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scopes: ["logistics:book"],
        maxAmountBdt: 3000,
        districts: ["Dhaka", "Narayanganj"],
      }),
    });
    const { token } = (await mintRes.json()).data;

    const verifyRes = await fetch(`${baseUrl}/api/v1/security/leash/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        actionScope: "logistics:book",
        district: "Sylhet", // Unauthorized district
      }),
    });

    expect(verifyRes.status).toBe(403);
    const body = await verifyRes.json();
    expect(body.data.code).toBe("DISTRICT_UNAUTHORIZED");
  });

  it("attenuates token to narrower bounds and verifies enforced restriction", async () => {
    // 1. Root token has 10,000 BDT and ["mfs:disburse", "logistics:book"]
    const root = capabilityLeashEngine.mintRootLeash({
      scopes: ["mfs:disburse", "logistics:book"],
      maxAmountBdt: 10000,
      districts: ["Dhaka"],
    });

    // 2. Attenuate offline: restrict to max 1,500 BDT and ONLY "logistics:book"
    const attRes = await fetch(`${baseUrl}/api/v1/security/leash/attenuate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: root.token,
        addCaveats: [
          { type: "scope", key: "scopes", value: ["logistics:book"] },
          { type: "max_amount_bdt", key: "max_amount_bdt", value: 1500 },
        ],
      }),
    });

    expect(attRes.status).toBe(200);
    const attBody = await attRes.json();
    const attenuatedToken = attBody.data.token;

    // 3. logistics:book for 1,200 BDT must succeed
    const validCheck = capabilityLeashEngine.verifyLeash(attenuatedToken, {
      actionScope: "logistics:book",
      amountBdt: 1200,
      district: "Dhaka",
    });
    expect(validCheck.valid).toBe(true);

    // 4. mfs:disburse on attenuated token must be rejected
    const scopeCheck = capabilityLeashEngine.verifyLeash(attenuatedToken, {
      actionScope: "mfs:disburse",
      amountBdt: 500,
      district: "Dhaka",
    });
    expect(scopeCheck.valid).toBe(false);
    expect(scopeCheck.code).toBe("SCOPE_UNAUTHORIZED");

    // 5. logistics:book for 2,000 BDT exceeds attenuated 1,500 BDT limit
    const budgetCheck = capabilityLeashEngine.verifyLeash(attenuatedToken, {
      actionScope: "logistics:book",
      amountBdt: 2000,
      district: "Dhaka",
    });
    expect(budgetCheck.valid).toBe(false);
    expect(budgetCheck.code).toBe("BUDGET_EXCEEDED");
  });

  it("tracks cumulative spend and stops execution when budget runs dry", async () => {
    const root = capabilityLeashEngine.mintRootLeash({
      scopes: ["logistics:book"],
      maxAmountBdt: 2000,
    });

    // Spend 1,400 BDT
    const spendRes = await fetch(`${baseUrl}/api/v1/security/leash/spend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: root.token,
        amountBdt: 1400,
      }),
    });
    expect(spendRes.status).toBe(200);
    const spendBody = await spendRes.json();
    expect(spendBody.data.remainingBudgetBdt).toBe(600);

    // Verify 500 BDT works (1400 + 500 <= 2000)
    const check1 = capabilityLeashEngine.verifyLeash(root.token, {
      actionScope: "logistics:book",
      amountBdt: 500,
    });
    expect(check1.valid).toBe(true);
    expect(check1.remainingBudgetBdt).toBe(600);

    // Verify 700 BDT is rejected (1400 + 700 > 2000)
    const check2 = capabilityLeashEngine.verifyLeash(root.token, {
      actionScope: "logistics:book",
      amountBdt: 700,
    });
    expect(check2.valid).toBe(false);
    expect(check2.code).toBe("BUDGET_EXCEEDED");
  });

  it("detects cryptographic tampering and rejects token", async () => {
    const root = capabilityLeashEngine.mintRootLeash({
      scopes: ["mfs:disburse"],
      maxAmountBdt: 500,
    });

    // 1. Tamper with signature inside valid token structure
    const parsed = capabilityLeashEngine.decodeToken(root.token);
    const tamperedParsed = { ...parsed, signature: parsed.signature.slice(0, -4) + "0000" };
    const tamperedToken = capabilityLeashEngine.encodeToken(tamperedParsed);

    const verifyCheck = capabilityLeashEngine.verifyLeash(tamperedToken, {
      actionScope: "mfs:disburse",
      amountBdt: 100,
    });
    expect(verifyCheck.valid).toBe(false);
    expect(verifyCheck.code).toBe("INVALID_SIGNATURE");

    // 2. Corrupt token base64 format entirely
    const malformedCheck = capabilityLeashEngine.verifyLeash("shothik_macaroon_v1.invalid_base64_json!@#$", {
      actionScope: "mfs:disburse",
      amountBdt: 100,
    });
    expect(malformedCheck.valid).toBe(false);
    expect(malformedCheck.code).toBe("MALFORMED_TOKEN");
  });
});
