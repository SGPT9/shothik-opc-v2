import { Router, Request, Response } from "express";
import { wasmVectorIndexEngine } from "../lib/wasm-vector-index.js";
import { logger } from "../lib/logger.js";

export const wasmVectorIndicesRouter = Router();

/**
 * GET /api/v1/crdt/vectors/status
 * Returns WebAssembly Linear Memory vector index capacity and CRDT cluster clocks
 */
wasmVectorIndicesRouter.get("/v1/crdt/vectors/status", (_req: Request, res: Response) => {
  try {
    const status = wasmVectorIndexEngine.getStatus();
    return res.status(200).json({
      success: true,
      status,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[wasmVectorIndicesRouter] Failed to retrieve status");
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/crdt/vectors/entries
 * Lists all indexed vector records and metadata offsets
 */
wasmVectorIndicesRouter.get("/v1/crdt/vectors/entries", (_req: Request, res: Response) => {
  try {
    const entries = wasmVectorIndexEngine.getEntries();
    return res.status(200).json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[wasmVectorIndicesRouter] Failed to retrieve entries");
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/crdt/vectors/insert
 * Inserts a document vector directly into WebAssembly Linear Memory with CRDT clock advance
 */
wasmVectorIndicesRouter.post("/v1/crdt/vectors/insert", (req: Request, res: Response) => {
  try {
    const { id, documentId, textExcerpt, tags, vector, peerOrigin } = req.body || {};

    if (!textExcerpt || typeof textExcerpt !== "string") {
      return res.status(400).json({
        success: false,
        error: "Field 'textExcerpt' is required and must be a string",
      });
    }

    const vectorId = id || `vec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const docId = documentId || `doc_${Date.now()}`;

    const result = wasmVectorIndexEngine.insertVector(
      vectorId,
      docId,
      textExcerpt,
      Array.isArray(tags) ? tags : [],
      Array.isArray(vector) ? vector : undefined,
      typeof peerOrigin === "string" ? peerOrigin : undefined
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[wasmVectorIndicesRouter] Failed to insert vector");
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/crdt/vectors/query
 * Executes zero-copy nearest-neighbor search over WebAssembly linear memory
 */
wasmVectorIndicesRouter.post("/v1/crdt/vectors/query", (req: Request, res: Response) => {
  try {
    const { query, topK, metric } = req.body || {};

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query text or query vector array is required",
      });
    }

    const searchMetric = metric === "EUCLIDEAN_L2" ? "EUCLIDEAN_L2" : "COSINE";
    const k = typeof topK === "number" && topK > 0 ? Math.min(topK, 50) : 5;

    const searchResult = wasmVectorIndexEngine.searchNearest(query, k, searchMetric);

    return res.status(200).json({
      success: true,
      ...searchResult,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[wasmVectorIndicesRouter] Failed to execute vector query");
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/crdt/vectors/delta
 * Exports or merges autonomous CRDT vector state delta
 */
wasmVectorIndicesRouter.post("/v1/crdt/vectors/delta", (req: Request, res: Response) => {
  try {
    const { action, delta } = req.body || {};

    if (action === "merge" && delta) {
      const mergeResult = wasmVectorIndexEngine.mergeCrdtDelta(delta);
      return res.status(200).json({
        success: true,
        action: "merge",
        ...mergeResult,
      });
    }

    // Default action: export delta
    const exportedDelta = wasmVectorIndexEngine.exportCrdtDelta();
    return res.status(200).json({
      success: true,
      action: "export",
      delta: exportedDelta,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[wasmVectorIndicesRouter] Failed to process CRDT delta");
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/crdt/vectors/benchmark
 * Runs simulated throughput and QPS benchmark over WASM linear memory
 */
wasmVectorIndicesRouter.post("/v1/crdt/vectors/benchmark", (req: Request, res: Response) => {
  try {
    const { sampleQueries } = req.body || {};
    const samples = typeof sampleQueries === "number" && sampleQueries > 0
      ? Math.min(sampleQueries, 1000)
      : 250;

    const bench = wasmVectorIndexEngine.benchmarkThroughput(samples);

    return res.status(200).json({
      success: true,
      benchmark: bench,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[wasmVectorIndicesRouter] Failed to execute benchmark");
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/crdt/vectors/clear
 * Resets linear memory and re-seeds default knowledge vectors
 */
wasmVectorIndicesRouter.post("/v1/crdt/vectors/clear", (_req: Request, res: Response) => {
  try {
    wasmVectorIndexEngine.clear();
    return res.status(200).json({
      success: true,
      message: "WASM linear memory vector index reset and re-seeded successfully",
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[wasmVectorIndicesRouter] Failed to clear index");
    return res.status(500).json({ success: false, error: error.message });
  }
});
