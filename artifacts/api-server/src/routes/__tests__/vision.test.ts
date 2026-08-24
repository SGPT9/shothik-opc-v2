import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("SAM 2 Multimodal Vision & UI Segmentation (/api/v1/vision)", () => {
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

  it("POST /api/v1/vision/segment segments UI elements and returns JSX components", async () => {
    const res = await fetch(`${baseUrl}/api/v1/vision/segment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_vision_test_1",
        imageUrl: "https://example.com/mockups/checkout.png",
        promptHint: "F-Commerce checkout dialog with bKash button",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.sessionId).toMatch(/^dsh_/);
    expect(json.result.detectedComponents.length).toBeGreaterThanOrEqual(3);
    expect(json.result.detectedComponents[0].suggestedReactCode).toContain("<header");
  });

  it("POST /api/v1/vision/segment rejects payload without imageBase64 or imageUrl", async () => {
    const res = await fetch(`${baseUrl}/api/v1/vision/segment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptHint: "Missing image",
      }),
    });

    expect(res.status).toBe(400);
    const json = (await res.json()) as any;
    expect(json.success).toBe(false);
  });
});
