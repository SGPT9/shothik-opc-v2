/**
 * UnifiedVoiceOrbService Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { unifiedVoiceOrbService } from "./voice/unified-voice-orb-service";

describe("UnifiedVoiceOrbService (3D Voice Orb VAD Engine)", () => {
  it("processes audio amplitude and calculates orb pulsate scale", () => {
    const frame = unifiedVoiceOrbService.processVadFrame(0.8);
    expect(frame.amplitude).toBe(0.8);
    expect(frame.pulsateScale).toBe(1.4);
    expect(frame.frequencyBands.length).toBe(8);
  });

  it("processes Banglish transcript and detects language cleanly", () => {
    const res = unifiedVoiceOrbService.processTranscript("kivabe taka pathabo bhai?");
    expect(res.state).toBe("speaking");
    expect(res.detectedLanguage).toBe("banglish");
    expect(res.confidenceScore).toBe(0.96);
  });
});
