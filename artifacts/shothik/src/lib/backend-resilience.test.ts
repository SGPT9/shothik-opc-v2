/**
 * Full Backend Resilience & Cache Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { cacheManager } from "../../../api-server/src/lib/cache-manager";
import { CircuitBreaker } from "../../../api-server/src/lib/circuit-breaker";

describe("Full Backend Resilience & Cache Suite", () => {
  describe("CacheManager (TTL Expiration & Pattern Invalidation)", () => {
    it("stores and retrieves key value before TTL expiration", () => {
      cacheManager.set("user:101", { name: "আরিফ" }, 10000);
      const val = cacheManager.get<{ name: string }>("user:101");
      expect(val?.name).toBe("আরিফ");
    });

    it("invalidates keys matching wildcard pattern", () => {
      cacheManager.set("workspace:a", 1);
      cacheManager.set("workspace:b", 2);
      cacheManager.set("user:202", 3);

      const deleted = cacheManager.invalidateByPattern("workspace:*");
      expect(deleted).toBe(2);
      expect(cacheManager.get("workspace:a")).toBeNull();
      expect(cacheManager.get("user:202")).toBe(3);
    });
  });

  describe("CircuitBreaker (Microservice Outage Protection)", () => {
    it("trips circuit state to OPEN after reaching failure threshold", async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 2, recoveryTimeoutMs: 5000 });

      const failingAction = async () => {
        throw new Error("Downstream LLM Outage");
      };
      const fallback = () => "FALLBACK_RESPONSE";

      await breaker.execute(failingAction, fallback);
      await breaker.execute(failingAction, fallback);

      const status = breaker.getStatus();
      expect(status.state).toBe("OPEN");

      const immediateResult = await breaker.execute(failingAction, fallback);
      expect(immediateResult).toBe("FALLBACK_RESPONSE");
    });
  });
});
