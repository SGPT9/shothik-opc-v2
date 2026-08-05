import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import twinSeedRouter, { __resetTwinSeedRateLimits } from "./twin-seed";

const VALID_SEED = {
  companyName: "DentSync",
  summary: "Appointment and claims automation for dental clinics.",
  businessPlan: "## Problem\nNo-shows.\n## Solution\nAutomation.",
  tasks: ["Interview dentists", "Wireframe MVP", "Set up HIPAA infra"],
};

function geminiResponse(payload: unknown) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

const MESSAGES = [
  { role: "user", content: "I want to build a SaaS for dental clinics." },
  { role: "assistant", content: "Great niche." },
];

describe("POST /api/twin/seed", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    __resetTwinSeedRateLimits();
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const app = express();
    app.use(express.json());
    app.use("/api", twinSeedRouter);
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await new Promise((resolve) => server.close(resolve));
  });

  function post(body: unknown, headers: Record<string, string> = {}) {
    return fetch(`${baseUrl}/api/twin/seed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-chat-device-id": "guest-test-device-0001",
        origin: "http://localhost:3000",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  it("rejects requests without any caller identity (401)", async () => {
    const res = await fetch(`${baseUrl}/api/twin/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ messages: MESSAGES }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects disallowed cross-site origins (403)", async () => {
    const res = await post({ messages: MESSAGES }, { origin: "https://evil.example.com" });
    expect(res.status).toBe(403);
  });

  it("rejects arbitrary Replit-hosted origins (403)", async () => {
    const res = await post({ messages: MESSAGES }, { origin: "https://attacker-site.replit.app" });
    expect(res.status).toBe(403);
  });

  it("rejects requests without an Origin header (403)", async () => {
    const res = await fetch(`${baseUrl}/api/twin/seed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-chat-device-id": "guest-test-device-0001",
      },
      body: JSON.stringify({ messages: MESSAGES }),
    });
    expect(res.status).toBe(403);
  });

  it("allows the configured REPLIT_DEV_DOMAIN origin", async () => {
    vi.stubEnv("REPLIT_DEV_DOMAIN", "myapp.dev.example.replit.dev");
    mockGemini(() => geminiResponse(VALID_SEED));
    const res = await post(
      { messages: MESSAGES },
      { origin: "https://myapp.dev.example.replit.dev" },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://myapp.dev.example.replit.dev",
    );
  });

  it("allows localhost origins", async () => {
    mockGemini(() => geminiResponse(VALID_SEED));
    const res = await post({ messages: MESSAGES }, { origin: "http://localhost:3000" });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: typeof VALID_SEED };
    expect(json.data.companyName).toBe("DentSync");
  });

  it("rejects empty message lists (400)", async () => {
    const res = await post({ messages: [] });
    expect(res.status).toBe(400);
  });

  it("returns 503 when no LLM key is configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("AI_INTEGRATIONS_GEMINI_API_KEY", "");
    const res = await post({ messages: MESSAGES });
    expect(res.status).toBe(503);
  });

  it("generates a seed from a valid transcript (200)", async () => {
    mockGemini(() => geminiResponse(VALID_SEED));
    const res = await post({ messages: MESSAGES });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: typeof VALID_SEED };
    expect(json.data.summary).toContain("dental");
    expect(json.data.tasks.length).toBeGreaterThanOrEqual(3);
  });

  it("returns 502 when the model returns malformed content", async () => {
    mockGemini(() =>
      new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: "not json" }] } }] }),
        { status: 200 },
      ),
    );
    const res = await post({ messages: MESSAGES });
    expect(res.status).toBe(502);
  });

  it("rate-limits repeated requests per identity (429)", async () => {
    mockGemini(() => geminiResponse(VALID_SEED));
    let last = 0;
    for (let i = 0; i < 8; i++) {
      const res = await post({ messages: MESSAGES });
      last = res.status;
      if (last === 429) break;
    }
    expect(last).toBe(429);
  });

  /** Mock only outbound Gemini calls; pass everything else to real fetch. */
  function mockGemini(handler: () => Response) {
    const realFetch = globalThis.fetch.bind(globalThis);
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("generativelanguage") || url.includes("gemini")) return handler();
      return realFetch(input, init);
    });
  }
});
