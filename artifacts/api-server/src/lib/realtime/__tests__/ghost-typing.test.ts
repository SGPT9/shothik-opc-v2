import { describe, it, expect } from "vitest";
import { GhostTypingStreamer } from "../ghost-typing-streamer.js";

describe("Ghost Typing Streamer", () => {
  it("formats inline diff replacements into Monaco decoration ranges", () => {
    const frame = GhostTypingStreamer.createDiffFrame({
      originalText: "তিনি আসিলেন",
      replacementText: "তিনি এলেন",
      line: 3,
      startCol: 5,
    });

    expect(frame.type).toBe("INLINE_DIFF");
    expect(frame.deletions).toHaveLength(1);
    expect(frame.insertions).toHaveLength(1);
    expect(frame.deletions[0].range.startLineNumber).toBe(3);
    expect(frame.deletions[0].range.startColumn).toBe(5);
    expect(frame.deletions[0].inlineClassName).toBe("monaco-diff-deletion");
    expect(frame.insertions[0].inlineClassName).toBe("monaco-diff-insertion");
  });

  it("packages streaming token deltas for Monaco ghost text auto-completion", () => {
    const ghost = GhostTypingStreamer.createGhostTextFrame({
      streamId: "stream_ghost_01",
      delta: " সুন্দর সকাল।",
      accumulated: "আজ একটি সুন্দর সকাল।",
      cursorPosition: { lineNumber: 1, column: 10 },
      isFinal: false,
    });

    expect(ghost.type).toBe("GHOST_SUGGESTION");
    expect(ghost.streamId).toBe("stream_ghost_01");
    expect(ghost.delta).toBe(" সুন্দর সকাল।");
    expect(ghost.position.lineNumber).toBe(1);
    expect(ghost.position.column).toBe(10);
    expect(ghost.isFinal).toBe(false);
  });

  it("handles empty diff edge case with zero deletions/insertions", () => {
    const frame = GhostTypingStreamer.createDiffFrame({
      originalText: "অভিন্ন বাক্য",
      replacementText: "অভিন্ন বাক্য",
      line: 1,
      startCol: 1,
    });

    expect(frame.type).toBe("INLINE_DIFF");
    expect(frame.deletions).toHaveLength(0);
    expect(frame.insertions).toHaveLength(0);
  });
});
