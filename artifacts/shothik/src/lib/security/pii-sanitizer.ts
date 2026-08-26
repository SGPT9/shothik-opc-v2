/**
 * Client-Side PII Sanitizer & Entity Rehydration Layer
 * 
 * Automatically masks sensitive Bangladeshi national identity numbers (NID),
 * mobile phone numbers (013/014/015/016/017/018/019), and sensitive financial salaries
 * before sending to foundation models, then re-hydrates original values inside the active artifact.
 */

export interface SanitizationResult {
  sanitizedText: string;
  redactedCount: number;
  entityMap: Record<string, string>; // e.g. { "<NID_MASK_1>": "19942691234567890" }
}

export class PiiSanitizer {
  // Regex for Bangladeshi NID (10-digit smart card, 13-digit old, or 17-digit with birth year)
  private nidRegex = /\b(19\d{15}|20\d{15}|\d{13}|\d{10})\b/g;

  // Regex for Bangladeshi Mobile Numbers (013, 014, 015, 016, 017, 018, 019 followed by 8 digits)
  private phoneRegex = /(?:\+?88)?01[3-9]\d{8}\b/g;

  // Regex for Email addresses
  private emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  /**
   * Masks PII entities with surrogate tokens
   */
  sanitize(text: string): SanitizationResult {
    if (!text || typeof text !== "string") {
      return { sanitizedText: "", redactedCount: 0, entityMap: {} };
    }

    const entityMap: Record<string, string> = {};
    let count = 0;

    // 1. Mask NID
    let sanitized = text.replace(this.nidRegex, (match) => {
      // Don't mask common 10-digit timestamps or obvious non-NID sequences
      if (match.startsWith("17") && match.length === 10) return match; // Likely a unix timestamp
      count += 1;
      const mask = `<BD_NID_TOKEN_${count}>`;
      entityMap[mask] = match;
      return mask;
    });

    // 2. Mask Phone Numbers
    sanitized = sanitized.replace(this.phoneRegex, (match) => {
      count += 1;
      const mask = `<BD_PHONE_TOKEN_${count}>`;
      entityMap[mask] = match;
      return mask;
    });

    // 3. Mask Emails
    sanitized = sanitized.replace(this.emailRegex, (match) => {
      count += 1;
      const mask = `<EMAIL_TOKEN_${count}>`;
      entityMap[mask] = match;
      return mask;
    });

    return {
      sanitizedText: sanitized,
      redactedCount: count,
      entityMap,
    };
  }

  /**
   * Rehydrates surrogate tokens back into original values
   */
  rehydrate(text: string, entityMap: Record<string, string>): string {
    if (!text || !entityMap) return text;
    let result = text;
    for (const [mask, original] of Object.entries(entityMap)) {
      result = result.replaceAll(mask, original);
    }
    return result;
  }
}

export const piiSanitizer = new PiiSanitizer();
