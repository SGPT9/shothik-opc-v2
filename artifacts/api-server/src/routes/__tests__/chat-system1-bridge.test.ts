import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Bridge 1: Speculative System-1 Router to Chat-Local Bridge", { timeout: 25000 }, () => {
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

  it("intercepts courier tracking query and streams immediate System-1 fast-path response", async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Amar parcel STDF_44991 kothay ache? Delivery status jante chai",
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const text = await res.text();
    expect(text).toContain("system1_edge");
    expect(text).toContain("⚡ Speculative System-1");
    expect(text).toContain("STDF_44991");
    expect(text).toContain("[DONE]");
  });

  it("intercepts MFS refund query and returns structured Finance Twin resolution", async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Customer refund disburse koro 1200 taka 01712345678 number e",
      }),
    });

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("system1_edge");
    expect(text).toContain("MFS Wallet & Payout Inquiry");
    expect(text).toContain("01712345678");
  });

  it("intercepts academic thesis similarity query and returns Content Twin resolution", async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Thesis similarity report and academic research scan koro",
      }),
    });

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("system1_edge");
    expect(text).toContain("Academic Plagiarism & Similarity Scan");
  });
});
