import { z } from "zod";

/**
 * RFC 7807 Problem Details Standard Error Schema
 */
export const ProblemDetailsSchema = z.object({
  type: z.string().default("https://api.shothikgpt.com/errors/validation-error"),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string().optional(),
  invalidParams: z
    .array(
      z.object({
        name: z.string(),
        reason: z.string(),
      })
    )
    .optional(),
  code: z.string().optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

/**
 * Projects Domain Schemas
 */
export const ProjectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(120),
  description: z.string().max(1000).optional(),
  category: z.enum(["academic", "commerce", "venture", "general"]).default("general"),
  templateId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(["academic", "commerce", "venture", "general"]).optional(),
  status: z.enum(["active", "archived", "draft"]).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Twin Tasks & Workspaces Schemas
 */
export const TwinTaskCreateSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["todo", "in_progress", "completed", "archived"]).default("todo"),
  twinId: z.string().optional(),
  assignee: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

export const TwinTaskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["todo", "in_progress", "completed", "archived"]).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Approvals Schemas
 */
export const ApprovalActionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes"]),
  note: z.string().max(500).optional(),
  feedback: z.string().max(2000).optional(),
});

/**
 * Connectors & Ingestion Schemas
 */
export const ConnectorSyncSchema = z.object({
  connectorType: z.enum(["notion", "gdrive", "github", "sheets", "web"]),
  sourceId: z.string().min(1, "Source identifier is required"),
  incremental: z.boolean().default(true),
  authConfig: z.record(z.any()).optional(),
});

export const ConnectorConfigSchema = z.object({
  type: z.enum(["notion", "gdrive", "github", "sheets", "web"]),
  name: z.string().min(1).max(100),
  credentials: z.record(z.any()).optional(),
  syncIntervalMinutes: z.number().int().min(5).max(10080).default(60),
});

/**
 * Publishing & Nilkhet POD Schemas
 */
export const NilkhetOrderCreateSchema = z.object({
  documentId: z.string().min(1, "Document identifier is required"),
  documentTitle: z.string().min(1).max(200),
  pageCount: z.number().int().min(1, "Page count must be at least 1"),
  paperType: z.enum(["offset", "art", "cream", "newsprint"]).default("cream"),
  bindingType: z.enum(["paperback", "hardcover", "spiral", "saddle_stitch"]).default("paperback"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10000),
  deliveryAddress: z.object({
    recipientName: z.string().min(1, "Recipient name is required"),
    recipientPhone: z.string().regex(/^01[3-9]\d{8}$/, "Valid 11-digit Bangladesh phone number required"),
    district: z.string().min(1, "District is required"),
    fullAddress: z.string().min(5, "Full delivery address required"),
  }),
  notes: z.string().max(500).optional(),
});

export const CalculateSpineSchema = z.object({
  pageCount: z.number().int().min(1, "Page count must be at least 1"),
  paperType: z.enum(["offset", "art", "cream", "newsprint"]).default("cream"),
  paperGsm: z.number().int().min(50).max(300).default(80),
  bindingType: z.enum(["paperback", "hardcover"]).default("paperback"),
});

export const EstimateCostSchema = z.object({
  pageCount: z.number().int().min(1),
  quantity: z.number().int().min(1).default(1),
  paperType: z.enum(["offset", "art", "cream", "newsprint"]).default("cream"),
  bindingType: z.enum(["paperback", "hardcover", "spiral", "saddle_stitch"]).default("paperback"),
});

/**
 * Logistics & Courier Schemas (Steadfast + Pathao)
 */
export const LogisticsCostEstimateSchema = z.object({
  deliveryType: z.enum(["dhaka_metro", "outside_dhaka", "express"]).default("dhaka_metro"),
  weightKg: z.number().positive().default(0.5),
  itemValueBdt: z.number().nonnegative().default(0),
  carrier: z.enum(["steadfast", "pathao", "auto"]).default("auto"),
});

export const LogisticsBookingSchema = z.object({
  carrier: z.enum(["steadfast", "pathao", "auto"]).default("auto"),
  invoiceId: z.string().min(1),
  recipientName: z.string().min(1),
  recipientPhone: z.string().regex(/^01[3-9]\d{8}$/, "Must be valid 11-digit BD phone number"),
  recipientAddress: z.string().min(5),
  district: z.string().min(1),
  codAmount: z.number().nonnegative().default(0),
  weightKg: z.number().positive().default(0.5),
  note: z.string().max(300).optional(),
});

/**
 * MFS & Subscriptions Schemas
 */
export const MfsVerifyTrxSchema = z.object({
  trxId: z.string().regex(/^[A-Za-z0-9]{8,12}$/, "Valid 8-12 alphanumeric Transaction ID required"),
  provider: z.enum(["bkash", "nagad", "upay", "rocket"]).default("bkash"),
  amount: z.number().positive("Amount must be positive"),
  tier: z.enum(["student", "freelancer", "fcommerce", "pro", "enterprise"]).default("freelancer"),
  userId: z.string().optional(),
});

export const MfsIpnWebhookSchema = z.object({
  trxId: z.string(),
  paymentId: z.string().optional(),
  amount: z.number().or(z.string().transform(Number)),
  currency: z.literal("BDT").default("BDT"),
  status: z.enum(["Completed", "Successful", "Failed", "Cancelled"]),
  customerMsisdn: z.string().optional(),
  signature: z.string().optional(),
  timestamp: z.string().optional(),
});

/**
 * Task Queue / Background Job Schemas
 */
export const JobSubmitSchema = z.object({
  type: z.enum([
    "DEEP_RESEARCH",
    "BULK_COURIER_RECONCILIATION",
    "BOOK_PDF_COMPILATION",
    "SEMANTIC_VAULT_REINDEX",
  ]),
  userId: z.string().default("usr_default"),
  data: z.record(z.any()).default({}),
});
