import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Local SQLite table for caching and offline state
 */
export const localCacheTable = sqliteTable("local_cache", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

/**
 * Local SQLite table for agent session traces and introspection journals
 */
export const agentTracesTable = sqliteTable("agent_traces", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  agentName: text("agent_name").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull().default(""),
  status: text("status").notNull().default("completed"),
  durationMs: integer("duration_ms").notNull().default(0),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export type LocalCache = typeof localCacheTable.$inferSelect;
export type AgentTrace = typeof agentTracesTable.$inferSelect;
