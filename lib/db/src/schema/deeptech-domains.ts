import { boolean, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
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

/**
 * 7. Unified User Profiles (Synced with Supabase auth.users + Dual-Verify Bridge)
 */
export const userProfilesTable = pgTable(
  "user_profiles",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("user"),
    country: text("country").notNull().default("BD"),
    credits: integer("credits").notNull().default(500),
    tier: text("tier").notNull().default("starter"),
    authProvider: text("auth_provider").notNull().default("supabase"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_profiles_email_idx").on(t.email)],
);

export type UserProfileRow = typeof userProfilesTable.$inferSelect;

/**
 * 8. Migrated InsForge Multi-Tenant Organizations, Workspaces, Canvas & OPC Tasks
 */
export const organizationsTable = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  ownerId: text("owner_id").notNull(),
  tier: text("tier").notNull().default("FREE"),
  creditsPool: integer("credits_pool").notNull().default(550),
  mfsPhone: text("mfs_phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organizationMembersTable = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("MEMBER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workspacesTable = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const canvasArtifactsTable = pgTable("canvas_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizationsTable.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspacesTable.id, { onDelete: "set null" }),
  type: text("type").notNull().default("doc"),
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  version: integer("version").notNull().default(1),
  isPublic: boolean("is_public").notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const opcTasksTable = pgTable("opc_tasks", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().default("comp_verifiq"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").default("medium"),
  assignedAgent: text("assigned_agent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 9. Migrated Convex & InsForge AI Twin Tables
 */
export const twinProfilesTable = pgTable("twin_profiles", {
  id: text("id").primaryKey(),
  masterId: text("master_id"),
  name: text("name").notNull(),
  specialization: text("specialization").default("General"),
  persona: text("persona"),
  expertiseAreas: jsonb("expertise_areas").$type<string[]>().notNull().default([]),
  communicationStyle: text("communication_style"),
  goals: jsonb("goals").$type<string[]>().notNull().default([]),
  languages: jsonb("languages").$type<string[]>().notNull().default(["en", "bn"]),
  bio: text("bio"),
  sourcePlatform: text("source_platform").notNull().default("shothik"),
  trainingStatus: text("training_status").notNull().default("ready"),
  knowledgeScore: integer("knowledge_score").notNull().default(10),
  isActive: boolean("is_active").notNull().default(true),
  taskCount: integer("task_count").notNull().default(0),
  lifecycleState: text("lifecycle_state").notNull().default("active"),
  verificationBadge: boolean("verification_badge").notNull().default(false),
  trustScore: integer("trust_score").notNull().default(100),
  publishedCount: integer("published_count").notNull().default(0),
  followersCount: integer("followers_count").notNull().default(0),
  allowedSkills: jsonb("allowed_skills").$type<string[]>().notNull().default([]),
  blockedSkills: jsonb("blocked_skills").$type<string[]>().notNull().default([]),
  approvalRequiredActions: jsonb("approval_required_actions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const twinKnowledgeVectorsTable = pgTable("twin_knowledge_vectors", {
  id: uuid("id").defaultRandom().primaryKey(),
  twinId: text("twin_id").notNull(),
  documentId: text("document_id").notNull(),
  contentType: text("content_type").notNull().default("manuscript"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 10. Migrated Convex Publishing Books, Chapters, Earnings & Chat Conversations
 */
export const publishingBooksTable = pgTable("publishing_books", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default("guest"),
  projectId: text("project_id"),
  title: text("title").notNull().default("Untitled Book"),
  subtitle: text("subtitle"),
  description: text("description"),
  language: text("language").notNull().default("bn"),
  category: text("category"),
  subcategory: text("subcategory"),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  listPrice: text("list_price").default("250"),
  currency: text("currency").notNull().default("BDT"),
  status: text("status").notNull().default("draft"),
  targetWordCount: integer("target_word_count").notNull().default(50000),
  currentRunId: text("current_run_id"),
  manuscriptStorageId: text("manuscript_storage_id"),
  manuscriptName: text("manuscript_name"),
  manuscriptSize: integer("manuscript_size"),
  manuscriptFormat: text("manuscript_format"),
  coverStorageId: text("cover_storage_id"),
  coverDimensions: jsonb("cover_dimensions").$type<{ width: number; height: number }>(),
  reviewerName: text("reviewer_name"),
  reviewNotes: text("review_notes"),
  rejectionReason: text("rejection_reason"),
  rejectionCategory: text("rejection_category"),
  isbn: text("isbn"),
  googlePlayUrl: text("google_play_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookChaptersTable = pgTable("book_chapters", {
  id: text("id").primaryKey(),
  bookId: text("book_id").notNull().references(() => publishingBooksTable.id, { onDelete: "cascade" }),
  chapterIndex: integer("chapter_index").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatConversationsTable = pgTable("chat_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  surface: text("surface").notNull().default("flagship"),
  title: text("title").notNull().default("New Conversation"),
  modelHandle: text("model_handle"),
  status: text("status").notNull().default("active"),
  pinned: boolean("pinned").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  temporary: boolean("temporary").notNull().default(false),
  contextRef: jsonb("context_ref").$type<Record<string, unknown>>().notNull().default({}),
  lastMessagePreview: text("last_message_preview"),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 11. Migrated In-Memory & Disk-Backed Engines (TwinMemoryV2, SemanticMemory, RAG, DSH, Nightshift, Engine KV)
 */
export const twinDirectionsTable = pgTable("twin_directions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  companySlug: text("company_slug").notNull().default("default"),
  kind: text("kind").notNull(),
  content: text("content").notNull(),
  supersedesId: text("supersedes_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const twinTaskMemosTable = pgTable("twin_task_memos", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull(),
  companySlug: text("company_slug").notNull().default("default"),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  scopePath: text("scope_path").notNull().default("general"),
  summary: text("summary").notNull(),
  executionSteps: jsonb("execution_steps").$type<string[]>().notNull().default([]),
  outputArtifacts: jsonb("output_artifacts").$type<Array<{ type: string; path: string }>>().notNull().default([]),
  qualityScore: text("quality_score").notNull().default("1.0"),
  invalidationReason: text("invalidation_reason"),
  isInvalidated: boolean("is_invalidated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const semanticMemoriesTable = pgTable("semantic_memories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull().default("fact"),
  content: text("content").notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ragDocumentsTable = pgTable("rag_documents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  sourceType: text("source_type").notNull().default("text"),
  sourceUrl: text("source_url"),
  totalLength: integer("total_length").notNull().default(0),
  chunkCount: integer("chunk_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ragChunksTable = pgTable("rag_chunks", {
  id: text("id").primaryKey(),
  docId: text("doc_id").notNull().references(() => ragDocumentsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull().default(0),
  tokens: integer("tokens").notNull().default(0),
  embedding: jsonb("embedding").$type<number[]>().notNull().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dshSessionsTable = pgTable("dsh_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("active"),
  forkedFromSessionId: text("forked_from_session_id"),
  forkedAtEventIndex: integer("forked_at_event_index"),
  events: jsonb("events").$type<unknown[]>().notNull().default([]),
  metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nightshiftDigestsTable = pgTable("nightshift_digests", {
  id: text("id").primaryKey(),
  cycleTimestamp: text("cycle_timestamp").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("completed"),
  skillsExecuted: jsonb("skills_executed").$type<unknown[]>().notNull().default([]),
  overallHealthScore: integer("overall_health_score").notNull().default(100),
  topActionItems: jsonb("top_action_items").$type<string[]>().notNull().default([]),
  markdownReport: text("markdown_report").notNull().default(""),
  executionDurationMs: integer("execution_duration_ms").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const engineKvSnapshotsTable = pgTable(
  "engine_kv_snapshots",
  {
    namespace: text("namespace").notNull(),
    entityId: text("entity_id").notNull(),
    userId: text("user_id").notNull().default("system"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("engine_kv_snapshots_ns_entity_idx").on(t.namespace, t.entityId)],
);

export const twinActivityLogsTable = pgTable("twin_activity_logs", {
  id: text("id").primaryKey(),
  twinId: text("twin_id").notNull(),
  masterId: text("master_id"),
  action: text("action").notNull(),
  targetResource: text("target_resource").notNull().default(""),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const twinApprovalsTable = pgTable("twin_approvals", {
  id: text("id").primaryKey(),
  twinId: text("twin_id").notNull(),
  masterId: text("master_id").notNull(),
  action: text("action").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const bookChapterAttemptsTable = pgTable("book_chapter_attempts", {
  id: text("id").primaryKey(),
  bookId: text("book_id").notNull().references(() => publishingBooksTable.id, { onDelete: "cascade" }),
  chapterIndex: integer("chapter_index").notNull(),
  attemptNumber: integer("attempt_number").notNull().default(1),
  content: text("content").notNull().default(""),
  passedValidation: boolean("passed_validation").notNull().default(false),
  validationReport: jsonb("validation_report").$type<Record<string, unknown>>(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authorEarningsTable = pgTable("author_earnings", {
  userId: text("user_id").primaryKey(),
  totalEarnings: numeric("total_earnings", { precision: 12, scale: 2 }).notNull().default("0"),
  totalUnitsSold: integer("total_units_sold").notNull().default(0),
  lifetimeRevenue: numeric("lifetime_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  availableBalance: numeric("available_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  totalPaidOut: numeric("total_paid_out", { precision: 12, scale: 2 }).notNull().default("0"),
  pendingPayouts: numeric("pending_payouts", { precision: 12, scale: 2 }).notNull().default("0"),
  publishedBooksCount: integer("published_books_count").notNull().default(0),
  monthlyBreakdown: jsonb("monthly_breakdown").$type<unknown[]>().notNull().default([]),
  perBookEarnings: jsonb("per_book_earnings").$type<unknown[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authorPayoutsTable = pgTable("author_payouts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull().default("bKash"),
  status: text("status").notNull().default("pending"),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authorPayoutAccountsTable = pgTable("author_payout_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  method: text("method").notNull().default("bKash"),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name"),
  routingNumber: text("routing_number"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});



