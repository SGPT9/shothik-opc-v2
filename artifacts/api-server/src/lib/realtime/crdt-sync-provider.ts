import crypto from "crypto";

export interface TextDiffEntry {
  type: "insert" | "delete" | "retain";
  text: string;
}

export interface BranchMergeResult {
  hasConflicts: boolean;
  mergedText: string;
  diffs: TextDiffEntry[];
  summary: {
    additions: number;
    deletions: number;
    unchanged: number;
  };
}

export interface DocumentSnapshotPayload {
  projectId: string;
  docId: string;
  content: string;
  version: number;
  wordCount: number;
  checksum: string;
  authorId: string;
  timestamp: number;
}

export class CrdtSyncProvider {
  /**
   * Deterministically elects a single persistence leader from active room peers.
   * Ensures only one client writes periodic autosave flushes to the database.
   */
  static determinePersistenceLeader(activePeers: string[]): string | null {
    if (!activePeers || activePeers.length === 0) {
      return null;
    }
    const sorted = [...activePeers].sort();
    return sorted[0];
  }

  /**
   * Computes a structured line-by-line diff and reconciles alternative branch text
   * into canonical manuscript text.
   */
  static mergeText(canonical: string, branchText: string): BranchMergeResult {
    const canonicalLines = canonical.split("\n");
    const branchLines = branchText.split("\n");

    const diffs: TextDiffEntry[] = [];
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    // Line reconciliation
    const maxLen = Math.max(canonicalLines.length, branchLines.length);
    for (let i = 0; i < maxLen; i++) {
      const cLine = canonicalLines[i];
      const bLine = branchLines[i];

      if (cLine === undefined && bLine !== undefined) {
        diffs.push({ type: "insert", text: bLine });
        additions++;
      } else if (bLine === undefined && cLine !== undefined) {
        diffs.push({ type: "delete", text: cLine });
        deletions++;
      } else if (cLine === bLine) {
        diffs.push({ type: "retain", text: cLine });
        unchanged++;
      } else {
        diffs.push({ type: "delete", text: cLine });
        diffs.push({ type: "insert", text: bLine });
        deletions++;
        additions++;
      }
    }

    return {
      hasConflicts: false,
      mergedText: branchText,
      diffs,
      summary: {
        additions,
        deletions,
        unchanged,
      },
    };
  }

  /**
   * Prepares a validated document snapshot payload with SHA-256 integrity hash
   */
  static createSnapshotPayload(params: {
    projectId: string;
    docId?: string;
    content: string;
    version: number;
    authorId: string;
  }): DocumentSnapshotPayload {
    const { projectId, docId = "doc_root", content, version, authorId } = params;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const checksum = crypto.createHash("sha256").update(content, "utf8").digest("hex");

    return {
      projectId,
      docId,
      content,
      version,
      wordCount: words,
      checksum,
      authorId,
      timestamp: Date.now(),
    };
  }
}
