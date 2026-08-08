import { bigint, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export interface TwinSeedTask {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Server-side copy of the generated Twin workspace seed (company name,
 * summary, business plan and starter tasks), keyed by the caller identity
 * (guest device id / session) and the originating chat conversation.
 */
export const twinSeedsTable = pgTable(
  "twin_seeds",
  {
    id: serial("id").primaryKey(),
    identity: text("identity").notNull(),
    conversationId: text("conversation_id").notNull(),
    companyName: text("company_name").notNull(),
    summary: text("summary").notNull().default(""),
    businessPlan: text("business_plan").notNull().default(""),
    tasks: jsonb("tasks").$type<TwinSeedTask[]>().notNull().default([]),
    /** Client-supplied monotonic revision; stale writes (lower revision) lose. */
    revision: bigint("revision", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("twin_seeds_identity_conversation_idx").on(t.identity, t.conversationId)],
);

export const insertTwinSeedSchema = createInsertSchema(twinSeedsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTwinSeed = z.infer<typeof insertTwinSeedSchema>;
export type TwinSeed = typeof twinSeedsTable.$inferSelect;
