import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { VtuberPresenterService } from "@/lib/infrastructure/vtuber-presenter";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/infrastructure/vtuber-presenter", () => ({
  VtuberPresenterService: {
    startPresenterSession: vi.fn(),
  },
}));

describe("POST /api/hermes/vtuber/session", () => {
  it("rejects request if user is not authenticated", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/hermes/vtuber/session", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_vtb_test",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("initializes an Open-LLM-VTuber session for authenticated user", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce({
      _id: "user_vtb_123",
      id: "user_vtb_123",
      email: "vtuber@shothik.ai",
      name: "VTuber Presenter User",
      role: "user",
    });

    vi.mocked(VtuberPresenterService.startPresenterSession).mockResolvedValueOnce({
      sessionId: "vtb_sess_789",
      websocketUrl: "ws://localhost:8000/vtuber/stream/vtb_sess_789",
      avatarModel: "custom_avatar.vrm",
      voiceEngine: "edge-tts",
      status: "ready",
      slideDeckSynced: true,
      currentSlideIndex: 0,
    });

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
    expect(data.data.sessionId).toBe("vtb_sess_789");
    expect(data.data.websocketUrl).toContain("ws://");
  });

  it("handles service initialization errors gracefully with status 500", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce({
      _id: "user_vtb_123",
      id: "user_vtb_123",
      email: "vtuber@shothik.ai",
      name: "VTuber Presenter User",
      role: "user",
    });

    vi.mocked(VtuberPresenterService.startPresenterSession).mockRejectedValueOnce(
      new Error("VTuber engine connection refused")
    );

    const req = new NextRequest("http://localhost:3000/api/hermes/vtuber/session", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_vtb_test",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.code).toBe("VTUBER_SESSION_ERROR");
  });
});
