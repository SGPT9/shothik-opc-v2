/**
 * VtuberStreamingService Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { vtuberStreamingService } from "./voice/vtuber-streaming-service";

describe("VtuberStreamingService (Multilingual Voice & Avatar Protocol)", () => {
  it("synthesizes voice audio and generates valid 3D VTuber facial blendshapes", () => {
    const frame = vtuberStreamingService.synthesizeAndStream({
      text: "হ্যালো, কেমন আছেন?",
      language: "bn",
      avatarPreset: "shothik_female",
    });

    expect(frame.frameId).toContain("vtf_");
    expect(frame.blendshapes.mouthOpen).toBeGreaterThan(0);
    expect(frame.audioChunkBase64).toBeDefined();
  });
});
