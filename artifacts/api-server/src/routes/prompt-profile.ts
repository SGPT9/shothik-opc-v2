import { Router, type Request, type Response } from "express";
import { promptProfileManager } from "../../../shothik/src/lib/ai/prompt-profile-manager";

const router = Router();

/**
 * GET /api/v1/prompt-profiles
 * List all available intent-aware system prompt profiles
 */
router.get("/v1/prompt-profiles", (_req: Request, res: Response) => {
  const profiles = promptProfileManager.listProfiles();
  return res.status(200).json({
    success: true,
    profiles,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/prompt-profiles/inject
 * Resolve and inject system prompt profile for user query
 */
router.post("/v1/prompt-profiles/inject", (req: Request, res: Response) => {
  const { userPrompt = "" } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ success: false, error: "userPrompt is required" });
  }

  const profile = promptProfileManager.resolvePromptProfile(userPrompt);

  return res.status(200).json({
    success: true,
    userPrompt,
    resolvedProfile: profile,
    timestamp: new Date().toISOString(),
  });
});

export default router;
