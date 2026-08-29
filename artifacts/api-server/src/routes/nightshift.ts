import { Router, Request, Response } from "express";
import { nightshiftEngine } from "../lib/nightshift-engine.js";
import { logger } from "../lib/logger.js";

const router = Router();

/**
 * POST /api/v1/nightshift/run-cycle
 * Trigger on-demand execution of the 2:00 AM nocturnal swarm cycle
 */
router.post(["/v1/nightshift/run-cycle", "/api/v1/nightshift/run-cycle"], async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId = "usr_default", projectName = "VerifiQ AI" } = req.body;
    const digest = await nightshiftEngine.runAutonomousCycle({ userId, projectName });

    res.status(200).json({
      success: true,
      cycleId: digest.id,
      date: digest.date,
      overallHealthScore: digest.overallHealthScore,
      skillsExecutedCount: digest.skillsExecuted.length,
      topActionItems: digest.topActionItems,
      digest,
      message: `2:00 AM Nightshift cycle completed in ${digest.executionDurationMs}ms.`,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[nightshift-route] Cycle failed");
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/nightshift/latest-digest
 * Retrieve the latest CEO Morning Digest
 */
router.get(["/v1/nightshift/latest-digest", "/api/v1/nightshift/latest-digest"], async (_req: Request, res: Response): Promise<void> => {
  try {
    const digest = await nightshiftEngine.getLatestDigest();
    res.status(200).json({
      success: true,
      digest,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/nightshift/status
 * Retrieve scheduler state and next run countdown
 */
router.get(["/v1/nightshift/status", "/api/v1/nightshift/status"], (_req: Request, res: Response): void => {
  const status = nightshiftEngine.getSchedulerStatus();
  res.status(200).json({
    success: true,
    status,
  });
});

/**
 * GET /api/v1/nightshift/history
 * Retrieve historical morning digests
 */
router.get(["/v1/nightshift/history", "/api/v1/nightshift/history"], (_req: Request, res: Response): void => {
  const history = nightshiftEngine.getHistory();
  res.status(200).json({
    success: true,
    count: history.length,
    history,
  });
});

export default router;
