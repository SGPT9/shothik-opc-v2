import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { LiveKitAudioVideoService } from "@/lib/infrastructure/livekit-service";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/livekit/token - Generate LiveKit WebRTC room access token
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const result = await LiveKitAudioVideoService.generateRoomToken({
      roomName: body.roomName || "shothik_vtuber_room",
      participantName: body.participantName || (user as any).name || "Shothik User",
      identity: String(user._id),
      metadata: body.metadata,
    });

    logger.info("[api] LiveKit room token issued successfully", {
      roomName: result.roomName,
      participantName: result.participantName,
    });

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    logger.error("[api] LiveKit token generation failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "LiveKit token generation failed",
        code: "LIVEKIT_TOKEN_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
