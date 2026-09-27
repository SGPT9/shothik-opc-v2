import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("NBR Mushak 6.3 Automated VAT Challan Suite", () => {
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

  it("POST /api/tax/mushak-63/validate-bin validates 9-digit and 13-digit NBR BINs", async () => {
    const validRes = await fetch(`${baseUrl}/api/tax/mushak-63/validate-bin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bin: "123456789-0101" }),
    });
    const validJson = await validRes.json();
    expect(validJson.isValid).toBe(true);

    const invalidRes = await fetch(`${baseUrl}/api/tax/mushak-63/validate-bin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bin: "1234" }),
    });
    const invalidJson = await invalidRes.json();
    expect(invalidJson.isValid).toBe(false);
  });

  it("POST /api/tax/mushak-63/generate generates itemized Challan, QR payload, and SHA-256 seal", async () => {
    const res = await fetch(`${baseUrl}/api/tax/mushak-63/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellerName: "Shothik Technologies BD Ltd",
        sellerBIN: "001234567-0101",
        sellerAddress: "Tejgaon I/A, Dhaka 1208",
        buyerName: "Square Pharmaceuticals Ltd",
        buyerBIN: "009876543-0202",
        buyerAddress: "Uttara, Dhaka",
        items: [
          {
            itemDescription: "Thermal Receipt Roll 80mm",
            hsCode: "4811.90.00",
            quantity: 500,
            unitPriceBDT: 120,
            vatRatePercent: 15,
          },
          {
            itemDescription: "Barcode Scanner Handheld USB",
            hsCode: "8471.60.00",
            quantity: 10,
            unitPriceBDT: 3500,
            vatRatePercent: 15,
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.challan.challanNumber).toMatch(/^MUSHAK-6.3-/);
    expect(json.challan.totalValueExcludingVatBDT).toBe(500 * 120 + 10 * 3500); // 60,000 + 35,000 = 95,000
    expect(json.challan.totalVATAmountBDT).toBe(Math.round(95000 * 0.15)); // 14,250
    expect(json.challan.qrCodePayload).toContain("NBR-VAT");
    expect(json.challan.nbrVerificationHashSha256).toHaveLength(64);
  });
});
