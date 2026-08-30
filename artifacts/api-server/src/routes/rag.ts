import { Router, Request, Response } from "express";
import { ragEngine } from "../lib/rag-engine.js";
import { logger } from "../lib/logger.js";

export const ragRouter = Router();

/**
 * POST /api/v1/rag/ingest
 * Ingests a raw text, markdown, or document payload into vectorized chunks.
 */
ragRouter.post("/v1/rag/ingest", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, userId = "usr_default", sourceType = "text", sourceUrl, metadata } = req.body;

    if (!title || typeof title !== "string") {
      res.status(400).json({ success: false, error: "Missing or invalid 'title' (string required)" });
      return;
    }

    if (!content || typeof content !== "string") {
      res.status(400).json({ success: false, error: "Missing or invalid 'content' (string required)" });
      return;
    }

    const result = await ragEngine.ingestDocument({
      userId,
      title,
      content,
      sourceType,
      sourceUrl,
      metadata,
    });

    res.status(201).json({
      success: true,
      document: result.document,
      chunksCreated: result.chunksCreated,
    });
  } catch (err: any) {
    logger.error(`[rag-route] Ingest error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/rag/query
 * Performs hybrid vector + keyword semantic search across indexed document chunks.
 */
ragRouter.post("/v1/rag/query", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, userId = "usr_default", topK = 3 } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({ success: false, error: "Missing or invalid 'query' (string required)" });
      return;
    }

    const results = await ragEngine.queryKnowledge(userId, query, Number(topK));

    res.json({
      success: true,
      query,
      matchCount: results.length,
      results,
    });
  } catch (err: any) {
    logger.error(`[rag-route] Query error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/rag/rerank
 * Performs cross-encoder reranking across passages using NVIDIA NeMo Reranker.
 */
ragRouter.post("/v1/rag/rerank", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, passages } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({ success: false, error: "Missing or invalid 'query' (string required)" });
      return;
    }

    if (!Array.isArray(passages)) {
      res.status(400).json({ success: false, error: "Missing or invalid 'passages' (array of strings or search results required)" });
      return;
    }

    const formattedPassages = passages.map((p, idx) => ({
      chunkId: typeof p === "string" ? `temp_${idx}` : p.chunkId || `temp_${idx}`,
      docId: typeof p === "string" ? "temp_doc" : p.docId || "temp_doc",
      title: typeof p === "string" ? `Passage ${idx + 1}` : p.title || `Passage ${idx + 1}`,
      content: typeof p === "string" ? p : p.content || "",
      score: typeof p === "string" ? 1.0 : p.score || 1.0,
      metadata: typeof p === "object" ? p.metadata : undefined,
    }));

    const reranked = await ragEngine.rerankResults(query, formattedPassages);

    res.json({
      success: true,
      query,
      count: reranked.length,
      results: reranked,
    });
  } catch (err: any) {
    logger.error(`[rag-route] Rerank error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/rag/documents
 * Lists all indexed documents for a given user.
 */
ragRouter.get("/v1/rag/documents", (req: Request, res: Response): void => {
  try {
    const userId = (req.query.userId as string) || "usr_default";
    const documents = ragEngine.listDocuments(userId);

    res.json({
      success: true,
      userId,
      count: documents.length,
      documents,
    });
  } catch (err: any) {
    logger.error(`[rag-route] List docs error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/rag/documents/:docId
 * Deletes an indexed document and its chunks.
 */
ragRouter.delete("/v1/rag/documents/:docId", async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = String(req.params.docId);
    const userId = typeof req.query.userId === "string" ? req.query.userId : "usr_default";

    const deleted = await ragEngine.deleteDocument(userId, docId);
    if (!deleted) {
      res.status(404).json({ success: false, error: `Document ${docId} not found` });
      return;
    }

    res.json({
      success: true,
      deletedDocId: docId,
      message: "Document and associated vector chunks deleted successfully",
    });
  } catch (err: any) {
    logger.error(`[rag-route] Delete error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});
