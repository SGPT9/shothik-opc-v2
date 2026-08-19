import { describe, it, expect } from "vitest";
import { WhatsAppRescueAdapter } from "../whatsapp-rescue-adapter";

describe("📱 WhatsApp Cloud API & Inbound Rescue Adapter TDD Suite", () => {
  it("should validate and standardize Bangladeshi phone numbers to E.164", () => {
    expect(WhatsAppRescueAdapter.validateBdPhoneNumber("01712345678")).toEqual({
      isValid: true,
      formatted: "+8801712345678",
    });

    expect(WhatsAppRescueAdapter.validateBdPhoneNumber("+8801812345678")).toEqual({
      isValid: true,
      formatted: "+8801812345678",
    });

    expect(WhatsAppRescueAdapter.validateBdPhoneNumber("019-1234-5678")).toEqual({
      isValid: true,
      formatted: "+8801912345678",
    });

    expect(WhatsAppRescueAdapter.validateBdPhoneNumber("123456")).toEqual({
      isValid: false,
      formatted: "123456",
    });
  });

  it("should format and dispatch zero-return rescue WhatsApp message", async () => {
    const payload = WhatsAppRescueAdapter.createZeroReturnRescuePayload(
      "01712345678",
      "রাকিব হাসান",
      "steadfast",
      "ST-882910"
    );

    expect(payload.templateType).toBe("ZERO_RETURN_RESCUE");
    expect(payload.messageBody).toContain("Assalamu Alaikum রাকিব হাসান");
    expect(payload.messageBody).toContain("STEADFAST rider delivery korte eshechilo");

    const result = await WhatsAppRescueAdapter.dispatchMessage(payload);
    expect(result.status).toBe("SENT");
    expect(result.recipient).toBe("+8801712345678");
    expect(result.messageId).toMatch(/^wamid\.HBgM[A-Z0-9]+$/);
  });
});
