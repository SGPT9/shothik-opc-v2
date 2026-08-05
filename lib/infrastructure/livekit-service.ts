import logger from "@/lib/logger";

export interface LiveKitTokenParams {
  roomName: string;
  participantName: string;
  identity?: string;
  metadata?: Record<string, unknown>;
}

export interface LiveKitTokenResult {
  roomName: string;
  participantName: string;
  token: string;
  serverUrl: string;
  expiresAt: string;
}

export class LiveKitAudioVideoService {
  /**
   * Generates real-time WebRTC room token for Open-LLM-VTuber, video calls, and screen sharing.
   */
  static async generateRoomToken(params: LiveKitTokenParams): Promise<LiveKitTokenResult> {
    const identity = params.identity || `user_${Date.now()}`;
    const serverUrl = process.env.LIVEKIT_URL || "wss://livekit.shothik.app";
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // Mock/JWT signing format for LiveKit WebRTC access tokens
    const token = `lk_token_${Buffer.from(JSON.stringify({ room: params.roomName, sub: identity })).toString("base64url")}`;

    logger.info("[livekit-service] Generated WebRTC room access token", {
      roomName: params.roomName,
      participantName: params.participantName,
      identity,
      serverUrl,
    });

    return {
      roomName: params.roomName,
      participantName: params.participantName,
      token,
      serverUrl,
      expiresAt,
    };
  }
}
