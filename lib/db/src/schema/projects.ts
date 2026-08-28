import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Projects table — migrated from Convex `projects` collection.
 * Stores writing studio projects, research projects, and assignments.
 */
export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull().default("book"), // "book" | "research" | "assignment"
  template: text("template"),
  description: text("description").notNull().default(""),
  content: text("content").notNull().default(""),
  sections: jsonb("sections").$type<unknown[]>().notNull().default([]),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  wordCount: integer("word_count").notNull().default(0),
  progress: integer("progress").notNull().default(0),
  starred: boolean("starred").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
