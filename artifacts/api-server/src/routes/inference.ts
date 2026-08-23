import { Router, Request, Response } from "express";
import { inferenceGateway } from "../lib/inference-gateway";
import { logger } from "../lib/logger";

export const inferenceRouter = Router();

/**
 * GET /api/v1/inference/status
 * Get the current health and active tier of FreeToken, Ollama, DeepSeek Cloud, and Memori.
 */
inferenceRouter.get("/v1/inference/status", async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = await inferenceGateway.checkStatus();
    res.json({
      success: true,
      status,
    });
  } catch (err: any) {
    logger.error(`[inference-router] Failed to query status: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/inference/chat
 * Multi-tier streaming / non-streaming chat with automatic Memori context injection and TTFT telemetry.
 */
inferenceRouter.post("/v1/inference/chat", async (req: Request, res: Response): Promise<void> => {
  const { messages, model, temperature, stream = true, userId, enableMemoryRecall = true } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({
      success: false,
      error: "Missing or invalid 'messages' array in request body",
    });
    return;
  }

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      for await (const chunk of inferenceGateway.streamChat({
        messages,
        model,
        temperature,
        userId,
        enableMemoryRecall,
      })) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      logger.error(`[inference-router] Streaming failed: ${err.message}`);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  } else {
    try {
      let fullContent = "";
      let reasoningContent = "";
      let activeProvider = "hermes_synthetic";
      let ttftMs = 0;

      for await (const chunk of inferenceGateway.streamChat({
        messages,
        model,
        temperature,
        userId,
        enableMemoryRecall,
      })) {
        if (chunk.content) fullContent += chunk.content;
        if (chunk.reasoning_content) reasoningContent += chunk.reasoning_content;
        if (chunk.provider) activeProvider = chunk.provider;
        if (chunk.ttftMs && !ttftMs) ttftMs = chunk.ttftMs;
      }

      res.json({
        success: true,
        message: {
          role: "assistant",
          content: fullContent.trim(),
          reasoning_content: reasoningContent.trim() || undefined,
        },
        meta: {
          provider: activeProvider,
          ttftMs,
        },
      });
    } catch (err: any) {
      logger.error(`[inference-router] Execution failed: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  }
});
