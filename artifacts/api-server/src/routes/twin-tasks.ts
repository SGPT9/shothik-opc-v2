import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import { executeWayfinderTask, type TaskExecutionRequest } from "../lib/twin/task-runner";

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

export default router;
