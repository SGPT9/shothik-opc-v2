import { Router, Request, Response } from "express";
import crypto from "crypto";
import { openDataLoader } from "../lib/document-parsing/opendataloader-bridge";
import { ragEngine } from "../lib/rag-engine";
import { logger } from "../lib/logger";
import { idempotencyMiddleware } from "../lib/idempotency/idempotency-service";

const router = Router();

/**
 * POST /api/v1/files/upload
 * Uploads a document (PDF, DOCX, XLSX, TXT, CSV, MD) and automatically parses and indexes it for Vector RAG.
 * Guarded by IETF Idempotency-Key.
 */
router.post("/v1/files/upload", idempotencyMiddleware, async (req: Request, res: Response): Promise<void> => {
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
    let fileHash: string;

    if (fileBase64) {
      const buffer = Buffer.from(fileBase64, "base64");
      fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
      const lower = filename.toLowerCase();

      if (lower.endsWith(".pdf")) {
        parsedResult = await openDataLoader.parsePdf(buffer, filename);
      } else if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
        try {
          const { OfficeParser } = await import("@workspace/office-engine");
          const extractedText = lower.endsWith(".docx") ? await OfficeParser.docxToText(buffer) : await OfficeParser.docToText(buffer);
          parsedResult = openDataLoader.parseTextDocument(extractedText || "", filename);
        } catch {
          parsedResult = openDataLoader.parseTextDocument(buffer.toString("utf8"), filename);
        }
      } else if (lower.endsWith(".xlsx")) {
        try {
          const { OfficeParser } = await import("@workspace/office-engine");
          const extractedText = await OfficeParser.xlsxToText(buffer);
          parsedResult = openDataLoader.parseTextDocument(extractedText || "", filename);
        } catch {
          parsedResult = openDataLoader.parseTextDocument(buffer.toString("utf8"), filename);
        }
      } else if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) {
        try {
          const { OfficeParser } = await import("@workspace/office-engine");
          const extractedText = lower.endsWith(".pptx") ? await OfficeParser.pptxToText(buffer) : await OfficeParser.pptToText(buffer);
          parsedResult = openDataLoader.parseTextDocument(extractedText || "", filename);
        } catch {
          parsedResult = openDataLoader.parseTextDocument(buffer.toString("utf8"), filename);
        }
      } else {
        parsedResult = openDataLoader.parseTextDocument(buffer.toString("utf8"), filename);
      }
    } else {
      fileHash = crypto.createHash("sha256").update(rawContent).digest("hex");
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
        fileHash,
        ...metadata,
      },
    });

    res.status(201).json({
      success: true,
      documentId: ragResult.document.id,
      title: parsedResult.title,
      fileHash,
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
 * POST /api/v1/files/batch-upload
 * Batch ingest multiple documents in parallel
 */
router.post("/v1/files/batch-upload", async (req: Request, res: Response): Promise<void> => {
  try {
    const { files, userId = "usr_default" } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      res.status(400).json({ success: false, error: "files array is required and must not be empty" });
      return;
    }

    const uploaded = [];
    for (const f of files) {
      const parsed = openDataLoader.parseTextDocument(f.rawContent || "", f.filename || "file.txt");
      const rag = await ragEngine.ingestDocument({
        userId,
        title: parsed.title,
        content: parsed.markdown,
        sourceType: "text",
      });
      uploaded.push({
        documentId: rag.document.id,
        title: parsed.title,
        chunksCreated: rag.chunksCreated,
      });
    }

    res.status(201).json({
      success: true,
      count: uploaded.length,
      documents: uploaded,
    });
  } catch (error: any) {
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
 * GET /api/v1/files/:docId/content
 * Retrieves the full parsed content of an indexed file
 */
router.get("/v1/files/:docId/content", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string) || "usr_default";
    const { docId } = req.params;
    const allDocs = await ragEngine.listDocuments(userId);
    const doc = allDocs.find((d) => d.id === docId);

    if (!doc) {
      res.status(404).json({ success: false, error: `Document ${docId} not found` });
      return;
    }

    res.status(200).json({
      success: true,
      document: doc,
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

/**

 * POST /api/v1/files/ocr
 * High-precision Bangla OCR route for legal deeds ("দলিল"), land khatians, and university handouts.
 * Automatically normalizes Bangla Academy short-i orthography and extracts structured deed metadata.
 */
router.post("/v1/files/ocr", idempotencyMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename = "dalil_scan.pdf", fileBase64, rawContent, userId = "usr_default" } = req.body;

    if (!fileBase64 && !rawContent) {
      res.status(400).json({
        success: false,
        error: "Missing OCR document payload: fileBase64 or rawContent is required",
      });
      return;
    }

    const inputData = fileBase64 ? Buffer.from(fileBase64, "base64") : rawContent;
    const ocrResult = openDataLoader.parseBanglaOcr(inputData, filename);

    res.status(200).json({
      success: true,
      filename,
      ocrResult: {
        title: ocrResult.title,
        pageCount: ocrResult.pageCount,
        totalLength: ocrResult.totalLength,
        markdown: ocrResult.markdown,
        deedMetadata: ocrResult.deedMetadata,
      },
      message: "Bangla OCR processing and orthography normalization completed successfully.",
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[files/ocr] OCR processing failure");
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

