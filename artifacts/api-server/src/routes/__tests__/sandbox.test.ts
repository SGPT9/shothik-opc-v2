import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Isolated Code Interpreter Sandbox (/api/v1/sandbox)", () => {
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

  it("GET /api/v1/sandbox/runtimes returns supported language environments", async () => {
    const res = await fetch(`${baseUrl}/api/v1/sandbox/runtimes`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBeGreaterThanOrEqual(3);
  });

  it("POST /api/v1/sandbox/run executes JavaScript and captures stdout", async () => {
    const res = await fetch(`${baseUrl}/api/v1/sandbox/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        code: `
          const bKashFee = 1.85 / 100;
          const amount = 5000;
          const fee = amount * bKashFee;
          console.log(JSON.stringify({ amount, fee, net: amount - fee }));
        `,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.result.stdout).toContain('"fee":92.5');
    expect(json.result.exitCode).toBe(0);
  });

  it("POST /api/v1/sandbox/run enforces security guard against dangerous shell commands and process.env access", async () => {
    const res = await fetch(`${baseUrl}/api/v1/sandbox/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        code: `rm -rf /`,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(false);
    expect(json.result.error).toBe("SECURITY_VIOLATION");

    const envRes = await fetch(`${baseUrl}/api/v1/sandbox/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        code: `console.log(process.env.JWT_SECRET)`,
      }),
    });
    expect(envRes.status).toBe(200);
    const envJson = (await envRes.json()) as any;
    expect(envJson.success).toBe(false);
    expect(envJson.result.error).toBe("SECURITY_VIOLATION");
  });

  it("POST /api/v1/sandbox/deerflow-calc calculates exact Mushak 6.3 VAT and withholding taxes", async () => {
    const res = await fetch(`${baseUrl}/api/v1/sandbox/deerflow-calc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calculationType: "mushak_63_vat",
        baseAmount: 20000,
        vatRatePercent: 15,
        withholdingTaxPercent: 5,
        supplementaryDutyPercent: 10,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.calculation.baseAmount).toBe(20000);
    expect(json.calculation.supplementaryDuty).toBe(2000); // 10% of 20000
    expect(json.calculation.vatAmount).toBe(3300); // 15% of (20000 + 2000)
    expect(json.calculation.withholdingTax).toBe(1000); // 5% of 20000
    expect(json.calculation.totalPayable).toBe(25300); // 22000 + 3300
    expect(json.calculation.engine).toBe("deerflow-sandbox-v2");
  });
});
