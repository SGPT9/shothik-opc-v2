import { z } from "zod";

/**
 * Supported South Asian MFS (Mobile Financial Services) providers
 */
export const MfsProviderSchema = z.enum(["bkash", "nagad", "rocket", "upay", "sslcommerz"]);
export type MfsProvider = z.infer<typeof MfsProviderSchema>;

/**
 * Micro-Pass and Credit Pack Pricing tiers
 */
export const MicroPassTierSchema = z.enum([
  "micro_100_bdt",    // 100 BDT (~$0.85 USD) - Single thesis check / 3 slide decks (80 credits)
  "student_350_bdt",  // 350 BDT (~$2.95 USD) - Student Semester Pass (300 credits)
  "pro_750_bdt",      // 750 BDT (~$6.30 USD) - Pro Creator Pack (750 credits)
  "merchant_1500_bdt",// 1500 BDT (~$12.60 USD) - F-Commerce Business Twin (2000 credits)
]);
export type MicroPassTier = z.infer<typeof MicroPassTierSchema>;

export const TIER_CREDIT_MAP: Record<MicroPassTier, { credits: number; bdt: number; label: string }> = {
  micro_100_bdt: { credits: 80, bdt: 100, label: "100 BDT Quick Micro-Pass" },
  student_350_bdt: { credits: 300, bdt: 350, label: "350 BDT Student Semester Pack" },
  pro_750_bdt: { credits: 750, bdt: 750, label: "750 BDT Pro Creator Pack" },
  merchant_1500_bdt: { credits: 2000, bdt: 1500, label: "1,500 BDT F-Commerce Merchant Pack" },
};

/**
 * Manual/Webhook SMS Transaction Verification Request
 */
export const TrxVerificationRequestSchema = z.object({
  trxId: z.string().min(8).max(12).regex(/^[A-Za-z0-9]+$/, "TrxID must be alphanumeric"),
  provider: MfsProviderSchema.default("bkash"),
  senderMobileNumber: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, "Invalid Bangladesh mobile number"),
  tier: MicroPassTierSchema,
  amountBdt: z.number().positive(),
  userId: z.string(),
  workspaceId: z.string().optional(),
});
export type TrxVerificationRequest = z.infer<typeof TrxVerificationRequestSchema>;

/**
 * Transaction Verification Response
 */
export const TrxVerificationResponseSchema = z.object({
  success: z.boolean(),
  trxId: z.string(),
  provider: MfsProviderSchema,
  status: z.enum(["verified", "pending_review", "duplicate", "invalid_amount"]),
  creditedAmount: z.number(),
  newBalance: z.number(),
  ledgerId: z.string(),
  timestamp: z.string(),
  message: z.string(),
});
export type TrxVerificationResponse = z.infer<typeof TrxVerificationResponseSchema>;
