import { customType, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * pgvector custom type mapping for 1536-dimensional semantic embeddings.
 */
export const pgvector1536 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return value.replace(/^\[|\]$/g, "").split(",").map(Number);
    }
  },
});

/**
 * Document embeddings table for Perplexity-grade semantic search and whole-repo RAG.
 */
export const documentEmbeddingsTable = pgTable("document_embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id"),
  repo: text("repo"),
  filePath: text("file_path"),
  content: text("content").notNull(),
  embedding: pgvector1536("embedding"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDocumentEmbeddingSchema = createInsertSchema(documentEmbeddingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertDocumentEmbedding = z.infer<typeof insertDocumentEmbeddingSchema>;
export type DocumentEmbedding = typeof documentEmbeddingsTable.$inferSelect;
