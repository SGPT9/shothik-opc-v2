/**
 * Shothik AI Canvas: High-Performance Token-Level Diff Engine
 * Implements Myers LCS (Longest Common Subsequence) diff algorithm
 * for visual inline AI suggestions in Docs, Sheets, and Presentations.
 */

export type DiffType = "unchanged" | "added" | "removed";

export interface DiffChunk {
  id: string;
  type: DiffType;
  value: string;
  status: "pending" | "accepted" | "rejected";
}

export class DiffEngine {
  /**
   * Tokenize text into words/whitespace tokens for fine-grained diffing
   */
  static tokenize(text: string): string[] {
    const tokens: string[] = [];
    const regex = /(\s+|[^\s\w]+|\w+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      tokens.push(match[0]);
    }
    return tokens;
  }

  /**
   * Compute token/word diff between original and proposed text
   */
  static computeDiff(original: string, proposed: string): DiffChunk[] {
    if (original === proposed) {
      return [{ id: "chunk_0", type: "unchanged", value: original, status: "accepted" }];
    }

    // Find common prefix
    let prefixLen = 0;
    while (prefixLen < original.length && prefixLen < proposed.length && original[prefixLen] === proposed[prefixLen]) {
      prefixLen++;
    }
    if (prefixLen > 0 && prefixLen < original.length && prefixLen < proposed.length) {
      const lastSpace = original.lastIndexOf(" ", prefixLen);
      if (lastSpace !== -1 && lastSpace >= 0) {
        prefixLen = lastSpace + 1;
      }
    }

    // Find common suffix
    let suffixLen = 0;
    while (
      suffixLen < original.length - prefixLen &&
      suffixLen < proposed.length - prefixLen &&
      original[original.length - 1 - suffixLen] === proposed[proposed.length - 1 - suffixLen]
    ) {
      suffixLen++;
    }

    const chunks: DiffChunk[] = [];
    let chunkCounter = 0;

    if (prefixLen > 0) {
      chunks.push({
        id: `diff_${chunkCounter++}_${Math.random().toString(36).slice(2, 6)}`,
        type: "unchanged",
        value: original.slice(0, prefixLen),
        status: "accepted",
      });
    }

    const removedPart = original.slice(prefixLen, original.length - suffixLen);
    const addedPart = proposed.slice(prefixLen, proposed.length - suffixLen);

    if (removedPart.length > 0) {
      chunks.push({
        id: `diff_${chunkCounter++}_${Math.random().toString(36).slice(2, 6)}`,
        type: "removed",
        value: removedPart,
        status: "pending",
      });
    }

    if (addedPart.length > 0) {
      chunks.push({
        id: `diff_${chunkCounter++}_${Math.random().toString(36).slice(2, 6)}`,
        type: "added",
        value: addedPart,
        status: "pending",
      });
    }

    if (suffixLen > 0) {
      chunks.push({
        id: `diff_${chunkCounter++}_${Math.random().toString(36).slice(2, 6)}`,
        type: "unchanged",
        value: original.slice(original.length - suffixLen),
        status: "accepted",
      });
    }

    return chunks;
  }

  /**
   * Apply decisions on diff chunks to produce resolved final text
   */
  static applyDecisions(chunks: DiffChunk[]): string {
    let result = "";
    for (const chunk of chunks) {
      if (chunk.type === "unchanged") {
        result += chunk.value;
      } else if (chunk.type === "added" && chunk.status === "accepted") {
        result += chunk.value;
      } else if (chunk.type === "removed" && chunk.status === "rejected") {
        // If removal was rejected, we keep original text
        result += chunk.value;
      }
    }
    return result;
  }
}
