import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import { executeWayfinderTask, type TaskExecutionRequest } from "../lib/twin/task-runner";
import { TwinOrchestrator } from "../lib/twin/twin-orchestrator.js";
import { nightshiftEngine } from "../lib/nightshift-engine.js";

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

    res.json({
      success: true,
      data: result,
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

export default router;
