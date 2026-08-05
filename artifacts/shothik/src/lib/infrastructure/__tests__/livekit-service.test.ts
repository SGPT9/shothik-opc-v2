import { describe, it, expect } from "vitest";
import { LiveKitAudioVideoService } from "../livekit-service";

describe("LiveKitAudioVideoService WebRTC Real-Time Rooms", () => {
  it("should generate WebRTC access token for VTuber avatar video rooms", async () => {
    const result = await LiveKitAudioVideoService.generateRoomToken({
      roomName: "room_vtuber_pitch_101",
      participantName: "Investor / Client",
      identity: "usr_lk_999",
    });

    expect(result.roomName).toBe("room_vtuber_pitch_101");
    expect(result.token).toContain("lk_token_");
    expect(result.serverUrl).toBeDefined();
    expect(result.expiresAt).toBeDefined();
  });
});
