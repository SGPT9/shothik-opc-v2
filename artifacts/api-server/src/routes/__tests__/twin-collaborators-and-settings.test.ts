import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Twin Company Settings, Collaborator & Task Credit API", { timeout: 25000 }, () => {
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

  const companySlug = "fintech_dhaka";

  it("PATCH /api/v1/twin/companies/:slug updates company name and toggles pause status", async () => {
    // 1. First get or initialize the company
    await fetch(`${baseUrl}/api/v1/twin/companies/${companySlug}`);

    // 2. Rename and pause company
    const patchRes = await fetch(`${baseUrl}/api/v1/twin/companies/${companySlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "FinTech Dhaka Global",
        isPaused: true,
        revenueBdt: 75000,
      }),
    });

    expect(patchRes.status).toBe(200);
    const patchBody = await patchRes.json();
    expect(patchBody.success).toBe(true);
    expect(patchBody.data.name).toBe("FinTech Dhaka Global");
    expect(patchBody.data.isPaused).toBe(true);
    expect(patchBody.data.revenueBdt).toBe(75000);
  });

  it("manages scoped collaborators via POST, GET, and DELETE endpoints", async () => {
    // 1. Add collaborator
    const inviteRes = await fetch(`${baseUrl}/api/v1/twin/companies/${companySlug}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "cto@fintech-dhaka.com",
        role: "admin",
      }),
    });

    expect(inviteRes.status).toBe(201);
    const inviteBody = await inviteRes.json();
    expect(inviteBody.success).toBe(true);
    expect(inviteBody.data.email).toBe("cto@fintech-dhaka.com");
    expect(inviteBody.data.role).toBe("admin");
    const collabId = inviteBody.data.id;

    // 2. Reject duplicate email invite
    const dupRes = await fetch(`${baseUrl}/api/v1/twin/companies/${companySlug}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "cto@fintech-dhaka.com" }),
    });
    expect(dupRes.status).toBe(400);

    // 3. List collaborators
    const listRes = await fetch(`${baseUrl}/api/v1/twin/companies/${companySlug}/collaborators`);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.data.length).toBe(1);
    expect(listBody.data[0].email).toBe("cto@fintech-dhaka.com");

    // 4. Remove collaborator
    const delRes = await fetch(`${baseUrl}/api/v1/twin/companies/${companySlug}/collaborators/${collabId}`, {
      method: "DELETE",
    });
    expect(delRes.status).toBe(200);

    // 5. Verify list is now empty
    const verifyRes = await fetch(`${baseUrl}/api/v1/twin/companies/${companySlug}/collaborators`);
    const verifyBody = await verifyRes.json();
    expect(verifyBody.data.length).toBe(0);
  });

  it("handles task credit wallet top-up and execution deductions", async () => {
    const testUserId = "usr_credit_verification_test";

    // 1. Top up 50 task credits
    const topupRes = await fetch(`${baseUrl}/api/v1/subscriptions/topup-credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: testUserId,
        amount: 50,
        paymentMethod: "bkash",
      }),
    });

    expect(topupRes.status).toBe(200);
    const topupBody = await topupRes.json();
    expect(topupBody.success).toBe(true);
    expect(topupBody.creditsBalance).toBeGreaterThanOrEqual(550);

    // 2. Deduct 1 credit for autonomous task execution
    const deductRes = await fetch(`${baseUrl}/api/v1/subscriptions/deduct-credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: testUserId,
        costCredits: 1,
        taskId: "task_verify_001",
        taskTitle: "Steadfast Courier API Hookup",
      }),
    });

    expect(deductRes.status).toBe(200);
    const deductBody = await deductRes.json();
    expect(deductBody.success).toBe(true);
    expect(deductBody.deducted).toBe(1);
    expect(deductBody.transactionId).toMatch(/^TX_CR_/);
  });
});
