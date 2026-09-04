import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Demography Dialects API Routes", () => {
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

  it("POST /api/demography/dialects/detect detects Sylheti dialect and returns normalized text", async () => {
    const res = await fetch(`${baseUrl}/api/demography/dialects/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "লন্ডন থাকি টেকা আইছে, অখন যাইরাম" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.detectedDialect).toBe("sylheti");
    expect(body.confidence).toBeGreaterThan(0.7);
    expect(body.normalizedStandardBangla).toContain("লন্ডন থেকে টাকা এসেছে");
  });

  it("POST /api/demography/dialects/synthesize translates standard text to target dialect", async () => {
    const res = await fetch(`${baseUrl}/api/demography/dialects/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "এক ট্যাপে বিকাশ পেমেন্ট করুন",
        targetDialect: "dhakaiya",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.targetDialect).toBe("dhakaiya");
    expect(body.translatedText).toBe("১-ট্যাপে বিকাশ মারেন");
  });

  it("returns 400 when missing payload text", async () => {
    const res = await fetch(`${baseUrl}/api/demography/dialects/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required 'text'");
  });
});
