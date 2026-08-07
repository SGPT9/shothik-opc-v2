import { describe, expect, it } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("POST /api/hermes/vtuber/session", () => {
  it("initializes an Open-LLM-VTuber session for authenticated user", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/vtuber/session", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_vtb_test",
        avatarModel: "custom_avatar.vrm",
        voiceEngine: "edge-tts",
        enableVAD: true,
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.sessionId).toBeDefined();
    expect(data.data.websocketUrl).toContain("ws://");
  });
});
