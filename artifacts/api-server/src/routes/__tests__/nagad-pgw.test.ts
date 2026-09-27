import { describe, it, expect } from "vitest";
import express from "express";
import mfsRouter from "../mfs.js";

const app = express();
app.use(express.json());
app.use("/api", mfsRouter);

describe("Nagad Sheba Direct PGW Integration", () => {
  let server: any;
  let baseUrl: string;

  it("POST /api/v1/mfs/nagad/initiate initializes a payment checkout session", async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    const res = await fetch(`${baseUrl}/api/v1/mfs/nagad/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ORD_NAGAD_TEST_01",
        amountBDT: 1500,
        customerPhone: "01812345678",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.paymentReferenceId).toMatch(/^NAGAD_/);
    expect(body.redirectUrl).toContain("payment.nagad.com.bd");
    expect(body.verificationSealSha256).toBeDefined();

    // Verify Payment
    const verifyRes = await fetch(`${baseUrl}/api/v1/mfs/nagad/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentReferenceId: body.paymentReferenceId,
        orderId: "ORD_NAGAD_TEST_01",
        amountBDT: 1500,
      }),
    });

    expect(verifyRes.status).toBe(200);
    const verifyBody = await verifyRes.json();
    expect(verifyBody.success).toBe(true);
    expect(verifyBody.status).toBe("SUCCESS");
    expect(verifyBody.issuerTrxId).toMatch(/^NGD_TRX_/);
    expect(verifyBody.verificationSealSha256).toBeDefined();

    server.close();
  });
});
