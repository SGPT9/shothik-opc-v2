import { z } from "zod";

/**
 * Standard Hermes Sheets Event Envelope (ADR-001)
 */
export const HermesSheetEventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  runId: z.string(),
  workspaceId: z.string(),
  artifactId: z.string().optional(),
  domain: z.literal("sheets"),
  eventType: z.string(),
  timestamp: z.string().datetime({ offset: true }),
  payload: z.record(z.string(), z.unknown()),
});

export type HermesSheetEventEnvelope = z.infer<typeof HermesSheetEventEnvelopeSchema>;

/**
 * GenerateSpreadsheetCommand Schema (Phase 2)
 */
export const GenerateSpreadsheetCommandSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  workspaceId: z.string().min(1, "workspaceId is required"),
  prompt: z.string().min(3, "Prompt must be at least 3 characters long"),
  title: z.string().default("Untitled Spreadsheet"),
  sheetCount: z.number().int().min(1).max(20).default(1),
  theme: z.string().default("classic"),
  userId: z.string().min(1, "userId is required"),
});

export type GenerateSpreadsheetCommand = z.infer<typeof GenerateSpreadsheetCommandSchema>;

/**
 * UpdateCellCommand Schema
 */
export const UpdateCellCommandSchema = z.object({
  requestId: z.string().min(1),
  workspaceId: z.string().min(1),
  runId: z.string().min(1),
  sheetIndex: z.number().int().min(0).default(0),
  cell: z.string().regex(/^[A-Z]+[1-9][0-9]*$/, "Invalid cell format (e.g. A1, B12)"),
  value: z.union([z.string(), z.number(), z.boolean()]),
  formula: z.string().optional(),
  userId: z.string().min(1),
});

export type UpdateCellCommand = z.infer<typeof UpdateCellCommandSchema>;

/**
 * CalculateFormulaCommand Schema
 */
export const CalculateFormulaCommandSchema = z.object({
  requestId: z.string().min(1),
  workspaceId: z.string().min(1),
  runId: z.string().min(1),
  sheetIndex: z.number().int().min(0).default(0),
  formula: z.string().startsWith("=", "Formula must start with '='"),
  targetCell: z.string().regex(/^[A-Z]+[1-9][0-9]*$/),
  userId: z.string().min(1),
});

export type CalculateFormulaCommand = z.infer<typeof CalculateFormulaCommandSchema>;

/**
 * ExportSheetCommand Schema
 */
export const ExportSheetCommandSchema = z.object({
  requestId: z.string().min(1),
  workspaceId: z.string().min(1),
  runId: z.string().min(1),
  format: z.enum(["csv", "xlsx", "json"]).default("xlsx"),
  userId: z.string().min(1),
});

export type ExportSheetCommand = z.infer<typeof ExportSheetCommandSchema>;
