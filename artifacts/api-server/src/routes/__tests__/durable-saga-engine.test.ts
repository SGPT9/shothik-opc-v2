import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { durableSagaEngine, type SagaStep } from "../../lib/saga/durable-saga-engine";

describe("Pillar 1: Durable Saga Transaction Engine", { timeout: 25000 }, () => {
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

  it("lists registered saga definitions", async () => {
    const res = await fetch(`${baseUrl}/api/v1/sagas/definitions`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    const names = body.data.map((d: any) => d.name);
    expect(names).toContain("MFS_PAYOUT_LOGISTICS_BOOKING");
    expect(names).toContain("ESCROW_COD_SETTLEMENT");
  });

  it("successfully completes atomic forward execution of MFS_PAYOUT_LOGISTICS_BOOKING", async () => {
    const payload = {
      sagaName: "MFS_PAYOUT_LOGISTICS_BOOKING",
      initialContext: {
        amountBdt: 1500,
        merchantId: "merch_dhaka_01",
        orderId: "ord_9981",
        recipientPhone: "+8801712345678",
        deliveryDistrict: "Dhaka",
      },
      idempotencyKey: `idem_success_${Date.now()}`,
    };

    const res = await fetch(`${baseUrl}/api/v1/sagas/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const data = body.data;

    expect(data.status).toBe("COMPLETED");
    expect(data.currentStepIndex).toBe(2);
    expect(data.steps.length).toBe(3);
    expect(data.steps[0].status).toBe("COMPLETED");
    expect(data.steps[1].status).toBe("COMPLETED");
    expect(data.steps[2].status).toBe("COMPLETED");

    // Check context enriched from steps
    expect(data.context.mfsReservationId).toBeDefined();
    expect(data.context.trackingCode).toBeDefined();
    expect(data.context.mushakInvoiceNumber).toBeDefined();
    expect(data.context.vatBdt).toBe(75); // 5% of 1500
  });

  it("triggers backward compensation rollback when step 2 fails", async () => {
    const payload = {
      sagaName: "MFS_PAYOUT_LOGISTICS_BOOKING",
      initialContext: {
        amountBdt: 2000,
        merchantId: "merch_chittagong_02",
        orderId: "ord_fail_01",
        recipientPhone: "+8801811223344",
        deliveryDistrict: "Bandarban",
        simulateFailure: true, // will throw in step 2 (courier dispatch)
      },
      idempotencyKey: `idem_fail_${Date.now()}`,
    };

    const res = await fetch(`${baseUrl}/api/v1/sagas/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    const data = body.data;

    expect(data.status).toBe("COMPENSATED");
    expect(data.steps[0].status).toBe("COMPENSATED"); // Step 1 was executed then compensated
    expect(data.steps[1].status).toBe("FAILED"); // Step 2 failed
    expect(data.steps[2].status).toBe("PENDING"); // Step 3 never reached
    expect(data.error).toContain("Courier dispatch API timed out");
  });

  it("enforces idempotency: repeated request with same key returns cached execution", async () => {
    const idempotencyKey = `idem_repeat_${Date.now()}`;
    const payload = {
      sagaName: "ESCROW_COD_SETTLEMENT",
      initialContext: {
        consignmentId: "CN_12345",
        codAmount: 5000,
        merchantWallet: "01999888777",
      },
      idempotencyKey,
    };

    const res1 = await fetch(`${baseUrl}/api/v1/sagas/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    const sagaId1 = body1.data.sagaId;

    const res2 = await fetch(`${baseUrl}/api/v1/sagas/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.data.sagaId).toBe(sagaId1);
  });

  it("retrieves saga by ID and lists executions in audit trail", async () => {
    const listRes = await fetch(`${baseUrl}/api/v1/sagas`);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.count).toBeGreaterThan(0);

    const firstId = listBody.data[0].sagaId;
    const detailRes = await fetch(`${baseUrl}/api/v1/sagas/${firstId}`);
    expect(detailRes.status).toBe(200);
    const detailBody = await detailRes.json();
    expect(detailBody.data.sagaId).toBe(firstId);
  });

  it("compensates custom step pipeline in exact reverse order", async () => {
    const executionOrder: string[] = [];
    const compensationOrder: string[] = [];

    const steps: SagaStep[] = [
      {
        name: "step_A",
        execute: async () => {
          executionOrder.push("A");
          return { aDone: true };
        },
        compensate: async () => {
          compensationOrder.push("comp_A");
        },
      },
      {
        name: "step_B",
        execute: async () => {
          executionOrder.push("B");
          return { bDone: true };
        },
        compensate: async () => {
          compensationOrder.push("comp_B");
        },
      },
      {
        name: "step_C",
        execute: async () => {
          executionOrder.push("C");
          throw new Error("Simulated disaster in Step C");
        },
        compensate: async () => {
          compensationOrder.push("comp_C");
        },
      },
    ];

    const record = await durableSagaEngine.executeSaga({
      sagaName: "TEST_CUSTOM_SAGA",
      initialContext: {},
      steps,
    });

    expect(record.status).toBe("COMPENSATED");
    expect(executionOrder).toEqual(["A", "B", "C"]);
    // Compensation should execute in exact reverse order of completed steps: B then A
    expect(compensationOrder).toEqual(["comp_B", "comp_A"]);
  });
});
