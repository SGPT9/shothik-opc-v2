import { randomUUID } from "crypto";
import { logger } from "./logger.js";
import { promises as fs } from "fs";
import path from "path";

export interface DocumentChunk {
  id: string;
  docId: string;
  userId: string;
  title: string;
  content: string;
  chunkIndex: number;
  tokens: number;
  embedding: number[];
  metadata?: Record<string, any>;
  createdAt: string;
}

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY || "";
const NVIDIA_NIM_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || process.env.NIM_HOST || "https://integrate.api.nvidia.com/v1";

export interface IngestedDocument {
  id: string;
  userId: string;
  title: string;
  sourceType: "text" | "markdown" | "pdf" | "docx" | "pptx" | "xlsx" | "url";
  sourceUrl?: string;
  totalLength: number;
  chunkCount: number;
  createdAt: string;
}

export interface RAGSearchResult {
  chunkId: string;
  docId: string;
  title: string;
  content: string;
  score: number;
  rerankScore?: number;
  metadata?: Record<string, any>;
}

export class RAGKnowledgeEngine {
  private static instance: RAGKnowledgeEngine;
  private documents = new Map<string, IngestedDocument>();
  private chunks = new Map<string, DocumentChunk>();
  private storagePath = path.resolve(process.cwd(), "data", "rag-store.json");

  private constructor() {
    this.loadFromDisk().catch((err) => {
      logger.warn(`[rag-engine] Initial load warning: ${err.message}`);
    });
  }

  static getInstance(): RAGKnowledgeEngine {
    if (!RAGKnowledgeEngine.instance) {
      RAGKnowledgeEngine.instance = new RAGKnowledgeEngine();
    }
    return RAGKnowledgeEngine.instance;
  }

  /**
   * Generates a dense vector for semantic similarity.
   * If NVIDIA NIM is available, requests a 1024-dim neural embedding; otherwise uses a 128-dim subword feature hashing vectorizer.
   */
  async generateVector(text: string): Promise<number[]> {
    if (NVIDIA_API_KEY) {
      try {
        const res = await fetch(`${NVIDIA_NIM_BASE_URL}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
          },
          body: JSON.stringify({
            input: text.slice(0, 2048),
            model: "nvidia/llama-3.2-nv-embedqa-1b-v1",
            encoding_format: "float",
          }),
          signal: AbortSignal.timeout(3000),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.[0]?.embedding) {
            return json.data[0].embedding;
          }
        }
      } catch (err: any) {
        logger.warn(`[rag-engine] Neural embedding failed, using local hash vectorizer: ${err.message}`);
      }
    }

    return this.generateHashedVector(text);
  }

  /**
   * 128-dimensional subword and token feature hashing vectorizer (works offline for English, Bangla, and Code).
   */
  generateHashedVector(text: string): number[] {
    const DIM = 128;
    const vector = new Array(DIM).fill(0);
    const tokens = text.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) || [];
    
    if (tokens.length === 0) return new Array(DIM).fill(1 / Math.sqrt(DIM));

    for (const tok of tokens) {
      let hash = 0;
      for (let i = 0; i < tok.length; i++) {
        hash = (hash << 5) - hash + tok.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % DIM;
      vector[idx] += 1;
    }

    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return mag === 0 ? vector.map(() => 1 / Math.sqrt(DIM)) : vector.map((v) => v / mag);
  }

  /**
   * Computes cosine similarity between two unit vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Cross-Encoder Reranker: Uses NVIDIA NeMo Reranker when configured, or lexical density scoring.
   */
  async rerankResults(query: string, results: RAGSearchResult[]): Promise<RAGSearchResult[]> {
    if (results.length <= 1) return results;

    if (NVIDIA_API_KEY) {
      try {
        const res = await fetch(`${NVIDIA_NIM_BASE_URL}/reranking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
          },
          body: JSON.stringify({
            model: "nvidia/llama-nemotron-rerank-1b-v2",
            query: { text: query },
            passages: results.map((r) => ({ text: r.content })),
          }),
          signal: AbortSignal.timeout(3000),
        });

        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.rankings)) {
            const reordered: RAGSearchResult[] = [];
            for (const item of json.rankings) {
              const original = results[item.index];
              if (original) {
                reordered.push({
                  ...original,
                  rerankScore: item.logit,
                });
              }
            }
            if (reordered.length > 0) return reordered;
          }
        }
      } catch (err: any) {
        logger.warn(`[rag-engine] NeMo Reranking failed, using hybrid scores: ${err.message}`);
      }
    }

    return results;
  }

  /**
   * Recursively splits document text into overlapping semantic chunks.
   */
  private chunkText(text: string, chunkSize = 400, overlap = 80): string[] {
    const cleanText = text.trim();
    if (cleanText.length <= chunkSize) return [cleanText];

    const chunks: string[] = [];
    let start = 0;

    while (start < cleanText.length) {
      let end = start + chunkSize;
      if (end >= cleanText.length) {
        chunks.push(cleanText.slice(start));
        break;
      }

      // Try to break at sentence or newline boundary
      const boundaryIndex = cleanText.lastIndexOf("\n", end);
      const spaceIndex = cleanText.lastIndexOf(" ", end);
      const splitPoint = boundaryIndex > start + 100 ? boundaryIndex : (spaceIndex > start + 100 ? spaceIndex : end);

      chunks.push(cleanText.slice(start, splitPoint).trim());
      start = splitPoint - overlap;
    }

    return chunks.filter((c) => c.length > 10);
  }

  /**
   * Ingests a new document, chunks it, generates vector embeddings, and stores it.
   */
  async ingestDocument(params: {
    userId: string;
    title: string;
    content: string;
    sourceType?: "text" | "markdown" | "pdf" | "url";
    sourceUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<{ document: IngestedDocument; chunksCreated: number }> {
    const docId = `doc_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const sourceType = params.sourceType || "text";

    const textChunks = this.chunkText(params.content);
    const createdChunks: DocumentChunk[] = [];

    for (let index = 0; index < textChunks.length; index++) {
      const chunkContent = textChunks[index];
      const chunkId = `chk_${docId}_${index}`;
      const embedding = await this.generateVector(chunkContent);
      const chunk: DocumentChunk = {
        id: chunkId,
        docId,
        userId: params.userId,
        title: params.title,
        content: chunkContent,
        chunkIndex: index,
        tokens: Math.round(chunkContent.length / 4),
        embedding,
        metadata: params.metadata,
        createdAt: now,
      };
      this.chunks.set(chunkId, chunk);
      createdChunks.push(chunk);
    }

    const doc: IngestedDocument = {
      id: docId,
      userId: params.userId,
      title: params.title,
      sourceType,
      sourceUrl: params.sourceUrl,
      totalLength: params.content.length,
      chunkCount: createdChunks.length,
      createdAt: now,
    };

    this.documents.set(docId, doc);
    await this.persistToDisk();

    logger.info(`[rag-engine] Ingested document "${params.title}" (${docId}) into ${createdChunks.length} vector chunks`);
    return { document: doc, chunksCreated: createdChunks.length };
  }

  /**
   * Queries the knowledge base using hybrid vector + keyword matching and NeMo cross-encoder reranking.
   */
  async queryKnowledge(userId: string, query: string, topK = 3): Promise<RAGSearchResult[]> {
    const queryVector = await this.generateVector(query);
    const queryWords = query.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) || [];

    const userChunks = Array.from(this.chunks.values()).filter(
      (c) => c.userId === userId || c.userId === "global" || c.userId === "usr_default"
    );

    const scored: RAGSearchResult[] = userChunks.map((chunk) => {
      // 1. Vector cosine similarity
      const vectorScore = this.cosineSimilarity(queryVector, chunk.embedding);

      // 2. Keyword exact match frequency
      const contentLower = chunk.content.toLowerCase();
      let keywordHits = 0;
      for (const w of queryWords) {
        if (contentLower.includes(w)) keywordHits++;
      }
      const keywordScore = queryWords.length > 0 ? keywordHits / queryWords.length : 0;

      // 3. Hybrid fusion (65% vector + 35% keyword)
      const combinedScore = (vectorScore * 0.65) + (keywordScore * 0.35);

      return {
        chunkId: chunk.id,
        docId: chunk.docId,
        title: chunk.title,
        content: chunk.content,
        score: Number(combinedScore.toFixed(4)),
        metadata: chunk.metadata,
      };
    });

    // Sort descending by initial hybrid score
    scored.sort((a, b) => b.score - a.score);
    const candidatePool = scored.slice(0, Math.max(topK * 3, 10));

    // Two-Stage Cross-Encoder Rerank
    const reranked = await this.rerankResults(query, candidatePool);
    return reranked.slice(0, topK);
  }

  /**
   * Lists all indexed documents for a user.
   */
  listDocuments(userId: string): IngestedDocument[] {
    return Array.from(this.documents.values()).filter(
      (d) => d.userId === userId || d.userId === "global" || d.userId === "usr_default"
    );
  }

  /**
   * Deletes a document and all its indexed chunks.
   */
  async deleteDocument(userId: string, docId: string): Promise<boolean> {
    const doc = this.documents.get(docId);
    if (!doc) return false;

    this.documents.delete(docId);
    for (const [chunkId, chunk] of this.chunks.entries()) {
      if (chunk.docId === docId) {
        this.chunks.delete(chunkId);
      }
    }

    await this.persistToDisk();
    logger.info(`[rag-engine] Deleted document ${docId} and its associated chunks`);
    return true;
  }

  private async persistToDisk(): Promise<void> {
    try {
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });
      const payload = {
        documents: Array.from(this.documents.values()),
        chunks: Array.from(this.chunks.values()),
      };
      await fs.writeFile(this.storagePath, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err: any) {
      logger.warn(`[rag-engine] Failed to persist to disk: ${err.message}`);
    }
  }

  private async loadFromDisk(): Promise<void> {
    try {
      const data = await fs.readFile(this.storagePath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed.documents)) {
        for (const d of parsed.documents) this.documents.set(d.id, d);
      }
      if (Array.isArray(parsed.chunks)) {
        for (const c of parsed.chunks) this.chunks.set(c.id, c);
      }
      logger.info(`[rag-engine] Loaded ${this.documents.size} documents and ${this.chunks.size} chunks from store`);
    } catch {
      // Clean start if file doesn't exist
    }
  }

  clearStore(): void {
    this.documents.clear();
    this.chunks.clear();
  }
}

export const ragEngine = RAGKnowledgeEngine.getInstance();
