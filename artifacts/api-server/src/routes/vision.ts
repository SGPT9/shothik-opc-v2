import { Router, Request, Response } from "express";
import { visionEngine } from "../lib/vision-engine.js";
import { dshRuntime } from "../lib/dsh-runtime.js";
import { logger } from "../lib/logger.js";

export const visionRouter = Router();

/**
 * POST /api/v1/vision/segment
 * Segments an uploaded screenshot or wireframe image into interactive UI code and bounding boxes.
 */
visionRouter.post("/v1/vision/segment", async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, imageUrl, promptHint, userId = "usr_default", sessionId } = req.body;

    if (!imageBase64 && !imageUrl) {
      res.status(400).json({ success: false, error: "Either 'imageBase64' or 'imageUrl' must be provided." });
      return;
    }

    // 1. Trace in DSH if sessionId provided
    let trackedSessionId = sessionId;
    if (!trackedSessionId) {
      const dshSession = await dshRuntime.initSession(userId, "Vision: UI Segmentation", { promptHint });
      trackedSessionId = dshSession.id;
    }

    await dshRuntime.recordEvent(trackedSessionId, "tool_call", {
      tool: "sam2_vision_segmentation",
      promptHint,
    });

    const result = await visionEngine.analyzeUI({ imageBase64, imageUrl, promptHint });

    await dshRuntime.recordEvent(trackedSessionId, "tool_result", {
      componentsFound: result.detectedComponents.length,
      durationMs: result.durationMs,
    });

    res.json({
      success: true,
      sessionId: trackedSessionId,
      result,
    });
  } catch (err: any) {
    logger.error(`[vision-route] Segmentation error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});
