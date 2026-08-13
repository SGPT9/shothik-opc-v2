import { describe, it, expect } from "vitest";
import { BuzzWhisperSpeechService } from "../buzz-whisper-service";

describe("BuzzWhisperSpeechService", () => {
  it("should transcribe code-mixed Banglish speech and normalize business terms", async () => {
    const result = await BuzzWhisperSpeechService.transcribeBanglishVoiceAudio({
      languageMode: "code-mixed",
    });

    expect(result.confidenceScore).toBeGreaterThan(0.98);
    expect(result.normalizedText).toContain("bKash");
    expect(result.normalizedText).toContain("Steadfast");
    expect(result.extractedKeywords).toContain("bKash");
    expect(result.extractedKeywords).toContain("Steadfast");
  });
});
