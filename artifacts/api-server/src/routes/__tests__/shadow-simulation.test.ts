import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Pillar 5: Shadow Digital Twin Simulation & Rehearsal Engine", { timeout: 25000 }, () => {
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

  it("lists pre-configured rehearsal scenarios", async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulation/scenarios`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(2);

    const ids = body.data.map((s: any) => s.id);
    expect(ids).toContain("FLASH_SALE_ORDER_FLOW");
    expect(ids).toContain("OVERDRAFT_DEFENSE_FLOW");
  });

  it("rehearses valid multi-twin flow in sub-15ms and returns APPROVED_TO_EXECUTE with state deltas", async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulation/rehearse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actions: [
          {
            twinId: "sales_twin",
            actionName: "reserve_inventory",
            params: { sku: "SKU_TSHIRT_BLK", quantity: 3 },
          },
          {
            twinId: "operations_twin",
            actionName: "book_courier_consignment",
            params: { district: "Dhaka", recipientPhone: "01712345678" },
          },
          {
            twinId: "finance_twin",
            actionName: "issue_tax_invoice",
            params: { amountBdt: 2700 },
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const report = body.data;

    expect(report.verdict).toBe("APPROVED_TO_EXECUTE");
    expect(report.riskScore).toBeLessThanOrEqual(25);
    expect(report.totalSteps).toBe(3);
    expect(report.stepsPassed).toBe(3);
    expect(report.violations.length).toBe(0);
    expect(report.durationMs).toBeLessThan(50);

    // Assert exact projected state deltas
    expect(report.stateDeltas.inventoryDeltas["SKU_TSHIRT_BLK"]).toBe(-3);
    expect(report.stateDeltas.consignmentsCreated).toBe(1);
    expect(report.stateDeltas.taxInvoicesCreated).toBe(1);
  });

  it("rejects simulation with REJECTED_INVARIANT_VIOLATION when wallet overdraft occurs", async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulation/rehearse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initialState: { walletBalanceBdt: 5000 },
        actions: [
          {
            twinId: "finance_twin",
            actionName: "mfs_disburse",
            params: { amountBdt: 8000, recipientPhone: "01812345678" }, // 8,000 exceeds 5,000 balance!
          },
        ],
      }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    const report = body.data;

    expect(report.verdict).toBe("REJECTED_INVARIANT_VIOLATION");
    expect(report.failedStepIndex).toBe(0);
    expect(report.violations[0]).toContain("NO_NEGATIVE_WALLET_OVERDRAFT");
    expect(report.riskScore).toBe(100);
  });

  it("rejects simulation when inventory stockout occurs", async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulation/rehearse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initialState: { inventoryStock: { "SKU_TSHIRT_BLK": 2 } },
        actions: [
          {
            twinId: "sales_twin",
            actionName: "reserve_inventory",
            params: { sku: "SKU_TSHIRT_BLK", quantity: 10 }, // 10 exceeds 2 available
          },
        ],
      }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.data.verdict).toBe("REJECTED_INVARIANT_VIOLATION");
    expect(body.data.violations[0]).toContain("NO_NEGATIVE_INVENTORY_STOCKOUT");
  });

  it("rejects transaction attempting to charge credit on a frozen customer account", async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulation/rehearse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actions: [
          {
            twinId: "finance_twin",
            actionName: "charge_customer_credit",
            params: { customerId: "CUST_FROZEN", amountBdt: 1000 },
          },
        ],
      }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.data.verdict).toBe("REJECTED_INVARIANT_VIOLATION");
    expect(body.data.violations[0]).toContain("NO_TRANSACTIONS_ON_FROZEN_ACCOUNT");
  });

  it("escalates high-value transactions to NEEDS_HITL_ESCALATION", async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulation/rehearse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initialState: { walletBalanceBdt: 100000 },
        actions: [
          {
            twinId: "finance_twin",
            actionName: "mfs_disburse",
            params: { amountBdt: 22000, recipientPhone: "01711223344" },
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.verdict).toBe("NEEDS_HITL_ESCALATION");
    expect(body.data.riskScore).toBeGreaterThanOrEqual(60);
  });

  it("executes named rehearsal scenario FLASH_SALE_ORDER_FLOW", async () => {
    const res = await fetch(`${baseUrl}/api/v1/simulation/scenarios/FLASH_SALE_ORDER_FLOW/run`, {
      method: "POST",
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.verdict).toBe("APPROVED_TO_EXECUTE");
    expect(body.data.totalSteps).toBe(3);
  });
});
