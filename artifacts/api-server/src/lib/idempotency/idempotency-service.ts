import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { db, idempotencyKeysTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../logger";

export interface IdempotencyCheckResult {
  status: "HIT" | "PROCEED" | "CONFLICT";
  responseStatus?: number;
  responseBody?: unknown;
  error?: string;
}

// In-memory fallback map for environments where Postgres is disconnected or in SQLite mode
const localMemoryIdempotencyStore = new Map<
  string,
  {
    userId: string;
    endpoint: string;
    requestHash: string;
    responseStatus: number;
    responseBody: unknown;
    state: "processing" | "completed";
    createdAt: number;
    expiresAt: number;
  }
>();

// Circuit breaker for database connection health
let isPostgresAvailable = true;
let lastPostgresFailureTime = 0;
const POSTGRES_CIRCUIT_BREAKER_TTL_MS = 30000;

/**
 * Computes deterministic SHA-256 hash of the request payload
 */
export function computeRequestHash(payload: unknown): string {
  const normalized = typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export class IdempotencyService {
  private static instance: IdempotencyService;

  public static getInstance(): IdempotencyService {
    if (!IdempotencyService.instance) {
      IdempotencyService.instance = new IdempotencyService();
    }
    return IdempotencyService.instance;
  }

  /**
   * Acquire or check an idempotency key before running the business logic
   */
  public async acquire(params: {
    key: string;
    userId: string;
    endpoint: string;
    requestHash: string;
    ttlHours?: number;
  }): Promise<IdempotencyCheckResult> {
    const { key, userId, endpoint, requestHash, ttlHours = 24 } = params;
    const now = Date.now();
    const expiresAt = new Date(now + ttlHours * 60 * 60 * 1000);

    // Check circuit breaker status
    const shouldProbePostgres =
      isPostgresAvailable || now - lastPostgresFailureTime > POSTGRES_CIRCUIT_BREAKER_TTL_MS;

    if (shouldProbePostgres) {
      try {
        const [existing] = await db
          .select()
          .from(idempotencyKeysTable)
          .where(eq(idempotencyKeysTable.key, key));

        isPostgresAvailable = true;

        if (existing) {
          if (existing.state === "completed") {
            logger.info({ key, endpoint }, "[idempotency] Cache HIT for completed mutation");
            return {
              status: "HIT",
              responseStatus: existing.responseStatus ?? 200,
              responseBody: existing.responseBody,
            };
          }

          // State is processing. If lock is younger than 30 seconds, reject concurrent race
          const lockAgeMs = now - new Date(existing.createdAt).getTime();
          if (lockAgeMs < 30000) {
            logger.warn({ key, endpoint }, "[idempotency] Concurrent lock conflict");
            return {
              status: "CONFLICT",
              error: "A mutation with this Idempotency-Key is currently in progress. Please retry in a few moments.",
            };
          }

          // Lock expired / stale worker recovery: reclaim lock
          await db
            .update(idempotencyKeysTable)
            .set({ requestHash, createdAt: new Date() })
            .where(eq(idempotencyKeysTable.key, key));
          return { status: "PROCEED" };
        }

        // Insert new processing record
        await db.insert(idempotencyKeysTable).values({
          key,
          userId,
          endpoint,
          requestHash,
          state: "processing",
          expiresAt,
        });

        return { status: "PROCEED" };
      } catch (dbErr: any) {
        isPostgresAvailable = false;
        lastPostgresFailureTime = now;
        logger.debug({ error: dbErr.message }, "[idempotency] Circuit open, using local memory store");
      }
    }

    // In-memory fallback (Instantaneous sub-millisecond execution)
    const local = localMemoryIdempotencyStore.get(key);

    if (local) {
      if (local.state === "completed") {
        return {
          status: "HIT",
          responseStatus: local.responseStatus,
          responseBody: local.responseBody,
        };
      }
      if (now - local.createdAt < 30000) {
        return {
          status: "CONFLICT",
          error: "A mutation with this Idempotency-Key is currently in progress.",
        };
      }
    }

    localMemoryIdempotencyStore.set(key, {
      userId,
      endpoint,
      requestHash,
      responseStatus: 200,
      responseBody: null,
      state: "processing",
      createdAt: now,
      expiresAt: now + ttlHours * 60 * 60 * 1000,
    });

    return { status: "PROCEED" };
  }

  /**
   * Finalize the idempotency record with the completed response
   */
  public async complete(params: {
    key: string;
    responseStatus: number;
    responseBody: unknown;
  }): Promise<void> {
    const { key, responseStatus, responseBody } = params;

    if (isPostgresAvailable) {
      try {
        await db
          .update(idempotencyKeysTable)
          .set({
            state: "completed",
            responseStatus,
            responseBody,
          })
          .where(eq(idempotencyKeysTable.key, key));
      } catch (err: any) {
        isPostgresAvailable = false;
        lastPostgresFailureTime = Date.now();
      }
    }

    // Always keep memory fallback in sync
    const local = localMemoryIdempotencyStore.get(key);
    if (local) {
      local.state = "completed";
      local.responseStatus = responseStatus;
      local.responseBody = responseBody;
    } else {
      localMemoryIdempotencyStore.set(key, {
        userId: "usr_fallback",
        endpoint: "api",
        requestHash: "hash",
        responseStatus,
        responseBody,
        state: "completed",
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    }
  }

  /**
   * Helper for testing: resets circuit breaker state
   */
  public resetCircuitBreaker(): void {
    isPostgresAvailable = false;
    lastPostgresFailureTime = Date.now();
  }
}

export const idempotencyService = IdempotencyService.getInstance();

/**
 * Express Middleware: Automatically protects mutating routes with Idempotency-Key
 */
export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const rawKey = req.headers["idempotency-key"] || req.headers["x-idempotency-key"];
  if (!rawKey || typeof rawKey !== "string") {
    // No idempotency key supplied: proceed normally
    next();
    return;
  }

  const key = rawKey.trim();
  const userId = (req.headers["x-user-id"] as string) || (req.query?.userId as string) || "usr_anonymous";
  const endpoint = req.baseUrl + req.path;
  const requestHash = computeRequestHash(req.body);

  idempotencyService
    .acquire({ key, userId, endpoint, requestHash })
    .then((result) => {
      if (result.status === "HIT") {
        res.setHeader("X-Cache-Lookup", "HIT");
        res.setHeader("Idempotency-Replay", "true");
        res.status(result.responseStatus || 200).json(result.responseBody);
        return;
      }

      if (result.status === "CONFLICT") {
        res.status(409).json({
          success: false,
          error: result.error || "Concurrent operation with this Idempotency-Key is already in progress.",
        });
        return;
      }

      // Intercept res.json to capture downstream response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        idempotencyService
          .complete({
            key,
            responseStatus: res.statusCode,
            responseBody: body,
          })
          .catch((e) => logger.warn({ error: e.message }, "[idempotency] Failed to record completed response"));

        return originalJson(body);
      };

      next();
    })
    .catch((err) => {
      logger.error({ error: err.message }, "[idempotency] Error in idempotency middleware");
      next();
    });
}
