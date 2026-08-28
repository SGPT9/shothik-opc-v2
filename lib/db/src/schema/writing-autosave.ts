import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Writing autosave table — migrated from Convex `writing` collection.
 * Stores auto-saved content snapshots keyed by localProjectId.
 * Only the latest snapshot per project is kept (upsert on conflict).
 */
export const writingAutosaveTable = pgTable(
  "writing_autosave",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    localProjectId: text("local_project_id").notNull(),
    content: text("content").notNull().default(""),
    wordCount: integer("word_count").notNull().default(0),
    savedAt: timestamp("saved_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("writing_autosave_user_project_idx").on(t.userId, t.localProjectId)],
);

export const insertWritingAutosaveSchema = createInsertSchema(writingAutosaveTable).omit({
  id: true,
  savedAt: true,
});
export type InsertWritingAutosave = z.infer<typeof insertWritingAutosaveSchema>;
export type WritingAutosave = typeof writingAutosaveTable.$inferSelect;
