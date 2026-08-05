import { describe, it, expect } from "vitest";
import { VtuberPresenterService } from "../vtuber-presenter";

describe("VtuberPresenterService Open-LLM-VTuber Presenter", () => {
  it("should initialize VTuber session with WebSockets and live stream URLs", async () => {
    const session = await VtuberPresenterService.startPresenterSession({
      workspaceId: "ws_vtb_test_1",
      avatarModel: "shothik_narrator.vrm",
      language: "bn",
      enableVAD: true,
      enableVision: true,
    });

    expect(session.sessionId).toBeDefined();
    expect(session.status).toBe("active");
    expect(session.websocketUrl).toContain("wss://vtuber.shothik.app/ws/");
    expect(session.streamUrl).toContain("https://vtuber.shothik.app/stream/");
  });
});
