import { describe, it, expect } from "vitest";
import {
  generateCharacterReply,
} from "../character-messenger";

describe("Direct Character Messenger & Voice-Note Lore Chat (Capability #22)", () => {
  it("generates enigmatic philosophical in-persona reply from Himu when questioned about Rupa", () => {
    const userMsg = "হিমু, তুমি রূপার নীল শাড়িটি কেন নিলে না?";
    const reply = generateCharacterReply("char_himu", userMsg);

    expect(reply.replyText).toContain("রুপা");
    expect(reply.replyText).toContain("নীল");
    expect(reply.replyText).toContain("মায়া");
    expect(reply.emotion).toBe("enigmatic");
    expect(reply.secretLore).toBeDefined();
    expect(reply.secretLore?.topic).toContain("রূপার নীল খাম");
  });

  it("generates detached psychological reply from Himu when questioned about the police station", () => {
    const userMsg = "ওসি রফিক তো তোমাকে থানায় আটকে রেখেছে, তুমি ভয় পাচ্ছ না?";
    const reply = generateCharacterReply("char_himu", userMsg);

    expect(reply.replyText).toContain("ওসি সাহেব");
    expect(reply.replyText).toContain("লকআপ");
    expect(reply.emotion).toBe("detached");
    expect(reply.secretLore?.confession).toContain("ওসি সাহেব");
  });

  it("generates exasperated and anxious dialogue from Badal regarding Himu's antics", () => {
    const userMsg = "বাদল, হিমু ভাই কি আজ রাতে তোমার সাথে ছিল?";
    const reply = generateCharacterReply("char_badal", userMsg);

    expect(reply.replyText).toContain("হিমু");
    expect(reply.emotion).toBe("exasperated_warm");
    expect(reply.secretLore?.topic).toContain("বাদলের ডায়েরি");
  });

  it("generates authoritative legal defiance from OC Rafiq", () => {
    const userMsg = "আপনি কি হিমুকে ছেড়ে দেবেন?";
    const reply = generateCharacterReply("char_oc_rafiq", userMsg);

    expect(reply.replyText).toContain("সিআরপিসি");
    expect(reply.replyText).toContain("হিমু");
    expect(reply.emotion).toBe("stern_authoritative");
    expect(reply.secretLore?.topic).toContain("পিতার অমীমাংসিত ফাইল");
  });

  it("handles fallback default character gracefully", () => {
    const reply = generateCharacterReply("char_unknown", "Hello?");
    expect(reply.replyText).toBeTruthy();
    expect(reply.emotion).toBe("neutral");
  });
});
