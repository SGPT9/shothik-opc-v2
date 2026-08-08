import { z } from "zod";

/**
 * Standard Hermes Research Event Envelope (ADR-001)
 */
export const HermesResearchEventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  runId: z.string(),
  workspaceId: z.string(),
  artifactId: z.string().optional(),
  domain: z.literal("research"),
  eventType: z.string(),
  timestamp: z.string().datetime({ offset: true }),
  payload: z.record(z.string(), z.unknown()),
});

export type HermesResearchEventEnvelope = z.infer<typeof HermesResearchEventEnvelopeSchema>;

/**
 * GenerateResearchReportCommand Schema (Phase 3)
 */
export const GenerateResearchReportCommandSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  workspaceId: z.string().min(1, "workspaceId is required"),
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  depth: z.enum(["quick", "standard", "deep"]).default("standard"),
  sources: z.array(z.enum(["openalex", "arxiv", "pubmed", "biorxiv", "web"])).default(["openalex", "web"]),
  maxSources: z.number().int().min(1).max(100).default(20),
  language: z.string().default("en"),
  userId: z.string().min(1, "userId is required"),
});

export type GenerateResearchReportCommand = z.infer<typeof GenerateResearchReportCommandSchema>;

/**
 * FetchLiteratureCommand Schema
 */
export const FetchLiteratureCommandSchema = z.object({
  requestId: z.string().min(1),
  workspaceId: z.string().min(1),
  query: z.string().min(2, "Query required"),
  source: z.enum(["openalex", "arxiv", "pubmed", "biorxiv"]).default("openalex"),
  limit: z.number().int().min(1).max(50).default(10),
  userId: z.string().min(1),
});

export type FetchLiteratureCommand = z.infer<typeof FetchLiteratureCommandSchema>;

/**
 * SynthesizeFindingsCommand Schema
 */
export const SynthesizeFindingsCommandSchema = z.object({
  requestId: z.string().min(1),
  workspaceId: z.string().min(1),
  runId: z.string().min(1),
  paperIds: z.array(z.string()).min(1, "At least one paper required"),
  focusQuestion: z.string().optional(),
  userId: z.string().min(1),
});

export type SynthesizeFindingsCommand = z.infer<typeof SynthesizeFindingsCommandSchema>;

/**
 * ExportResearchReportCommand Schema
 */
export const ExportResearchReportCommandSchema = z.object({
  requestId: z.string().min(1),
  workspaceId: z.string().min(1),
  runId: z.string().min(1),
  format: z.enum(["pdf", "markdown", "docx", "json"]).default("markdown"),
  userId: z.string().min(1),
});

export type ExportResearchReportCommand = z.infer<typeof ExportResearchReportCommandSchema>;
