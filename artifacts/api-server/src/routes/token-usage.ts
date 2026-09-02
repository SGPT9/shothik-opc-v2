import { Router, type Request, type Response } from "express";
import { tokenUsageTracker } from "../../../shothik/src/lib/infrastructure/token-usage-tracker";

const router = Router();

/**
 * POST /api/v1/analytics/token-usage/record
 * Calculate and record AI model token usage and cost
 */
router.post("/v1/analytics/token-usage/record", (req: Request, res: Response) => {
  const { userId = "usr_01", modelName = "deepseek-r1", promptTokens = 1000, completionTokens = 500 } = req.body;

  const report = tokenUsageTracker.recordUsage({
    userId,
    modelName,
    promptTokens: Number(promptTokens),
    completionTokens: Number(completionTokens),
  });

  return res.status(200).json({
    success: true,
    report,
  });
});

export default router;
