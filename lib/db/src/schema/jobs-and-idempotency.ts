import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Background Jobs & Transactional Outbox
 * Crash-resilient queue for long-running AI and logistics tasks
 */
export const backgroundJobsTable = pgTable("background_jobs", {
  id: serial("id").primaryKey(),
  taskType: text("task_type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
  status: text("status").notNull().default("pending"), // pending | processing | completed | failed | dead_letter
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  lastError: text("last_error"),
  idempotencyKey: text("idempotency_key").unique(),
  lockedAt: timestamp("locked_at"),
  lockedBy: text("locked_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertBackgroundJobSchema = createInsertSchema(backgroundJobsTable).omit({ id: true });
export type InsertBackgroundJob = z.infer<typeof insertBackgroundJobSchema>;
export type BackgroundJob = typeof backgroundJobsTable.$inferSelect;

/**
 * Persistent Courier Parcels & Consignments
 * Stores live dispatch status, tracking codes, and delivery logs across Steadfast, Pathao, RedX
 */
export const parcelsTable = pgTable("parcels", {
  id: serial("id").primaryKey(),
  consignmentId: text("consignment_id").notNull().unique(),
  trackingCode: text("tracking_code").notNull().unique(),
  provider: text("provider").notNull().default("steadfast"), // steadfast | pathao | redx
  userId: text("user_id").notNull().default("usr_default"),
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  codAmountBdt: integer("cod_amount_bdt").notNull().default(0),
  deliveryFeeBdt: integer("delivery_fee_bdt").notNull().default(60),
  status: text("status").notNull().default("BOOKED"), // BOOKED | PICKED_UP | IN_TRANSIT | DELIVERED | CANCELLED
  statusBangla: text("status_bangla").notNull().default("বুকিং সম্পন্ন হয়েছে"),
  timeline: jsonb("timeline").$type<Array<{ status: string; time: string; note: string }>>().default([]).notNull(),
  whatsappNotificationSent: boolean("whatsapp_notification_sent").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertParcelSchema = createInsertSchema(parcelsTable).omit({ id: true });
export type InsertParcel = z.infer<typeof insertParcelSchema>;
export type Parcel = typeof parcelsTable.$inferSelect;

/**
 * API Gateway Idempotency Keys
 * IETF draft compliance for idempotent mutation execution (Stripe-grade prevention of double-spend)
 */
export const idempotencyKeysTable = pgTable("idempotency_keys", {
  key: text("key").primaryKey(),
  userId: text("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  requestHash: text("request_hash").notNull(),
  responseStatus: integer("response_status"),
  responseBody: jsonb("response_body").$type<unknown>(),
  state: text("state").notNull().default("processing"), // processing | completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertIdempotencyKeySchema = createInsertSchema(idempotencyKeysTable);
export type InsertIdempotencyKey = z.infer<typeof insertIdempotencyKeySchema>;
export type IdempotencyKeyRecord = typeof idempotencyKeysTable.$inferSelect;
