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

/**
 * Local SQLite table for offline projects mirror
 */
export const offlineProjectsTable = sqliteTable("offline_projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  wordCount: integer("word_count").notNull().default(0),
  currentVersion: integer("current_version").notNull().default(1),
  genre: text("genre").default("general"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

/**
 * Local SQLite table for document autosaves
 */
export const offlineAutosaveTable = sqliteTable("offline_autosave", {
  id: text("id").primaryKey(),
  docId: text("doc_id").notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  checksum: text("checksum").notNull(),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

/**
 * Local SQLite table for offline courier parcels mirror
 */
export const offlineParcelsTable = sqliteTable("offline_parcels", {
  trackingCode: text("tracking_code").primaryKey(),
  consignmentId: text("consignment_id").notNull(),
  provider: text("provider").notNull().default("steadfast"),
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  codAmountBdt: integer("cod_amount_bdt").notNull().default(0),
  status: text("status").notNull().default("BOOKED"),
  statusBangla: text("status_bangla").notNull().default("বুক করা হয়েছে"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

/**
 * Local SQLite table for offline Nilkhet POD book orders
 */
export const offlineNilkhetOrdersTable = sqliteTable("offline_nilkhet_orders", {
  orderId: text("order_id").primaryKey(),
  userId: text("user_id").notNull(),
  bookTitle: text("book_title").notNull(),
  pageCount: integer("page_count").notNull(),
  copies: integer("copies").notNull().default(1),
  spineThicknessMm: text("spine_thickness_mm").notNull(),
  totalCostBdt: integer("total_cost_bdt").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  status: text("status").notNull().default("PENDING_PRINT"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type OfflineProject = typeof offlineProjectsTable.$inferSelect;
export type OfflineAutosave = typeof offlineAutosaveTable.$inferSelect;
export type OfflineParcel = typeof offlineParcelsTable.$inferSelect;
export type OfflineNilkhetOrder = typeof offlineNilkhetOrdersTable.$inferSelect;
