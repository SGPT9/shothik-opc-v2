import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Bridge 2: Shadow Simulation Engine to Action Proposals Bridge", { timeout: 25000 }, () => {
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

  it("enriches new action proposals with pre-flight simulation report", async () => {
    const res = await fetch(`${baseUrl}/api/v1/action-proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "courier.dispatch",
        data: {
          courier: "steadfast",
          recipientName: "Tanvir Ahmed",
          recipientPhone: "01712345678",
          deliveryAddress: "Dhanmondi 27, Dhaka",
          codAmount: 1500,
          itemDescription: "Shothik Smart Hoodie",
        },
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.proposal.simulationReport).toBeDefined();
    expect(body.proposal.simulationReport.verdict).toBe("APPROVED_TO_EXECUTE");
    expect(body.proposal.simulationReport.stateDeltas.consignmentsCreated).toBe(1);
  });

  it("detects excessive payout overdraft in simulation and blocks approval with 422", async () => {
    // 1. Create proposal for 75,000 BDT (default shadow sandbox has 50,000 BDT balance)
    const createRes = await fetch(`${baseUrl}/api/v1/action-proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "bkash.payout",
        data: {
          recipientPhone: "01811223344",
          amount: 75000,
          reference: "OVERDRAFT_TEST",
        },
      }),
    });

    expect(createRes.status).toBe(201);
    const createBody = await createRes.json();
    const proposalId = createBody.proposal.id;
    expect(createBody.proposal.simulationReport.verdict).toBe("REJECTED_INVARIANT_VIOLATION");
    expect(createBody.proposal.simulationReport.violations[0]).toContain("NO_NEGATIVE_WALLET_OVERDRAFT");

    // 2. Attempt to approve this proposal
    const approveRes = await fetch(`${baseUrl}/api/v1/action-proposals/${proposalId}/approve`, {
      method: "POST",
    });

    expect(approveRes.status).toBe(422);
    const approveBody = await approveRes.json();
    expect(approveBody.success).toBe(false);
    expect(approveBody.error).toContain("Action proposal blocked by Shadow Simulation");
    expect(approveBody.simulationReport.verdict).toBe("REJECTED_INVARIANT_VIOLATION");
  });
});
