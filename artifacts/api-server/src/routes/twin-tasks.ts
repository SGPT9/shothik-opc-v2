import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import { executeWayfinderTask, type TaskExecutionRequest } from "../lib/twin/task-runner";
import { TwinOrchestrator } from "../lib/twin/twin-orchestrator.js";
import { nightshiftEngine } from "../lib/nightshift-engine.js";
import { tokenCostTracker } from "../lib/token-cost-tracker.js";
import { developerTwinEngine } from "../lib/twin/developer-twin-engine.js";

const router = Router();

/**
 * POST /api/v1/twin/tasks/execute
 * Execute an individual Wayfinder task autonomously
 */
router.post("/v1/twin/tasks/execute", async (req: Request, res: Response) => {
  try {
    const { companySlug, companyName, taskId, title, description, category, urgency, costCredits } = req.body;

    if (!taskId || !title) {
      res.status(400).json({ success: false, error: "taskId and title are required" });
      return;
    }

    const payload: TaskExecutionRequest = {
      companySlug: companySlug || "venture",
      companyName: companyName || "Autonomous Venture",
      taskId,
      title,
      description: description || "",
      category,
      urgency,
      costCredits: costCredits || 1,
    };

    const result = await executeWayfinderTask(payload);

    // Track inference cost telemetry across tiers
    const costUsage = tokenCostTracker.recordUsage({
      modelOrTier: "tier1_webgpu",
      promptTokens: 420,
      completionTokens: 180,
      twinId: "operations_twin",
      taskId: taskId,
    });

    res.json({
      success: true,
      data: {
        ...result,
        costTelemetry: costUsage,
      },
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to execute Wayfinder task");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/twin/tasks/batch-run
 * Execute multiple queued tasks in sequence (Auto Mode / Nightshift cycle)
 */
router.post("/v1/twin/tasks/batch-run", async (req: Request, res: Response) => {
  try {
    const { companySlug, companyName, tasks, maxTasks = 3 } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      res.status(400).json({ success: false, error: "tasks array is required" });
      return;
    }

    const toRun = tasks.slice(0, maxTasks);
    const results = [];

    for (const t of toRun) {
      const execResult = await executeWayfinderTask({
        companySlug: companySlug || "venture",
        companyName: companyName || "Autonomous Venture",
        taskId: t.id,
        title: t.title,
        description: t.description || "",
        category: t.category,
        urgency: t.urgency,
        costCredits: t.costCredits || 1,
      });
      results.push(execResult);
    }

    const totalCredits = results.reduce((acc, r) => acc + r.creditsDeducted, 0);

    res.json({
      success: true,
      data: {
        completedCount: results.length,
        totalCreditsDeducted: totalCredits,
        executions: results,
      },
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to batch execute Wayfinder tasks");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/twin/cycle/ingest
 * Ingest inbound webhook signal (WhatsApp, bKash, Courier, CRM) and run 5-stage Twin cycle
 */
router.post("/v1/twin/cycle/ingest", async (req: Request, res: Response) => {
  try {
    const { source, payload, userId, companySlug } = req.body;

    if (!source || !payload) {
      res.status(400).json({ success: false, error: "source and payload are required" });
      return;
    }

    const result = await TwinOrchestrator.getInstance().processCycle({
      source,
      payload,
      userId: userId || (req as any).user?.id || "usr_anonymous",
      companySlug: companySlug || "venture",
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to process Twin operational cycle");
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTO MODE LIFECYCLE (Away / Overnight Execution for OPC)
// ─────────────────────────────────────────────────────────────────────────────

interface AutoModeSession {
  companySlug: string;
  companyName: string;
  userId: string;
  active: boolean;
  startedAt: string;
  durationHours: number;
  expiresAt: string;
  tasksCompleted: number;
  creditsDeducted: number;
  lastBriefingId?: string;
}

const activeAutoModeSessions = new Map<string, AutoModeSession>();

/**
 * POST /api/v1/twin/auto-mode/start
 * Activate Auto Mode: executes queued tasks, triggers 5-stage Twin cycle,
 * and compiles an Executive Away / Morning Briefing.
 */
router.post(["/v1/twin/auto-mode/start", "/api/v1/twin/auto-mode/start"], async (req: Request, res: Response) => {
  try {
    const {
      hours = 2,
      companySlug = "venture",
      companyName = "Autonomous Venture",
      userId = "usr_default",
      tasks = [],
    } = req.body;

    const startedAt = new Date().toISOString();
    const durationHours = Math.min(Math.max(Number(hours) || 2, 1), 24);
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    // 1. Execute queued tasks (up to 3 in initial burst)
    const toExecute = Array.isArray(tasks) ? tasks.slice(0, 3) : [];
    const executedTasks = [];

    for (const t of toExecute) {
      try {
        const taskResult = await executeWayfinderTask({
          companySlug,
          companyName,
          taskId: t.id || `task_${Date.now()}`,
          title: t.title || "Autonomous Maintenance",
          description: t.description || "",
          category: t.category || "Ops",
          urgency: t.urgency || "P1",
          costCredits: t.costCredits || 1,
        });
        executedTasks.push(taskResult);
      } catch (e: any) {
        logger.warn({ error: e.message, taskId: t.id }, "Auto Mode task failed safely");
      }
    }

    // 2. Trigger Twin 5-Stage Operational Cycle (Observe -> Understand -> Decide -> Execute -> Learn)
    const twinCycle = await TwinOrchestrator.getInstance().processCycle({
      source: "manual_intent",
      payload: {
        intent: "founder_away_auto_mode",
        message: `Founder activated Auto Mode for ${durationHours} hours. Maintain autonomous company operations.`,
        companySlug,
      },
      userId,
      companySlug,
    });

    // 3. Trigger 4-Skill Nightshift Swarm to compile Executive Away Briefing
    const digest = await nightshiftEngine.runAutonomousCycle({
      userId,
      projectName: companyName,
    });

    const totalCreditsDeducted = executedTasks.reduce((acc, t) => acc + t.creditsDeducted, 0) + 1;

    const session: AutoModeSession = {
      companySlug,
      companyName,
      userId,
      active: true,
      startedAt,
      durationHours,
      expiresAt,
      tasksCompleted: executedTasks.length,
      creditsDeducted: totalCreditsDeducted,
      lastBriefingId: digest.id,
    };

    activeAutoModeSessions.set(companySlug, session);

    logger.info({ companySlug, durationHours, tasksShipped: executedTasks.length }, "Auto Mode engaged successfully");

    res.json({
      success: true,
      data: {
        session,
        executedTasks,
        twinCycle,
        digest,
        message: `⚡ Auto Mode activated for ${durationHours} hours. ${executedTasks.length} queued tasks executed autonomously, 5-stage Twin cycle initialized, and Executive Briefing compiled.`,
      },
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to start Auto Mode");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/twin/auto-mode/status
 * Get the current Auto Mode status for a company
 */
router.get(["/v1/twin/auto-mode/status", "/api/v1/twin/auto-mode/status"], (req: Request, res: Response) => {
  const companySlug = (req.query.companySlug as string) || "venture";
  const session = activeAutoModeSessions.get(companySlug);

  if (!session || !session.active) {
    res.json({
      success: true,
      data: { active: false, companySlug },
    });
    return;
  }

  const remainingSeconds = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
  const isExpired = remainingSeconds <= 0;

  if (isExpired) {
    session.active = false;
  }

  res.json({
    success: true,
    data: {
      ...session,
      remainingSeconds,
      isExpired,
    },
  });
});

/**
 * POST /api/v1/twin/auto-mode/stop
 * Disengage Auto Mode
 */
router.post(["/v1/twin/auto-mode/stop", "/api/v1/twin/auto-mode/stop"], (req: Request, res: Response) => {
  const { companySlug = "venture" } = req.body || {};
  const session = activeAutoModeSessions.get(companySlug);

  if (session) {
    session.active = false;
  }

  res.json({
    success: true,
    data: {
      active: false,
      companySlug,
      message: "Auto Mode disengaged. Shothik returned to on-demand assistant mode.",
    },
  });
});

export interface SpecializedTwinCard {
  id: string;
  name: string;
  category: string;
  role: string;
  avatar: string;
  status: "idle" | "observing" | "executing" | "learning";
  currentTask?: string;
  tasksCompleted: number;
  lastAction: string;
  capabilities: string[];
}

export const CANONICAL_SPECIALIZED_TWINS: SpecializedTwinCard[] = [
  {
    id: "marketing_twin",
    name: "Marketing Twin",
    category: "Marketing",
    role: "Campaign Optimization & Audience Targeting",
    avatar: "📈",
    status: "observing",
    currentTask: "Analyzing competitor landing page conversions",
    tasksCompleted: 42,
    lastAction: "Generated 3 ad copy variants for Meta & Google Ads",
    capabilities: ["Campaigns", "Ad Copy", "Audience Targeting", "Bangla Copywriting"],
  },
  {
    id: "sales_twin",
    name: "Sales Twin",
    category: "Sales",
    role: "Lead Qualification & Deal Closing",
    avatar: "🎯",
    status: "idle",
    currentTask: "Listening for high-intent B2B inquiries",
    tasksCompleted: 38,
    lastAction: "Qualified CTO lead from Dhaka Fintech and dispatched proposal",
    capabilities: ["Lead Qualification", "Deal Closing", "Custom Quotations", "Proposal Generation"],
  },
  {
    id: "customer_support_twin",
    name: "Customer Support Twin",
    category: "Customer Support",
    role: "24/7 Dialect-Aware Inquiries & Ticket Resolution",
    avatar: "💬",
    status: "executing",
    currentTask: "Auto-resolving customer WhatsApp queries in Sylheti & Dhakaiya",
    tasksCompleted: 119,
    lastAction: "Resolved courier delay ticket via Pathao API tracking webhook",
    capabilities: ["WhatsApp Support", "Dialect Adaptation", "Ticket Resolution", "F-Commerce FAQ"],
  },
  {
    id: "crm_twin",
    name: "CRM Twin",
    category: "CRM",
    role: "Contact Lifecycle & Pipeline Management",
    avatar: "📇",
    status: "idle",
    currentTask: "Tracking pipeline velocity",
    tasksCompleted: 56,
    lastAction: "Updated 8 enterprise accounts to 'Contract Sent' stage",
    capabilities: ["Pipeline Tracking", "Contact Enrichment", "Lifecycle Stage", "Churn Prevention"],
  },
  {
    id: "finance_twin",
    name: "Finance & Cashflow Twin",
    category: "Finance & Cashflow",
    role: "bKash/Nagad Reconciliation & Runway Modeling",
    avatar: "💰",
    status: "learning",
    currentTask: "Reconciling 1-Tap bKash TrxIDs against bank settlement report",
    tasksCompleted: 87,
    lastAction: "Reconciled ৳45,200 BDT daily receipts with 0 discrepancies",
    capabilities: ["MFS Settlement", "Cashflow Forecasting", "Disbursement Audits", "Invoice Automation"],
  },
  {
    id: "operations_twin",
    name: "Operations & Logistics Twin",
    category: "Operations & Logistics",
    role: "Steadfast/Pathao Courier Consignments & Inventory",
    avatar: "🚚",
    status: "executing",
    currentTask: "Syncing Steadfast webhook dispatch for pending Nilkhet books",
    tasksCompleted: 74,
    lastAction: "Booked 14 parcels with Steadfast courier API",
    capabilities: ["Courier Booking", "Consignment Tracking", "Inventory Alerts", "POD Print Orders"],
  },
  {
    id: "content_twin",
    name: "Content & Social Twin",
    category: "Content & Social",
    role: "Cross-Platform Social Distribution & Viral Reels",
    avatar: "📱",
    status: "observing",
    currentTask: "Monitoring trending Bangladesh tech topics on X and LinkedIn",
    tasksCompleted: 93,
    lastAction: "Drafted 5-tweet announcement thread on OPC autonomous execution",
    capabilities: ["X Threads", "LinkedIn Posts", "Reel Scripts", "Repurposing Engine"],
  },
  {
    id: "analytics_twin",
    name: "Analytics & Reporting Twin",
    category: "Analytics & Reporting",
    role: "Morning CEO Digests & Telemetry Health Scoring",
    avatar: "📊",
    status: "learning",
    currentTask: "Synthesizing 2:00 AM Nightshift Swarm metrics",
    tasksCompleted: 65,
    lastAction: "Compiled Executive Briefing: Health Score 98/100",
    capabilities: ["Health Scoring", "Daily Briefings", "Conversion Metrics", "Anomaly Detection"],
  },
  {
    id: "administration_twin",
    name: "Administration Twin",
    category: "Administration",
    role: "Domain DNS, Container Uptime & Audit Logs",
    avatar: "📋",
    status: "idle",
    currentTask: "Monitoring Dokploy VPS container memory headroom",
    tasksCompleted: 31,
    lastAction: "Verified Cloudflare SSL cert renewal for custom domains",
    capabilities: ["Dokploy VPS", "DNS Records", "Audit Export", "Security Scanning"],
  },
  {
    id: "developer_twin",
    name: "Developer Twin",
    category: "Engineering & DevOps",
    role: "Autonomous Code Generation, CI/CD Pipelines & Repository Management",
    avatar: "💻",
    status: "executing",
    currentTask: "Scaffolding new microservice and auditing dependency vulnerabilities",
    tasksCompleted: 53,
    lastAction: "Generated patch for bKash webhook race condition and triggered CI build",
    capabilities: ["Code Gen", "Git Ops", "CI/CD", "Dep Audit", "PR Review", "Scaffold"],
  },
];

/**
 * GET /api/v1/twin/specialized-twins
 * Return all 9 Specialized Twins with dynamic operational status
 */
router.get(["/v1/twin/specialized-twins", "/api/v1/twin/specialized-twins"], (req: Request, res: Response) => {
  const companySlug = (req.query.companySlug as string) || "venture";
  res.json({
    success: true,
    data: CANONICAL_SPECIALIZED_TWINS.map((t) => ({
      ...t,
      companySlug,
    })),
  });
});

/**
 * POST /api/v1/twin/specialized-twins/dispatch
 * Dispatch an autonomous execution targeted to a specific Specialized Twin
 */
router.post(
  ["/v1/twin/specialized-twins/dispatch", "/api/v1/twin/specialized-twins/dispatch"],
  async (req: Request, res: Response) => {
    try {
      const { twinId, companySlug = "venture", taskTitle, customDirective } = req.body;
      const targetTwin = CANONICAL_SPECIALIZED_TWINS.find((t) => t.id === twinId);

      if (!targetTwin) {
        res.status(404).json({ success: false, error: `Specialized Twin "${twinId}" not found in roster.` });
        return;
      }

      const orchestrator = TwinOrchestrator.getInstance();
      const cycleResult = await orchestrator.processCycle({
        source: "manual_intent",
        userId: "usr_founder",
        companySlug,
        payload: {
          twinId,
          taskTitle: taskTitle || targetTwin.currentTask,
          customDirective,
        },
      });

      const executionLog = `⚡ [${targetTwin.name}] Dispatched autonomously: "${taskTitle || targetTwin.currentTask}". ${cycleResult.twinOutput}`;

      // Record telemetry in token cost engine
      const costMetrics = tokenCostTracker.recordUsage({
        modelOrTier: "tier1_webgpu",
        promptTokens: 380,
        completionTokens: 190,
        twinId,
        taskId: taskTitle || targetTwin.currentTask,
      });

      res.json({
        success: true,
        data: {
          twinId,
          twinName: targetTwin.name,
          actionDispatched: taskTitle || targetTwin.currentTask,
          executionLog,
          cycleResult,
          costTelemetry: costMetrics,
          status: "completed",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      logger.error({ err }, "Failed to dispatch Specialized Twin");
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/v1/twin/telemetry/cost
 * Returns real-time token tracking, financial expenditure, and local WebGPU savings
 */
router.get(["/v1/twin/telemetry/cost", "/api/v1/twin/telemetry/cost"], (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: tokenCostTracker.getSummary(),
  });
});

/**
 * POST /api/v1/twin/telemetry/cost/record
 * Ingests external/client token usage record into the cost ledger
 */
router.post(
  ["/v1/twin/telemetry/cost/record", "/api/v1/twin/telemetry/cost/record"],
  (req: Request, res: Response) => {
    const { modelOrTier = "tier1_webgpu", promptTokens = 0, completionTokens = 0, twinId, taskId } = req.body || {};
    const recorded = tokenCostTracker.recordUsage({
      modelOrTier,
      promptTokens: Number(promptTokens) || 0,
      completionTokens: Number(completionTokens) || 0,
      twinId,
      taskId,
    });
    res.json({
      success: true,
      data: {
        recorded,
        summary: tokenCostTracker.getSummary(),
      },
    });
  }
);

/**
 * POST /api/v1/twin/telemetry/cost/reset
 * Resets token cost telemetry counters
 */
router.post(
  ["/v1/twin/telemetry/cost/reset", "/api/v1/twin/telemetry/cost/reset"],
  (_req: Request, res: Response) => {
    tokenCostTracker.reset();
    res.json({
      success: true,
      data: tokenCostTracker.getSummary(),
    });
  }
);

/* ------------------------------------------------------------------ */
/* Developer Twin Routes                                               */
/* ------------------------------------------------------------------ */

/**
 * GET /api/v1/twin/developer/repos
 * List managed OPC venture repositories with health scores
 */
router.get(
  ["/v1/twin/developer/repos", "/api/v1/twin/developer/repos"],
  (req: Request, res: Response) => {
    try {
      const companySlug = (req.query.companySlug as string) || undefined;
      const repos = developerTwinEngine.listRepos(companySlug);
      res.json({ success: true, data: repos });
    } catch (err: any) {
      logger.error({ err }, "Failed to list developer twin repos");
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

/**
 * POST /api/v1/twin/developer/scaffold
 * Scaffold a new project from a template
 */
router.post(
  ["/v1/twin/developer/scaffold", "/api/v1/twin/developer/scaffold"],
  (req: Request, res: Response) => {
    try {
      const { template, projectName, techStack } = req.body;
      if (!template || !projectName) {
        res.status(400).json({ success: false, error: "template and projectName are required" });
        return;
      }
      const result = developerTwinEngine.scaffoldProject({ template, projectName, techStack });
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to scaffold project");
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

/**
 * POST /api/v1/twin/developer/patch
 * Generate a code patch for a described issue
 */
router.post(
  ["/v1/twin/developer/patch", "/api/v1/twin/developer/patch"],
  (req: Request, res: Response) => {
    try {
      const { repoSlug, issueDescription, context } = req.body;
      if (!repoSlug || !issueDescription) {
        res.status(400).json({ success: false, error: "repoSlug and issueDescription are required" });
        return;
      }
      const result = developerTwinEngine.generatePatch({ repoSlug, issueDescription, context });

      // Track developer twin code synthesis token telemetry
      tokenCostTracker.recordUsage({
        modelOrTier: "tier1_webgpu",
        promptTokens: 520,
        completionTokens: 240,
        twinId: "developer_twin",
        taskId: `patch_${repoSlug}`,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to generate patch");
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

/**
 * POST /api/v1/twin/developer/build
 * Trigger a build/test pipeline for a repo
 */
router.post(
  ["/v1/twin/developer/build", "/api/v1/twin/developer/build"],
  (req: Request, res: Response) => {
    try {
      const { repoSlug } = req.body;
      if (!repoSlug) {
        res.status(400).json({ success: false, error: "repoSlug is required" });
        return;
      }
      const result = developerTwinEngine.runBuild(repoSlug);
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to run build");
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

/**
 * POST /api/v1/twin/developer/deploy
 * Request a deploy (Protected Action — requires human approval)
 */
router.post(
  ["/v1/twin/developer/deploy", "/api/v1/twin/developer/deploy"],
  (req: Request, res: Response) => {
    try {
      const { repoSlug, environment, changelog } = req.body;
      if (!repoSlug || !environment) {
        res.status(400).json({ success: false, error: "repoSlug and environment are required" });
        return;
      }
      if (environment !== "staging" && environment !== "production") {
        res.status(400).json({ success: false, error: 'environment must be "staging" or "production"' });
        return;
      }
      const result = developerTwinEngine.requestDeploy({ repoSlug, environment, changelog });
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to create deploy request");
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

/**
 * POST /api/v1/twin/developer/self-heal
 * Deeptech Autonomous Self-Healing Loop (Red-Green-Refactor) in isolated sandbox
 */
router.post(
  ["/v1/twin/developer/self-heal", "/api/v1/twin/developer/self-heal"],
  (req: Request, res: Response) => {
    try {
      const { repoSlug, failingTestOrError, maxIterations, sandboxType } = req.body;
      if (!repoSlug || !failingTestOrError) {
        res.status(400).json({ success: false, error: "repoSlug and failingTestOrError are required" });
        return;
      }
      const result = developerTwinEngine.runSelfHealingLoop({
        repoSlug,
        failingTestOrError,
        maxIterations,
        sandboxType,
      });

      // Track self-healing compute token telemetry
      tokenCostTracker.recordUsage({
        modelOrTier: sandboxType === "vast_spot_gpu" ? "tier2_cloud_fallback" : "tier1_webgpu",
        promptTokens: 850,
        completionTokens: 420,
        twinId: "developer_twin",
        taskId: `self_heal_${repoSlug}`,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to execute self-healing loop");
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

/**
 * POST /api/v1/twin/developer/blast-radius
 * Deeptech AST Blast Radius & Semantic Impact Analyzer
 */
router.post(
  ["/v1/twin/developer/blast-radius", "/api/v1/twin/developer/blast-radius"],
  (req: Request, res: Response) => {
    try {
      const { repoSlug, targetFiles, changeType } = req.body;
      if (!repoSlug) {
        res.status(400).json({ success: false, error: "repoSlug is required" });
        return;
      }
      const result = developerTwinEngine.analyzeBlastRadius({
        repoSlug,
        targetFiles,
        changeType,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to analyze blast radius");
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

/**
 * GET /api/v1/twin/developer/deeptech-metrics
 * Deeptech Autonomous Engine Performance & Telemetry
 */
router.get(
  ["/v1/twin/developer/deeptech-metrics", "/api/v1/twin/developer/deeptech-metrics"],
  (_req: Request, res: Response) => {
    try {
      const metrics = developerTwinEngine.getDeeptechMetrics();
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      logger.error({ err }, "Failed to get deeptech metrics");
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

/**
 * GET /api/v1/twin/developer/deploys
 * List pending and historical deploy requests
 */
router.get(
  ["/v1/twin/developer/deploys", "/api/v1/twin/developer/deploys"],
  (req: Request, res: Response) => {
    try {
      const repoSlug = (req.query.repoSlug as string) || undefined;
      const deploys = developerTwinEngine.listDeployRequests(repoSlug);
      res.json({ success: true, data: deploys });
    } catch (err: any) {
      logger.error({ err }, "Failed to list deploy requests");
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

/**
 * POST /api/v1/twin/developer/deploys/:approvalId/review
 * Submit human review (approval or rejection) for a protected deploy request
 */
router.post(
  ["/v1/twin/developer/deploys/:approvalId/review", "/api/v1/twin/developer/deploys/:approvalId/review"],
  (req: Request, res: Response) => {
    try {
      const approvalId = String(req.params.approvalId || "");
      const { action, reviewerComment } = req.body;
      if (!approvalId || !action) {
        res.status(400).json({ success: false, error: "approvalId and action are required" });
        return;
      }
      if (action !== "approve" && action !== "reject") {
        res.status(400).json({ success: false, error: 'action must be "approve" or "reject"' });
        return;
      }
      const result = developerTwinEngine.reviewDeploy({
        approvalId,
        action,
        reviewerComment,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to process deploy review");
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

export default router;
