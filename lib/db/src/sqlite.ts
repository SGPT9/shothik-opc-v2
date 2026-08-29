import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, lt, and, desc } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import {
  localCacheTable,
  agentTracesTable,
  offlineProjectsTable,
  offlineAutosaveTable,
  offlineParcelsTable,
  offlineNilkhetOrdersTable,
  type LocalCache,
  type AgentTrace,
  type OfflineProject,
  type OfflineAutosave,
  type OfflineParcel,
  type OfflineNilkhetOrder,
} from "./schema/sqlite-schema";

// Ensure local data directory exists
const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {
    // Ignore if running in a restricted sandbox or memory mode
  }
}

const sqliteUrl = process.env.SQLITE_DATABASE_URL || `file:${path.join(dataDir, "shothik_local.db")}`;

export const sqliteClient = createClient({
  url: sqliteUrl,
});

export const sqliteDb = drizzle(sqliteClient, {
  schema: {
    localCacheTable,
    agentTracesTable,
    offlineProjectsTable,
    offlineAutosaveTable,
    offlineParcelsTable,
    offlineNilkhetOrdersTable,
  },
});

export { sqliteClient as rawSqlite };

/**
 * Initialize all local SQLite tables and concurrency settings if they do not exist
 */
let tablesInitPromise: Promise<void> | null = null;
export async function initSqliteTables(client: Client = sqliteClient): Promise<void> {
  try {
    await client.execute(`PRAGMA journal_mode = WAL;`);
    await client.execute(`PRAGMA busy_timeout = 5000;`);
    await client.execute(`PRAGMA synchronous = NORMAL;`);
  } catch {
    // Some in-memory or remote libsql drivers ignore pragma journal_mode
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS local_cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      expires_at INTEGER,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS agent_traces (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'completed',
      duration_ms INTEGER NOT NULL DEFAULT 0,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS offline_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      current_version INTEGER NOT NULL DEFAULT 1,
      genre TEXT DEFAULT 'general',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS offline_autosave (
      id TEXT PRIMARY KEY,
      doc_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      checksum TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS offline_parcels (
      tracking_code TEXT PRIMARY KEY,
      consignment_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'steadfast',
      recipient_name TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      cod_amount_bdt INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'BOOKED',
      status_bangla TEXT NOT NULL DEFAULT 'বুক করা হয়েছে',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS offline_nilkhet_orders (
      order_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_title TEXT NOT NULL,
      page_count INTEGER NOT NULL,
      copies INTEGER NOT NULL DEFAULT 1,
      spine_thickness_mm TEXT NOT NULL,
      total_cost_bdt INTEGER NOT NULL,
      delivery_address TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING_PRINT',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}


export async function ensureTablesInitialized(client: Client = sqliteClient): Promise<void> {
  if (!tablesInitPromise) {
    tablesInitPromise = initSqliteTables(client).catch((err) => {
      tablesInitPromise = null;
      throw err;
    });
  }
  return tablesInitPromise;
}

/**
 * Cache Utilities
 */
export async function setCache<T>(key: string, value: T, ttlMs?: number): Promise<void> {
  await ensureTablesInitialized();
  const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : null;
  const serialized = typeof value === "string" ? value : JSON.stringify(value);

  await sqliteDb
    .insert(localCacheTable)
    .values({
      key,
      value: serialized,
      expiresAt,
      createdAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: localCacheTable.key,
      set: {
        value: serialized,
        expiresAt,
      },
    });
}

export async function getCache<T>(key: string): Promise<T | null> {
  await ensureTablesInitialized();
  const rows = await sqliteDb
    .select()
    .from(localCacheTable)
    .where(eq(localCacheTable.key, key));


  if (!rows || rows.length === 0) {
    return null;
  }

  const cached = rows[0];
  if (cached.expiresAt && cached.expiresAt < Date.now()) {
    // Expired - clean up lazily
    await sqliteDb.delete(localCacheTable).where(eq(localCacheTable.key, key));
    return null;
  }

  try {
    return JSON.parse(cached.value) as T;
  } catch {
    return cached.value as unknown as T;
  }
}

export async function deleteCache(key: string): Promise<void> {
  await sqliteDb.delete(localCacheTable).where(eq(localCacheTable.key, key));
}

export async function clearExpiredCache(): Promise<number> {
  const now = Date.now();
  const res = await sqliteDb
    .delete(localCacheTable)
    .where(and(lt(localCacheTable.expiresAt, now)));
  return res.rowsAffected ?? 0;
}

/**
 * Agent Trace Utilities
 */
export interface RecordTraceInput {
  id?: string;
  sessionId: string;
  agentName: string;
  prompt: string;
  response?: string;
  status?: string;
  durationMs?: number;
  metadata?: Record<string, unknown> | string;
}

export async function recordAgentTrace(input: RecordTraceInput): Promise<AgentTrace> {
  await ensureTablesInitialized();
  const traceId = input.id || `trc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const metadataStr = typeof input.metadata === "object" ? JSON.stringify(input.metadata) : (input.metadata || "{}");
  
  const record: AgentTrace = {
    id: traceId,
    sessionId: input.sessionId,
    agentName: input.agentName,
    prompt: input.prompt,
    response: input.response ?? "",
    status: input.status ?? "completed",
    durationMs: input.durationMs ?? 0,
    metadata: metadataStr,
    createdAt: Date.now(),
  };

  await sqliteDb.insert(agentTracesTable).values(record);
  return record;
}

export async function getAgentTracesBySession(sessionId: string): Promise<AgentTrace[]> {
  await ensureTablesInitialized();
  return sqliteDb
    .select()
    .from(agentTracesTable)
    .where(eq(agentTracesTable.sessionId, sessionId))
    .orderBy(desc(agentTracesTable.createdAt));
}

export async function getAgentTrace(id: string): Promise<AgentTrace | null> {
  await ensureTablesInitialized();
  const rows = await sqliteDb
    .select()
    .from(agentTracesTable)
    .where(eq(agentTracesTable.id, id));
  return rows[0] || null;
}

export async function clearSessionTraces(sessionId: string): Promise<void> {
  await ensureTablesInitialized();
  await sqliteDb.delete(agentTracesTable).where(eq(agentTracesTable.sessionId, sessionId));
}


