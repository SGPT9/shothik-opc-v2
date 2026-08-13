import { describe, it, expect } from "vitest";
import { ChatGptVoiceAgentService } from "../chatgpt-voice-agent-service";

describe("ChatGptVoiceAgentService", () => {
  it("should execute bKash payment verification via voice action", () => {
    const res = ChatGptVoiceAgentService.executeVoiceAction("Verify bKash payment", "bkash_verify_payment", "bn-BD");

    expect(res.executionId).toContain("voice_exec_");
    expect(res.actionType).toBe("bkash_verify_payment");
    expect(res.metadata.trxId).toBe("8N7X2P91M");
    expect(res.spokenTranscript).toContain("bKash TrxID");
  });

  it("should execute Steadfast courier booking via voice action", () => {
    const res = ChatGptVoiceAgentService.executeVoiceAction("Book Steadfast courier", "steadfast_book_courier", "bn-BD");

    expect(res.actionType).toBe("steadfast_book_courier");
    expect(res.metadata.trackingCode).toBe("ST-99824");
  });

  it("should execute NBR Form 11GA Tax Clearance via voice action", () => {
    const res = ChatGptVoiceAgentService.executeVoiceAction("File NBR Tax Return", "nbr_tax_clearance_form11ga", "bn-BD");

    expect(res.actionType).toBe("nbr_tax_clearance_form11ga");
    expect(res.metadata.receiptNo).toContain("NBR-2026");
  });
});
