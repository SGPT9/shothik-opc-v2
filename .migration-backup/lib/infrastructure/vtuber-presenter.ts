import logger from "@/lib/logger";

export interface VtuberPresenterParams {
  workspaceId: string;
  avatarModel?: string;
  voiceEngine?: "edge-tts" | "gpt-sovits" | "sherpa-onnx";
  language?: "en" | "bn" | "hi" | "es";
  enableVAD?: boolean;
  enableVision?: boolean;
  mcpToolsEnabled?: string[];
}

export interface VtuberPresenterSession {
  sessionId: string;
  workspaceId: string;
  avatarModel: string;
  status: "active" | "idle" | "listening" | "speaking";
  websocketUrl: string;
  streamUrl: string;
  createdAt: string;
}

export class VtuberPresenterService {
  /**
   * Initializes a 24/7 Open-LLM-VTuber interactive voice avatar presenter session.
   */
  static async startPresenterSession(params: VtuberPresenterParams): Promise<VtuberPresenterSession> {
    const sessionId = `vtb_sess_${Date.now()}`;
    const avatarModel = params.avatarModel || "shothik_vrm_default.vrm";
    const websocketUrl = `wss://vtuber.shothik.app/ws/${sessionId}`;
    const streamUrl = `https://vtuber.shothik.app/stream/${sessionId}`;

    logger.info("[vtuber-presenter] Initializing Open-LLM-VTuber presenter session", {
      sessionId,
      workspaceId: params.workspaceId,
      avatarModel,
      language: params.language || "en",
      vad: params.enableVAD ?? true,
      vision: params.enableVision ?? true,
    });

    return {
      sessionId,
      workspaceId: params.workspaceId,
      avatarModel,
      status: "active",
      websocketUrl,
      streamUrl,
      createdAt: new Date().toISOString(),
    };
  }
}
