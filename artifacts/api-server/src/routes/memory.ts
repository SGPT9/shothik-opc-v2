import { Router, Request, Response } from "express";
import { semanticMemory } from "../lib/semantic-memory";
import { logger } from "../lib/logger";

export const memoryRouter = Router();

/**
 * POST /api/memory/memorize
 * Store a new semantic memory fact or preference for a user.
 */
memoryRouter.post("/memory/memorize", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, content, category, metadata } = req.body;

    if (!userId || typeof userId !== "string" || !content || typeof content !== "string") {
      res.status(400).json({
        success: false,
        error: "Missing required fields: 'userId' (string) and 'content' (string)",
      });
      return;
    }

    const memory = await semanticMemory.memorize(
      userId,
      content,
      category || "fact",
      metadata
    );

    res.status(201).json({
      success: true,
      memory,
    });
  } catch (err: any) {
    logger.error(`[memory-router] Failed to memorize: ${err.message}`);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to persist memory",
    });
  }
});

/**
 * POST /api/memory/recall
 * Semantically recall relevant user memories given a prompt/query.
 */
memoryRouter.post("/memory/recall", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, query, limit } = req.body;

    if (!userId || typeof userId !== "string" || !query || typeof query !== "string") {
      res.status(400).json({
        success: false,
        error: "Missing required fields: 'userId' (string) and 'query' (string)",
      });
      return;
    }

    const recallResult = await semanticMemory.recall(
      userId,
      query,
      typeof limit === "number" ? limit : 5
    );

    res.json({
      success: true,
      data: recallResult,
    });
  } catch (err: any) {
    logger.error(`[memory-router] Failed to recall memory: ${err.message}`);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to recall memory",
    });
  }
});

/**
 * GET /api/memory/:userId
 * List all memories for a user, optionally filtered by category.
 */
memoryRouter.get("/memory/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : String(req.params.userId || "");
    const category = typeof req.query.category === "string" ? req.query.category : undefined;

    if (!userId) {
      res.status(400).json({ success: false, error: "Invalid userId" });
      return;
    }

    const memories = await semanticMemory.listMemories(userId, category);
    res.json({
      success: true,
      userId,
      count: memories.length,
      memories,
    });
  } catch (err: any) {
    logger.error(`[memory-router] Failed to list memories: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/memory/:userId/:memoryId
 * Delete a specific memory entry.
 */
memoryRouter.delete("/memory/:userId/:memoryId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : String(req.params.userId || "");
    const memoryId = typeof req.params.memoryId === "string" ? req.params.memoryId : String(req.params.memoryId || "");

    if (!userId || !memoryId) {
      res.status(400).json({ success: false, error: "Invalid userId or memoryId" });
      return;
    }

    const deleted = await semanticMemory.deleteMemory(userId, memoryId);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Memory entry not found" });
      return;
    }

    res.json({
      success: true,
      message: `Memory ${memoryId} successfully deleted`,
    });
  } catch (err: any) {
    logger.error(`[memory-router] Failed to delete memory: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/memory/:userId
 * Clear all memories for a user.
 */
memoryRouter.delete("/memory/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : String(req.params.userId || "");

    if (!userId) {
      res.status(400).json({ success: false, error: "Invalid userId" });
      return;
    }

    const clearedCount = await semanticMemory.clearUserMemories(userId);
    res.json({
      success: true,
      clearedCount,
      message: `Cleared ${clearedCount} memories for user ${userId}`,
    });
  } catch (err: any) {
    logger.error(`[memory-router] Failed to clear memories: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});
