import { Router, type Request, type Response } from "express";
import { unifiedVoiceOrbService } from "../../../shothik/src/lib/voice/unified-voice-orb-service";

const router = Router();

/**
 * POST /api/v1/voice/orb/vad-event
 * Process Voice Activity Detection (VAD) raw amplitude frame
 */
router.post("/v1/voice/orb/vad-event", (req: Request, res: Response) => {
  const { rawAmplitude = 0.5 } = req.body;
  const audioData = unifiedVoiceOrbService.processVadFrame(Number(rawAmplitude));

  return res.status(200).json({
    success: true,
    audioData,
  });
});

/**
 * POST /api/v1/voice/orb/transcript
 * Process voice transcript and update orb state
 */
router.post("/v1/voice/orb/transcript", (req: Request, res: Response) => {
  const { text = "হ্যালো শঠিক" } = req.body;
  const result = unifiedVoiceOrbService.processTranscript(text);

  return res.status(200).json({
    success: true,
    result,
  });
});

export default router;
