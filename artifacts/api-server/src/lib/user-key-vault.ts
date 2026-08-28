import { db, keyCustodyTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { logger } from "./logger";

const ENCRYPTION_SECRET = process.env.KEY_VAULT_SECRET || process.env.BETTER_AUTH_SECRET || "shothik-default-vault-secure-seed-key-32bytes!";

// Derive 32-byte key
const keyBuffer = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();

/**
 * Encrypt sensitive API credential at rest
 */
function sealKey(plainText: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt credential for execution runtime
 */
function unsealKey(sealedText: string): string {
  try {
    const parts = sealedText.split(":");
    if (parts.length !== 3) return sealedText;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err: any) {
    logger.warn({ error: err.message }, "[UserKeyVault] Failed to decrypt key, returning raw value");
    return sealedText;
  }
}

export class UserKeyVault {
  /**
   * Save or update a user's BYOK credential
   */
  public async saveKey(
    userId: string,
    provider: string,
    credentials: { apiKey?: string; secretKey?: string; endpointUrl?: string; extra?: Record<string, any> }
  ): Promise<void> {
    const sealed = sealKey(JSON.stringify(credentials));
    const purpose = `connector_${provider.toLowerCase()}`;

    try {
      const existing = await db
        .select()
        .from(keyCustodyTable)
        .where(and(eq(keyCustodyTable.userId, userId), eq(keyCustodyTable.purpose, purpose)));

      if (existing.length > 0) {
        await db
          .update(keyCustodyTable)
          .set({
            sealedKey: sealed,
            provider,
            updatedAt: new Date(),
          })
          .where(eq(keyCustodyTable.id, existing[0].id));
      } else {
        await db.insert(keyCustodyTable).values({
          userId,
          purpose,
          provider,
          sealedKey: sealed,
        });
      }
      logger.info({ userId, provider }, "[UserKeyVault] Stored user BYOK credentials securely");
    } catch (err: any) {
      logger.error({ userId, provider, error: err.message }, "[UserKeyVault] Failed to save key in DB");
    }
  }

  /**
   * Retrieve and unseal a user's credentials for execution
   */
  public async getKey(userId: string, provider: string): Promise<{ apiKey?: string; secretKey?: string; endpointUrl?: string; extra?: Record<string, any> } | null> {
    const purpose = `connector_${provider.toLowerCase()}`;
    try {
      const records = await db
        .select()
        .from(keyCustodyTable)
        .where(and(eq(keyCustodyTable.userId, userId), eq(keyCustodyTable.purpose, purpose)));

      if (records.length === 0) return null;
      const unsealed = unsealKey(records[0].sealedKey);
      return JSON.parse(unsealed);
    } catch (err: any) {
      logger.warn({ userId, provider, error: err.message }, "[UserKeyVault] Could not retrieve user key");
      return null;
    }
  }

  /**
   * List all configured providers for a user with masked key previews
   */
  public async listUserProviders(userId: string): Promise<Record<string, { configured: boolean; maskedKey: string; endpointUrl?: string }>> {
    try {
      const records = await db
        .select()
        .from(keyCustodyTable)
        .where(eq(keyCustodyTable.userId, userId));

      const result: Record<string, { configured: boolean; maskedKey: string; endpointUrl?: string }> = {};

      for (const record of records) {
        const providerName = record.provider || record.purpose.replace("connector_", "");
        try {
          const raw = JSON.parse(unsealKey(record.sealedKey));
          const keyStr = raw.apiKey || raw.secretKey || "";
          const masked = keyStr.length > 8 ? `${keyStr.slice(0, 4)}...${keyStr.slice(-4)}` : "••••••••";
          result[providerName.toLowerCase()] = {
            configured: true,
            maskedKey: masked,
            endpointUrl: raw.endpointUrl,
          };
        } catch {
          result[providerName.toLowerCase()] = { configured: true, maskedKey: "••••••••" };
        }
      }

      return result;
    } catch (err: any) {
      logger.warn({ userId, error: err.message }, "[UserKeyVault] Error listing user providers");
      return {};
    }
  }

  /**
   * Delete a user's stored provider key
   */
  public async deleteKey(userId: string, provider: string): Promise<void> {
    const purpose = `connector_${provider.toLowerCase()}`;
    try {
      await db
        .delete(keyCustodyTable)
        .where(and(eq(keyCustodyTable.userId, userId), eq(keyCustodyTable.purpose, purpose)));
      logger.info({ userId, provider }, "[UserKeyVault] Removed user BYOK credentials");
    } catch (err: any) {
      logger.error({ userId, provider, error: err.message }, "[UserKeyVault] Failed to delete key");
    }
  }
}

export const userKeyVault = new UserKeyVault();
