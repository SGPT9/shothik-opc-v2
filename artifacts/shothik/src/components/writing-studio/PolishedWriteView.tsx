/**
 * FAANG-Grade Refactored PolishedWriteView Orchestrator.
 *
 * Responsibilities deconstructed into clean modular hooks & discrete error boundaries:
 *  - `useWritingEditor`: Content state, title, citation style, memoized word count & readiness metrics.
 *  - `useWritingHistory`: Debounced undo/redo history stack management.
 *  - `ComponentErrorBoundary`: Discrete React Error Boundaries for Navigation, Left Sidebar, Center Editor, and Right Panel.
 */
import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileDown, BookOpen, Edit3, Sparkles, X, Check, SplitSquareHorizontal } from "lucide-react";
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
import { DeerFlowStatusBanner } from "./ux/DeerFlowStatusBanner";

const PublishingPage = lazy(() => import("./PublishingPage") as any);
const PolishedWriteOnboarding = lazy(() => import("./PolishedWriteOnboarding") as any);
const WebMCPWidget = lazy(() => import("./WebMCPWidget") as any);

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
  } = useWritingEditor(project?.content || "", project?.title || bookTitle);

  const { pushHistory, undo, redo, canUndo, canRedo } = useWritingHistory(project?.content || "");

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleContentChange = useCallback(
    (newText: string) => {
      setContent(newText);
      pushHistory(newText);
    },
    [pushHistory, setContent]
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top Header Mode Switcher */}
      <ComponentErrorBoundary title="Header Navigation Error">
        <ModeSwitcherHeader
          title={title}
          mode={mode}
          onModeChange={setMode}
          onBack={onBack}
        />
      </ComponentErrorBoundary>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Sidebar */}
        <ComponentErrorBoundary title="Left Sidebar Error">
          <LeftSidebar
            content={content}
            wordCount={wordCount}
            citationCount={citationCount}
            readinessScore={readinessScore}
          />
        </ComponentErrorBoundary>

        {/* Center Editor / Publishing View */}
        <div className="flex flex-1 flex-col min-w-0 h-full">
          <ComponentErrorBoundary title="DeerFlow Banner Error">
            <DeerFlowStatusBanner />
          </ComponentErrorBoundary>

          {mode === "write" && (
            <ComponentErrorBoundary title="Editor Workspace Error">
              <CenterEditor
                content={content}
                onContentChange={handleContentChange}
                canUndo={canUndo}
                canRedo={canRedo}
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

        {/* Right Panel Auditor */}
        <ComponentErrorBoundary title="Auditor Panel Error">
          <RightPanel
            content={content}
            citationStyle={citationStyle}
            onCitationStyleChange={setCitationStyle}
            referenceList={referenceList}
          />
        </ComponentErrorBoundary>
      </div>

      {/* Status Bar Footer */}
      <StatusBar wordCount={wordCount} isSaving={isSaving} lastSaved={lastSaved} />
    </div>
  );
}

export default PolishedWriteView;
