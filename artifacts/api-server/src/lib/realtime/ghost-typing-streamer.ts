export interface MonacoRangeBounds {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface MonacoDecorationRange {
  range: MonacoRangeBounds;
  inlineClassName: string;
  hoverMessage?: string;
}

export interface DiffDecorationFrame {
  type: "INLINE_DIFF";
  originalText: string;
  replacementText: string;
  line: number;
  deletions: MonacoDecorationRange[];
  insertions: MonacoDecorationRange[];
  timestamp: number;
}

export interface GhostTextFrame {
  type: "GHOST_SUGGESTION";
  streamId: string;
  delta: string;
  accumulated: string;
  position: {
    lineNumber: number;
    column: number;
  };
  isFinal: boolean;
  timestamp: number;
}

export class GhostTypingStreamer {
  /**
   * Formats in-place red/green Monaco diff decoration ranges for prompt rewrites or tone polishing.
   */
  static createDiffFrame(params: {
    originalText: string;
    replacementText: string;
    line: number;
    startCol: number;
    hoverDeletion?: string;
    hoverInsertion?: string;
  }): DiffDecorationFrame {
    const { originalText, replacementText, line, startCol, hoverDeletion, hoverInsertion } = params;

    // Edge case: unchanged text produces no decorative alterations
    if (originalText === replacementText) {
      return {
        type: "INLINE_DIFF",
        originalText,
        replacementText,
        line,
        deletions: [],
        insertions: [],
        timestamp: Date.now(),
      };
    }

    const deletions: MonacoDecorationRange[] = [
      {
        range: {
          startLineNumber: line,
          startColumn: startCol,
          endLineNumber: line,
          endColumn: startCol + originalText.length,
        },
        inlineClassName: "monaco-diff-deletion",
        hoverMessage: hoverDeletion || "Original text (removed)",
      },
    ];

    const insertions: MonacoDecorationRange[] = [
      {
        range: {
          startLineNumber: line,
          startColumn: startCol,
          endLineNumber: line,
          endColumn: startCol + replacementText.length,
        },
        inlineClassName: "monaco-diff-insertion",
        hoverMessage: hoverInsertion || "Suggested replacement (AI)",
      },
    ];

    return {
      type: "INLINE_DIFF",
      originalText,
      replacementText,
      line,
      deletions,
      insertions,
      timestamp: Date.now(),
    };
  }

  /**
   * Packages streaming LLM token deltas into ghost text frames for Monaco inline autocompletion.
   */
  static createGhostTextFrame(params: {
    streamId: string;
    delta: string;
    accumulated: string;
    cursorPosition: { lineNumber: number; column: number };
    isFinal?: boolean;
  }): GhostTextFrame {
    return {
      type: "GHOST_SUGGESTION",
      streamId: params.streamId,
      delta: params.delta,
      accumulated: params.accumulated,
      position: {
        lineNumber: params.cursorPosition.lineNumber,
        column: params.cursorPosition.column,
      },
      isFinal: params.isFinal ?? false,
      timestamp: Date.now(),
    };
  }
}
