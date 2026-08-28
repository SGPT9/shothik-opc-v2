import { boolean, integer, numeric, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * User Subscriptions table — migrated from Convex subscriptions.
 */
export const userSubscriptionsTable = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  tier: text("tier").notNull().default("free"), // "free" | "pro" | "team" | "enterprise"
  status: text("status").notNull().default("active"),
  interval: text("interval").notNull().default("month"), // "month" | "year"
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptionsTable.$inferSelect;

/**
 * Tool Usage table — tracks monthly usage counts per user per tool.
 */
export const toolUsageTable = pgTable(
  "tool_usage",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    tool: text("tool").notNull(),
    count: integer("count").notNull().default(0),
    periodStart: timestamp("period_start").notNull().defaultNow(),
    periodEnd: timestamp("period_end"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tool_usage_user_tool_idx").on(t.userId, t.tool)],
);

export const insertToolUsageSchema = createInsertSchema(toolUsageTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertToolUsage = z.infer<typeof insertToolUsageSchema>;
export type ToolUsage = typeof toolUsageTable.$inferSelect;

/**
 * LLM Token Usage table — tracks granular AI model invocations and costs.
 */
export const llmUsageTable = pgTable("llm_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  tool: text("tool").notNull(),
  provider: text("provider").notNull(),
  tokens: integer("tokens").notNull().default(0),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costUsd: numeric("cost_usd", { precision: 10, scale: 6 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLlmUsageSchema = createInsertSchema(llmUsageTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLlmUsage = z.infer<typeof insertLlmUsageSchema>;
export type LlmUsage = typeof llmUsageTable.$inferSelect;
