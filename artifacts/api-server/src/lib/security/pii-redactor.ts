/**
 * Zero-PII Data Gasket Engine
 * Redacts sensitive Personally Identifiable Information (PII), Bangladesh-specific identifiers,
 * financial credentials, and auth tokens from logs, traces, telemetry, and error payloads.
 */

// Regex patterns for sensitive South Asian / Bangladesh & global PII
const BD_PHONE_REGEX = /(?:\+?880|0)1[3-9]\d{8}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const BD_NID_REGEX = /\b\d{10}\b|\b\d{13}\b|\b\d{17}\b/g; // 10-digit Smart NID, 13/17-digit legacy NID
const BEARER_AUTH_REGEX = /Bearer\s+([A-Za-z0-9_\-\.~+/]+=*)/gi;

const SENSITIVE_KEY_NAMES = new Set([
  "password",
  "passwd",
  "secret",
  "secretkey",
  "apikey",
  "api_key",
  "token",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "authorization",
  "bearer",
  "pin",
  "cvv",
  "cvc",
  "cardnumber",
  "card_number",
  "nid",
  "nationalid",
  "national_id",
  "bkashpin",
  "nagadpin",
]);

/**
 * Mask a phone number while keeping network prefix and last 2 digits
 * e.g. 01712345678 -> 017****5678, +8801812345678 -> +88018****5678
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "[REDACTED_PHONE]";
  const prefix = phone.slice(0, phone.startsWith("+88") ? 6 : 3);
  const suffix = phone.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * Mask an email address
 * e.g. user.name@example.com -> u***e@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length === 0) return "[REDACTED_EMAIL]";
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Mask a credit card number to last 4 digits
 * e.g. 4111 2222 3333 4444 -> ****-****-****-4444
 */
export function maskCreditCard(card: string): string {
  const clean = card.replace(/\D/g, "");
  if (clean.length < 12) return "[REDACTED_CARD]";
  const last4 = clean.slice(-4);
  return `****-****-****-${last4}`;
}

/**
 * Redact sensitive PII strings from raw text
 */
export function redactPiiText(text: string): string {
  if (!text || typeof text !== "string") return text;

  let redacted = text;

  // Mask bearer tokens
  redacted = redacted.replace(BEARER_AUTH_REGEX, "Bearer [REDACTED_TOKEN]");

  // Mask credit card numbers
  redacted = redacted.replace(CREDIT_CARD_REGEX, (match) => maskCreditCard(match));

  // Mask BD Phone Numbers
  redacted = redacted.replace(BD_PHONE_REGEX, (match) => maskPhone(match));

  // Mask Email addresses
  redacted = redacted.replace(EMAIL_REGEX, (match) => maskEmail(match));

  return redacted;
}

/**
 * Recursively redacts PII from objects, arrays, and nested structures
 */
export function redactPiiObject<T>(input: T, depth = 0): T {
  // Prevent runaway recursion
  if (depth > 12 || input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    return redactPiiText(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => redactPiiObject(item, depth + 1)) as unknown as T;
  }

  if (typeof input === "object") {
    // If it's a Buffer, Date, or Error, handle safely
    if (input instanceof Date) return input;
    if (input instanceof Error) {
      return {
        name: input.name,
        message: redactPiiText(input.message),
        stack: input.stack ? redactPiiText(input.stack) : undefined,
      } as unknown as T;
    }

    const output: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, "");

      if (SENSITIVE_KEY_NAMES.has(lowerKey)) {
        output[key] = "[REDACTED]";
      } else if (typeof value === "string") {
        output[key] = redactPiiText(value);
      } else if (typeof value === "object" && value !== null) {
        output[key] = redactPiiObject(value, depth + 1);
      } else {
        output[key] = value;
      }
    }
    return output as T;
  }

  return input;
}
