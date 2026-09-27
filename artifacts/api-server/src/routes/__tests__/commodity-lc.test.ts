import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Emporium Commodity Ticker & Inland LC Engine Suite", () => {
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

  it("GET /api/wholesale/commodities/tickers returns real-time market tickers", async () => {
    const res = await fetch(`${baseUrl}/api/wholesale/commodities/tickers`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.tickers.length).toBeGreaterThanOrEqual(4);
    expect(json.tickers[0].marketLocation).toBeDefined();
  });

  it("POST /api/wholesale/inland-lc/issue issues compliant Inland LC with escrow seal", async () => {
    const res = await fetch(`${baseUrl}/api/wholesale/inland-lc/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerName: "Apex Retailers Ltd",
        buyerPhone: "01711998877",
        sellerName: "Chawkbazar Packaging Syndicate",
        sellerPhone: "01811554433",
        commodityName: "Tamper-Evident Poly Courier Flyer (Large)",
        quantity: 50, // 50 packs
        unitPriceBDT: 3200,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.inlandLC.lcNumber).toMatch(/^ILC-/);
    expect(json.inlandLC.totalEscrowAmountBDT).toBe(50 * 3200);
    expect(json.inlandLC.escrowStatus).toBe("funds_locked");
    expect(json.inlandLC.sha256LienSeal).toHaveLength(64);
  });
});
