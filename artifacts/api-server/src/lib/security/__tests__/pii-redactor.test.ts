import { describe, it, expect } from "vitest";
import {
  redactPiiText,
  redactPiiObject,
  maskPhone,
  maskEmail,
  maskCreditCard,
} from "../pii-redactor";
import { structuredLogger } from "../../structured-logger";

describe("Zero-PII Data Gasket Engine", () => {
  it("masks Bangladeshi phone numbers accurately", () => {
    expect(maskPhone("01712345678")).toBe("017****5678");
    expect(maskPhone("+8801812345678")).toBe("+88018****5678");
    expect(maskPhone("123")).toBe("[REDACTED_PHONE]");
  });

  it("masks email addresses accurately", () => {
    expect(maskEmail("user@example.com")).toBe("u***r@example.com");
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
  });

  it("masks credit card numbers leaving only the last 4 digits", () => {
    expect(maskCreditCard("4111 2222 3333 4444")).toBe("****-****-****-4444");
    expect(maskCreditCard("5555666677778888")).toBe("****-****-****-8888");
  });

  it("redacts sensitive strings embedded in freeform log messages", () => {
    const raw = "Customer 01799887766 made payment of 500 BDT with card 4111 2222 3333 4444. Auth: Bearer sk-live-secret-token-xyz123";
    const redacted = redactPiiText(raw);

    expect(redacted).not.toContain("01799887766");
    expect(redacted).toContain("017****7766");
    expect(redacted).not.toContain("4111 2222 3333 4444");
    expect(redacted).toContain("****-****-****-4444");
    expect(redacted).not.toContain("sk-live-secret-token-xyz123");
    expect(redacted).toContain("Bearer [REDACTED_TOKEN]");
  });

  it("recursively redacts sensitive keys and values in nested JSON objects", () => {
    const payload = {
      user: {
        name: "Rahim Ahmed",
        email: "rahim@shothik.ai",
        phone: "01812345678",
        nid: "19942691234567890",
        bkashPin: "12345",
      },
      headers: {
        authorization: "Bearer my-secret-jwt-token",
        apiKey: "sk-proj-xyz",
      },
      cart: {
        items: [
          { sku: "TEA-BT2", price: 420 },
        ],
      },
    };

    const clean = redactPiiObject(payload);

    expect(clean.user.name).toBe("Rahim Ahmed");
    expect(clean.user.email).toContain("r***m@shothik.ai");
    expect(clean.user.phone).toContain("018****5678");
    expect(clean.user.nid).toBe("[REDACTED]");
    expect(clean.user.bkashPin).toBe("[REDACTED]");
    expect(clean.headers.authorization).toBe("[REDACTED]");
    expect(clean.headers.apiKey).toBe("[REDACTED]");
    expect(clean.cart.items[0].sku).toBe("TEA-BT2");
  });

  it("integrates seamlessly into StructuredLogger without leakage", () => {
    const log = structuredLogger.log(
      "info",
      "Processed settlement for customer phone 01912345678",
      "trc_test_01",
      {
        secretKey: "top-secret-val",
        customerNote: "Contact me at founder@example.com or 01711223344",
      }
    );

    expect(log.message).not.toContain("01912345678");
    expect(log.message).toContain("019****5678");
    expect(log.meta?.secretKey).toBe("[REDACTED]");
    expect(log.meta?.customerNote).toContain("f***r@example.com");
    expect(log.meta?.customerNote).toContain("017****3344");
  });
});
