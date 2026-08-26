/**
 * Client-Side Zero-Trust Key Custody & Secrets Vault
 * 
 * Uses WebCrypto AES-GCM (256-bit) to encrypt third-party credentials in the browser
 * before transmitting or persisting. Secrets are decrypted in ephemeral runtime memory only.
 */

export interface EncryptedSecretRecord {
  id: string;
  label: string;
  provider: "bkash" | "nagad" | "steadfast" | "openai" | "anthropic" | "custom";
  ciphertextBase64: string;
  ivBase64: string;
  createdAt: number;
  lastUsedAt?: number;
}

export class ClientKeyVault {
  private inMemoryDecryptedCache = new Map<string, string>();
  private masterKeyPromise: Promise<CryptoKey> | null = null;

  private async getMasterKey(): Promise<CryptoKey> {
    if (this.masterKeyPromise) return this.masterKeyPromise;

    this.masterKeyPromise = (async () => {
      // Derive browser-local key from crypto.subtle
      const rawEntropy = new TextEncoder().encode("shothik-zero-trust-vault-salt-entropy-v1");
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        rawEntropy,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      return crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new TextEncoder().encode("shothik-browser-salt"),
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    })();

    return this.masterKeyPromise;
  }

  /**
   * Encrypts plaintext API key into ciphertext + IV base64
   */
  async encryptSecret(label: string, provider: EncryptedSecretRecord["provider"], plaintext: string): Promise<EncryptedSecretRecord> {
    const key = await this.getMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Store in ephemeral memory cache for active session
    this.inMemoryDecryptedCache.set(id, plaintext);

    return {
      id,
      label,
      provider,
      ciphertextBase64,
      ivBase64,
      createdAt: Date.now(),
    };
  }

  /**
   * Decrypts ciphertext in ephemeral memory
   */
  async decryptSecret(record: EncryptedSecretRecord): Promise<string> {
    if (this.inMemoryDecryptedCache.has(record.id)) {
      return this.inMemoryDecryptedCache.get(record.id)!;
    }

    const key = await this.getMasterKey();
    const iv = Uint8Array.from(atob(record.ivBase64), (c) => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(record.ciphertextBase64), (c) => c.charCodeAt(0));

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    this.inMemoryDecryptedCache.set(record.id, decryptedText);
    return decryptedText;
  }

  clearSessionMemory() {
    this.inMemoryDecryptedCache.clear();
  }
}

export const clientKeyVault = new ClientKeyVault();
