import { z } from "zod";

/**
 * Standard Hermes Event Envelope header marker
 */
export const HERMES_ENVELOPE_MARKER = true as const;

/**
 * Canonical Hermes event types
 */
export type HermesEventType =
  | "session_created"
  | "session_updated"
  | "run_started"
  | "plan_generated"
  | "progress_update"
  | "document_ingestion_started"
  | "document_ingestion_completed"
  | "artifact_ready"
  | "tool_call_started"
  | "tool_call_completed"
  | "run_paused"
  | "run_resumed"
  | "run_cancelled"
  | "run_completed"
  | "run_failed";

/**
 * Zod Schema for HermesEventEnvelope
 */
export const HermesEventEnvelopeSchema = z.object({
  __hermes: z.literal(true),
  eventId: z.string(),
  runId: z.string(),
  sessionId: z.string(),
  workspaceId: z.string().optional(),
  domain: z.string().optional(),
  eventType: z.enum([
    "session_created",
    "session_updated",
    "run_started",
    "plan_generated",
    "progress_update",
    "document_ingestion_started",
    "document_ingestion_completed",
    "artifact_ready",
    "tool_call_started",
    "tool_call_completed",
    "run_paused",
    "run_resumed",
    "run_cancelled",
    "run_completed",
    "run_failed",
  ]),
  timestamp: z.string(),
  sequence: z.number().int().nonnegative(),
  payload: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
});

export type HermesEventEnvelope = z.infer<typeof HermesEventEnvelopeSchema>;

/**
 * Hermes Session Entity Definition
 */
export const HermesSessionSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  status: z.enum(["active", "archived", "closed"]).default("active"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type HermesSession = z.infer<typeof HermesSessionSchema>;

/**
 * Hermes Run Config & Entity Definition
 */
export const RunConfigSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  toolsEnabled: z.array(z.string()).optional(),
  customPrompt: z.string().optional(),
});

export type RunConfig = z.infer<typeof RunConfigSchema>;

export const HermesRunSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  workspaceId: z.string(),
  domain: z.string().default("general"),
  status: z
    .enum(["queued", "running", "paused", "completed", "failed", "cancelled"])
    .default("queued"),
  config: RunConfigSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable().optional(),
});

export type HermesRun = z.infer<typeof HermesRunSchema>;

/**
 * Run Control Actions
 */
export const RunControlActionSchema = z.object({
  action: z.enum(["pause", "resume", "cancel"]),
  reason: z.string().optional(),
});

export type RunControlAction = z.infer<typeof RunControlActionSchema>;
