/**
 * FAANG-Grade Refactored ReplitBookWorkspace Orchestrator.
 * 3-Fold Book Writing & Rendering IDE (/writing-studio?mode=3fold)
 *
 * Deconstructed Responsibilities:
 *  - `useBookManuscript`: Outline, word count, active chapter state.
 *  - `useBookAgentConsole`: Sub-agent stream execution, logs, voice dictation.
 *  - `BookLeftChapterTree`: Fold 1 Chapter tree & progress metrics.
 *  - `BookCenterCanvas`: Fold 2 5-Mode Canvas (Writing Studio, Fortune Sheet, Mind Map, Marp Slides, Live Web Preview).
 *  - `BookRightConsole`: Fold 3 Sub-Agent Console & Polsia Swarm.
 */
import React, { useState } from "react";
import { useBookManuscript, type ChapterItem } from "./hooks/useBookManuscript";
import { useBookAgentConsole } from "./hooks/useBookAgentConsole";
import { BookLeftChapterTree } from "./components/BookLeftChapterTree";
import { BookCenterCanvas, type CanvasTab } from "./components/BookCenterCanvas";
import { BookRightConsole } from "./components/BookRightConsole";
import { ComponentErrorBoundary } from "@/components/agents/components/ChatErrorBoundaries";

export interface ReplitBookWorkspaceProps {
  initialTitle?: string;
  initialChapters?: ChapterItem[];
  onExport?: (format: "pdf" | "epub" | "docx") => void;
  onBack?: () => void;
}

export function ReplitBookWorkspace({
  initialTitle = "Untitled Masterpiece",
  initialChapters = [
    { id: "ch-1", title: "Chapter 1: The Quantum Horizon", synopsis: "Introduction to the core conflict.", wordCount: 4200 },
    { id: "ch-2", title: "Chapter 2: The Core Mechanism", synopsis: "Escalation of stakes.", wordCount: 6150 },
    { id: "ch-3", title: "Chapter 3: Scaling & Autonomous Execution", synopsis: "Resolution and execution.", wordCount: 8080 },
  ],
  onExport,
  onBack,
}: ReplitBookWorkspaceProps) {
  const { chapters, activeChapterId, totalWords, setActiveChapterId, addChapter } =
    useBookManuscript(initialChapters);

  const { customPrompt, setCustomPrompt, logs, status, startStream } = useBookAgentConsole();

  const [activeTab, setActiveTab] = useState<CanvasTab>("editor");
  const [editorText, setEditorText] = useState(
    "# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight..."
  );

  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(3);
  const checkpoints = [
    { id: 1, label: "Step 1: Outline Verified", summary: "3 Chapters structured · 47 primary sources", words: 0 },
    { id: 2, label: "Step 2: Chapter 1 Drafted", summary: "Quantum Horizon drafted · 4,200 words", words: 4200 },
    { id: 3, label: "Step 3: Canon Audit Passed", summary: "Character timeline & invariants verified", words: 10350 },
    { id: 4, label: "Step 4: Nilkhet Preflight Ready", summary: "300 DPI CMYK layout & bleed checked", words: 18430 },
  ];

  const handleRestoreCheckpoint = (cpId: number) => {
    setActiveCheckpoint(cpId);
    if (cpId === 1) {
      setEditorText("# Chapter 1: The Quantum Horizon\n\n[Outline Draft] Initial conflict established.");
    } else if (cpId === 2) {
      setEditorText("# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight...");
    } else if (cpId === 3) {
      setEditorText("# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight as Maya stepped past the perimeter line.");
    } else if (cpId === 4) {
      setEditorText("# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight as Inspector Maya Sen uncovered the unmistakable serial number etched into the casing.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* ── Replit Agent Top Checkpoint Scrubber Bar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/80 bg-muted/40 shrink-0 text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
            Replit Checkpoints:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {checkpoints.map((cp) => {
              const isActive = activeCheckpoint === cp.id;
              const isPast = activeCheckpoint >= cp.id;
              return (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => handleRestoreCheckpoint(cp.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-xs scale-[1.02]"
                      : isPast
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "text-muted-foreground hover:text-foreground opacity-60"
                  }`}
                  title={`${cp.summary} (Click to restore)`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-cyan-400 animate-pulse" : isPast ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                  <span>{cp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground">
            Snapshot #{activeCheckpoint} / {checkpoints.length}
          </span>
        </div>
      </div>

      {/* Main 3-Fold Workspace Layout */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Fold 1: Left Chapter Tree */}
        <div className="w-64 shrink-0 h-full">
          <ComponentErrorBoundary title="Chapter Tree Error">
            <BookLeftChapterTree
              chapters={chapters}
              activeChapterId={activeChapterId}
              onSelectChapter={setActiveChapterId}
              onAddChapter={() => addChapter("New Chapter", "Outline synopsis...")}
              totalWords={totalWords}
            />
          </ComponentErrorBoundary>
        </div>

        {/* Fold 2: Center 5-Mode Canvas */}
        <div className="flex-1 min-w-0 h-full">
          <ComponentErrorBoundary title="Canvas View Error">
            <BookCenterCanvas
              activeTab={activeTab}
              onTabChange={setActiveTab}
              editorText={editorText}
              onEditorTextChange={setEditorText}
              livePreviewUrl="https://yourbusiness.com"
            />
          </ComponentErrorBoundary>
        </div>

        {/* Fold 3: Right Sub-Agent Console */}
        <div className="w-80 shrink-0 h-full">
          <ComponentErrorBoundary title="Sub-Agent Console Error">
            <BookRightConsole
              logs={logs}
              status={status}
              customPrompt={customPrompt}
              onPromptChange={setCustomPrompt}
              onRunAgent={(prompt) => startStream(prompt)}
            />
          </ComponentErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default ReplitBookWorkspace;
