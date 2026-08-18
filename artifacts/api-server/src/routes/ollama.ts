import { Router, type IRouter, type Request, type Response } from "express";
import { OllamaService } from "../lib/ollama-service";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// GET /api/ollama/status
router.get("/ollama/status", async (_req: Request, res: Response) => {
  try {
    const status = await OllamaService.checkStatus();
    res.json(status);
  } catch (err: any) {
    logger.error({ err: err?.message }, "[ollama-route] Failed to check status");
    res.status(500).json({ error: "Failed to query Ollama status", details: err?.message });
  }
});

// GET /api/ollama/models
router.get("/ollama/models", async (_req: Request, res: Response) => {
  try {
    const status = await OllamaService.checkStatus();
    res.json({ models: status.models, activeModel: status.activeModel, mode: status.mode });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to list models", details: err?.message });
  }
});

// POST /api/ollama/chat
router.post("/ollama/chat", async (req: Request, res: Response) => {
  const { messages, model, temperature, stream = true } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid 'messages' array in request body" });
  }

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      for await (const chunk of OllamaService.streamChat({ messages, model, temperature })) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      logger.error({ err: err?.message }, "[ollama-route] Chat stream error");
      res.write(`data: ${JSON.stringify({ error: err?.message })}\n\n`);
      res.end();
    }
  } else {
    try {
      let fullContent = "";
      for await (const chunk of OllamaService.streamChat({ messages, model, temperature })) {
        fullContent += chunk.content;
      }
      res.json({ message: { role: "assistant", content: fullContent } });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  }
});

export default router;
