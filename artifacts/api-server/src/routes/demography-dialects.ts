import { Router, type IRouter, type Request, type Response } from "express";
import { VernacularDialectEngine, type RegionalDialect } from "../lib/vernacular-dialects.js";

const router: IRouter = Router();
const engine = VernacularDialectEngine.getInstance();

/**
 * POST /api/v1/demography/dialects/detect
 * Detects regional dialect and normalizes to standard Bangla for RAG/LLM ingestion
 */
router.post("/demography/dialects/detect", (req: Request, res: Response) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing required 'text' string in payload." });
  }

  const result = engine.detectDialect(text);
  return res.json({
    success: true,
    ...result,
  });
});

/**
 * POST /api/v1/demography/dialects/synthesize
 * Synthesizes standard text into target regional dialect
 */
router.post("/demography/dialects/synthesize", (req: Request, res: Response) => {
  const { text, targetDialect = "dhakaiya" } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing required 'text' string in payload." });
  }

  const result = engine.synthesizeDialect(text, targetDialect as RegionalDialect);
  return res.json({
    success: true,
    ...result,
  });
});

export default router;
