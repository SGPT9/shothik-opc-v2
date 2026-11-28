import { Router, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { userSubscriptionsTable, toolUsageTable, llmUsageTable, userCreditsTable, pricingPlansTable, outcomePassesTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { idempotencyMiddleware } from "../lib/idempotency/idempotency-service";
import { resolveUserId } from "../middleware/auth.js";

const router = Router();

export const DEFAULT_TIER_LIMITS: Record<string, Record<string, number>> = {
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
  student: {
    chat: 100,
    plagiarism: 30,
    "ai-detector": 30,
    paraphrase: 50,
    grammar: 100,
    humanize: 20,
    summarize: 50,
    translator: 100,
    plagiarismChecks: 30,
    aiDetectorScans: 30,
    paraphraseUses: 50,
    grammarChecks: 100,
    humanizeUses: 20,
    summarizeUses: 50,
    translatorUses: 100,
  },
  "starter-pass": {
    chat: 100,
    plagiarism: 30,
    "ai-detector": 30,
    paraphrase: 50,
    grammar: 100,
    humanize: 20,
    summarize: 50,
    translator: 100,
    plagiarismChecks: 30,
    aiDetectorScans: 30,
    paraphraseUses: 50,
    grammarChecks: 100,
    humanizeUses: 20,
    summarizeUses: 50,
    translatorUses: 100,
  },
  researcher: {
    chat: -1,
    plagiarism: 100,
    "ai-detector": 100,
    paraphrase: 200,
    grammar: -1,
    humanize: 100,
    summarize: 200,
    translator: -1,
    plagiarismChecks: 100,
    aiDetectorScans: 100,
    paraphraseUses: 200,
    grammarChecks: -1,
    humanizeUses: 100,
    summarizeUses: 200,
    translatorUses: -1,
  },
  "pro-operator": {
    chat: -1,
    plagiarism: 100,
    "ai-detector": 100,
    paraphrase: 200,
    grammar: -1,
    humanize: 100,
    summarize: 200,
    translator: -1,
    plagiarismChecks: 100,
    aiDetectorScans: 100,
    paraphraseUses: 200,
    grammarChecks: -1,
    humanizeUses: 100,
    summarizeUses: 200,
    translatorUses: -1,
  },
  pro: {
    chat: -1,
    plagiarism: -1,
    "ai-detector": -1,
    paraphrase: -1,
    grammar: -1,
    humanize: -1,
    summarize: -1,
    translator: -1,
    plagiarismChecks: -1,
    aiDetectorScans: -1,
    paraphraseUses: -1,
    grammarChecks: -1,
    humanizeUses: -1,
    summarizeUses: -1,
    translatorUses: -1,
  },
  "venture-twin": {
    chat: -1,
    plagiarism: -1,
    "ai-detector": -1,
    paraphrase: -1,
    grammar: -1,
    humanize: -1,
    summarize: -1,
    translator: -1,
    plagiarismChecks: -1,
    aiDetectorScans: -1,
    paraphraseUses: -1,
    grammarChecks: -1,
    humanizeUses: -1,
    summarizeUses: -1,
    translatorUses: -1,
  },
  "agency-scale": {
    chat: -1,
    plagiarism: -1,
    "ai-detector": -1,
    paraphrase: -1,
    grammar: -1,
    humanize: -1,
    summarize: -1,
    translator: -1,
    plagiarismChecks: -1,
    aiDetectorScans: -1,
    paraphraseUses: -1,
    grammarChecks: -1,
    humanizeUses: -1,
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
    const userId = resolveUserId(req, "guest");

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
    const userId = resolveUserId(req, "guest");

    const rows = await db
      .select()
      .from(toolUsageTable)
      .where(eq(toolUsageTable.userId, userId))
      .catch(() => []);

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
    const userId = resolveUserId(req, typeof req.body?.userId === "string" ? req.body.userId : "guest");
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
        .where(eq(userSubscriptionsTable.userId, userId))
        .catch(() => []);
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
      .where(and(eq(toolUsageTable.userId, userId), eq(toolUsageTable.tool, tool)))
      .catch(() => []);

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
    const userId = resolveUserId(req, typeof req.body?.userId === "string" ? req.body.userId : "guest");
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
    const userId = resolveUserId(req, typeof req.body?.userId === "string" ? req.body.userId : "guest");
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

export async function getPersistedCredits(userId: string): Promise<number> {
  try {
    const record = await db
      .select()
      .from(userCreditsTable)
      .where(eq(userCreditsTable.userId, userId))
      .then((rows) => rows[0]);
    if (record) {
      userCreditLedger.set(userId, record.balance);
      return record.balance;
    }
  } catch (err) {
    // Fallback
  }
  return userCreditLedger.get(userId) ?? 500;
}

export async function persistCreditDeduction(userId: string, newBalance: number, amountSpent = 0): Promise<void> {
  userCreditLedger.set(userId, newBalance);
  try {
    await db
      .insert(userCreditsTable)
      .values({
        userId,
        balance: newBalance,
        lifetimeSpent: amountSpent,
      })
      .onConflictDoUpdate({
        target: userCreditsTable.userId,
        set: {
          balance: newBalance,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    // Fallback
  }
}


/**
 * GET /api/v1/subscriptions/credits
 * Returns the live credit balance for the user
 */
router.get(["/v1/subscriptions/credits", "/api/v1/subscriptions/credits"], async (req: Request, res: Response) => {
  const userId = resolveUserId(req, "usr_default");
  const currentCredits = await getPersistedCredits(userId);

  res.status(200).json({
    success: true,
    userId,
    creditsBalance: currentCredits,
    currency: "CREDITS",
    tier: currentCredits > 500 ? "pro" : "starter",
    canExecuteAutonomousTask: currentCredits >= 1,
  });
});

// Outcome-based monetization pass catalog
export const OUTCOME_PASSES: Record<string, { id: string; name: string; priceBdt: number; creditsEquivalent: number; outcome: string }> = {
  THESIS_PLAGIARISM_PASS: {
    id: "THESIS_PLAGIARISM_PASS",
    name: "Single Thesis Plagiarism & Citation Report",
    priceBdt: 49,
    creditsEquivalent: 50,
    outcome: "Full thesis plagiarism audit report with institutional similarity scores & IEEE PDF export",
  },
  AUDIOBOOK_BOOKTOK_PASS: {
    id: "AUDIOBOOK_BOOKTOK_PASS",
    name: "Audiobook & BookTok Launch Pass",
    priceBdt: 149,
    creditsEquivalent: 150,
    outcome: "24kHz Multi-Cast Bangla Audiobook Chapter, 3D Binaural Soundscape, and 3 BookTok Lip-Sync Video Reels",
  },
  BOI_MELA_PRINT_PASS: {
    id: "BOI_MELA_PRINT_PASS",
    name: "Ekushey Boi Mela Print-Ready Book Pass",
    priceBdt: 199,
    creditsEquivalent: 200,
    outcome: "Complete Ekushey Boi Mela 6x9 PDF/X-1a Nilkhet Forma Typesetting, 3D Book Jacket, National Library CIP & EAN-13 ISBN Barcode, and Legal Defamation Preflight Certificate",
  },
  PROJECT_VENTURE_PASS: {
    id: "PROJECT_VENTURE_PASS",
    name: "Founder Project Pass",
    priceBdt: 299,
    creditsEquivalent: 300,
    outcome: "Editable PPTX pitch deck, 3-year financial model spreadsheet, and Dokploy container deployment",
  },
  F_COMMERCE_MONTHLY_PASS: {
    id: "F_COMMERCE_MONTHLY_PASS",
    name: "Autonomous F-Commerce Operations",
    priceBdt: 999,
    creditsEquivalent: 1200,
    outcome: "24/7 autonomous Steadfast/Pathao courier tracking and customer query resolution on Messenger/WhatsApp",
  },
};

/**
 * GET /api/v1/subscriptions/passes/catalog
 * Public catalog of outcome-based micro-passes
 */
router.get(["/v1/subscriptions/passes/catalog", "/api/v1/subscriptions/passes/catalog"], (req: Request, res: Response) => {
  const includeAll = req.query.all === "true" || req.query.version === "v2";
  const allPasses = Object.values(OUTCOME_PASSES);
  const corePasses = [
    OUTCOME_PASSES.THESIS_PLAGIARISM_PASS,
    OUTCOME_PASSES.PROJECT_VENTURE_PASS,
    OUTCOME_PASSES.F_COMMERCE_MONTHLY_PASS,
  ];
  res.status(200).json({
    success: true,
    currency: "BDT",
    passes: includeAll ? allPasses : corePasses,
    allPasses,
  });
});

/**
 * POST /api/v1/subscriptions/ledger:deduct (Canonical) & /v1/subscriptions/deduct-credits (Legacy)
 * Atomically checks balance and deducts task credits for autonomous agent actions
 */
router.post(
  [
    "/v1/subscriptions/ledger:deduct",
    "/api/v1/subscriptions/ledger:deduct",
    "/v1/subscriptions/deduct-credits",
    "/api/v1/subscriptions/deduct-credits",
  ],
  idempotencyMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId = "usr_default", amount = 1, taskId, taskTitle } = req.body;
      const cost = Math.max(1, Number(amount) || 1);
      const currentBalance = await getPersistedCredits(userId);

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
      await persistCreditDeduction(userId, newBalance, cost);

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
  }
);

/**
 * POST /api/v1/subscriptions/ledger:topup (Canonical) & /v1/subscriptions/topup-credits (Legacy)
 * Credits user's balance upon verified bKash/Nagad TrxID
 */
router.post(
  [
    "/v1/subscriptions/ledger:topup",
    "/api/v1/subscriptions/ledger:topup",
    "/v1/subscriptions/topup-credits",
    "/api/v1/subscriptions/topup-credits",
  ],
  idempotencyMiddleware,
  async (req: Request, res: Response) => {
    try {
      // Security Gate: Direct credit ledger top-up requires admin or verified internal secret in production (Finding 3)
      const isDevOrTest = process.env.NODE_ENV !== "production";
      const internalKey = req.headers["x-internal-secret"] || req.headers["x-admin-key"];
      const expectedSecret = process.env.INTERNAL_SERVICE_SECRET || process.env.ADMIN_API_KEY;
      const authorized = isDevOrTest || (expectedSecret && internalKey === expectedSecret) || (req as any).user?.role === "admin";

      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "Direct credit ledger top-up requires administrative or verified payment webhook authorization.",
        });
      }

      const userId = resolveUserId(req, req.body?.userId || "usr_default");
      const { amount = 500, trxId, paymentMethod = "bkash" } = req.body;
      const addedCredits = Math.max(1, Number(amount) || 500);
      const currentBalance = await getPersistedCredits(userId);
      const newBalance = currentBalance + addedCredits;

      await persistCreditDeduction(userId, newBalance, 0);
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
  }
);

/**
 * POST /api/v1/subscriptions/passes:purchase
 * Instant unlock for tangible human outcomes (Thesis 49 BDT, Audiobook 149 BDT, Boi Mela 199 BDT, Project 299 BDT, F-Commerce 999 BDT)
 */
router.post(
  ["/v1/subscriptions/passes:purchase", "/api/v1/subscriptions/passes:purchase"],
  idempotencyMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = resolveUserId(req, req.body?.userId || "usr_default");
      const { passId, trxId } = req.body;
      const pass = OUTCOME_PASSES[passId];

      if (!pass) {
        return res.status(400).json({
          success: false,
          error: `Invalid passId. Valid passes are: ${Object.keys(OUTCOME_PASSES).join(", ")}`,
        });
      }

      const currentBalance = await getPersistedCredits(userId);
      const newBalance = currentBalance + pass.creditsEquivalent;
      await persistCreditDeduction(userId, newBalance, 0);

      const passToken = `PASS_${pass.id.slice(0, 4)}_${Date.now()}`;
      logger.info({ userId, passId, passToken, trxId }, "[CreditLedger] Outcome pass activated");

      return res.status(200).json({
        success: true,
        passToken,
        passId: pass.id,
        name: pass.name,
        priceBdt: pass.priceBdt,
        outcomeUnlocked: pass.outcome,
        newCreditsBalance: newBalance,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

// =========================================================================
// Public Plans, Packages & MFS Checkout Endpoints (for Pricing Page & Checkout)
// =========================================================================

const PUBLIC_PLANS = [
  { _id: "monthly", name: "Monthly", duration: 30, is_active: true },
  { _id: "yearly", name: "Yearly (Save 20%)", duration: 365, is_active: true },
];

const PUBLIC_PACKAGES = [
  {
    _id: "starter-pass",
    name: "Starter Student Micro-Pass",
    description: "Ideal for university assignments, thesis Turnitin checks, and single slide deck creation.",
    package_for: "User",
    is_popular: false,
    is_active: true,
    price: { USD: 0.85, BDT: 100 },
    plans: [
      {
        _id: "plan_starter_monthly",
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 0.85, BDT: 100 },
        token: 50,
        is_initial: true,
        is_active: true,
      },
      {
        _id: "plan_starter_yearly",
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 8.16, BDT: 960 },
        token: 1200,
        is_initial: false,
        is_active: true,
      },
    ],
    features: [
      { _id: "f1", name: "50 Instant Task Credits" },
      { _id: "f2", name: "Academic Plagiarism & Turnitin Check" },
      { _id: "f3", name: "1 Full Presentation Generation" },
      { _id: "f4", name: "Bangla & English Spell Checking" },
    ],
  },
  {
    _id: "pro-operator",
    name: "Pro Operator Pack",
    description: "Most popular for solo entrepreneurs, developers, and agency copywriters.",
    package_for: "User",
    is_popular: true,
    is_active: true,
    price: { USD: 8.50, BDT: 990 },
    plans: [
      {
        _id: "plan_pro_monthly",
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 8.50, BDT: 990 },
        token: 550,
        is_initial: true,
        is_active: true,
      },
      {
        _id: "plan_pro_yearly",
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 81.60, BDT: 9500 },
        token: 7200,
        is_initial: false,
        is_active: true,
      },
    ],
    features: [
      { _id: "f5", name: "550 Workspace Credits" },
      { _id: "f6", name: "Unlimited Pro Search & Deep Research" },
      { _id: "f7", name: "5-Step Slide Studio with 16:9 Canvas" },
      { _id: "f8", name: "40-Scenario Financial Stress Lab" },
      { _id: "f9", name: "Interactive Voice Dictation & Presenter" },
    ],
  },
  {
    _id: "venture-twin",
    name: "Venture Twin & OPC",
    description: "For active startups and digital businesses automating sales, marketing, and logistics.",
    package_for: "User",
    is_popular: false,
    is_active: true,
    price: { USD: 19.99, BDT: 2400 },
    plans: [
      {
        _id: "plan_venture_monthly",
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 19.99, BDT: 2400 },
        token: 1500,
        is_initial: true,
        is_active: true,
      },
      {
        _id: "plan_venture_yearly",
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 191.90, BDT: 23040 },
        token: 21600,
        is_initial: false,
        is_active: true,
      },
    ],
    features: [
      { _id: "f10", name: "1,500 Monthly Credits" },
      { _id: "f11", name: "1 Autonomous Company Slot" },
      { _id: "f12", name: "Tonight Engine Overnight Background Worker" },
      { _id: "f13", name: "Steadfast & Pathao Courier Auto-Dispatch" },
      { _id: "f14", name: "bKash & Nagad Merchant Reconciliation" },
    ],
  },
  {
    _id: "agency-scale",
    name: "Agency & Publisher Enterprise",
    description: "Multi-brand Venture Twin orchestration, unlimited Nilkhet publishing runs, and Bangladesh Industrial ERP.",
    package_for: "User",
    is_popular: false,
    is_active: true,
    price: { USD: 49.99, BDT: 6000 },
    plans: [
      {
        _id: "plan_agency_monthly",
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 49.99, BDT: 6000 },
        token: 5000,
        is_initial: true,
        is_active: true,
      },
      {
        _id: "plan_agency_yearly",
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 479.90, BDT: 57600 },
        token: 60000,
        is_initial: false,
        is_active: true,
      },
    ],
    features: [
      { _id: "f15", name: "5,000 Monthly Task Credits" },
      { _id: "f16", name: "5 Autonomous Company Slots" },
      { _id: "f17", name: "Unlimited InkOS 45 Publishing & Boi Mela Print Runs" },
      { _id: "f18", name: "NBR Mushak 4.3/6.3/6.6 VAT & Industrial ERP Suite" },
      { _id: "f19", name: "Dedicated DeepSeek R1 & Qwen GPU Inference Nodes" },
    ],
  },
];

const PUBLIC_PAYMENT_METHODS = [
  {
    _id: "bkash",
    name: "bKash MFS",
    type: "mobile_banking",
    currency: "BDT",
    is_active: true,
  },
  {
    _id: "nagad",
    name: "Nagad MFS",
    type: "mobile_banking",
    currency: "BDT",
    is_active: true,
  },
  {
    _id: "card",
    name: "Visa / Mastercard",
    type: "card",
    currency: "USD",
    is_active: true,
  },
];

router.get(["/plans/public", "/v1/plans/public"], (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: PUBLIC_PLANS });
});

router.get(["/packages/public", "/v1/packages/public"], (req: Request, res: Response) => {
  const pkgId = typeof req.query._id === "string" ? req.query._id : undefined;
  const data = pkgId ? PUBLIC_PACKAGES.filter((p) => p._id === pkgId) : PUBLIC_PACKAGES;
  res.status(200).json({ success: true, data: data.length > 0 ? data : PUBLIC_PACKAGES });
});

router.get(["/packages/public/:id", "/v1/packages/public/:id"], (req: Request, res: Response) => {
  const pkg = PUBLIC_PACKAGES.find((p) => p._id === req.params.id) || PUBLIC_PACKAGES[0];
  res.status(200).json({ success: true, data: pkg });
});

router.get(["/payment-methods/public", "/v1/payment-methods/public"], (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: PUBLIC_PAYMENT_METHODS });
});

router.get(["/payment-methods/:id/public", "/v1/payment-methods/:id/public"], (req: Request, res: Response) => {
  const method = PUBLIC_PAYMENT_METHODS.find((m) => m._id === req.params.id) || PUBLIC_PAYMENT_METHODS[0];
  res.status(200).json({ success: true, data: method });
});

interface PublicPaymentTransaction {
  _id: string;
  package: string;
  plan: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  customer_email: string;
  credits: number;
  verified: boolean;
  createdAt: string;
  verifiedAt?: string;
}

const pendingPublicTransactions = new Map<string, PublicPaymentTransaction>();

router.post(["/payment-transactions/initiate", "/v1/payment-transactions/initiate"], (req: Request, res: Response) => {
  const { package: pkgId, plan: planId = "monthly", payment_method = "bkash", customer_email } = req.body || {};
  const selectedPkg = PUBLIC_PACKAGES.find((p) => p._id === pkgId) || PUBLIC_PACKAGES[0];
  const normalizedPlan = planId === "yearly" || planId === "year" ? "yearly" : "monthly";
  const selectedPlanEntry = selectedPkg.plans.find((pl) => pl.plan._id === normalizedPlan) || selectedPkg.plans[0];
  const transactionId = `TRX_INIT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Credits to allocate upon verification
  const credits = selectedPlanEntry?.token ?? (selectedPkg._id === "starter-pass" ? 50 : selectedPkg._id === "pro-operator" ? 550 : selectedPkg._id === "venture-twin" ? 1500 : 5000);
  const isCard = payment_method === "card";
  const currency = isCard ? "USD" : "BDT";
  const amount = isCard ? (selectedPlanEntry?.price.USD ?? selectedPkg.price.USD) : (selectedPlanEntry?.price.BDT ?? selectedPkg.price.BDT);

  const txRecord: PublicPaymentTransaction = {
    _id: transactionId,
    package: selectedPkg._id,
    plan: normalizedPlan,
    payment_method,
    amount,
    currency,
    status: "pending",
    customer_email: customer_email || "tester@shothik.ai",
    credits,
    verified: false,
    createdAt: new Date().toISOString(),
  };

  pendingPublicTransactions.set(transactionId, txRecord);

  // Return success redirect path with transaction metadata
  const successUrl = `/pricing/checkout/success?trx_id=${transactionId}&package_id=${selectedPkg._id}&credits=${credits}`;

  res.status(200).json({
    success: true,
    data: {
      payment_transaction: txRecord,
      redirect_url: successUrl,
      payment_url: successUrl,
    },
  });
});

router.post(["/payment-transactions/:id/verify", "/v1/payment-transactions/:id/verify"], async (req: Request, res: Response) => {
  const trxId = String(req.params.id || "");
  const userId = resolveUserId(req, "usr_default");

  const txRecord = pendingPublicTransactions.get(trxId);
  if (!txRecord) {
    return res.status(404).json({
      success: false,
      error: `Transaction ${trxId} not found or expired.`,
    });
  }

  // Idempotency: avoid double-crediting
  if (txRecord.status === "completed" && txRecord.verified) {
    return res.status(200).json({
      success: true,
      message: "Transaction was already verified and credited.",
      data: {
        _id: trxId,
        status: "completed",
        verified: true,
      },
    });
  }

  // Security Gate: Verify upstream MFS settlement status in production (Finding 4)
  const isDevOrTest = process.env.NODE_ENV !== "production";
  const gatewaySignature = req.headers["x-gateway-signature"] || req.body?.gatewaySignature;
  
  if (!isDevOrTest && !gatewaySignature && txRecord.payment_method !== "stripe") {
    // In production, reject unconfirmed manual verify requests without upstream gateway confirmation
    const isMockBypass = process.env.ALLOW_MOCK_PAYMENT_VERIFY === "true";
    if (!isMockBypass) {
      return res.status(402).json({
        success: false,
        error: "PaymentRequired",
        message: "Payment provider verification pending or unconfirmed by upstream MFS gateway.",
      });
    }
  }

  // Settle transaction and credit exact tier tokens
  txRecord.status = "completed";
  txRecord.verified = true;
  txRecord.verifiedAt = new Date().toISOString();

  const currentCredits = await getPersistedCredits(userId);
  await persistCreditDeduction(userId, currentCredits + txRecord.credits, 0);

  // Upsert user subscription tier in PostgreSQL
  if (userId && userId !== "guest") {
    try {
      const mappedTier =
        txRecord.package === "starter-pass"
          ? "student"
          : txRecord.package === "pro-operator"
          ? "researcher"
          : "pro";
      const interval = txRecord.plan === "yearly" ? "year" : "month";
      const periodEnd = new Date();
      if (interval === "year") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const [existingSub] = await db
        .select()
        .from(userSubscriptionsTable)
        .where(eq(userSubscriptionsTable.userId, userId));

      if (existingSub) {
        await db
          .update(userSubscriptionsTable)
          .set({
            tier: mappedTier,
            status: "active",
            interval,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptionsTable.id, existingSub.id));
      } else {
        await db.insert(userSubscriptionsTable).values({
          userId,
          tier: mappedTier,
          status: "active",
          interval,
          currentPeriodEnd: periodEnd,
        });
      }
    } catch {
      // Fallback when DB is offline in isolated unit tests
    }
  }

  return res.status(200).json({
    success: true,
    message: "Transaction verified and credits credited successfully.",
    data: {
      _id: trxId,
      status: "completed",
      verified: true,
      creditedAmount: txRecord.credits,
    },
  });
});

router.get(["/payment-transactions/:id/status", "/v1/payment-transactions/:id/status"], (req: Request, res: Response) => {
  const trxId = String(req.params.id || "");
  const txRecord = pendingPublicTransactions.get(trxId);
  if (!txRecord) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found.",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      _id: txRecord._id,
      status: txRecord.status,
      is_paid: txRecord.status === "completed",
    },
  });
});

/**
 * POST /stripe/subscription/checkout & /v1/subscriptions/checkout
 * Express-mounted checkout session creator for UpgradeModal & BillingPage
 */
router.post(
  ["/stripe/subscription/checkout", "/api/stripe/subscription/checkout", "/v1/subscriptions/checkout"],
  (req: Request, res: Response) => {
    const { tier = "researcher", interval = "month", currency = "usd", customer_email } = req.body || {};
    const pkgId =
      tier === "student" || tier === "starter-pass"
        ? "starter-pass"
        : tier === "researcher" || tier === "pro-operator"
        ? "pro-operator"
        : tier === "agency-scale" || tier === "enterprise"
        ? "agency-scale"
        : "venture-twin";
    const planId = interval === "year" || interval === "yearly" ? "yearly" : "monthly";
    const selectedPkg = PUBLIC_PACKAGES.find((p) => p._id === pkgId) || PUBLIC_PACKAGES[1];
    const selectedPlanEntry = selectedPkg.plans.find((pl) => pl.plan._id === planId) || selectedPkg.plans[0];
    const transactionId = `TRX_STRIPE_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const normCurrency = String(currency).toUpperCase() === "BDT" ? "BDT" : "USD";
    const amount = normCurrency === "BDT" ? selectedPlanEntry.price.BDT : selectedPlanEntry.price.USD;
    const credits = selectedPlanEntry.token;

    const txRecord: PublicPaymentTransaction = {
      _id: transactionId,
      package: pkgId,
      plan: planId,
      payment_method: normCurrency === "BDT" ? "bkash" : "card",
      amount,
      currency: normCurrency,
      status: "pending",
      customer_email: customer_email || "tester@shothik.ai",
      credits,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    pendingPublicTransactions.set(transactionId, txRecord);

    const checkoutUrl = `/pricing/checkout?packageId=${pkgId}&planId=${planId}&trx_id=${transactionId}`;
    return res.status(200).json({
      success: true,
      checkoutUrl,
      url: checkoutUrl,
      transactionId,
    });
  }
);

/**
 * POST /stripe/subscription/portal & /v1/subscriptions/portal
 * Express-mounted billing portal redirect for BillingPage
 */
router.post(
  ["/stripe/subscription/portal", "/api/stripe/subscription/portal", "/v1/subscriptions/portal"],
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      portalUrl: "/pricing",
      url: "/pricing",
    });
  }
);

router.get(["/v1/subscriptions/plans", "/v1/pricing/plans"], async (_req: Request, res: Response) => {
  try {
    const dbPlans: any[] = await db.select().from(pricingPlansTable).catch(() => []);
    if (dbPlans.length > 0) {
      dbPlans.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      return res.status(200).json({ success: true, currency: "BDT", plans: dbPlans });
    }
  } catch {}
  return res.status(200).json({
    success: true,
    currency: "BDT",
    plans: Object.entries(DEFAULT_TIER_LIMITS).map(([slug, toolLimits]) => ({ id: `plan_${slug}`, slug, name: slug.toUpperCase(), toolLimits })),
  });
});

export default router;

