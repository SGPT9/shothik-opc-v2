import { NextResponse } from "next/server";

export interface LiveKitTokenRequest {
  roomName?: string;
  participantName?: string;
}

export async function POST(req: Request) {
  try {
    const body: LiveKitTokenRequest = await req.json();
    const roomName = body.roomName || "shothik-voice-room";
    const participantName = body.participantName || "South-Asian-Merchant";

    // Simulate LiveKit WebRTC Session Token generation
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI${Date.now()}...`;

    return NextResponse.json({
      success: true,
      token: mockToken,
      roomName,
      participantName,
      serverUrl: "wss://shothik-voice.livekit.cloud",
      message: `🎙️ LiveKit WebRTC Token issued for room [${roomName}]. Code-mixed Bangla/Urdu/Hindi/English voice agent active.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
