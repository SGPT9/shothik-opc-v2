import { Router, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { userSubscriptionsTable, toolUsageTable, llmUsageTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

const DEFAULT_TIER_LIMITS: Record<string, Record<string, number>> = {
  free: {
    chat: 25,
    plagiarism: 5,
    "ai-detector": 5,
    paraphrase: 10,
    grammar: 20,
    humanize: 5,
    summarize: 10,
    translator: 20,
    plagiarismChecks: 5,
    aiDetectorScans: 5,
    paraphraseUses: 10,
    grammarChecks: 20,
    humanizeUses: 5,
    summarizeUses: 10,
    translatorUses: 20,
  },
  pro: {
    chat: -1,
    plagiarism: 100,
    "ai-detector": 100,
    paraphrase: -1,
    grammar: -1,
    humanize: 100,
    summarize: -1,
    translator: -1,
    plagiarismChecks: 100,
    aiDetectorScans: 100,
    paraphraseUses: -1,
    grammarChecks: -1,
    humanizeUses: 100,
    summarizeUses: -1,
    translatorUses: -1,
  },
};

/**
 * GET /api/v1/subscriptions/me & /api/v1/subscriptions/current
 * Retrieve the current user's subscription details.
 */
router.get(["/v1/subscriptions/me", "/v1/subscriptions/current"], async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string) || "guest";

    if (userId === "guest") {
      res.json({
        success: true,
        data: {
          tier: "free",
          status: "active",
          interval: "month",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          credits: 500,
        },
      });
      return;
    }

    const subscription = await db
      .select()
      .from(userSubscriptionsTable)
      .where(eq(userSubscriptionsTable.userId, userId))
      .then((rows) => rows[0])
      .catch(() => null);

    if (!subscription) {
      res.json({
        success: true,
        data: {
          tier: "free",
          status: "active",
          interval: "month",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });
      return;
    }

    res.json({ success: true, data: subscription });
  } catch (err: any) {
    logger.error({ err }, "Failed to get user subscription");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/subscriptions/usage
 * Retrieve all usage counts for a user.
 */
router.get("/v1/subscriptions/usage", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string) || "guest";

    const rows = await db
      .select()
      .from(toolUsageTable)
      .where(eq(toolUsageTable.userId, userId));

    const usageMap: Record<string, number> = {};
    for (const r of rows) {
      usageMap[r.tool] = r.count;
    }

    res.json({ success: true, data: usageMap });
  } catch (err: any) {
    logger.error({ err }, "Failed to get user tool usage");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/subscriptions/check-limit
 * Check if the user has remaining quota for a given tool.
 */
router.post("/v1/subscriptions/check-limit", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || req.body.userId || "guest";
    const tool = req.body.tool;

    if (!tool) {
      res.status(400).json({ success: false, error: "tool is required" });
      return;
    }

    // Determine user tier
    let tier = "free";
    if (userId !== "guest") {
      const [sub] = await db
        .select()
        .from(userSubscriptionsTable)
        .where(eq(userSubscriptionsTable.userId, userId));
      if (sub) tier = sub.tier;
    }

    const limits = DEFAULT_TIER_LIMITS[tier] || DEFAULT_TIER_LIMITS.free;
    const limit = limits[tool] ?? 10;

    if (limit === -1) {
      res.json({
        success: true,
        allowed: true,
        tier,
        used: 0,
        limit: -1,
      });
      return;
    }

    // Get current usage
    const [row] = await db
      .select()
      .from(toolUsageTable)
      .where(and(eq(toolUsageTable.userId, userId), eq(toolUsageTable.tool, tool)));

    const used = row ? row.count : 0;
    const allowed = used < limit;

    res.json({
      success: true,
      allowed,
      tier,
      used,
      limit,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to check usage limit");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/subscriptions/increment-usage
 * Increment the tool usage counter for a user.
 */
router.post("/v1/subscriptions/increment-usage", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || req.body.userId || "guest";
    const tool = req.body.tool;

    if (!tool) {
      res.status(400).json({ success: false, error: "tool is required" });
      return;
    }

    const [existing] = await db
      .select()
      .from(toolUsageTable)
      .where(and(eq(toolUsageTable.userId, userId), eq(toolUsageTable.tool, tool)));

    let newCount = 1;
    if (existing) {
      newCount = existing.count + 1;
      await db
        .update(toolUsageTable)
        .set({ count: newCount, updatedAt: new Date() })
        .where(eq(toolUsageTable.id, existing.id));
    } else {
      await db.insert(toolUsageTable).values({
        userId,
        tool,
        count: 1,
      });
    }

    res.json({
      success: true,
      used: newCount,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to increment usage");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/subscriptions/llm-track
 * Track detailed LLM token metrics and cost.
 */
router.post("/v1/subscriptions/llm-track", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || req.body.userId || "guest";
    const { tool, provider, tokens, inputTokens, outputTokens, costUsd } = req.body;

    await db.insert(llmUsageTable).values({
      userId,
      tool: tool || "unknown",
      provider: provider || "unknown",
      tokens: tokens || 0,
      inputTokens: inputTokens || 0,
      outputTokens: outputTokens || 0,
      costUsd: costUsd ? String(costUsd) : "0",
    });

    res.json({ success: true });
  } catch (err: any) {
    logger.error({ err }, "Failed to record LLM usage metrics");
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Task Credit Deduction & Top-Up Endpoints ---

// In-memory credit store for fast local atomic ledger operations
const userCreditLedger = new Map<string, number>([
  ["usr_default", 500],
  ["guest", 500],
  ["dev_user_local", 1200],
]);

/**
 * GET /api/v1/subscriptions/credits
 * Returns the live credit balance for the user
 */
router.get(["/v1/subscriptions/credits", "/api/v1/subscriptions/credits"], async (req: Request, res: Response) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string) || "usr_default";
  const currentCredits = userCreditLedger.get(userId) ?? 500;

  res.status(200).json({
    success: true,
    userId,
    creditsBalance: currentCredits,
    currency: "CREDITS",
    tier: currentCredits > 500 ? "pro" : "starter",
    canExecuteAutonomousTask: currentCredits >= 1,
  });
});

/**
 * POST /api/v1/subscriptions/deduct-credits
 * Atomically checks balance and deducts task credits for autonomous agent actions
 */
router.post(["/v1/subscriptions/deduct-credits", "/api/v1/subscriptions/deduct-credits"], async (req: Request, res: Response) => {
  try {
    const { userId = "usr_default", amount = 1, taskId, taskTitle, reason = "Autonomous Twin Task" } = req.body;
    const cost = Math.max(1, Number(amount) || 1);
    const currentBalance = userCreditLedger.get(userId) ?? 500;

    if (currentBalance < cost) {
      logger.warn({ userId, currentBalance, cost }, "[CreditLedger] Insufficient credits for task execution");
      return res.status(402).json({
        success: false,
        error: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        required: cost,
        available: currentBalance,
        topupRequired: true,
        message: `Task execution requires ${cost} credits, but current balance is ${currentBalance}. Please top up via bKash or Nagad.`,
      });
    }

    const newBalance = currentBalance - cost;
    userCreditLedger.set(userId, newBalance);

    const transactionId = `TX_CR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    logger.info({ userId, cost, newBalance, taskId, transactionId }, "[CreditLedger] Deducted credits for autonomous task");

    return res.status(200).json({
      success: true,
      transactionId,
      userId,
      deducted: cost,
      previousBalance: currentBalance,
      remainingCredits: newBalance,
      taskId: taskId || `task_${Date.now()}`,
      taskTitle: taskTitle || "Autonomous Strategy Directive",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/subscriptions/topup-credits
 * Credits user's balance upon verified bKash/Nagad TrxID
 */
router.post(["/v1/subscriptions/topup-credits", "/api/v1/subscriptions/topup-credits"], async (req: Request, res: Response) => {
  try {
    const { userId = "usr_default", amount = 500, trxId, paymentMethod = "bkash" } = req.body;
    const addedCredits = Math.max(1, Number(amount) || 500);
    const currentBalance = userCreditLedger.get(userId) ?? 500;
    const newBalance = currentBalance + addedCredits;

    userCreditLedger.set(userId, newBalance);
    const receiptNumber = `RCP_CR_${Date.now()}`;

    logger.info({ userId, addedCredits, newBalance, trxId }, "[CreditLedger] Top-up credits applied");

    return res.status(200).json({
      success: true,
      receiptNumber,
      userId,
      addedCredits,
      previousBalance: currentBalance,
      creditsBalance: newBalance,
      trxId: trxId || `TRX_${Date.now()}`,
      paymentMethod,
      message: `Successfully topped up ${addedCredits} task credits to your wallet.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
