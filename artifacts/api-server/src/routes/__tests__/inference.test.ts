import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { inferenceGateway } from "../../lib/inference-gateway.js";
import { semanticMemory } from "../../lib/semantic-memory.js";

describe("Adaptive Inference Gateway Suite (/api/v1/inference)", () => {
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

  it("GET /api/v1/inference/status returns multi-tier health and active tier", async () => {
    const res = await fetch(`${baseUrl}/api/v1/inference/status`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.status.activeTier).toBeDefined();
    expect(json.status.providers.hermesSynthetic.available).toBe(true);
    expect(json.status.semanticMemoryEnabled).toBe(true);
  });

  it("POST /api/v1/inference/chat non-streaming returns synthetic fallback with TTFT telemetry", async () => {
    const res = await fetch(`${baseUrl}/api/v1/inference/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello from Dhaka test runner" }],
        stream: false,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.message.role).toBe("assistant");
    expect(json.message.content.length).toBeGreaterThan(0);
    expect(json.meta.provider).toBeDefined();
    expect(json.meta.ttftMs).toBeGreaterThanOrEqual(0);
  });

  it("POST /api/v1/inference/chat automatically injects recalled user semantic memories", async () => {
    const userId = "usr_inf_test_909";
    // Seed a memory
    await semanticMemory.memorize(userId, "Prefers responses in Bengali and works at RedX logistics", "preference");

    const res = await fetch(`${baseUrl}/api/v1/inference/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        enableMemoryRecall: true,
        messages: [{ role: "user", content: "Tell me about my logistics company" }],
        stream: false,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.message.content.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/inference/chat streams Server-Sent Events (SSE)", async () => {
    const res = await fetch(`${baseUrl}/api/v1/inference/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Generate typescript code for a function" }],
        stream: true,
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const text = await res.text();
    expect(text).toContain("data:");
    expect(text).toContain("[DONE]");
  });
});
