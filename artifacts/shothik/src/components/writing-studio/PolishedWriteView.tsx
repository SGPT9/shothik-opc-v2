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
  Printer,
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
import { NilkhetOrderModal } from "@/components/books/NilkhetOrderModal";
import { Button } from "@/components/ui/button";
import { CollaborativePresence } from "./CollaborativePresence";
import { RoomShareModal } from "./components/RoomShareModal";
import { PlotBranchModal } from "./components/PlotBranchModal";
import { AuthorshipCertificateModal } from "./components/AuthorshipCertificateModal";
import { PodcastAudioModal } from "./components/PodcastAudioModal";
import { ResumableUploadModal } from "./components/ResumableUploadModal";
import { BilingualSplitModal } from "./components/BilingualSplitModal";
import { NarrativeForecastModal } from "./components/NarrativeForecastModal";
import { InteractiveStoryGraphModal } from "./components/InteractiveStoryGraphModal";
import { SemanticDeslopModal } from "./components/SemanticDeslopModal";
import { DirectorsTabletopModal } from "./components/DirectorsTabletopModal";
import { ShortFictionPackageModal } from "./components/ShortFictionPackageModal";
import { ChekhovGunModal } from "./components/ChekhovGunModal";
import { LiteraryStyleDnaModal } from "./components/LiteraryStyleDnaModal";
import { MultiverseSandboxModal } from "./components/MultiverseSandboxModal";
import { AutopilotDaemonModal } from "./components/AutopilotDaemonModal";
import { StoryBibleHudModal } from "./components/StoryBibleHudModal";
import { VoiceCastingModal } from "./components/VoiceCastingModal";
import { PhonemeTunerModal } from "./components/PhonemeTunerModal";
import { BinauralSoundscapeModal } from "./components/BinauralSoundscapeModal";
import { BookTokTeaserModal } from "./components/BookTokTeaserModal";
import { RoomBlockingModal } from "./components/RoomBlockingModal";
import { ScriptStoryboardModal } from "./components/ScriptStoryboardModal";
import { RetentionRadarModal } from "./components/RetentionRadarModal";
import { TensionEkgModal } from "./components/TensionEkgModal";
import { RelationshipGraphModal } from "./components/RelationshipGraphModal";
import { Users, GitBranch, Award, Radio, UploadCloud, Languages, Compass, Network, Clapperboard, BookCopy, Crosshair, Fingerprint, GitFork, Moon, BookMarked, Mic, SpellCheck, Headphones, Grid, Film, TrendingUp, Activity } from "lucide-react";

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
  const [isNilkhetModalOpen, setIsNilkhetModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);
  const [isResumableModalOpen, setIsResumableModalOpen] = useState(false);
  const [isBilingualModalOpen, setIsBilingualModalOpen] = useState(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [isStoryGraphModalOpen, setIsStoryGraphModalOpen] = useState(false);
  const [isDeslopModalOpen, setIsDeslopModalOpen] = useState(false);
  const [isTabletopModalOpen, setIsTabletopModalOpen] = useState(false);
  const [isShortFictionModalOpen, setIsShortFictionModalOpen] = useState(false);
  const [isChekhovModalOpen, setIsChekhovModalOpen] = useState(false);
  const [isStyleDnaModalOpen, setIsStyleDnaModalOpen] = useState(false);
  const [isMultiverseModalOpen, setIsMultiverseModalOpen] = useState(false);
  const [isAutopilotModalOpen, setIsAutopilotModalOpen] = useState(false);
  const [isStoryBibleModalOpen, setIsStoryBibleModalOpen] = useState(false);
  const [isVoiceCastingModalOpen, setIsVoiceCastingModalOpen] = useState(false);
  const [isPhonemeModalOpen, setIsPhonemeModalOpen] = useState(false);
  const [isSoundscapeModalOpen, setIsSoundscapeModalOpen] = useState(false);
  const [isBookTokModalOpen, setIsBookTokModalOpen] = useState(false);
  const [isRoomBlockingModalOpen, setIsRoomBlockingModalOpen] = useState(false);
  const [isScriptStoryboardModalOpen, setIsScriptStoryboardModalOpen] = useState(false);
  const [isRetentionRadarModalOpen, setIsRetentionRadarModalOpen] = useState(false);
  const [isTensionEkgModalOpen, setIsTensionEkgModalOpen] = useState(false);
  const [isRelationshipGraphModalOpen, setIsRelationshipGraphModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "B" || e.key === "b")) {
        e.preventDefault();
        setIsStoryBibleModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          <div className="flex items-center gap-1.5 flex-wrap">
            <CollaborativePresence
              bookId={project?._id || project?.id || "default"}
              currentChapterTitle={activeChapter?.title}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsShareModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
              title="Share Room with Live Presence & Passcode"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBranchModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
              title="Git for Writers: Plot Branching & Alternative Endings"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Branches</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCertificateModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              title="Cryptographic Proof of Authorship Certificate"
            >
              <Award className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copyright</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPodcastModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              title="Audiobook Podcast RSS Feed & Waveform Player"
            >
              <Radio className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Podcast</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsResumableModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
              title="TUS Resumable Upload for Large Audio & Thesis PDFs"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBilingualModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-teal-500/30 text-teal-400 hover:bg-teal-500/10 cursor-pointer"
              title="Synchronized Dual-Language Split Screen (Bengali & English)"
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bilingual</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsForecastModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-purple-500/40 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
              title="Multi-Branch Narrative Forecast Engine (InkOS 3-Trajectory Simulation)"
            >
              <Compass className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Forecast</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsStoryGraphModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
              title="Interactive Story Graph & Gamebook Studio (Inkle .ink + HTML)"
            >
              <Network className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Story Graph</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeslopModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              title="Semantic Prose De-Slopper (7-Point AI Tropes & Cliché Cleaner)"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">De-Slop</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTabletopModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-red-500/40 text-red-400 hover:bg-red-500/10 cursor-pointer"
              title="Live Director's Tabletop Scene Simulator (InkOS Play)"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tabletop Play</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsShortFictionModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
              title="Automated Commercial Short-Fiction Package Studio (12-Chapter Generator & Sales Pitch)"
            >
              <BookCopy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Short Fiction</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsChekhovModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-orange-500/40 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
              title="Chekhov’s Gun & Plot Foreshadowing Lifecycle Tracker (4-Stage State Machine)"
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chekhov's Gun</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsStyleDnaModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-purple-500/40 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
              title="Literary Style DNA & Author Voice Fingerprint (Cadence, Lexicon & Voice Lock)"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Style DNA</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMultiverseModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
              title="What-If? Multi-Verse & Canon Sandbox (AU, OOC & Relationship Branches)"
            >
              <GitFork className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Multi-Verse</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAutopilotModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
              title="Autopilot Chapter Daemon & Mobile Push Dispatch (Overnight Checks & Telegram Approval Cards)"
            >
              <Moon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Autopilot</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsStoryBibleModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              title="Sub-Millisecond Offline Story Bible HUD (Ctrl+Shift+B: Instant Character, Location & Lore Reference)"
            >
              <BookMarked className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Story Bible</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsVoiceCastingModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
              title="Multi-Cast Voice Casting & Dialect Director (Local 24kHz Neural Voice AI Engine :8001)"
            >
              <Mic className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voice Casting</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPhonemeModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-pink-500/40 text-pink-400 hover:bg-pink-500/10 cursor-pointer"
              title="Custom Phoneme & Diacritic Pronunciation Tuner (IPA, SSML & Syllabification Engine)"
            >
              <SpellCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Phoneme Tuner</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSoundscapeModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-teal-500/40 text-teal-400 hover:bg-teal-500/10 cursor-pointer"
              title="Immersive 3D Binaural Soundscape & Audio Foley Engine (HRTF Spatial Rain, River, Traffic & Nature)"
            >
              <Headphones className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">3D Soundscape</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBookTokModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              title="2D Talking-Head Lip-Sync Video & BookTok Teaser Generator (9:16 Vertical Reel & Viseme Sync)"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">BookTok Teaser</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRoomBlockingModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              title="3D Spatial Room Blocking & Line-of-Sight Canvas (Raycast Sightlines & Physical Staging Audit)"
            >
              <Grid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Room Blocking</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsScriptStoryboardModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              title="Novel-to-Screenplay & Comic Storyboard Transmuter (Fountain Script & 6-Panel Comic Layouts)"
            >
              <Film className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Script / Comic</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRetentionRadarModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              title="Market Trend & Reader Retention Radar (Cliffhanger Pacing & Commercial Trope Momentum)"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Retention Radar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTensionEkgModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              title="Narrative Tension Heartbeat & Pacing Velocity EKG (Oscilloscope Waveform & Conflict Velocity)"
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tension EKG</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRelationshipGraphModalOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
              title="Dynamic Character Relationship & Social Topology Graph (Trust, Rivalry & Betrayal Vectors)"
            >
              <Network className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Relations</span>
            </Button>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsNilkhetModalOpen(true)}
                  className="px-3 py-1 h-7 rounded-full text-xs font-semibold border-brand/40 text-brand hover:bg-brand/10 gap-1"
                >
                  <Printer className="h-3 w-3" />
                  <span>নীলক্ষেত প্রিন্ট কোটেশন</span>
                </Button>
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

      {/* 🚀 Income Enablement: Nilkhet Print-on-Demand & BoiMela 3D Bridge */}
      {wordCount >= 2500 && mode === "write" && (
        <div className="mx-4 my-2 p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>Manuscript Print-Ready ({wordCount.toLocaleString()} words)</span>
                <span className="text-[10px] font-mono font-normal text-muted-foreground">
                  ~{Math.max(48, Math.ceil(wordCount / 250))} pages (6×9 Royal Demy)
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Your manuscript is print-ready. View 3D Book Flip Preview and calculate Nilkhet Print-on-Demand cost.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMode("format");
                setPreview3D(true);
              }}
              className="h-8 text-xs gap-1.5 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>3D Flip Preview</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNilkhetModalOpen(true)}
              className="h-8 text-xs gap-1.5 bg-brand hover:bg-brand/90 text-white font-semibold shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Nilkhet Print Quote</span>
            </Button>
          </div>
        </div>
      )}

      {/* Status Bar Footer */}
      <StatusBar wordCount={wordCount} />

      {/* Manuscript Import Modal */}
      <ManuscriptImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportManuscript}
      />

      {/* Nilkhet Print-on-Demand Modal */}
      <NilkhetOrderModal
        open={isNilkhetModalOpen}
        onOpenChange={setIsNilkhetModalOpen}
        bookTitle={title}
        pageCount={Math.max(48, Math.ceil(wordCount / 250))}
        authorName={project?.author || "Shothik Author"}
      />

      {/* Supabase DeepTech Modals */}
      <RoomShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
      />
      <PlotBranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        projectId={project?._id || project?.id || "default"} 
        projectTitle={title}
        onMergeComplete={(merged) => {
          setContent(merged);
        }}
      />
      <AuthorshipCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        authorName={project?.author || "Tareq Masud"}
      />
      <PodcastAudioModal
        isOpen={isPodcastModalOpen}
        onClose={() => setIsPodcastModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        chapters={chapters}
      />
      <ResumableUploadModal
        isOpen={isResumableModalOpen}
        onClose={() => setIsResumableModalOpen(false)}
        bucket="academic-manuscripts"
      />
      <BilingualSplitModal
        isOpen={isBilingualModalOpen}
        onClose={() => setIsBilingualModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        initialContent={content}
      />
      <NarrativeForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
      />
      <InteractiveStoryGraphModal
        isOpen={isStoryGraphModalOpen}
        onClose={() => setIsStoryGraphModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
      />
      <SemanticDeslopModal
        isOpen={isDeslopModalOpen}
        onClose={() => setIsDeslopModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentContent={content}
        onApplyRevision={(newContent) => setContent(newContent)}
      />
      <DirectorsTabletopModal
        isOpen={isTabletopModalOpen}
        onClose={() => setIsTabletopModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        onInsertProseToEditor={(prose) => setContent((prev) => (prev ? `${prev}\n\n${prose}` : prose))}
      />
      <ShortFictionPackageModal
        isOpen={isShortFictionModalOpen}
        onClose={() => setIsShortFictionModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        onApplyChapters={(newChapters) => {
          setChapters(newChapters as any);
          if (newChapters.length > 0 && newChapters[0].content) {
            setContent(newChapters.map((c) => `## ${c.title}\n\n${c.content}`).join("\n\n---\n\n"));
          }
        }}
      />
      <ChekhovGunModal
        isOpen={isChekhovModalOpen}
        onClose={() => setIsChekhovModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
      />
      <LiteraryStyleDnaModal
        isOpen={isStyleDnaModalOpen}
        onClose={() => setIsStyleDnaModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        currentManuscriptText={content}
        onApplyContinuation={(prose) => setContent((prev) => (prev ? `${prev}\n\n${prose}` : prose))}
      />
      <MultiverseSandboxModal
        isOpen={isMultiverseModalOpen}
        onClose={() => setIsMultiverseModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        onInsertScene={(prose) => setContent((prev) => (prev ? `${prev}\n\n${prose}` : prose))}
      />
      <AutopilotDaemonModal
        isOpen={isAutopilotModalOpen}
        onClose={() => setIsAutopilotModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        onApplyFixToManuscript={(before, after) => {
          setContent((prev) => (prev ? prev.replace(before, after) : after));
        }}
      />
      <StoryBibleHudModal
        isOpen={isStoryBibleModalOpen}
        onClose={() => setIsStoryBibleModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        onInsertProseToEditor={(prose) => setContent((prev) => (prev ? `${prev}

${prose}` : prose))}
      />
      <VoiceCastingModal
        isOpen={isVoiceCastingModalOpen}
        onClose={() => setIsVoiceCastingModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
      <PhonemeTunerModal
        isOpen={isPhonemeModalOpen}
        onClose={() => setIsPhonemeModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
      <BinauralSoundscapeModal
        isOpen={isSoundscapeModalOpen}
        onClose={() => setIsSoundscapeModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
      <BookTokTeaserModal
        isOpen={isBookTokModalOpen}
        onClose={() => setIsBookTokModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
      <RoomBlockingModal
        isOpen={isRoomBlockingModalOpen}
        onClose={() => setIsRoomBlockingModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
      <ScriptStoryboardModal
        isOpen={isScriptStoryboardModalOpen}
        onClose={() => setIsScriptStoryboardModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        currentManuscriptText={content}
        onInsertToManuscript={(insertedScript) => {
          setContent((prev) => prev + "\n\n" + insertedScript);
        }}
      />
      <RetentionRadarModal
        isOpen={isRetentionRadarModalOpen}
        onClose={() => setIsRetentionRadarModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
      <TensionEkgModal
        isOpen={isTensionEkgModalOpen}
        onClose={() => setIsTensionEkgModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
      <RelationshipGraphModal
        isOpen={isRelationshipGraphModalOpen}
        onClose={() => setIsRelationshipGraphModalOpen(false)}
        projectId={project?._id || project?.id || "default"}
        projectTitle={title}
        currentManuscriptText={content}
      />
    </div>
  );
}

export default PolishedWriteView;
