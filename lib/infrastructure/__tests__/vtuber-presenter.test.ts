import { describe, expect, it } from "vitest";
import { VtuberPresenterService } from "@/lib/infrastructure/vtuber-presenter";

describe("VtuberPresenterService (Open-LLM-VTuber Engine)", () => {
  it("initializes an interactive VTuber presenter session with default avatar settings", async () => {
    const session = await VtuberPresenterService.startPresenterSession({
      workspaceId: "ws_vtuber_default",
    });

    expect(session.sessionId).toContain("vtb_sess_");
    expect(session.workspaceId).toBe("ws_vtuber_default");
    expect(session.avatarModel).toBe("shothik_vrm_default.vrm");
    expect(session.status).toBe("active");
    expect(session.websocketUrl).toContain("wss://vtuber.shothik.app/ws/");
    expect(session.streamUrl).toContain("https://vtuber.shothik.app/stream/");
  });

  it("supports custom VRM avatar models, voice engines, and multi-lingual options", async () => {
    const session = await VtuberPresenterService.startPresenterSession({
      workspaceId: "ws_vtuber_custom",
      avatarModel: "avatar_futuristic.vrm",
      voiceEngine: "gpt-sovits",
      language: "bn",
      enableVAD: true,
      enableVision: true,
      mcpToolsEnabled: ["web_search", "papermark_analytics"],
    });

    expect(session.workspaceId).toBe("ws_vtuber_custom");
    expect(session.avatarModel).toBe("avatar_futuristic.vrm");
    expect(session.status).toBe("active");
  });

  it("generates audio subtitle chunks with lip-sync viseme phonemes", async () => {
    const chunk = await VtuberPresenterService.generateAudioSubtitleChunk(
      "vtb_sess_123",
      "Welcome to the Shothik AI Product Presentation.",
      2
    );

    expect(chunk.chunkId).toContain("chk_");
    expect(chunk.slideIndex).toBe(2);
    expect(chunk.phonemes.length).toBeGreaterThan(0);
    expect(chunk.audioUrl).toContain("vtb_sess_123");
  });

  it("synchronizes VTuber avatar motion and speech to Papermark slide transitions", async () => {
    const syncRes = await VtuberPresenterService.syncSlidePresentation(
      "vtb_sess_123",
      3,
      "Market Analysis & Growth Projections"
    );

    expect(syncRes.synced).toBe(true);
    expect(syncRes.currentSlide).toBe(3);
    expect(syncRes.title).toBe("Market Analysis & Growth Projections");
  });
});
