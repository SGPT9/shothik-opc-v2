import { describe, it, expect } from "vitest";
import { MultilingualIndicVoiceService, INDIC_VOICE_PROFILES } from "../multilingual-indic-voice-service";

describe("MultilingualIndicVoiceService", () => {
  it("should distinguish between Bangladeshi Bangla (bn-BD) and Indian Bangla (bn-IN)", () => {
    const bd = INDIC_VOICE_PROFILES.find((p) => p.code === "bn-BD");
    const inBangla = INDIC_VOICE_PROFILES.find((p) => p.code === "bn-IN");

    expect(bd?.name).toContain("Bangladeshi Bangla");
    expect(bd?.dialectRegion).toContain("Dhaka");
    expect(inBangla?.name).toContain("Indian Bangla");
    expect(inBangla?.dialectRegion).toContain("Kolkata");
  });

  it("should synthesize Bangladeshi Bangla (bn-BD) with viseme timeline for 3D VTuber", () => {
    const res = MultilingualIndicVoiceService.synthesizeIndicVoice(
      "আপনার bKash পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে।",
      "bn-BD"
    );

    expect(res.synthesisId).toContain("syn_bn_BD_");
    expect(res.langCode).toBe("bn-BD");
    expect(res.dialectRegion).toContain("Dhaka");
    expect(res.visemeTimeline.length).toBeGreaterThan(0);
  });

  it("should synthesize Bangladeshi Banglish (bn-BD-banglish) code-mixed audio", () => {
    const res = MultilingualIndicVoiceService.synthesizeIndicVoice(
      "Ami bKash e টাকা send korlam, TrxID check koro.",
      "bn-BD-banglish"
    );

    expect(res.synthesisId).toContain("syn_bn_BD_banglish_");
    expect(res.langCode).toBe("bn-BD-banglish");
    expect(res.transcript).toContain("bKash");
  });
});
