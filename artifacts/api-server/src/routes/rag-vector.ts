import { Router, type Request, type Response } from "express";
import { ragVectorIndexer } from "../../../shothik/src/lib/infrastructure/rag-vector-indexer";

const router = Router();

/**
 * POST /api/v1/rag/vector/index
 * Index document into RAG vector store
 */
router.post("/v1/rag/vector/index", (req: Request, res: Response) => {
  const { documentId = "doc_01", content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, error: "content is required" });
  }

  const chunks = ragVectorIndexer.indexDocument(documentId, content);

  return res.status(200).json({
    success: true,
    documentId,
    indexedChunksCount: chunks.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/rag/vector/search
 * Search vector store using Cosine similarity
 */
router.post("/v1/rag/vector/search", (req: Request, res: Response) => {
  const { topK = 3 } = req.body;

  const results = ragVectorIndexer.searchSimilar([0.25, 0.5, 0.75, 0.1], topK);

  return res.status(200).json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  });
});

export default router;
