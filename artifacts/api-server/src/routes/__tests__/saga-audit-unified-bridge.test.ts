import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { AuditLedgerEngine } from "../../lib/audit/audit-ledger-engine";

describe("Bridges 5 & 6: Durable Saga Unified Dispatch & Financial Audit Ledger Integration", { timeout: 25000 }, () => {
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

  it("POST /api/v1/logistics/dispatch-saga executes atomic 3-step saga and records double-entry audit entry", async () => {
    const res = await fetch(`${baseUrl}/api/v1/logistics/dispatch-saga`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ORD_SAGA_001",
        merchantId: "merch_saga_dhaka",
        recipientPhone: "01712345678",
        deliveryDistrict: "Dhaka",
        amountBdt: 4000,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe("COMPLETED");
    expect(body.data.steps.length).toBe(3);
    expect(body.data.steps.every((s: any) => s.status === "COMPLETED")).toBe(true);

    // Verify AuditLedger has recorded the transaction
    const journals = AuditLedgerEngine.listJournals();
    const sagaEntry = journals.find((j) => j.transactionRef === body.sagaId);
    expect(sagaEntry).toBeDefined();
    expect(sagaEntry?.isBalanced).toBe(true);
    expect(sagaEntry?.totalDebitBdt).toBe(4000);
    expect(sagaEntry?.totalCreditBdt).toBe(4000);
    expect(sagaEntry?.auditHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("POST /api/v1/logistics/dispatch-saga rolls back atomically when courier booking fails", async () => {
    const res = await fetch(`${baseUrl}/api/v1/logistics/dispatch-saga`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ORD_SAGA_FAIL_002",
        merchantId: "merch_saga_dhaka",
        recipientPhone: "01899887766",
        deliveryDistrict: "Rangpur",
        amountBdt: 2500,
        simulateFailure: true, // Courier API fails
      }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.status).toBe("COMPENSATED");
    expect(body.data.error).toContain("Courier dispatch API timed out");

    // Verify step 0 was compensated
    expect(body.data.steps[0].status).toBe("COMPENSATED");
    expect(body.data.steps[1].status).toBe("FAILED");
  });

  it("POST /api/v1/mfs/payout posts cryptographic double-entry entry to NBR Audit Ledger", async () => {
    const res = await fetch(`${baseUrl}/api/v1/mfs/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_creator_audit_01",
        payoutAmountBdt: 2000,
        mfsProvider: "bkash",
        walletNumber: "01712345678",
        creatorNote: "Creator revenue payout audit test",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify journal entry in AuditLedger
    const journals = AuditLedgerEngine.listJournals();
    const payoutEntry = journals.find((j) => j.transactionRef === body.payoutTrxId);
    expect(payoutEntry).toBeDefined();
    expect(payoutEntry?.isBalanced).toBe(true);
    expect(payoutEntry?.totalDebitBdt).toBe(2000);
    expect(payoutEntry?.totalCreditBdt).toBe(2000);
  });
});
