import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Protected Action 2FA / OTP Verification Gate Suite", () => {
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

  it("POST /api/protected-actions/initiate initiates an action and returns an OTP challenge", async () => {
    const res = await fetch(`${baseUrl}/api/protected-actions/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType: "bkash_payout",
        actorPhone: "+8801711223344",
        payload: { amountBDT: 150000, recipient: "01711223344" },
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.actionId).toMatch(/^ACT-/);
    expect(json.simulatedOtp).toHaveLength(6);
  });

  it("POST /api/protected-actions/verify verifies valid OTP and generates SHA-256 seal", async () => {
    // 1. Initiate
    const initRes = await fetch(`${baseUrl}/api/protected-actions/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType: "po_wholesale",
        actorPhone: "+8801811223344",
        payload: { poId: "PO-991", totalBDT: 85000 },
      }),
    });
    const initJson = await initRes.json();
    const { actionId, simulatedOtp } = initJson;

    // 2. Reject incorrect OTP
    const badVerifyRes = await fetch(`${baseUrl}/api/protected-actions/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionId,
        otpCode: "000000",
      }),
    });
    expect(badVerifyRes.status).toBe(400);

    // 3. Accept correct OTP
    const goodVerifyRes = await fetch(`${baseUrl}/api/protected-actions/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionId,
        otpCode: simulatedOtp,
      }),
    });
    expect(goodVerifyRes.status).toBe(200);
    const goodVerifyJson = await goodVerifyRes.json();
    expect(goodVerifyJson.success).toBe(true);
    expect(goodVerifyJson.auditSealSha256).toHaveLength(64);
  });
});
