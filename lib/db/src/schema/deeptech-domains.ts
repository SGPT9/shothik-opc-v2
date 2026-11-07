import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * 1. Community Channels, Posts, Comments, Votes
 */
export const channelsTable = pgTable("channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  participantType: text("participant_type").default("both"),
  category: text("category"),
  status: text("status").default("open"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const postsTable = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  channelId: uuid("channel_id").references(() => channelsTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  agentId: text("agent_id"),
  title: text("title").notNull(),
  content: text("content"),
  contentUrl: text("content_url"),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const commentsTable = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => postsTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  parentId: uuid("parent_id"),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const votesTable = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    voteType: integer("vote_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("idx_votes_user_entity").on(t.userId, t.entityType, t.entityId)],
);

/**
 * 2. Chat & Character Messenger Threads
 */
export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  channelId: uuid("channel_id"),
  threadId: text("thread_id"),
  authorId: text("author_id").notNull(),
  role: text("role").default("user"),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessageRow = typeof chatMessagesTable.$inferSelect;

/**
 * 3. Connectors (Write-Only Encrypted Credentials Vault)
 */
export const userConnectorsTable = pgTable(
  "user_connectors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    connectorId: text("connector_id").notNull(),
    connected: boolean("connected").notNull().default(false),
    encryptedCredentials: text("encrypted_credentials"),
    maskedKey: text("masked_key"),
    endpointUrl: text("endpoint_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_connectors_user_connector_idx").on(t.userId, t.connectorId)],
);

export const insertUserConnectorSchema = createInsertSchema(userConnectorsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserConnector = z.infer<typeof insertUserConnectorSchema>;
export type UserConnectorRow = typeof userConnectorsTable.$inferSelect;

/**
 * 4. Writing Suite & Novel Engine Manifests (Chrono Braider, Plot Divergence, Lore Wiki, CIP)
 */
export const bookSuiteManifestsTable = pgTable(
  "book_suite_manifests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: text("project_id").notNull(),
    userId: text("user_id").notNull().default("usr_default"),
    moduleType: text("module_type").notNull(), // 'chrono_braider' | 'plot_divergence' | 'lore_wiki' | 'book_jacket' | 'cip_barcode'
    state: jsonb("state").$type<Record<string, unknown>>().notNull().default({}),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("book_suite_project_module_idx").on(t.projectId, t.moduleType)],
);

export type BookSuiteManifestRow = typeof bookSuiteManifestsTable.$inferSelect;

/**
 * 5. User Settings & Preferences
 */
export const userPreferencesTable = pgTable("user_preferences", {
  userId: text("user_id").primaryKey(),
  locale: text("locale").notNull().default("en"),
  theme: text("theme").notNull().default("dark"),
  studioMode: text("studio_mode").notNull().default("standard"),
  notifications: jsonb("notifications")
    .$type<{ email: boolean; whatsapp: boolean; agentAlerts: boolean }>()
    .notNull()
    .default({ email: true, whatsapp: false, agentAlerts: true }),
  taxProfile: jsonb("tax_profile").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserPreferenceRow = typeof userPreferencesTable.$inferSelect;

/**
 * 6. Proof of Authorship & Copyright Certificates
 */
export const authorshipCertificatesTable = pgTable("authorship_certificates", {
  certificateId: text("certificate_id").primaryKey(),
  projectId: uuid("project_id").notNull(),
  authorId: text("author_id").notNull(),
  title: text("title").notNull(),
  contentHashSha256: text("content_hash_sha256").notNull(),
  merkleRoot: text("merkle_root").notNull(),
  tamperProofSignature: text("tamper_proof_signature").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  status: text("status").notNull().default("verified"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuthorshipCertificateRow = typeof authorshipCertificatesTable.$inferSelect;
