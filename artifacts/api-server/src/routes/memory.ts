import { Router, Request, Response } from "express";
import { semanticMemory } from "../lib/semantic-memory";
import { logger } from "../lib/logger";
import { resolveUserId } from "../middleware/auth.js";

export const memoryRouter = Router();

/**
 * POST /api/v1/memory/memorize & /api/memory/memorize
 * Store a new semantic memory fact or preference for a user.
 */
const handleMemorize = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId: bodyUserId, content, category, metadata } = req.body;
    const userId = resolveUserId(req, typeof bodyUserId === "string" ? bodyUserId : "default");

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
};

memoryRouter.post("/memory/memorize", handleMemorize);
memoryRouter.post("/v1/memory/memorize", handleMemorize);

const handleRecall = async (req: Request, res: Response): Promise<void> => {
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
};

memoryRouter.post("/memory/recall", handleRecall);
memoryRouter.post("/v1/memory/recall", handleRecall);

const handleListMemories = async (req: Request, res: Response): Promise<void> => {
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
};

const handleSearchMemories = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const userId = resolveUserId(req, typeof req.query.userId === "string" ? req.query.userId : "default");
    if (!q) {
      const all = await semanticMemory.listMemories(userId);
      res.json(all.map((m) => ({ id: m.id, content: m.content, category: m.category, createdAt: m.createdAt })));
      return;
    }
    const recallResult = await semanticMemory.recall(userId, q, 10);
    res.json(recallResult.memories.map((m) => ({ id: m.id, content: m.content, category: m.category, createdAt: m.createdAt })));
  } catch (err: any) {
    logger.error(`[memory-router] Failed to search memory: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

memoryRouter.get("/memory/search", handleSearchMemories);
memoryRouter.get("/v1/memory/search", handleSearchMemories);

memoryRouter.get("/memory/:userId", handleListMemories);
memoryRouter.get("/v1/memory/:userId", handleListMemories);

const handleDeleteMemory = async (req: Request, res: Response): Promise<void> => {
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
};

memoryRouter.delete("/memory/:userId/:memoryId", handleDeleteMemory);
memoryRouter.delete("/v1/memory/:userId/:memoryId", handleDeleteMemory);

const handleClearMemories = async (req: Request, res: Response): Promise<void> => {
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
};

memoryRouter.delete("/memory/:userId", handleClearMemories);
memoryRouter.delete("/v1/memory/:userId", handleClearMemories);
