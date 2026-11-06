/**
 * FAANG-Grade PolishedWriteView Orchestrator — Replit-Inspired Comfort Edition.
 *
 * Ergonomic Highlights:
 *  - Calm 44px Replit Context Bar with 4 Mode-Aware Pinned Tools + `✨ All 45+ InkOS Tools (Ctrl+Shift+P)` Dock.
 *  - Conversational InkOS Suggestions inside `RightPanel` AI Co-Writer chat + `/slash` commands + Ambient Co-Pilot Whispers.
 *  - Inline Selection Floating Pill in `CenterEditor` for zero-friction De-Slop, 5-Senses, Dialect, and Co-Writer queries.
 *  - Wide Writing Canvas by default (`showPreview = false` in Write mode) + Zen Focus Mode (`Ctrl+\`).
 */
import React, { useState, useCallback, useEffect, lazy, Suspense, useMemo } from "react";
import {
  FileDown,
  BookOpen,
  Sparkles,
  Columns3,
  Eye,
  Printer,
  Command,
  Maximize2,
  Minimize2,
  Users,
  Zap,
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
import { DialectTranspilerModal } from "./components/DialectTranspilerModal";
import { ShowrunnersTableModal } from "./components/ShowrunnersTableModal";
import { CharacterMessengerModal } from "./components/CharacterMessengerModal";
import { BetaReadersModal } from "./components/BetaReadersModal";
import { CharacterDuetModal } from "./components/CharacterDuetModal";
import { BlockCatalyzerModal } from "./components/BlockCatalyzerModal";
import { SensoryPaletteModal } from "./components/SensoryPaletteModal";
import { MfaWorkshopModal } from "./components/MfaWorkshopModal";
import { StreamerModeModal } from "./components/StreamerModeModal";
import { CognitiveFrictionModal } from "./components/CognitiveFrictionModal";
import { SurrealistDreamscapeModal } from "./components/SurrealistDreamscapeModal";
import { LoreWikiModal } from "./components/LoreWikiModal";
import { ChronoBraiderModal } from "./components/ChronoBraiderModal";
import { PlotDivergenceModal } from "./components/PlotDivergenceModal";
import { SpatialGpsModal } from "./components/SpatialGpsModal";
import { ItemLedgerModal } from "./components/ItemLedgerModal";
import { LivingEpilogueModal } from "./components/LivingEpilogueModal";
import { CulturalOriginalityModal } from "./components/CulturalOriginalityModal";
import { PrintPreflightModal } from "./components/PrintPreflightModal";
import { BookJacketModal } from "./components/BookJacketModal";
import { CipBarcodeModal } from "./components/CipBarcodeModal";
import { WebnovelPaywallModal } from "./components/WebnovelPaywallModal";
import { PolyglotMatrixModal } from "./components/PolyglotMatrixModal";
import { ReadingScalerModal } from "./components/ReadingScalerModal";
import { RoyaltySplitModal } from "./components/RoyaltySplitModal";
import { LegalShieldModal } from "./components/LegalShieldModal";
import { InkOsCommandDockModal } from "./components/InkOsCommandDockModal";
import { INKOS_TOOLS, type InkOsToolId } from "./config/inkos-tool-catalog";
import UpgradeModal from "@/components/subscription/UpgradeModal";
import { useSubscription } from "@/hooks/subscription/useSubscription";

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
  // Default showPreview to false in Write mode so CenterEditor gets +440px of comfortable width
  const [showPreview, setShowPreview] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isCommandDockOpen, setIsCommandDockOpen] = useState(false);
  const [externalChatPrompt, setExternalChatPrompt] = useState<string | null>(null);
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
  const [isDialectTranspilerModalOpen, setIsDialectTranspilerModalOpen] = useState(false);
  const [isShowrunnersModalOpen, setIsShowrunnersModalOpen] = useState(false);
  const [isCharacterMessengerModalOpen, setIsCharacterMessengerModalOpen] = useState(false);
  const [isBetaReadersModalOpen, setIsBetaReadersModalOpen] = useState(false);
  const [isCharacterDuetModalOpen, setIsCharacterDuetModalOpen] = useState(false);
  const [isBlockCatalyzerModalOpen, setIsBlockCatalyzerModalOpen] = useState(false);
  const [isSensoryPaletteModalOpen, setIsSensoryPaletteModalOpen] = useState(false);
  const [isMfaWorkshopModalOpen, setIsMfaWorkshopModalOpen] = useState(false);
  const [isStreamerModeModalOpen, setIsStreamerModeModalOpen] = useState(false);
  const [isCognitiveFrictionModalOpen, setIsCognitiveFrictionModalOpen] = useState(false);
  const [isSurrealistModalOpen, setIsSurrealistModalOpen] = useState(false);
  const [isLoreWikiModalOpen, setIsLoreWikiModalOpen] = useState(false);
  const [isChronoBraiderModalOpen, setIsChronoBraiderModalOpen] = useState(false);
  const [isPlotDivergenceModalOpen, setIsPlotDivergenceModalOpen] = useState(false);
  const [isSpatialGpsModalOpen, setIsSpatialGpsModalOpen] = useState(false);
  const [isItemLedgerModalOpen, setIsItemLedgerModalOpen] = useState(false);
  const [isLivingEpilogueModalOpen, setIsLivingEpilogueModalOpen] = useState(false);
  const [isCulturalOriginalityModalOpen, setIsCulturalOriginalityModalOpen] = useState(false);
  const [isPrintPreflightModalOpen, setIsPrintPreflightModalOpen] = useState(false);
  const [isBookJacketModalOpen, setIsBookJacketModalOpen] = useState(false);
  const [isCipBarcodeModalOpen, setIsCipBarcodeModalOpen] = useState(false);
  const [isWebnovelPaywallModalOpen, setIsWebnovelPaywallModalOpen] = useState(false);
  const [isPolyglotMatrixModalOpen, setIsPolyglotMatrixModalOpen] = useState(false);
  const [isReadingScalerModalOpen, setIsReadingScalerModalOpen] = useState(false);
  const [isRoyaltySplitModalOpen, setIsRoyaltySplitModalOpen] = useState(false);
  const [isLegalShieldModalOpen, setIsLegalShieldModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [studioCredits, setStudioCredits] = useState<number>(550);
  const subscription = useSubscription();

  useEffect(() => {
    let active = true;
    fetch("/api/v1/subscriptions/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const bal = json?.data?.creditsBalance ?? json?.creditsBalance;
        if (active && typeof bal === "number") {
          setStudioCredits(bal);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "B" || e.key === "b")) {
        e.preventDefault();
        setIsStoryBibleModalOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        setIsCommandDockOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Unified dispatcher for opening any of the 45+ InkOS tools from Chat, Inline Selection, Context Bar, or Command Dock
  const handleOpenInkOsTool = useCallback((toolId: InkOsToolId) => {
    switch (toolId) {
      case "story-bible": setIsStoryBibleModalOpen(true); break;
      case "deslop": setIsDeslopModalOpen(true); break;
      case "forecast": setIsForecastModalOpen(true); break;
      case "story-graph": setIsStoryGraphModalOpen(true); break;
      case "tabletop": setIsTabletopModalOpen(true); break;
      case "short-fiction": setIsShortFictionModalOpen(true); break;
      case "chekhov": setIsChekhovModalOpen(true); break;
      case "style-dna": setIsStyleDnaModalOpen(true); break;
      case "multiverse": setIsMultiverseModalOpen(true); break;
      case "autopilot": setIsAutopilotModalOpen(true); break;
      case "voice-casting": setIsVoiceCastingModalOpen(true); break;
      case "phoneme-tuner": setIsPhonemeModalOpen(true); break;
      case "soundscape": setIsSoundscapeModalOpen(true); break;
      case "booktok": setIsBookTokModalOpen(true); break;
      case "room-blocking": setIsRoomBlockingModalOpen(true); break;
      case "storyboard": setIsScriptStoryboardModalOpen(true); break;
      case "retention-radar": setIsRetentionRadarModalOpen(true); break;
      case "tension-ekg": setIsTensionEkgModalOpen(true); break;
      case "relations": setIsRelationshipGraphModalOpen(true); break;
      case "dialect-transpiler": setIsDialectTranspilerModalOpen(true); break;
      case "showrunners": setIsShowrunnersModalOpen(true); break;
      case "char-messenger": setIsCharacterMessengerModalOpen(true); break;
      case "beta-readers": setIsBetaReadersModalOpen(true); break;
      case "character-duet": setIsCharacterDuetModalOpen(true); break;
      case "block-catalyzer": setIsBlockCatalyzerModalOpen(true); break;
      case "sensory-palette": setIsSensoryPaletteModalOpen(true); break;
      case "mfa-workshop": setIsMfaWorkshopModalOpen(true); break;
      case "streamer-mode": setIsStreamerModeModalOpen(true); break;
      case "cognitive-friction": setIsCognitiveFrictionModalOpen(true); break;
      case "dreamscape": setIsSurrealistModalOpen(true); break;
      case "lore-wiki": setIsLoreWikiModalOpen(true); break;
      case "chrono-braider": setIsChronoBraiderModalOpen(true); break;
      case "plot-divergence": setIsPlotDivergenceModalOpen(true); break;
      case "spatial-gps": setIsSpatialGpsModalOpen(true); break;
      case "item-ledger": setIsItemLedgerModalOpen(true); break;
      case "living-epilogue": setIsLivingEpilogueModalOpen(true); break;
      case "folk-scorer": setIsCulturalOriginalityModalOpen(true); break;
      case "print-preflight": setIsPrintPreflightModalOpen(true); break;
      case "book-jacket": setIsBookJacketModalOpen(true); break;
      case "cip-barcode": setIsCipBarcodeModalOpen(true); break;
      case "webnovel-paywall": setIsWebnovelPaywallModalOpen(true); break;
      case "polyglot-matrix": setIsPolyglotMatrixModalOpen(true); break;
      case "reading-scaler": setIsReadingScalerModalOpen(true); break;
      case "royalty-split": setIsRoyaltySplitModalOpen(true); break;
      case "legal-shield": setIsLegalShieldModalOpen(true); break;
      case "bilingual-split": setIsBilingualModalOpen(true); break;
      case "branches": setIsBranchModalOpen(true); break;
      case "copyright": setIsCertificateModalOpen(true); break;
      case "podcast": setIsPodcastModalOpen(true); break;
      case "share": setIsShareModalOpen(true); break;
      case "upload": setIsResumableModalOpen(true); break;
      case "import-manuscript": setIsImportOpen(true); break;
    }
  }, []);

  // Pinned mode-aware tools (only 4 relevant tools shown in the top bar per mode!)
  const pinnedModeTools = useMemo(
    () => INKOS_TOOLS.filter((t) => t.pinnedInModes?.includes(mode)).slice(0, 4),
    [mode]
  );

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
    setContent,
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

  // If user switches to full 3-Fold 5-Mode Workspace (now synced with live content!)
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
        initialContent={content}
        onContentChange={handleContentChange}
        onBack={() => setIs3FoldMode(false)}
      />
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* ── Calm 44px Replit-Inspired Context Header ── */}
      <ComponentErrorBoundary title="Header Navigation Error">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-1.5 gap-2">
          <ModeSwitcherHeader
            projectName={title}
            currentMode={mode}
            onModeChange={setMode}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />

          {/* Center: Mode-Aware Pinned Tools (4 Context Pills) + ✨ All 45+ InkOS Tools Dock */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {pinnedModeTools.map((tool) => (
              <Button
                key={tool.id}
                size="sm"
                variant="outline"
                data-testid={`pinned-tool-${tool.id}`}
                onClick={() => handleOpenInkOsTool(tool.id)}
                className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-zinc-200 dark:border-zinc-800 hover:border-brand/50 hover:bg-brand/5 shrink-0 cursor-pointer"
                title={`${tool.title} (${tool.titleBn}) — ${tool.description}`}
              >
                <span>{tool.emoji}</span>
                <span>{tool.shortLabel}</span>
              </Button>
            ))}

            <Button
              size="sm"
              variant="outline"
              data-testid="button-open-inkos-dock"
              onClick={() => setIsCommandDockOpen(true)}
              className="h-7 px-3 text-xs font-bold gap-1.5 border-brand/40 bg-brand/10 text-brand hover:bg-brand/20 shrink-0 cursor-pointer"
              title="Browse & Search All 45+ InkOS Studio Tools (Ctrl+Shift+P)"
            >
              <Command className="h-3.5 w-3.5" />
              <span>✨ All 45 InkOS Tools</span>
              <kbd className="hidden md:inline text-[10px] font-mono opacity-75 px-1 bg-brand/15 rounded">
                ⌃⇧P
              </kbd>
            </Button>
          </div>

          {/* Right: Credits HUD, Presence, Share, Live Preview, 3-Fold IDE & Zen Mode */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              data-testid="button-studio-credit-hud"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="h-7 px-2.5 text-xs font-bold gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
              title="Universal Shothik Wallet · 0 Credits for Writing & Story Bible (#10), 1-3 Credits for AI/Audio/Print Checkpoints"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>⚡ {studioCredits} Credits</span>
            </Button>

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
              <span className="hidden xl:inline">Share</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              title="Import DOCX / Markdown / TXT Manuscript"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Import</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPreview((p) => !p)}
              className={`h-7 px-2 text-xs font-semibold gap-1 cursor-pointer ${
                showPreview
                  ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/40"
                  : "text-muted-foreground border-border"
              }`}
              title="Toggle Live 6x9 Book Render Split Screen"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">6×9 Proof</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIs3FoldMode(true)}
              className="h-7 px-2 text-xs font-semibold gap-1 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
              title="Open 3-Fold IDE with Fortune Sheet, Mindmap, and Slide Pitch"
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">3-Fold IDE</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              data-testid="button-zen-mode"
              onClick={() => setIsZenMode((z) => !z)}
              className={`h-7 px-2 text-xs font-semibold gap-1 cursor-pointer ${
                isZenMode
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                  : "text-muted-foreground border-border"
              }`}
              title="Toggle Zen Distraction-Free Writing Mode (Ctrl+\)"
            >
              {isZenMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden 2xl:inline">{isZenMode ? "Exit Zen" : "Zen"}</span>
            </Button>
          </div>
        </div>
      </ComponentErrorBoundary>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Sidebar Chapter Tree (Hidden in Publish or Zen Mode) */}
        {mode !== "publish" && !isZenMode && (
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

        {/* ── Mode 1: Write (Editor + Optional Live Split Preview + Conversational Co-Writer) ── */}
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
                  onOpenInkOsTool={(toolId) => handleOpenInkOsTool(toolId)}
                  onAskCoWriter={(promptText) => {
                    if (isZenMode) setIsZenMode(false);
                    setExternalChatPrompt(promptText);
                  }}
                  onOpenCommandDock={() => setIsCommandDockOpen(true)}
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

            {/* Live 6x9 Book Render Split View (Opt-in so Editor stays wide by default) */}
            {showPreview && !isZenMode && (
              <div className="w-[420px] shrink-0 h-full border-l border-border bg-muted/20 overflow-hidden hidden lg:block">
                <ComponentErrorBoundary title="Live Document Preview Error">
                  <LiveDocumentPreview
                    content={content}
                    title={title}
                    projectType={projectType}
                  />
                </ComponentErrorBoundary>
              </div>
            )}

            {/* Right Panel AI Auditor & Co-writer with Embedded InkOS Action Chips */}
            {!isZenMode && (
              <ComponentErrorBoundary title="Auditor Panel Error">
                <RightPanel
                  content={content}
                  projectId={project?._id || "default"}
                  projectTitle={title}
                  projectType={projectType}
                  onOpenInkOsTool={(toolId) => handleOpenInkOsTool(toolId)}
                  onInsertToEditor={(snippet) =>
                    handleContentChange(content ? `${content}\n\n<p>${snippet}</p>` : `<p>${snippet}</p>`)
                  }
                  externalChatPrompt={externalChatPrompt}
                  onClearExternalChatPrompt={() => setExternalChatPrompt(null)}
                />
              </ComponentErrorBoundary>
            )}
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

      {/* ✨ Categorized 5-Pillar InkOS Command Dock Modal (Ctrl+Shift+P) */}
      <InkOsCommandDockModal
        isOpen={isCommandDockOpen}
        onClose={() => setIsCommandDockOpen(false)}
        onSelectTool={(toolId) => handleOpenInkOsTool(toolId)}
        studioCredits={studioCredits}
      />

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
        onInsertProseToEditor={(prose) => setContent((prev) => (prev ? `${prev}\n\n${prose}` : prose))}
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
      <DialectTranspilerModal
        isOpen={isDialectTranspilerModalOpen}
        onClose={() => setIsDialectTranspilerModalOpen(false)}
        activeEditorText={content}
        onApplyToManuscript={(updated) => setContent(updated)}
        projectId={project?._id || project?.id || "default"}
      />
      <ShowrunnersTableModal
        isOpen={isShowrunnersModalOpen}
        onClose={() => setIsShowrunnersModalOpen(false)}
        activeEditorText={content}
        onApplyToManuscript={(updated) => setContent(content + updated)}
        projectId={project?._id || project?.id || "default"}
      />
      <CharacterMessengerModal
        isOpen={isCharacterMessengerModalOpen}
        onClose={() => setIsCharacterMessengerModalOpen(false)}
        activeEditorText={content}
        onApplyToManuscript={(updated) => setContent(content + updated)}
        projectId={project?._id || project?.id || "default"}
      />
      <BetaReadersModal
        isOpen={isBetaReadersModalOpen}
        onClose={() => setIsBetaReadersModalOpen(false)}
        activeEditorText={content}
        onApplyToManuscript={(updated) => setContent(updated)}
        projectId={project?._id || project?.id || "default"}
      />
      <CharacterDuetModal
        isOpen={isCharacterDuetModalOpen}
        onClose={() => setIsCharacterDuetModalOpen(false)}
        activeEditorText={content}
        onApplyToManuscript={(inserted) => setContent(content + "\n\n" + inserted)}
        projectId={project?._id || project?.id || "default"}
      />
      <BlockCatalyzerModal
        isOpen={isBlockCatalyzerModalOpen}
        onClose={() => setIsBlockCatalyzerModalOpen(false)}
        activeEditorText={content}
        onApplyToManuscript={(inserted) => setContent(content + "\n\n" + inserted)}
        projectId={project?._id || project?.id || "default"}
      />
      <SensoryPaletteModal
        isOpen={isSensoryPaletteModalOpen}
        onClose={() => setIsSensoryPaletteModalOpen(false)}
        activeEditorText={content}
        onApplyToManuscript={(inserted) => setContent(content + "\n\n" + inserted)}
        projectId={project?._id || project?.id || "default"}
      />
      <MfaWorkshopModal
        isOpen={isMfaWorkshopModalOpen}
        onClose={() => setIsMfaWorkshopModalOpen(false)}
        manuscriptText={content}
        onApplyRevision={(revised) => setContent(content + "\n\n" + revised)}
        projectId={project?._id || project?.id || "default"}
      />
      <StreamerModeModal
        isOpen={isStreamerModeModalOpen}
        onClose={() => setIsStreamerModeModalOpen(false)}
        manuscriptText={content}
        onApplyBranch={(branchText) => setContent(content + "\n\n" + branchText)}
        projectId={project?._id || project?.id || "default"}
      />
      <CognitiveFrictionModal
        isOpen={isCognitiveFrictionModalOpen}
        onClose={() => setIsCognitiveFrictionModalOpen(false)}
        manuscriptText={content}
        onApplyRevision={(revised) => setContent(revised)}
        projectId={project?._id || project?.id || "default"}
      />
      <SurrealistDreamscapeModal
        isOpen={isSurrealistModalOpen}
        onClose={() => setIsSurrealistModalOpen(false)}
        manuscriptText={content}
        onApplyProse={(prose) => setContent(content + "\n\n" + prose)}
        projectId={project?._id || project?.id || "default"}
      />
      <LoreWikiModal
        isOpen={isLoreWikiModalOpen}
        onClose={() => setIsLoreWikiModalOpen(false)}
        manuscriptText={content}
        onInsertLore={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <ChronoBraiderModal
        isOpen={isChronoBraiderModalOpen}
        onClose={() => setIsChronoBraiderModalOpen(false)}
        manuscriptText={content}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <PlotDivergenceModal
        isOpen={isPlotDivergenceModalOpen}
        onClose={() => setIsPlotDivergenceModalOpen(false)}
        manuscriptText={content}
        onApplyDivergence={(prose) => setContent(content + prose)}
        projectId={project?._id || project?.id || "default"}
      />
      <SpatialGpsModal
        isOpen={isSpatialGpsModalOpen}
        onClose={() => setIsSpatialGpsModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <ItemLedgerModal
        isOpen={isItemLedgerModalOpen}
        onClose={() => setIsItemLedgerModalOpen(false)}
        manuscriptText={content}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <LivingEpilogueModal
        isOpen={isLivingEpilogueModalOpen}
        onClose={() => setIsLivingEpilogueModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <CulturalOriginalityModal
        isOpen={isCulturalOriginalityModalOpen}
        onClose={() => setIsCulturalOriginalityModalOpen(false)}
        manuscriptText={content}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <PrintPreflightModal
        isOpen={isPrintPreflightModalOpen}
        onClose={() => setIsPrintPreflightModalOpen(false)}
        manuscriptText={content}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <BookJacketModal
        isOpen={isBookJacketModalOpen}
        onClose={() => setIsBookJacketModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <CipBarcodeModal
        isOpen={isCipBarcodeModalOpen}
        onClose={() => setIsCipBarcodeModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <WebnovelPaywallModal
        isOpen={isWebnovelPaywallModalOpen}
        onClose={() => setIsWebnovelPaywallModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <PolyglotMatrixModal
        isOpen={isPolyglotMatrixModalOpen}
        onClose={() => setIsPolyglotMatrixModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <ReadingScalerModal
        isOpen={isReadingScalerModalOpen}
        onClose={() => setIsReadingScalerModalOpen(false)}
        onInsertProse={(snippet) => setContent(snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <RoyaltySplitModal
        isOpen={isRoyaltySplitModalOpen}
        onClose={() => setIsRoyaltySplitModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <LegalShieldModal
        isOpen={isLegalShieldModalOpen}
        onClose={() => setIsLegalShieldModalOpen(false)}
        onInsertProse={(snippet) => setContent(content + snippet)}
        projectId={project?._id || project?.id || "default"}
      />
      <UpgradeModal
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        currentTier={subscription.tier}
      />
    </div>
  );
}

export default PolishedWriteView;
