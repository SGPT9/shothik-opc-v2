import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { capabilityLeashEngine } from "../../lib/security/capability-leash";

describe("Bridge 4: Cryptographic Capability Leashes to MFS Payout & Logistics Booking Bridge", { timeout: 25000 }, () => {
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

  it("authorizes MFS creator payout when bounded by a valid spend leash token", async () => {
    // 1. Mint a leash allowing mfs_disburse up to 5,000 BDT
    const { token } = capabilityLeashEngine.mintRootLeash({
      scopes: ["mfs_disburse"],
      maxAmountBdt: 5000,
    });

    const res = await fetch(`${baseUrl}/api/v1/mfs/payout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-capability-token": token,
      },
      body: JSON.stringify({
        userId: "usr_merchant_leash_01",
        payoutAmountBdt: 1500,
        mfsProvider: "bkash",
        walletNumber: "01712345678",
        creatorNote: "Leashed automated payout",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe("DISBURSED");
    expect(body.netDisbursedBdt).toBe(1350); // 1500 - 10% TDS (150)
  });

  it("blocks MFS creator payout with 403 when spend exceeds leash budget limit", async () => {
    // 1. Mint a leash with strict 1,000 BDT ceiling
    const { token } = capabilityLeashEngine.mintRootLeash({
      scopes: ["mfs_disburse"],
      maxAmountBdt: 1000,
    });

    // 2. Attempt payout for 2,500 BDT (> 1,000)
    const res = await fetch(`${baseUrl}/api/v1/mfs/payout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-capability-token": token,
      },
      body: JSON.stringify({
        userId: "usr_merchant_leash_02",
        payoutAmountBdt: 2500,
        mfsProvider: "bkash",
        walletNumber: "01712345678",
      }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("BUDGET_EXCEEDED");
    expect(body.error).toContain("exceeds remaining leash budget");
  });

  it("enforces district spatial boundaries on logistics parcel bookings", async () => {
    // 1. Mint a leash restricted specifically to Dhaka district
    const { token } = capabilityLeashEngine.mintRootLeash({
      scopes: ["logistics_book"],
      maxAmountBdt: 1000,
      districts: ["Dhaka"],
    });

    // 2. Attempt booking in Sylhet -> should be rejected with 403 DISTRICT_UNAUTHORIZED
    const rejectRes = await fetch(`${baseUrl}/api/v1/logistics/steadfast/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-capability-token": token,
      },
      body: JSON.stringify({
        provider: "steadfast",
        order: {
          source: "whatsapp_dm",
          customerName: "Rahim Uddin",
          customerPhone: "01712345678",
          deliveryAddress: "Zindabazar, Sylhet Sadar",
          city: "Sylhet",
          codAmountBdt: 1200,
          items: [
            { sku: "SKU_BOOK_01", title: "Shothik Guide", quantity: 1, unitPriceBdt: 1200 },
          ],
        },
      }),
    });

    expect(rejectRes.status).toBe(403);
    const rejectBody = await rejectRes.json();
    expect(rejectBody.success).toBe(false);
    expect(rejectBody.code).toBe("DISTRICT_UNAUTHORIZED");
    expect(rejectBody.error).toContain("outside permitted operational territory");

    // 3. Attempt booking in Dhaka -> should be approved with 200
    const acceptRes = await fetch(`${baseUrl}/api/v1/logistics/steadfast/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-capability-token": token,
      },
      body: JSON.stringify({
        provider: "steadfast",
        order: {
          source: "whatsapp_dm",
          customerName: "Rahim Uddin",
          customerPhone: "01712345678",
          deliveryAddress: "Dhanmondi 27, Dhaka",
          city: "Dhaka",
          codAmountBdt: 1200,
          items: [
            { sku: "SKU_BOOK_01", title: "Shothik Guide", quantity: 1, unitPriceBdt: 1200 },
          ],
        },
      }),
    });

    expect(acceptRes.status).toBe(200);
    const acceptBody = await acceptRes.json();
    expect(acceptBody.success).toBe(true);
    expect(acceptBody.consignmentId).toBeDefined();
    expect(acceptBody.trackingCode).toBeDefined();
  });
});
