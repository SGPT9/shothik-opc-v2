import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import twinSeedRouter, {
  __resetTwinSeedRateLimits,
  __resetTwinSeedIdentityCache,
} from "./twin-seed";

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
    __resetTwinSeedIdentityCache();
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

  /* ------------------------------------------------------------------ */
  /* Persistence (real database)                                         */
  /* ------------------------------------------------------------------ */

  describe("persistence (GET/PUT, real database)", () => {
    // Unique per-run identities so tests are isolated and cleanup is exact.
    const runId = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const deviceA = `test-device-a-${runId}`;
    const deviceB = `test-device-b-${runId}`;

    afterEach(async () => {
      const { db, twinSeedsTable } = await import("@workspace/db");
      const { inArray } = await import("drizzle-orm");
      await db
        .delete(twinSeedsTable)
        .where(inArray(twinSeedsTable.identity, [`device:${deviceA}`, `device:${deviceB}`]));
    });

    function request(
      method: string,
      path: string,
      { device = deviceA, body }: { device?: string; body?: unknown } = {},
    ) {
      return fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-chat-device-id": device,
          origin: "http://localhost:3000",
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    }

    const SAVED = {
      conversationId: "conv-test-1",
      companyName: "DentSync",
      summary: "Appointment automation for dental clinics.",
      businessPlan: "## Problem\nNo-shows.",
      tasks: [
        { id: 1, title: "Interview dentists", completed: false },
        { id: 2, title: "Wireframe MVP", completed: true },
      ],
    };

    it("PUT saves and GET round-trips a seed, retaining edits and completion state", async () => {
      const put = await request("PUT", "/api/twin/seed", { body: SAVED });
      expect(put.status).toBe(200);

      const get = await request("GET", "/api/twin/seed?conversationId=conv-test-1");
      expect(get.status).toBe(200);
      const { data } = (await get.json()) as { data: typeof SAVED };
      expect(data.companyName).toBe("DentSync");
      expect(data.tasks).toHaveLength(2);
      expect(data.tasks[1]).toMatchObject({ title: "Wireframe MVP", completed: true });

      // Overwrite with an edit and re-read.
      const edited = { ...SAVED, companyName: "DentSync Pro" };
      await request("PUT", "/api/twin/seed", { body: edited });
      const reread = await request("GET", "/api/twin/seed?conversationId=conv-test-1");
      expect(((await reread.json()) as { data: typeof SAVED }).data.companyName).toBe(
        "DentSync Pro",
      );
    });

    it("GET without conversationId returns the caller's latest seed", async () => {
      await request("PUT", "/api/twin/seed", { body: SAVED });
      await request("PUT", "/api/twin/seed", {
        body: { ...SAVED, conversationId: "conv-test-2", companyName: "Newest Co" },
      });
      const res = await request("GET", "/api/twin/seed");
      expect(res.status).toBe(200);
      const { data } = (await res.json()) as { data: typeof SAVED };
      expect(data.companyName).toBe("Newest Co");
    });

    it("scopes seeds by identity — another device cannot read them (404)", async () => {
      await request("PUT", "/api/twin/seed", { body: SAVED });
      const other = await request("GET", "/api/twin/seed?conversationId=conv-test-1", {
        device: deviceB,
      });
      expect(other.status).toBe(404);
      const latest = await request("GET", "/api/twin/seed", { device: deviceB });
      expect(latest.status).toBe(404);
    });

    it("rejects invalid PUT payloads (400)", async () => {
      const res = await request("PUT", "/api/twin/seed", {
        body: { conversationId: "conv-test-1", companyName: "", summary: "", businessPlan: "", tasks: [] },
      });
      expect(res.status).toBe(400);
    });

    /**
     * Mock the upstream auth backend: tokens in `validTokens` resolve to the
     * given user id via GET /api/user/profile; everything else is 401.
     * Gemini calls are also handled so both can be mocked in one spy.
     */
    function mockUpstream(validTokens: Record<string, string>, gemini?: () => Response) {
      vi.stubEnv("CHAT_API_ORIGIN", "http://upstream.test");
      const realFetch = globalThis.fetch.bind(globalThis);
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
        const url =
          typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (url.startsWith("http://upstream.test/api/user/profile")) {
          const auth =
            (init?.headers as Record<string, string> | undefined)?.["Authorization"] ?? "";
          const token = auth.replace("Bearer ", "");
          const userId = validTokens[token];
          return userId
            ? new Response(JSON.stringify({ _id: userId, email: `${userId}@test.dev` }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              })
            : new Response("{}", { status: 401 });
        }
        if (gemini && (url.includes("generativelanguage") || url.includes("gemini"))) {
          return gemini();
        }
        return realFetch(input, init);
      });
    }

    it("the same authenticated user reaches their workspace from different devices", async () => {
      const token = `tok-cross-${runId}`;
      const userId = `test-user-${runId}`;
      mockUpstream({ [token]: userId });

      const put = await fetch(`${baseUrl}/api/twin/seed`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-chat-device-id": deviceA,
          Authorization: `Bearer ${token}`,
          origin: "http://localhost:3000",
        },
        body: JSON.stringify(SAVED),
      });
      expect(put.status).toBe(200);

      // Different device id, same account — must see the same workspace.
      const get = await fetch(`${baseUrl}/api/twin/seed?conversationId=conv-test-1`, {
        headers: {
          "x-chat-device-id": deviceB,
          Authorization: `Bearer ${token}`,
          origin: "http://localhost:3000",
        },
      });
      expect(get.status).toBe(200);
      const { data } = (await get.json()) as { data: typeof SAVED };
      expect(data.companyName).toBe("DentSync");

      const { db, twinSeedsTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      await db.delete(twinSeedsTable).where(eq(twinSeedsTable.identity, `user:${userId}`));
    });

    it("migrates guest seeds to the account when the user signs in", async () => {
      const token = `tok-migrate-${runId}`;
      const userId = `test-user-mig-${runId}`;

      // Saved as a guest (device only, no token).
      const put = await request("PUT", "/api/twin/seed", { body: SAVED });
      expect(put.status).toBe(200);

      // Now signed in on the same device: the seed follows the account…
      mockUpstream({ [token]: userId });
      const sameDevice = await fetch(`${baseUrl}/api/twin/seed?conversationId=conv-test-1`, {
        headers: {
          "x-chat-device-id": deviceA,
          Authorization: `Bearer ${token}`,
          origin: "http://localhost:3000",
        },
      });
      expect(sameDevice.status).toBe(200);

      // …and is now reachable from a completely different device.
      const otherDevice = await fetch(`${baseUrl}/api/twin/seed?conversationId=conv-test-1`, {
        headers: {
          "x-chat-device-id": deviceB,
          Authorization: `Bearer ${token}`,
          origin: "http://localhost:3000",
        },
      });
      expect(otherDevice.status).toBe(200);

      const { db, twinSeedsTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      await db.delete(twinSeedsTable).where(eq(twinSeedsTable.identity, `user:${userId}`));
    });

    it("rejects stale writes: an older revision cannot overwrite a newer one", async () => {
      const newer = { ...SAVED, companyName: "Newer Co", revision: 2000 };
      const older = { ...SAVED, companyName: "Older Co", revision: 1000 };

      await request("PUT", "/api/twin/seed", { body: newer });
      // Simulates an out-of-order completion: the older edit lands second.
      const staleRes = await request("PUT", "/api/twin/seed", { body: older });
      expect(staleRes.status).toBe(200);
      const stale = (await staleRes.json()) as { data: { companyName: string } };
      expect(stale.data.companyName).toBe("Newer Co");

      const get = await request("GET", "/api/twin/seed?conversationId=conv-test-1");
      const { data } = (await get.json()) as { data: { companyName: string; revision: number } };
      expect(data.companyName).toBe("Newer Co");
      expect(data.revision).toBe(2000);
    });

    it("POST with a conversationId persists the generated seed (persisted: true) and GET returns it", async () => {
      mockGemini(() => geminiResponse(VALID_SEED));
      const res = await post({ conversationId: "conv-test-gen", messages: MESSAGES });
      expect(res.status).toBe(200);
      const json = (await res.json()) as { persisted: boolean };
      expect(json.persisted).toBe(true);

      const get = await request("GET", "/api/twin/seed?conversationId=conv-test-gen", {
        device: "guest-test-device-0001",
      });
      expect(get.status).toBe(200);
      const { data } = (await get.json()) as {
        data: { companyName: string; tasks: { title: string; completed: boolean }[] };
      };
      expect(data.companyName).toBe(VALID_SEED.companyName);
      expect(data.tasks.map((t) => t.title)).toEqual(VALID_SEED.tasks);
      expect(data.tasks.every((t) => t.completed === false)).toBe(true);

      const { db, twinSeedsTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      await db
        .delete(twinSeedsTable)
        .where(eq(twinSeedsTable.identity, "device:guest-test-device-0001"));
    });
  });
});
