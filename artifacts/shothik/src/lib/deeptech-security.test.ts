/**
 * Deep-Tech Security Key Vault & AES-256-GCM Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { keyVaultSentinel } from "../../../api-server/src/security/key-vault-sentinel";

describe("Deep-Tech Security Suite (Zero-Trust Key Vault)", () => {
  it("encrypts secret using AES-256-GCM and decrypts back accurately", () => {
    const rawSecret = "bkash_app_secret_live_99812487123";
    const payload = keyVaultSentinel.encryptSecret(rawSecret);

    expect(payload.secretId).toContain("sec_");
    expect(payload.encryptedContentHex).not.toBe(rawSecret);
    expect(payload.authTagHex).toBeDefined();

    const decrypted = keyVaultSentinel.decryptSecret(payload);
    expect(decrypted).toBe(rawSecret);
  });

  it("throws error when attempting to decrypt tampered payload", () => {
    const payload = keyVaultSentinel.encryptSecret("sensitve_api_token");
    payload.encryptedContentHex = "tampered_hex_content_000";

    expect(() => keyVaultSentinel.decryptSecret(payload)).toThrow();
  });
});
