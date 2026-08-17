/**
 * FAANG-Grade PolishedWriteView Orchestrator.
 *
 * Full Feature Matrix:
 *  - Mode Switcher: "write" (Editor + Live Split Preview) | "format" (Typesetting Proof + Metadata) | "publish" (EPUB / PDF Preflight)
 *  - Chapter Sync: LeftSidebar chapter list with word counts & synopses.
 *  - CenterEditor: Bidirectional TipTap binding with ghost text and inline diff.
 *  - LiveDocumentPreview: Real-time 6x9 trade book rendering with zoom and page simulation.
 *  - 3-Fold Canvas Switcher: Instant jump to ReplitBookWorkspace.
 */
import React, { useState, useCallback, useEffect, lazy, Suspense, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  FileDown,
  BookOpen,
  Edit3,
  Sparkles,
  X,
  Check,
  SplitSquareHorizontal,
  Columns3,
  Eye,
  Sliders,
} from "lucide-react";
import { ModeSwitcherHeader } from "./navigation/ModeSwitcherHeader";
import { LeftSidebar } from "./layout/LeftSidebar";
import { CenterEditor } from "./layout/CenterEditor";
import { RightPanel } from "./layout/RightPanel";
import { FormatRightPanelV2 } from "./layout/FormatRightPanelV2";
import { StatusBar } from "./layout/StatusBar";
import { LiveDocumentPreview } from "./layout/LiveDocumentPreview";
import { ComponentErrorBoundary } from "@/components/agents/components/ChatErrorBoundaries";
import { useWritingEditor } from "./hooks/useWritingEditor";
import { useWritingHistory } from "./hooks/useWritingHistory";
import { ReplitBookWorkspace } from "./ReplitBookWorkspace";
import { ManuscriptImportModal } from "./ManuscriptImportModal";
import { BoiMela3DPageFlipPreview } from "@/components/books/BoiMela3DPageFlipPreview";
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
  const [showPreview, setShowPreview] = useState(true);
  const [preview3D, setPreview3D] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);

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
        title: "Chapter 1: The Quantum Horizon",
        synopsis: "Introduction to the central story premise and conflict.",
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
    return `<p>Start writing your masterpiece…</p>`;
  }, [project, activeChapter, bookTitle]);

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

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      setActiveSectionId(sectionId);
      const parentCh = chapters.find((c) => c.sections.some((s) => s.id === sectionId));
      if (parentCh) {
        setActiveChapterId(parentCh.id);
      }
    },
    [chapters]
  );

  const handleImportManuscript = useCallback(
    (imported: {
      title: string;
      chapters: Array<{
        id: string;
        title: string;
        synopsis: string;
        content: string;
        wordCount: number;
      }>;
    }) => {
      if (!imported.chapters.length) return;
      const formattedChapters = imported.chapters.map((ch, idx) => ({
        id: ch.id || `ch-${idx + 1}`,
        title: ch.title,
        synopsis: ch.synopsis,
        status: (idx === 0 ? "in-progress" : "draft") as "in-progress" | "draft" | "complete",
        sections: [{ id: `sec-${idx + 1}-1`, title: "Imported Draft", isActive: idx === 0 }],
        wordCount: ch.wordCount,
        wordTarget: 3500,
      }));

      setChapters(formattedChapters);
      setActiveChapterId(formattedChapters[0].id);
      setActiveSectionId(formattedChapters[0].sections[0].id);
      setContent(imported.chapters[0].content || `<p><em>${imported.chapters[0].synopsis}</em></p>`);
    },
    [setContent]
  );

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
            projectName={title}
            currentMode={mode}
            onModeChange={setMode}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-border text-muted-foreground hover:text-foreground cursor-pointer"
              title="Import Word, PDF, Text, or Bijoy Manuscript"
            >
              <FileDown className="h-3.5 w-3.5 text-indigo-400" />
              <span>Import Manuscript</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPreview((p) => !p)}
              className={`h-7 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer ${
                showPreview
                  ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/40"
                  : "text-muted-foreground border-border"
              }`}
              title="Toggle Live 6x9 Book Render Split Screen"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Book Render</span>
            </Button>

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
        {/* Left Sidebar Chapter Tree (Visible in Write & Format Modes) */}
        {mode !== "publish" && (
          <ComponentErrorBoundary title="Left Sidebar Error">
            <LeftSidebar
              chapters={chapters as any}
              activeSectionId={activeSectionId}
              onSectionClick={handleSectionClick}
              onChaptersChange={(newCh) => setChapters(newCh as any)}
              onImportClick={() => setIsImportOpen(true)}
              projectType={projectType}
              researchNotes={project?.researchNotes}
            />
          </ComponentErrorBoundary>
        )}

        {/* ── Mode 1: Write (Editor + Optional Live Split Preview) ── */}
        {mode === "write" && (
          <div className="flex flex-1 min-w-0 h-full overflow-hidden">
            {/* Center Rich Text Editor */}
            <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
              <ComponentErrorBoundary title="Editor Workspace Error">
                <CenterEditor
                  content={content}
                  onChange={handleContentChange}
                  chapterTitle={activeChapter?.title || title}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  citationStyle={citationStyle as any}
                  showPreview={showPreview}
                  onTogglePreview={() => setShowPreview((p) => !p)}
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
            </div>

            {/* Live 6x9 Book Render Split View */}
            {showPreview && (
              <div className="w-[440px] shrink-0 h-full border-l border-border bg-muted/20 overflow-hidden hidden lg:block">
                <ComponentErrorBoundary title="Live Document Preview Error">
                  <LiveDocumentPreview
                    content={content}
                    title={title}
                    projectType={projectType}
                  />
                </ComponentErrorBoundary>
              </div>
            )}

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
        )}

        {/* ── Mode 2: Format (Live Book Proof + Layout Metadata Panel) ── */}
        {mode === "format" && (
          <div className="flex flex-1 min-w-0 h-full overflow-hidden">
            {/* Main Proof Area */}
            <div className="flex-1 h-full overflow-y-auto bg-muted/30 p-6 flex flex-col justify-start items-center custom-scrollbar">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPreview3D(true)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    preview3D
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📖 অমর একুশে ৩ডি বই প্রিভিউ
                </button>
                <button
                  type="button"
                  onClick={() => setPreview3D(false)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    !preview3D
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📄 ২ডি প্রিন্ট প্রুফ শীট (৬×৯)
                </button>
              </div>

              <ComponentErrorBoundary title="Proof Rendering Error">
                {preview3D ? (
                  <div className="w-full max-w-2xl">
                    <BoiMela3DPageFlipPreview
                      book={{
                        titleBn: title || "অমর একুশে বই",
                        titleEn: project?.titleEn || title || "Amar Ekushey Book",
                        authorBn: project?.author || "লেখক",
                        authorEn: project?.authorEn || project?.author || "Author",
                        isbn: "978-984-95432-1-0",
                        chapters: [
                          {
                            id: "ch-1",
                            titleBn: title || "সূচনা পর্ব",
                            titleEn: "Introduction & Prelude",
                            content: [
                              content.slice(0, 450) || "বাংলা সাহিত্যের অমর একুশে গ্রন্থমেলা সংস্করণ...",
                              content.slice(450, 950) || "ক্লান্তিহীন পদধ্বনিতে রাতের নীরবতা ভেঙে যাচ্ছিল...",
                              content.slice(950, 1450) || "প্রতিটি পৃষ্ঠায় অমর একুশে বইমেলার ঐতিহ্য ও বাংলা মুদ্রণ শিল্পের গৌরব...",
                            ],
                          },
                        ],
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full text-xs font-mono text-muted-foreground shadow-xs">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      <span>6" × 9" Trade Hardcover Proof (300 DPI)</span>
                    </div>
                    <LiveDocumentPreview
                      content={content}
                      title={title}
                      projectType={projectType}
                      className="border border-border/80 shadow-2xl rounded-sm"
                    />
                  </div>
                )}
              </ComponentErrorBoundary>
            </div>

            {/* Format & Metadata Right Panel */}
            <div className="w-80 shrink-0 h-full border-l border-border bg-card overflow-hidden">
              <ComponentErrorBoundary title="Format Settings Error">
                <FormatRightPanelV2 />
              </ComponentErrorBoundary>
            </div>
          </div>
        )}

        {/* ── Mode 3: Publish (Export Engine) ── */}
        {mode === "publish" && (
          <div className="flex-1 h-full overflow-y-auto">
            <Suspense
              fallback={
                <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-3">
                  <Sparkles className="h-6 w-6 text-indigo-400 animate-spin" />
                  <span>Loading Publishing Engine…</span>
                </div>
              }
            >
              <PublishingPage
                content={content}
                title={title}
                onBack={() => setMode("write")}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Status Bar Footer */}
      <StatusBar wordCount={wordCount} />

      {/* Manuscript Import Modal */}
      <ManuscriptImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportManuscript}
      />
    </div>
  );
}

export default PolishedWriteView;
