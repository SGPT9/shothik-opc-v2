import { describe, it, expect, beforeEach } from "vitest";
import {
  sqliteDb,
  rawSqlite,
  initSqliteTables,
  setCache,
  getCache,
  deleteCache,
  clearExpiredCache,
  recordAgentTrace,
  getAgentTracesBySession,
  getAgentTrace,
  clearSessionTraces,
} from "../sqlite";
import { localCacheTable, agentTracesTable } from "../schema/sqlite-schema";
import { eq } from "drizzle-orm";

describe("SQLite Local DB Layer", () => {
  beforeEach(async () => {
    await initSqliteTables();
  });

  describe("Table Initialization", () => {
    it("successfully creates and verifies local_cache and agent_traces tables", async () => {
      await initSqliteTables();
      const testKey = `init_test_${Date.now()}`;
      await sqliteDb.insert(localCacheTable).values({
        key: testKey,
        value: "ok",
        createdAt: Date.now(),
      });

      const [row] = await sqliteDb.select().from(localCacheTable).where(eq(localCacheTable.key, testKey));
      expect(row).toBeDefined();
      expect(row.value).toBe("ok");
    });
  });

  describe("Cache Utilities", () => {
    it("sets, gets, and updates cached values", async () => {
      const key = "user_settings_101";
      const payload = { theme: "dark", lang: "bn", notifications: true };

      await setCache(key, payload, 60000);
      const retrieved = await getCache<typeof payload>(key);
      expect(retrieved).toEqual(payload);

      // Update same key
      const updatedPayload = { ...payload, theme: "light" };
      await setCache(key, updatedPayload, 60000);
      const retrievedUpdated = await getCache<typeof payload>(key);
      expect(retrievedUpdated?.theme).toBe("light");
    });

    it("handles TTL expiration and lazy eviction", async () => {
      const key = "transient_token";
      // Set expired in the past (1ms TTL and wait, or negative TTL)
      await setCache(key, { token: "abc" }, -100);

      const retrieved = await getCache(key);
      expect(retrieved).toBeNull();

      // Ensure key was deleted lazily
      const [row] = await sqliteDb.select().from(localCacheTable).where(eq(localCacheTable.key, key));
      expect(row).toBeUndefined();
    });

    it("explicitly deletes keys", async () => {
      const key = "to_delete";
      await setCache(key, "data");
      await deleteCache(key);
      const res = await getCache(key);
      expect(res).toBeNull();
    });

    it("clears bulk expired cache rows", async () => {
      await setCache("exp_1", "data1", -500);
      await setCache("exp_2", "data2", -500);
      await setCache("valid_1", "data3", 60000);

      const count = await clearExpiredCache();
      expect(count).toBeGreaterThanOrEqual(2);

      const valid = await getCache("valid_1");
      expect(valid).toBe("data3");
    });
  });

  describe("Agent Trace Utilities", () => {
    it("records, retrieves by session, and fetches single trace", async () => {
      const sessionId = `session_${Date.now()}`;
      
      const trace1 = await recordAgentTrace({
        sessionId,
        agentName: "planner",
        prompt: "Create migration plan",
        response: "Migration steps prepared",
        durationMs: 120,
        metadata: { model: "gemini-2.5-flash", steps: 3 },
      });

      const trace2 = await recordAgentTrace({
        sessionId,
        agentName: "code-reviewer",
        prompt: "Review sqlite.ts implementation",
        response: "Code conforms to standards",
        durationMs: 85,
        metadata: { verdict: "PASS" },
      });

      expect(trace1.id).toBeDefined();
      expect(trace2.id).toBeDefined();

      const sessionTraces = await getAgentTracesBySession(sessionId);
      expect(sessionTraces.length).toBe(2);
      expect(sessionTraces.map((t) => t.agentName)).toContain("planner");
      expect(sessionTraces.map((t) => t.agentName)).toContain("code-reviewer");

      const single = await getAgentTrace(trace1.id);
      expect(single).toBeDefined();
      expect(single?.prompt).toBe("Create migration plan");
      expect(JSON.parse(single?.metadata || "{}").steps).toBe(3);
    });

    it("clears traces by session", async () => {
      const sessionId = `session_to_clear_${Date.now()}`;
      await recordAgentTrace({
        sessionId,
        agentName: "tdd-guide",
        prompt: "Run tests",
      });

      await clearSessionTraces(sessionId);
      const traces = await getAgentTracesBySession(sessionId);
      expect(traces.length).toBe(0);
    });
  });
});

