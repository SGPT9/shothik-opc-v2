import { bigint, boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export interface TwinSeedTask {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Twins table — AI digital clone profiles, permissions, and lifecycle states.
 */
export const twinsTable = pgTable("twins", {
  id: serial("id").primaryKey(),
  masterId: text("master_id"),
  name: text("name").notNull(),
  specialization: text("specialization").notNull().default("General"),
  persona: text("persona").notNull().default(""),
  expertiseAreas: jsonb("expertise_areas").$type<string[]>().notNull().default([]),
  communicationStyle: text("communication_style").notNull().default("professional"),
  goals: jsonb("goals").$type<string[]>().notNull().default([]),
  languages: jsonb("languages").$type<string[]>().notNull().default(["bn", "en"]),
  bio: text("bio").notNull().default(""),
  sourcePlatform: text("source_platform").notNull().default("shothik"),
  trainingStatus: text("training_status").notNull().default("ready"),
  knowledgeScore: integer("knowledge_score").notNull().default(0),
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
  apiKeyHash: text("api_key_hash"),
  apiKeyPrefix: text("api_key_prefix"),
  registrationToken: text("registration_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTwinSchema = createInsertSchema(twinsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTwin = z.infer<typeof insertTwinSchema>;
export type Twin = typeof twinsTable.$inferSelect;

/**
 * Twin Tasks table — autonomous tasks executed by digital twins.
 */
export const twinTasksTable = pgTable("twin_tasks", {
  id: serial("id").primaryKey(),
  twinId: text("twin_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  taskType: text("task_type").notNull().default("general"),
  status: text("status").notNull().default("pending"), // "pending" | "in_progress" | "completed" | "failed"
  result: text("result").notNull().default(""),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTwinTaskSchema = createInsertSchema(twinTasksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTwinTask = z.infer<typeof insertTwinTaskSchema>;
export type TwinTask = typeof twinTasksTable.$inferSelect;

/**
 * Twin Activity Log table — audit trails for security and user transparency.
 */
export const twinActivityLogTable = pgTable("twin_activity_log", {
  id: serial("id").primaryKey(),
  twinId: text("twin_id").notNull(),
  masterId: text("master_id"),
  action: text("action").notNull(),
  targetResource: text("target_resource").notNull().default(""),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTwinActivityLogSchema = createInsertSchema(twinActivityLogTable).omit({
  id: true,
});
export type InsertTwinActivityLog = z.infer<typeof insertTwinActivityLogSchema>;
export type TwinActivityLog = typeof twinActivityLogTable.$inferSelect;

/**
 * Twin Pending Approvals table — human-in-the-loop permission gates.
 */
export const twinPendingApprovalsTable = pgTable("twin_pending_approvals", {
  id: serial("id").primaryKey(),
  twinId: text("twin_id").notNull(),
  masterId: text("master_id").notNull(),
  action: text("action").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected"
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertTwinPendingApprovalSchema = createInsertSchema(twinPendingApprovalsTable).omit({
  id: true,
});
export type InsertTwinPendingApproval = z.infer<typeof insertTwinPendingApprovalSchema>;
export type TwinPendingApproval = typeof twinPendingApprovalsTable.$inferSelect;

/**
 * Autonomous Companies table — Multi-venture autonomous companies, subdomains, metrics, and state.
 */
export const companiesTable = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("usr_default"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  industry: text("industry").notNull().default("Technology"),
  businessModel: text("business_model").notNull().default("SaaS"),
  businessType: text("business_type").default("Digital Venture"),
  problemStatement: text("problem_statement").default(""),
  domain: text("domain").notNull(),
  email: text("email").notNull(),
  revenueBdt: integer("revenue_bdt").notNull().default(0),
  visitorCount: integer("visitor_count").notNull().default(1),
  isPaused: boolean("is_paused").notNull().default(false),
  tasks: jsonb("tasks").$type<Record<string, unknown>[]>().notNull().default([]),
  docs: jsonb("docs").$type<Record<string, unknown>[]>().notNull().default([]),
  feed: jsonb("feed").$type<Record<string, unknown>[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companiesTable.$inferSelect;

/**
 * Twin Seeds table — server-side copy of generated Twin workspace seed.
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

/**
 * Key custody table — stores sealed BYOK provider credentials at rest.
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
