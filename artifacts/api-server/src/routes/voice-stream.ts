import { Router, type Request, type Response } from "express";
import { vtuberStreamingService } from "../../../shothik/src/lib/voice/vtuber-streaming-service";

const router = Router();

/**
 * POST /api/v1/voice/synthesize
 * Synthesize audio speech and return 3D VTuber facial blendshapes
 */
router.post("/v1/voice/synthesize", (req: Request, res: Response) => {
  const { text, language = "bn", avatarPreset = "shothik_female" } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, error: "text is required" });
  }

  const frame = vtuberStreamingService.synthesizeAndStream({
    text,
    language,
    avatarPreset,
  });

  return res.status(200).json({
    success: true,
    frame,
  });
});

export default router;
