import { Router, Request, Response } from "express";
import { z } from "zod";
import { AuditLedgerEngine } from "../lib/audit/audit-ledger-engine.js";

export const auditLedgerRouter = Router();

const postJournalSchema = z.object({
  transactionRef: z.string().min(1, "transactionRef is required"),
  transactionType: z.enum([
    "sale_cod",
    "sale_bkash",
    "mfs_fee",
    "vat_mushak_6_3",
    "customs_duty",
    "franchise_royalty",
    "courier_payout",
  ]),
  memo: z.string().min(1, "memo is required"),
  lines: z
    .array(
      z.object({
        accountCode: z.string().min(1, "accountCode is required"),
        debitBdt: z.number().nonnegative(),
        creditBdt: z.number().nonnegative(),
        description: z.string().optional(),
      })
    )
    .min(2, "Journal entry must have at least 2 balanced lines"),
});

const generateDossierSchema = z.object({
  merchantId: z.string().min(1, "merchantId is required"),
  merchantName: z.string().min(1, "merchantName is required"),
  binNumber: z.string().min(9, "Valid 9 to 13 digit BIN is required"),
  taxYear: z.string().optional(),
});

/**
 * GET /v1/audit/chart-of-accounts and /v1/audit/accounts
 */
auditLedgerRouter.get(["/v1/audit/chart-of-accounts", "/v1/audit/accounts"], (_req: Request, res: Response) => {
  try {
    const accounts = AuditLedgerEngine.listAccounts();
    return res.status(200).json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list chart of accounts",
    });
  }
});

/**
 * GET /v1/audit/journal-entries and /v1/audit/journals
 */
auditLedgerRouter.get(["/v1/audit/journal-entries", "/v1/audit/journals"], (_req: Request, res: Response) => {
  try {
    const entries = AuditLedgerEngine.listJournals();
    return res.status(200).json({
      success: true,
      count: entries.length,
      journals: entries,
      entries,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list journal entries",
    });
  }
});

/**
 * POST /v1/audit/journal-entries/post and /v1/audit/journal
 */
auditLedgerRouter.post(["/v1/audit/journal-entries/post", "/v1/audit/journal"], (req: Request, res: Response) => {
  try {
    const parse = postJournalSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const result = AuditLedgerEngine.postJournalEntry(parse.data);
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to post journal entry",
    });
  }
});

/**
 * GET /v1/audit/trial-balance
 */
auditLedgerRouter.get("/v1/audit/trial-balance", (_req: Request, res: Response) => {
  try {
    const trialBalance = AuditLedgerEngine.getTrialBalance();
    return res.status(200).json({
      success: true,
      trialBalance,
      ...trialBalance,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate trial balance",
    });
  }
});

/**
 * POST /v1/audit/dossier/generate and /v1/audit/dossier/compile
 */
auditLedgerRouter.post(["/v1/audit/dossier/generate", "/v1/audit/dossier/compile"], (req: Request, res: Response) => {
  try {
    const parse = generateDossierSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const dossier = AuditLedgerEngine.generateNbrDossier(parse.data);
    return res.status(200).json({
      success: true,
      dossier,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate NBR audit dossier",
    });
  }
});
