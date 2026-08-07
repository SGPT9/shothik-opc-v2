import { describe, expect, it } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("POST /api/hermes/payments/mfs", () => {
  it("creates a checkout session for bKash payment", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/payments/mfs", {
      method: "POST",
      body: JSON.stringify({
        action: "create",
        provider: "bkash",
        workspaceId: "ws_test_mfs",
        amountBdt: 1200,
        customerMobile: "01700000000",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.workspaceId).toBe("ws_test_mfs");
    expect(data.data.amountBdt).toBe(1200);
    expect(data.data.provider).toBe("bkash");
  });

  it("verifies a transaction for Nagad payment", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/payments/mfs", {
      method: "POST",
      body: JSON.stringify({
        action: "verify",
        provider: "nagad",
        paymentId: "mfs_nagad_test_123",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.paymentId).toBe("mfs_nagad_test_123");
    expect(data.data.provider).toBe("nagad");
    expect(data.data.status).toBe("verified");
  });
});
