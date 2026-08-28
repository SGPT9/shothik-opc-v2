import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Key custody table — stores sealed BYOK provider credentials at rest.
 * Keyed by (userId, purpose) so twin ownership transfers never leak keys.
 */
export const keyCustodyTable = pgTable(
  "second_me_key_custody",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    purpose: text("purpose").notNull(),
    provider: text("provider"),
    sealedKey: text("sealed_key").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("key_custody_user_purpose_idx").on(t.userId, t.purpose)],
);

export const insertKeyCustodySchema = createInsertSchema(keyCustodyTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertKeyCustody = z.infer<typeof insertKeyCustodySchema>;
export type KeyCustody = typeof keyCustodyTable.$inferSelect;

/**
 * Writing profiles table — links users to their Letta memory agent and WRITING.md state.
 */
export const writingProfilesTable = pgTable("second_me_writing_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  lettaAgentId: text("letta_agent_id").notNull(),
  blockLabel: text("block_label").notNull().default("WRITING.md"),
  modelHandle: text("model_handle"),
  lastContentLength: integer("last_content_length").notNull().default(0),
  lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWritingProfileSchema = createInsertSchema(writingProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWritingProfile = z.infer<typeof insertWritingProfileSchema>;
export type WritingProfile = typeof writingProfilesTable.$inferSelect;
