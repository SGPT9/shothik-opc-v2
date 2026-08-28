import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const nilkhetOrdersTable = pgTable("nilkhet_orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  bookTitle: text("book_title").notNull(),
  pageCount: integer("page_count").notNull(),
  copyCount: integer("copy_count").notNull(),
  paperType: text("paper_type").notNull(),
  bindingType: text("binding_type").notNull(),
  totalPriceBdt: text("total_price_bdt").notNull(),
  status: text("status").notNull().default("PROCESSING_PRINT"),
  courierProvider: text("courier_provider").default("steadfast"),
  trackingCode: text("tracking_code"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNilkhetOrderSchema = createInsertSchema(nilkhetOrdersTable).omit({ id: true });
export type InsertNilkhetOrder = z.infer<typeof insertNilkhetOrderSchema>;
export type NilkhetOrder = typeof nilkhetOrdersTable.$inferSelect;
