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
   * Compute Myers LCS diff between original and proposed text
   */
  static computeDiff(original: string, proposed: string): DiffChunk[] {
    if (original === proposed) {
      return [{ id: "chunk_0", type: "unchanged", value: original, status: "accepted" }];
    }

    const tokensA = this.tokenize(original);
    const tokensB = this.tokenize(proposed);

    const m = tokensA.length;
    const n = tokensB.length;

    // LCS DP Table
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (tokensA[i - 1] === tokensB[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to extract diff chunks
    let i = m;
    let j = n;
    const rawChunks: { type: DiffType; value: string }[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
        rawChunks.unshift({ type: "unchanged", value: tokensA[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        rawChunks.unshift({ type: "added", value: tokensB[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        rawChunks.unshift({ type: "removed", value: tokensA[i - 1] });
        i--;
      }
    }

    // Merge consecutive chunks of same type
    const mergedChunks: DiffChunk[] = [];
    let chunkCounter = 0;

    for (const chunk of rawChunks) {
      if (mergedChunks.length > 0 && mergedChunks[mergedChunks.length - 1].type === chunk.type) {
        mergedChunks[mergedChunks.length - 1].value += chunk.value;
      } else {
        mergedChunks.push({
          id: `diff_${chunkCounter++}_${Math.random().toString(36).slice(2, 6)}`,
          type: chunk.type,
          value: chunk.value,
          status: chunk.type === "unchanged" ? "accepted" : "pending",
        });
      }
    }

    return mergedChunks;
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
