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

/**
 * Local SQLite table for Papermark trackable investor and document share links
 */
export const offlinePapermarkLinksTable = sqliteTable("offline_papermark_links", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  documentId: text("document_id").notNull(),
  title: text("title").notNull(),
  documentType: text("document_type").notNull().default("pitch_deck"), // pitch_deck, financial_model, research_brief, book
  customSlug: text("custom_slug").notNull().unique(),
  passcode: text("passcode"),
  expiresAt: integer("expires_at"),
  allowDownload: integer("allow_download", { mode: "boolean" }).notNull().default(true),
  totalViews: integer("total_views").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  avgDurationSec: integer("avg_duration_sec").notNull().default(0),
  completionRate: integer("completion_rate").notNull().default(0), // percentage 0-100
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

/**
 * Local SQLite table for Papermark page-by-page view telemetry and visitor heatmaps
 */
export const offlinePapermarkViewsTable = sqliteTable("offline_papermark_views", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull(),
  visitorId: text("visitor_id").notNull(),
  ipHash: text("ip_hash").notNull().default(""),
  country: text("country").notNull().default("Bangladesh"),
  city: text("city").notNull().default("Dhaka"),
  device: text("device").notNull().default("desktop"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  pagesViewedJson: text("pages_viewed_json").notNull().default("[]"), // array of { page: number, durationSec: number }
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export type OfflineProject = typeof offlineProjectsTable.$inferSelect;
export type OfflineAutosave = typeof offlineAutosaveTable.$inferSelect;
export type OfflineParcel = typeof offlineParcelsTable.$inferSelect;
export type OfflineNilkhetOrder = typeof offlineNilkhetOrdersTable.$inferSelect;
export type OfflinePapermarkLink = typeof offlinePapermarkLinksTable.$inferSelect;
export type OfflinePapermarkView = typeof offlinePapermarkViewsTable.$inferSelect;
