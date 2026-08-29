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

// Circuit breaker for database connection health
let isPostgresAvailable = true;
let lastPostgresFailureTime = 0;
const POSTGRES_CIRCUIT_BREAKER_TTL_MS = 30000;

export class UserKeyVault {
  private fallbackStore = new Map<string, string>();

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
    const fallbackKey = `${userId}:${purpose}`;

    // Always mirror to fast local memory store for zero-latency failover
    this.fallbackStore.set(fallbackKey, sealed);

    const now = Date.now();
    const shouldProbeDb = isPostgresAvailable || now - lastPostgresFailureTime > POSTGRES_CIRCUIT_BREAKER_TTL_MS;

    if (shouldProbeDb) {
      try {
        const existing = await db
          .select()
          .from(keyCustodyTable)
          .where(and(eq(keyCustodyTable.userId, userId), eq(keyCustodyTable.purpose, purpose)));

        isPostgresAvailable = true;

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
        isPostgresAvailable = false;
        lastPostgresFailureTime = Date.now();
        logger.warn({ userId, provider, error: err.message }, "[UserKeyVault] DB offline, retained key in local encrypted memory vault");
      }
    }
  }

  /**
   * Retrieve and unseal a user's credentials for execution
   */
  public async getKey(userId: string, provider: string): Promise<{ apiKey?: string; secretKey?: string; endpointUrl?: string; extra?: Record<string, any> } | null> {
    const purpose = `connector_${provider.toLowerCase()}`;
    const fallbackKey = `${userId}:${purpose}`;

    const now = Date.now();
    const shouldProbeDb = isPostgresAvailable || now - lastPostgresFailureTime > POSTGRES_CIRCUIT_BREAKER_TTL_MS;

    if (shouldProbeDb) {
      try {
        const records = await db
          .select()
          .from(keyCustodyTable)
          .where(and(eq(keyCustodyTable.userId, userId), eq(keyCustodyTable.purpose, purpose)));

        isPostgresAvailable = true;

        if (records.length > 0) {
          const unsealed = unsealKey(records[0].sealedKey);
          return JSON.parse(unsealed);
        }
      } catch (err: any) {
        isPostgresAvailable = false;
        lastPostgresFailureTime = Date.now();
        logger.warn({ userId, provider, error: err.message }, "[UserKeyVault] DB read error, querying local memory vault");
      }
    }

    // Check local memory fallback
    const localSealed = this.fallbackStore.get(fallbackKey);
    if (localSealed) {
      try {
        const unsealed = unsealKey(localSealed);
        return JSON.parse(unsealed);
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * List all configured providers for a user with masked key previews
   */
  public async listUserProviders(userId: string): Promise<Record<string, { configured: boolean; maskedKey: string; endpointUrl?: string }>> {
    const result: Record<string, { configured: boolean; maskedKey: string; endpointUrl?: string }> = {};

    const now = Date.now();
    const shouldProbeDb = isPostgresAvailable || now - lastPostgresFailureTime > POSTGRES_CIRCUIT_BREAKER_TTL_MS;

    // 1. Load from DB if available
    if (shouldProbeDb) {
      try {
        const records = await db
          .select()
          .from(keyCustodyTable)
          .where(eq(keyCustodyTable.userId, userId));

        isPostgresAvailable = true;

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
      } catch (err: any) {
        isPostgresAvailable = false;
        lastPostgresFailureTime = Date.now();
        logger.warn({ userId, error: err.message }, "[UserKeyVault] DB list error, using local memory");
      }
    }

    // 2. Overlay local memory entries if DB was offline
    for (const [key, sealed] of this.fallbackStore.entries()) {
      if (key.startsWith(`${userId}:`)) {
        const providerName = key.replace(`${userId}:connector_`, "");
        if (!result[providerName]) {
          try {
            const raw = JSON.parse(unsealKey(sealed));
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
      }
    }

    return result;
  }

  /**
   * Delete a user's stored provider key
   */
  public async deleteKey(userId: string, provider: string): Promise<void> {
    const purpose = `connector_${provider.toLowerCase()}`;
    const fallbackKey = `${userId}:${purpose}`;
    this.fallbackStore.delete(fallbackKey);

    const now = Date.now();
    const shouldProbeDb = isPostgresAvailable || now - lastPostgresFailureTime > POSTGRES_CIRCUIT_BREAKER_TTL_MS;

    if (shouldProbeDb) {
      try {
        await db
          .delete(keyCustodyTable)
          .where(and(eq(keyCustodyTable.userId, userId), eq(keyCustodyTable.purpose, purpose)));
        logger.info({ userId, provider }, "[UserKeyVault] Removed user BYOK credentials");
      } catch (err: any) {
        isPostgresAvailable = false;
        lastPostgresFailureTime = Date.now();
        logger.warn({ userId, provider, error: err.message }, "[UserKeyVault] DB delete error, removed from local memory");
      }
    }
  }
}

export const userKeyVault = new UserKeyVault();
