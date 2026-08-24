import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Dual-Voice Ergonomics & ASR Pipeline (/api/v1/voice)", () => {
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

  it("POST /api/v1/voice/transcribe normalizes Banglish phonetics and extracts TrxID", async () => {
    const res = await fetch(`${baseUrl}/api/v1/voice/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "bikash e 2500 taka pathano hoyeche TrxID 9K881726AX",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.normalizedText).toContain("bKash");
    expect(json.intent).toBe("PAYMENT_RECONCILIATION");
    expect(json.entities.trxId).toBe("9K881726AX");
  });

  it("POST /api/v1/voice/synthesize generates low-latency audio stream response", async () => {
    const res = await fetch(`${baseUrl}/api/v1/voice/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Your bKash transaction has been verified successfully.",
        voice: "bengali-female",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.audioUrl).toMatch(/^https:\/\/cdn\.shothik\.internal\/audio\/synth_/);
    expect(json.durationEstimatedSeconds).toBeGreaterThanOrEqual(1);
  });
});
