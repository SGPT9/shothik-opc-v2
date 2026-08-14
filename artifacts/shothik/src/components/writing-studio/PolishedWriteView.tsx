/**
 * FAANG-Grade PolishedWriteView Orchestrator.
 *
 * Fully wired for:
 *  - Chapter tree sync (agentChapters -> LeftSidebar)
 *  - TipTap CenterEditor bidirectional binding (onChange + formatting)
 *  - RightPanel AI insights + Co-writer
 *  - 3-Fold 5-Mode Book Workspace toggle
 */
import React, { useState, useCallback, useEffect, lazy, Suspense, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileDown, BookOpen, Edit3, Sparkles, X, Check, SplitSquareHorizontal, Columns3 } from "lucide-react";
import { ModeSwitcherHeader } from "./navigation/ModeSwitcherHeader";
import { LeftSidebar } from "./layout/LeftSidebar";
import { ActivityBar } from "./layout/ActivityBar";
import { CenterEditor } from "./layout/CenterEditor";
import { RightPanel } from "./layout/RightPanel";
import { StatusBar } from "./layout/StatusBar";
import { CommandPalette } from "./CommandPalette";
import { LiveDocumentPreview } from "./layout/LiveDocumentPreview";
import { ComponentErrorBoundary } from "@/components/agents/components/ChatErrorBoundaries";
import { useWritingEditor } from "./hooks/useWritingEditor";
import { useWritingHistory } from "./hooks/useWritingHistory";
import { ReplitBookWorkspace } from "./ReplitBookWorkspace";
import { Button } from "@/components/ui/button";

const PublishingPage = lazy(() => import("./PublishingPage") as any);

type Mode = "write" | "format" | "publish";
type ProjectType = "book" | "research" | "assignment";

interface PolishedWriteViewProps {
  bookTitle?: string;
  project?: any;
  onBack?: () => void;
  projectType?: ProjectType;
}

export function PolishedWriteView({
  bookTitle = "Untitled Project",
  project,
  onBack,
  projectType: projectTypeProp,
}: PolishedWriteViewProps) {
  const projectType: ProjectType = projectTypeProp || project?.type || "book";
  const [mode, setMode] = useState<Mode>("write");
  const [is3FoldMode, setIs3FoldMode] = useState(false);

  // Initialize chapter manuscript structure from agent generation
  const initialChapters = useMemo(() => {
    const rawChapters = project?.agentChapters || project?.chapters || [];
    if (Array.isArray(rawChapters) && rawChapters.length > 0) {
      return rawChapters.map((ch: any, idx: number) => ({
        id: ch.id || `ch-${idx + 1}`,
        title: ch.title || `Chapter ${idx + 1}`,
        synopsis: ch.synopsis || "",
        status: (idx === 0 ? "in-progress" : "draft") as "in-progress" | "draft" | "complete",
        sections: [
          {
            id: `sec-${idx + 1}-1`,
            title: "Draft Manuscript",
            isActive: idx === 0,
          },
        ],
        wordCount: ch.wordCount || 0,
        wordTarget: ch.wordTarget || 3500,
      }));
    }
    return [
      {
        id: "ch-1",
        title: "Chapter 1: The Beginning",
        synopsis: "Introduction to the central story premise.",
        status: "in-progress" as const,
        sections: [{ id: "sec-1-1", title: "Opening Scene", isActive: true }],
        wordCount: 0,
        wordTarget: 3500,
      },
    ];
  }, [project]);

  const [chapters, setChapters] = useState(initialChapters);
  const [activeChapterId, setActiveChapterId] = useState(initialChapters[0]?.id || "ch-1");
  const [activeSectionId, setActiveSectionId] = useState(initialChapters[0]?.sections[0]?.id || "sec-1-1");

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) || chapters[0],
    [chapters, activeChapterId]
  );

  const initialContent = useMemo(() => {
    if (project?.content && project.content.trim()) return project.content;
    if (activeChapter?.synopsis) {
      return `<p><em>${activeChapter.synopsis}</em></p><p><br></p><p>Start writing chapter manuscript here in Bengali or English…</p>`;
    }
    return "<p>Start writing your masterpiece…</p>";
  }, [project, activeChapter]);

  const {
    content,
    title,
    citationStyle,
    isSaving,
    lastSaved,
    wordCount,
    citationCount,
    readinessScore,
    referenceList,
    setContent,
    setCitationStyle,
    setIsSaving,
    setLastSaved,
  } = useWritingEditor(initialContent, project?.title || bookTitle);

  const { pushHistory, undo, redo, canUndo, canRedo } = useWritingHistory(initialContent);

  const handleContentChange = useCallback(
    (newText: string) => {
      setContent(newText);
      pushHistory(newText);
    },
    [pushHistory, setContent]
  );

  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    const parentCh = chapters.find((c) => c.sections.some((s) => s.id === sectionId));
    if (parentCh) {
      setActiveChapterId(parentCh.id);
    }
  }, [chapters]);

  // If user switches to full 3-Fold 5-Mode Workspace
  if (is3FoldMode) {
    return (
      <ReplitBookWorkspace
        initialTitle={title}
        initialChapters={chapters.map((c) => ({
          id: c.id,
          title: c.title,
          synopsis: c.synopsis || "",
          wordCount: c.wordCount || 0,
        }))}
        onBack={() => setIs3FoldMode(false)}
      />
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top Header Mode Switcher */}
      <ComponentErrorBoundary title="Header Navigation Error">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
          <ModeSwitcherHeader
            title={title}
            mode={mode}
            onModeChange={setMode}
            onBack={onBack}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIs3FoldMode(true)}
              className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
              title="Open 3-Fold IDE with Fortune Sheet, Mindmap, and Slide Pitch"
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>3-Fold IDE Canvas</span>
            </Button>
          </div>
        </div>
      </ComponentErrorBoundary>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Sidebar Chapter Tree */}
        <ComponentErrorBoundary title="Left Sidebar Error">
          <LeftSidebar
            chapters={chapters}
            activeSectionId={activeSectionId}
            onSectionClick={handleSectionClick}
            onChaptersChange={setChapters}
            projectType={projectType}
            researchNotes={project?.researchNotes}
          />
        </ComponentErrorBoundary>

        {/* Center Editor / Publishing View */}
        <div className="flex flex-1 flex-col min-w-0 h-full">
          {mode === "write" && (
            <ComponentErrorBoundary title="Editor Workspace Error">
              <CenterEditor
                content={content}
                onChange={handleContentChange}
                chapterTitle={activeChapter?.title || title}
                canUndo={canUndo}
                canRedo={canRedo}
                citationStyle={citationStyle as any}
                onUndo={() => {
                  const prev = undo();
                  if (prev !== null) setContent(prev);
                }}
                onRedo={() => {
                  const next = redo();
                  if (next !== null) setContent(next);
                }}
              />
            </ComponentErrorBoundary>
          )}

          {mode === "publish" && (
            <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Publishing Engine…</div>}>
              <PublishingPage content={content} title={title} onBack={() => setMode("write")} />
            </Suspense>
          )}
        </div>

        {/* Right Panel AI Auditor & Co-writer */}
        <ComponentErrorBoundary title="Auditor Panel Error">
          <RightPanel
            content={content}
            projectId={project?._id || "default"}
            projectTitle={title}
            projectType={projectType}
          />
        </ComponentErrorBoundary>
      </div>

      {/* Status Bar Footer */}
      <StatusBar wordCount={wordCount} isSaving={isSaving} lastSaved={lastSaved} />
    </div>
  );
}

export default PolishedWriteView;
