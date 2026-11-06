/**
 * FAANG-Grade Refactored ReplitBookWorkspace Orchestrator.
 * 3-Fold Book Writing & Rendering IDE (/writing-studio?mode=3fold)
 */
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useBookManuscript, type ChapterItem } from "./hooks/useBookManuscript";
import { useBookAgentConsole } from "./hooks/useBookAgentConsole";
import { BookLeftChapterTree } from "./components/BookLeftChapterTree";
import { BookCenterCanvas, type CanvasTab } from "./components/BookCenterCanvas";
import { BookRightConsole } from "./components/BookRightConsole";
import { ComponentErrorBoundary } from "@/components/agents/components/ChatErrorBoundaries";

export interface ReplitBookWorkspaceProps {
  initialTitle?: string;
  initialChapters?: ChapterItem[];
  initialContent?: string;
  onContentChange?: (newContent: string) => void;
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
  initialContent,
  onContentChange,
  onExport,
  onBack,
}: ReplitBookWorkspaceProps) {
  const { chapters, activeChapterId, totalWords, setActiveChapterId, addChapter } =
    useBookManuscript(initialChapters);

  const { customPrompt, setCustomPrompt, logs, status, startStream } = useBookAgentConsole();

  const [activeTab, setActiveTab] = useState<CanvasTab>("editor");
  const [editorText, setEditorText] = useState(
    initialContent
      ? initialContent.replace(/<[^>]+>/g, "\n").trim()
      : "# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight..."
  );

  const handleEditorUpdate = (nextText: string) => {
    setEditorText(nextText);
    onContentChange?.(nextText);
  };

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
      handleEditorUpdate("# Chapter 1: The Quantum Horizon\n\n[Outline Draft] Initial conflict established.");
    } else if (cpId === 2) {
      handleEditorUpdate("# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight...");
    } else if (cpId === 3) {
      handleEditorUpdate("# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight as Maya stepped past the perimeter line.");
    } else if (cpId === 4) {
      handleEditorUpdate("# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight as Inspector Maya Sen uncovered the unmistakable serial number etched into the casing.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* ── Replit Agent Top Checkpoint Scrubber Bar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/80 bg-muted/40 shrink-0 text-xs select-none">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Studio</span>
            </button>
          )}
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
            {initialTitle} · Checkpoints:
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
              onEditorTextChange={handleEditorUpdate}
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
