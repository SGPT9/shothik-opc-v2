import { Router, type Request, type Response } from "express";
import { resolveUserId } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";
import { db, savedReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

export const reportsRouter = Router();

export interface SavedReportDTO {
  id: string;
  userId: string;
  title: string;
  type: "markdown" | "slides" | "sheet" | "pdf";
  snippet: string;
  content: string;
  chatId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback ledger for resilient offline/local operation
const memoryReportsLedger = new Map<string, SavedReportDTO[]>([
  [
    "usr_default",
    [
      {
        id: "rep_pitch_deck_01",
        userId: "usr_default",
        title: "10-Slide Investor Pitch Deck",
        type: "slides",
        snippet: "BD E-Commerce TAM analysis & Seed fundraising model ($500K target).",
        content: "# 10-Slide Investor Pitch Deck\n\nTAM: $1.2B\nCAGR: 32% YoY\nTarget: $500K Seed",
        chatId: "conv_pitch_deck",
        metadata: { slidesCount: 10, targetTAM: "$1.2B" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rep_nbr_tax_02",
        userId: "usr_default",
        title: "NBR Income Tax Act 2023 Analysis",
        type: "markdown",
        snippet: "Section 78 investment rebate & withholding tax exemptions.",
        content: "# NBR Income Tax Act 2023\n\nSection 78 Investment Rebate 15%\nTDS Form 10B Compliance",
        chatId: "conv_nbr_tax",
        metadata: { rebatePercent: "15%", actYear: "2023" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rep_mfs_settle_03",
        userId: "usr_default",
        title: "bKash & Nagad MFS Merchant Settlement API",
        type: "sheet",
        snippet: "Instant TrxID SMS webhook matching and 1.5% fee reconciliation.",
        content: "# bKash & Nagad MFS Settlement\n\nWebhook Verification: Instant TrxID\nCash-out Fee: 1.5%",
        chatId: "conv_mfs_settle",
        metadata: { feeRate: "1.5%", latency: "<1s" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  ],
]);

/**
 * GET /api/v1/reports
 * Returns saved reports for the authenticated user, checking Postgres first with memory ledger fallback.
 */
reportsRouter.get("/v1/reports", async (req: Request, res: Response) => {
  const userId = resolveUserId(req, "usr_default");

  try {
    if (db) {
      const records = await db
        .select()
        .from(savedReportsTable)
        .where(eq(savedReportsTable.userId, userId))
        .orderBy(desc(savedReportsTable.updatedAt))
        .limit(100);

      if (records && records.length > 0) {
        return res.status(200).json({
          success: true,
          source: "postgres",
          count: records.length,
          reports: records.map((r) => ({
            id: r.id,
            userId: r.userId,
            title: r.title,
            type: r.type as "markdown" | "slides" | "sheet" | "pdf",
            snippet: r.snippet,
            content: r.content,
            chatId: r.chatId,
            metadata: r.metadata ?? {},
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
          })),
        });
      }
    }
  } catch (err: any) {
    logger.warn(`[reports] Database query fallback: ${err.message}`);
  }

  // Memory/Local ledger fallback
  const userReports = memoryReportsLedger.get(userId) || memoryReportsLedger.get("usr_default") || [];
  return res.status(200).json({
    success: true,
    source: "local_ledger",
    count: userReports.length,
    reports: userReports,
  });
});

/**
 * POST /api/v1/reports
 * Saves or updates a report in Postgres and active ledger
 */
reportsRouter.post("/v1/reports", async (req: Request, res: Response) => {
  const userId = resolveUserId(req, "usr_default");
  const {
    id = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    type = "markdown",
    snippet = "",
    content = "",
    chatId = `conv_${Date.now()}`,
    metadata = {},
  } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: "Report title is required" });
  }

  const newReport: SavedReportDTO = {
    id,
    userId,
    title,
    type,
    snippet: snippet || (content ? content.slice(0, 140) + "..." : "Saved document report."),
    content,
    chatId,
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Persist to Postgres if available
  try {
    if (db) {
      await db
        .insert(savedReportsTable)
        .values({
          id,
          userId,
          title,
          type,
          snippet: newReport.snippet,
          content,
          chatId,
          metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: savedReportsTable.id,
          set: {
            title,
            type,
            snippet: newReport.snippet,
            content,
            metadata,
            updatedAt: new Date(),
          },
        });
    }
  } catch (err: any) {
    logger.warn(`[reports] DB save fallback: ${err.message}`);
  }

  // 2. Persist to memory ledger
  const current = memoryReportsLedger.get(userId) || [];
  const idx = current.findIndex((r) => r.id === id);
  if (idx >= 0) {
    current[idx] = newReport;
  } else {
    current.unshift(newReport);
  }
  memoryReportsLedger.set(userId, current);

  logger.info(`[reports] Saved report '${title}' (${id}) for user ${userId}`);
  return res.status(201).json({
    success: true,
    report: newReport,
  });
});

/**
 * DELETE /api/v1/reports/:id
 * Removes a saved report
 */
reportsRouter.delete("/v1/reports/:id", async (req: Request, res: Response) => {
  const userId = resolveUserId(req, "usr_default");
  const reportId = String(req.params.id ?? "");

  try {
    if (db) {
      await db
        .delete(savedReportsTable)
        .where(eq(savedReportsTable.id, reportId));
    }
  } catch (err: any) {
    logger.warn(`[reports] DB delete fallback: ${err.message}`);
  }

  const current = memoryReportsLedger.get(userId) || [];
  memoryReportsLedger.set(
    userId,
    current.filter((r) => r.id !== reportId)
  );

  return res.status(200).json({
    success: true,
    message: `Report ${reportId} deleted successfully.`,
  });
});
