import { Router, Request, Response } from "express";
import { openDataLoader } from "../lib/document-parsing/opendataloader-bridge";
import { ragEngine } from "../lib/rag-engine";
import { logger } from "../lib/logger";

const router = Router();

/**
 * POST /api/v1/files/upload
 * Uploads a document (PDF, TXT, CSV, MD) and automatically parses and indexes it for Vector RAG
 */
router.post("/v1/files/upload", async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename = "document.pdf", fileBase64, rawContent, userId = "usr_default", metadata } = req.body;

    if (!fileBase64 && !rawContent) {
      res.status(400).json({
        success: false,
        error: "Missing document payload: fileBase64 or rawContent is required",
      });
      return;
    }

    let parsedResult;

    if (fileBase64) {
      const buffer = Buffer.from(fileBase64, "base64");
      if (filename.toLowerCase().endsWith(".pdf")) {
        parsedResult = await openDataLoader.parsePdf(buffer, filename);
      } else {
        parsedResult = openDataLoader.parseTextDocument(buffer.toString("utf8"), filename);
      }
    } else {
      parsedResult = openDataLoader.parseTextDocument(rawContent, filename);
    }

    // Ingest into Vector RAG engine
    const ragResult = await ragEngine.ingestDocument({
      userId,
      title: parsedResult.title,
      content: parsedResult.markdown,
      sourceType: filename.toLowerCase().endsWith(".pdf") ? "pdf" : "text",
      metadata: {
        pageCount: parsedResult.pageCount,
        sectionCount: parsedResult.sections.length,
        ...metadata,
      },
    });

    res.status(201).json({
      success: true,
      documentId: ragResult.document.id,
      title: parsedResult.title,
      pageCount: parsedResult.pageCount,
      chunksCreated: ragResult.chunksCreated,
      totalLength: parsedResult.totalLength,
      previewMarkdown: parsedResult.markdown.slice(0, 500),
      message: `Successfully processed and indexed ${parsedResult.title} via OpenDataLoader into Vector RAG.`,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[files-route] Upload failed");
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/files
 * Lists all indexed files for a given user
 */
router.get("/v1/files", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.query.userId as string) || (req.headers["x-user-id"] as string) || "usr_default";
    const allDocs = await ragEngine.listDocuments(userId);

    res.status(200).json({
      success: true,
      userId,
      count: allDocs.length,
      documents: allDocs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/v1/files/:docId
 * Deletes a document from the RAG store
 */
router.delete("/v1/files/:docId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string) || "usr_default";
    const { docId } = req.params;
    await ragEngine.deleteDocument(userId, docId as string);
    res.status(200).json({
      success: true,
      docId,
      message: `Document ${docId} deleted from Knowledge Vault.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
