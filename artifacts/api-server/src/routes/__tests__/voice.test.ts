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

  it("POST /api/v1/voice/synthesize bridges live to Python bangla-audio-ai server when online", async () => {
    const { spawn } = await import("node:child_process");
    const path = await import("node:path");
    const fs = await import("node:fs");

    const banglaDir = path.resolve(process.cwd(), "../../../bangla-audio-ai");
    const serverPy = path.join(banglaDir, "src", "api", "server.py");
    expect(fs.existsSync(serverPy)).toBe(true);

    const testPort = 18001;
    const pyProc = spawn("python", ["-X", "utf8", "-m", "src.api.server"], {
      cwd: banglaDir,
      env: { ...process.env, PORT: String(testPort) },
      stdio: "ignore",
    });

    process.env.BANGLA_AUDIO_AI_URL = `http://127.0.0.1:${testPort}`;

    try {
      // Wait up to 3s for Python server readiness
      let ready = false;
      for (let i = 0; i < 30; i++) {
        try {
          const h = await fetch(`http://127.0.0.1:${testPort}/health`);
          if (h.ok) {
            ready = true;
            break;
          }
        } catch {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      expect(ready).toBe(true);

      const res = await fetch(`${baseUrl}/api/v1/voice/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "আসসালামু আলাইকুম, আপনার বিকাশ পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।",
          voice: "ayesha_sales",
          emotion: "empathetic",
          includeBreaths: true,
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.engine).toBe("bangla-audio-ai-openvino");
      expect(json.processedText).toContain("<inhale_soft>");
      expect(typeof json.audioBase64).toBe("string");
      const wavHeader = Buffer.from(json.audioBase64, "base64").subarray(0, 4).toString("ascii");
      expect(wavHeader).toBe("RIFF");
    } finally {
      delete process.env.BANGLA_AUDIO_AI_URL;
      pyProc.kill();
    }
  });
});
