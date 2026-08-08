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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
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
  );
}

export default ReplitBookWorkspace;
