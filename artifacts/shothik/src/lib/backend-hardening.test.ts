/**
 * Full Backend Hardening Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { rateLimiterService } from "../../../api-server/src/lib/rate-limiter";
import { databaseMigrationService } from "../../../api-server/src/db/migrate-and-seed";

describe("Full Backend Hardening Suite", () => {
  describe("RateLimiterService (Redis Token Bucket)", () => {
    it("allows requests under max limit and tracks remaining quota", () => {
      const result = rateLimiterService.isAllowed("test_client_01", { windowMs: 60000, maxRequests: 5 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("blocks requests once rate limit is exceeded", () => {
      const key = "test_client_blocked";
      for (let i = 0; i < 3; i++) {
        rateLimiterService.isAllowed(key, { windowMs: 60000, maxRequests: 3 });
      }

      const blockedResult = rateLimiterService.isAllowed(key, { windowMs: 60000, maxRequests: 3 });
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });
  });

  describe("DatabaseMigrationService (PostgreSQL Schema & RLS Seeder)", () => {
    it("executes migrations, applies RLS policies, and seeds initial accounts", async () => {
      const migration = await databaseMigrationService.runMigrationAndSeed();
      expect(migration.success).toBe(true);
      expect(migration.tablesCreatedCount).toBe(6);
      expect(migration.rlsPoliciesAppliedCount).toBe(4);
      expect(migration.seededAccountsCount).toBe(3);
    });
  });
});
