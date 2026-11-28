import { pgTable, text, serial, integer, timestamp, jsonb, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Persistent Saga Transaction Execution Log
 * Stores append-only Write-Ahead Logs (WAL) and rollback states across MFS and logistics operations
 */
export const sagaExecutionsTable = pgTable("saga_executions", {
  id: serial("id").primaryKey(),
  sagaId: text("saga_id").notNull().unique(),
  sagaName: text("saga_name").notNull(),
  correlationId: text("correlation_id").notNull(),
  idempotencyKey: text("idempotency_key"),
  status: text("status").notNull(), // PENDING | RUNNING | COMPLETED | FAILED | COMPENSATING | COMPENSATED | COMPENSATION_FAILED
  context: jsonb("context").$type<Record<string, unknown>>().default({}).notNull(),
  currentStepIndex: integer("current_step_index").notNull().default(0),
  steps: jsonb("steps").$type<Array<any>>().default([]).notNull(),
  error: text("error"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSagaExecutionSchema = createInsertSchema(sagaExecutionsTable).omit({ id: true });
export type InsertSagaExecution = z.infer<typeof insertSagaExecutionSchema>;
export type SagaExecution = typeof sagaExecutionsTable.$inferSelect;

/**
 * NBR Statutory Double-Entry Audit Ledger Table
 * Cryptographically signed journal entries for revenue, logistics payouts, and MFS reconciliation
 */
export const auditJournalEntriesTable = pgTable("audit_journal_entries", {
  id: serial("id").primaryKey(),
  entryId: text("entry_id").notNull().unique(),
  transactionRef: text("transaction_ref").notNull(),
  transactionType: text("transaction_type").notNull(),
  memo: text("memo").notNull(),
  lines: jsonb("lines").$type<Array<any>>().default([]).notNull(),
  totalDebitBdt: numeric("total_debit_bdt", { precision: 14, scale: 2 }).notNull(),
  totalCreditBdt: numeric("total_credit_bdt", { precision: 14, scale: 2 }).notNull(),
  isBalanced: boolean("is_balanced").notNull().default(true),
  auditHash: text("audit_hash").notNull(),
  initiatorKind: text("initiator_kind"),
  initiatorId: text("initiator_id"),
  postedAt: timestamp("posted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditJournalEntrySchema = createInsertSchema(auditJournalEntriesTable).omit({ id: true });
export type InsertAuditJournalEntry = z.infer<typeof insertAuditJournalEntrySchema>;
export type AuditJournalEntryRecord = typeof auditJournalEntriesTable.$inferSelect;

/**
 * MFS Reconciled Transactions & Speculative Order Ledger Table
 */
export const mfsTransactionsTable = pgTable("mfs_transactions", {
  id: serial("id").primaryKey(),
  trxId: text("trx_id").notNull().unique(),
  userId: text("user_id").notNull().default("usr_default"),
  provider: text("provider").notNull(), // bkash | nagad | rocket | upay
  amountBdt: numeric("amount_bdt", { precision: 12, scale: 2 }).notNull(),
  tier: text("tier"),
  status: text("status").notNull().default("RECONCILED"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reconciledAt: timestamp("reconciled_at").defaultNow().notNull(),
});

export const insertMfsTransactionSchema = createInsertSchema(mfsTransactionsTable).omit({ id: true });
export type InsertMfsTransaction = z.infer<typeof insertMfsTransactionSchema>;
export type MfsTransactionRecord = typeof mfsTransactionsTable.$inferSelect;
