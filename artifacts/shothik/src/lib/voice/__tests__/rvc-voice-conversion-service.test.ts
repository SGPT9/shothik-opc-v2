import { describe, it, expect } from "vitest";
import { RvcVoiceConversionService, PRESET_RVC_VOICE_MODELS } from "../rvc-voice-conversion-service";

describe("RvcVoiceConversionService", () => {
  it("should perform ultra-low latency zero-shot RVC voice conversion", () => {
    const res = RvcVoiceConversionService.convertVoice({
      modelId: "rvc_bangla_vtuber_fem_01",
      sourceAudioUrl: "https://example.com/tts_raw.wav",
      f0Method: "rmvpe",
    });

    expect(res.conversionId).toContain("rvc_conv_");
    expect(res.modelId).toBe("rvc_bangla_vtuber_fem_01");
    expect(res.latencyMs).toBeLessThan(50); // Under 50ms requirement
    expect(res.status).toBe("COMPLETED");
  });

  it("should train custom merchant RVC voice model for voice autopilot", () => {
    const model = RvcVoiceConversionService.trainMerchantVoiceClone("merchant_dhaka_01", "https://example.com/sample.wav");

    expect(model.modelId).toContain("rvc_merchant_merchant_dhaka_01_");
    expect(model.speakerCategory).toBe("merchant_cloned");
    expect(model.sampleRateHz).toBe(48000);
  });
});
