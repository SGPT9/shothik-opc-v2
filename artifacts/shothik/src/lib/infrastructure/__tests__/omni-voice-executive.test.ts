import { describe, it, expect } from "vitest";
import { OmniVoiceExecutiveService } from "../omni-voice-executive";

describe("OmniVoiceExecutiveService", () => {
  it("should generate Early Morning Executive Briefing script", async () => {
    const briefing = await OmniVoiceExecutiveService.generateMorningBriefing({
      founderName: "Tanvir",
      city: "Dhaka",
    });

    expect(briefing.founderName).toBe(undefined);
    expect(briefing.overnightTasksCompleted).toBe(2);
    expect(briefing.totalRevenueBdt).toBe(22500);
    expect(briefing.spokenBriefingAudioScript).toContain("শুভ সকাল Tanvir!");
    expect(briefing.spokenBriefingAudioScript).toContain("২২,৫০০");
  });

  it("should execute WhatsApp payment tool call during realtime voice turn", async () => {
    const turn = await OmniVoiceExecutiveService.runOmniVoiceTurn({
      sessionId: "sess_voice_101",
      voiceInputText: "Send bKash payment link to customer on WhatsApp",
      whatsappPhone: "01712345678",
    });

    expect(turn.toolCallExecuted?.toolName).toBe("whatsapp_bkash_payment");
    expect(turn.aiResponseText).toContain("হোয়াটসঅ্যাপে বিকাশ পেমেন্ট লিংক");
    expect(turn.whatsappAuthStatus).toBe("authenticated");
  });

  it("should execute live Wigolo web search during realtime voice turn", async () => {
    const turn = await OmniVoiceExecutiveService.runOmniVoiceTurn({
      sessionId: "sess_voice_102",
      voiceInputText: "Search latest tech news in Dhaka",
    });

    expect(turn.toolCallExecuted?.toolName).toBe("wigolo_keyless_search");
    expect(turn.aiResponseText).toContain("লাইভ সার্চের তথ্য");
  });
});
