import { describe, it, expect } from "vitest";
import express from "express";
import { mushak66Router } from "../mushak-66.js";

const app = express();
app.use(express.json());
app.use("/api", mushak66Router);

describe("NBR Mushak 6.6 VDS Certificate API", () => {
  let server: any;
  let baseUrl: string;

  it("POST /api/tax/mushak-66/generate creates compliant VDS withholding certificates", async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    const payload = {
      withholdingEntityName: "Shothik Technologies Limited",
      withholdingEntityBin: "1234567890123",
      withholdingEntityAddress: "Gulshan-2, Dhaka-1212",
      supplierName: "Dhaka Cotton Mills",
      supplierBin: "9876543210987",
      supplierAddress: "Narayanganj BSCIC",
      taxPeriodMonthYear: "September-2026",
      items: [
        {
          itemDescription: "Raw Cotton Yarn 30/1 Combed",
          mushak63ChallanNo: "CH-63-2026-8812",
          challanIssueDate: "2026-09-20",
          totalInvoiceAmountBDT: 230000,
          vatAmountBDT: 30000,
          vdsRatePercent: 7.5,
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/tax/mushak-66/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.certificate.certificateNo).toMatch(/^MUSHAK66-/);
    expect(body.certificate.totalVdsDeductedBDT).toBe(15000); // 30000 * (7.5 / 15)
    expect(body.certificate.totalNetDisbursedBDT).toBe(215000); // 230000 - 15000
    expect(body.certificate.verificationSealSha256).toBeDefined();

    server.close();
  });
});
