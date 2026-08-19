"use client";

import { useState, useEffect } from "react";
import { X, Presentation, Table2, BookOpen, Code2, History, Terminal, Network, FileText, Wand2, Globe, Clock, Truck, Users, Sparkles, Maximize2, Minimize2, Copy, Check, BatteryCharging, ShieldCheck, ChevronDown } from "lucide-react";
import { SlidesArtifact }       from "@/components/chat/artifacts/SlidesArtifact";
import { SheetArtifact }        from "@/components/chat/artifacts/SheetArtifact";
import { DeepResearchArtifact } from "@/components/chat/artifacts/DeepResearchArtifact";
import { CodeArtifact }         from "@/components/chat/artifacts/CodeArtifact";
import { ApprovalsArtifact }    from "@/components/chat/artifacts/ApprovalsArtifact";
import { DiagramArtifact }      from "@/components/chat/artifacts/DiagramArtifact";
import { DocArtifact }          from "@/components/chat/artifacts/DocArtifact";
import { PonytailSynthesizerCard } from "@/components/canvas/PonytailSynthesizerCard";
import { ReplitTerminalConsole } from "@/components/chat/ReplitTerminalConsole";
import { BoiMela3DPageFlipPreview } from "@/components/books/BoiMela3DPageFlipPreview";
import { CommerceActionCard } from "@/components/chat/CommerceActionCard";
import { ParallelAgentSpace } from "@/components/chat/ParallelAgentSpace";
import { FCommerceBlueprints } from "@/components/commerce/FCommerceBlueprints";
import { CommunityArtifact } from "@/components/chat/artifacts/CommunityArtifact";
import { MultiAgentSwarmFlow } from "@/components/chat/artifacts/MultiAgentSwarmFlow";
import { CareerStudioArtifact } from "@/components/chat/artifacts/CareerStudioArtifact";
import { WhatsAppOrderSimulator } from "@/components/chat/artifacts/WhatsAppOrderSimulator";
import { VoicePitchToDeck } from "@/components/chat/artifacts/VoicePitchToDeck";
import { PromptLabArtifact } from "@/components/chat/artifacts/PromptLabArtifact";
import { LegalContractArtifact } from "@/components/chat/artifacts/LegalContractArtifact";
import { ModelArenaArtifact } from "@/components/chat/artifacts/ModelArenaArtifact";
import { TwinArtifact } from "@/components/chat/artifacts/TwinArtifact";
import { LeadScraperArtifact } from "@/components/chat/artifacts/LeadScraperArtifact";
import { SeoContentArtifact } from "@/components/chat/artifacts/SeoContentArtifact";
import { ChatbotFlowArtifact } from "@/components/chat/artifacts/ChatbotFlowArtifact";
import { VideoScriptArtifact } from "@/components/chat/artifacts/VideoScriptArtifact";
import { VatTaxArtifact } from "@/components/chat/artifacts/VatTaxArtifact";
import { ProductPhotoArtifact } from "@/components/chat/artifacts/ProductPhotoArtifact";
import { SupplyChainArtifact } from "@/components/chat/artifacts/SupplyChainArtifact";
import { VoiceDubbingArtifact } from "@/components/chat/artifacts/VoiceDubbingArtifact";
import { BroadcastCampaignArtifact } from "@/components/chat/artifacts/BroadcastCampaignArtifact";
import { DisputeResolutionArtifact } from "@/components/chat/artifacts/DisputeResolutionArtifact";
import { PriceWatcherArtifact } from "@/components/chat/artifacts/PriceWatcherArtifact";
import { OvernightReconciliationArtifact } from "@/components/chat/artifacts/OvernightReconciliationArtifact";
import { WebGpuEngineArtifact } from "@/components/chat/artifacts/WebGpuEngineArtifact";
import { MarketingGrowthArtifact } from "@/components/chat/artifacts/MarketingGrowthArtifact";
import { Briefcase, MessageSquare, Mic, Scale, Swords, Bot, Target, GitFork, Clapperboard, Calculator, Camera, Boxes, Radio, SendHorizontal, ShieldAlert, TrendingDown, Moon, Zap, TrendingUp } from "lucide-react";
import { useCanvasRealtimeSync } from "@/hooks/useCanvasRealtimeSync";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArtifactTab = "slides" | "approvals" | "boimela" | "commerce" | "overnight" | "webgpu" | "marketing" | "whatsapp" | "career" | "voicepitch" | "promptlab" | "legal" | "arena" | "twin" | "leads" | "seo" | "flows" | "video" | "vattax" | "photo" | "inventory" | "dubbing" | "broadcast" | "disputes" | "pricewatcher" | "swarm" | "synthesizer" | "sheet" | "research" | "code" | "diagram" | "doc" | "community" | "sources" | "history";

interface TabConfig {
  id: ArtifactTab;
  label: string;
  Icon: React.ElementType;
  color: string;
}

const TABS: TabConfig[] = [
  { id: "approvals",   label: "Approvals",           Icon: ShieldCheck,  color: "text-emerald-400"},
  { id: "overnight",   label: "Overnight Routine",   Icon: Moon,         color: "text-indigo-400" },
  { id: "webgpu",      label: "WebGPU Local AI",     Icon: Zap,          color: "text-emerald-400"},
  { id: "marketing",   label: "Marketing & CRO",     Icon: TrendingUp,   color: "text-pink-400"   },
  { id: "slides",      label: "Slides",              Icon: Presentation, color: "text-indigo-400" },
  { id: "boimela",     label: "বইমেলা 3D",           Icon: Sparkles,     color: "text-rose-400"   },
  { id: "commerce",    label: "Commerce & MFS",      Icon: Truck,        color: "text-emerald-400"},
  { id: "whatsapp",    label: "WhatsApp Bot",        Icon: MessageSquare, color: "text-emerald-400"},
  { id: "career",      label: "Career & CV",         Icon: Briefcase,    color: "text-indigo-400" },
  { id: "voicepitch",  label: "Voice Pitch",         Icon: Mic,          color: "text-purple-400" },
  { id: "promptlab",   label: "Prompt Lab",          Icon: Terminal,     color: "text-cyan-400"   },
  { id: "legal",       label: "Legal & Stamp",       Icon: Scale,        color: "text-amber-400"  },
  { id: "arena",       label: "Model Arena",         Icon: Swords,       color: "text-purple-400" },
  { id: "twin",        label: "Twin Founder",        Icon: Bot,          color: "text-violet-400" },
  { id: "leads",       label: "B2B Leads",           Icon: Target,       color: "text-teal-400"   },
  { id: "seo",         label: "SEO & SERP",          Icon: Globe,        color: "text-blue-400"   },
  { id: "flows",       label: "Chatbot Flows",       Icon: GitFork,      color: "text-emerald-400"},
  { id: "video",       label: "Video Scripts",       Icon: Clapperboard, color: "text-pink-400"   },
  { id: "vattax",      label: "NBR VAT & Tax",       Icon: Calculator,   color: "text-emerald-400"},
  { id: "photo",       label: "Product Studio",      Icon: Camera,       color: "text-cyan-400"   },
  { id: "inventory",   label: "Inventory & ROP",     Icon: Boxes,        color: "text-amber-400"  },
  { id: "dubbing",     label: "Voice Dubbing",       Icon: Radio,        color: "text-purple-400" },
  { id: "broadcast",   label: "Broadcast Hub",       Icon: SendHorizontal, color: "text-emerald-400"},
  { id: "disputes",    label: "Dispute & Refund",    Icon: ShieldAlert,  color: "text-rose-400"   },
  { id: "pricewatcher", label: "Price Watcher",      Icon: TrendingDown, color: "text-blue-400"   },
  { id: "community",   label: "Community",           Icon: Users,        color: "text-brand"      },
  { id: "swarm",       label: "Swarm Fleet",         Icon: Users,        color: "text-purple-400" },
  { id: "synthesizer", label: "Venture Synthesizer", Icon: Wand2,        color: "text-purple-400" },
  { id: "sheet",       label: "Sheet",               Icon: Table2,       color: "text-cyan-400"   },
  { id: "research",    label: "Research",            Icon: BookOpen,     color: "text-violet-400" },
  { id: "code",        label: "Python REPL",         Icon: Code2,        color: "text-emerald-400"},
  { id: "diagram",     label: "Diagram",             Icon: Network,      color: "text-sky-400"    },
  { id: "doc",         label: "Doc",                 Icon: FileText,     color: "text-amber-400"  },
  { id: "sources",     label: "Sources",             Icon: Globe,        color: "text-blue-400"   },
  { id: "history",     label: "History",             Icon: Clock,        color: "text-orange-400" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtifactPanelProps {
  activeTab: ArtifactTab | null;
  onTabChange: (tab: ArtifactTab) => void;
  onClose: () => void;
  isStreaming?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;

  // Handoff: pre-populate from chat context
  slidesTopic?: string;
  researchQuery?: string;
  sheetData?: string[][];
  codeSnippet?: string;
  codeLanguage?: string;
  codeFilename?: string;

  // Document Canvas Handoff Props
  docTitle?: string;
  docContent?: string;
  docPage?: number;
  docBbox?: [number, number, number, number];
  docSourceRef?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArtifactPanel({
  activeTab,
  onTabChange,
  onClose,
  isStreaming,
  isMaximized = false,
  onToggleMaximize,
  slidesTopic,
  researchQuery,
  sheetData,
  codeSnippet,
  codeLanguage,
  codeFilename,
  docTitle,
  docContent,
  docPage,
  docBbox,
  docSourceRef,
}: ArtifactPanelProps) {
  // Version History State (Pillar 5)
  const [selectedVersion, setSelectedVersion] = useState<string>("v3");
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [internalMaximized, setInternalMaximized] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const effectiveMaximized = onToggleMaximize ? isMaximized : internalMaximized;

  // Global Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopyContent = () => {
    let contentToCopy = "";
    if (activeTab === "code") contentToCopy = codeSnippet || "";
    else if (activeTab === "slides") contentToCopy = slidesTopic || "";
    else if (activeTab === "sheet") contentToCopy = sheetData ? sheetData.map((r) => r.join("\t")).join("\n") : "";
    else if (activeTab === "research") contentToCopy = researchQuery || "";
    else if (activeTab === "doc") contentToCopy = docContent || docTitle || "";
    else contentToCopy = activeTab || "";

    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Lazy-mount state
  const [mounted, setMounted] = useState<Set<ArtifactTab>>(() => 
    activeTab ? new Set([activeTab]) : new Set()
  );

  const { broadcastCanvasEvent } = useCanvasRealtimeSync({
    workspaceId: "default-workspace",
    onSyncEvent: (event) => {
      if (event.type === "ACTIVE_TAB_CHANGED" && event.payload?.tab) {
        const newTab = event.payload.tab as ArtifactTab;
        setMounted((prev) => new Set([...prev, newTab]));
        onTabChange(newTab);
      }
    },
  });

  useEffect(() => {
    if (activeTab) {
      setMounted((prev) => new Set([...prev, activeTab]));
    }
  }, [activeTab]);

  const handleTabChange = (tab: ArtifactTab) => {
    setMounted((prev) => new Set([...prev, tab]));
    onTabChange(tab);
    broadcastCanvasEvent("ACTIVE_TAB_CHANGED", { tab });
  };

  if (!activeTab) return null;

  // Only show tabs that have content OR are the currently active tab (per DeepSeek-close spec)
  const tabsWithContent = new Set<ArtifactTab>([activeTab]);
  // Core work studio tabs readily accessible
  tabsWithContent.add("approvals");
  tabsWithContent.add("slides");
  tabsWithContent.add("community");
  tabsWithContent.add("commerce");
  tabsWithContent.add("whatsapp");
  tabsWithContent.add("career");
  tabsWithContent.add("voicepitch");
  tabsWithContent.add("promptlab");
  tabsWithContent.add("legal");
  tabsWithContent.add("arena");
  tabsWithContent.add("twin");
  tabsWithContent.add("leads");
  tabsWithContent.add("seo");
  tabsWithContent.add("flows");
  tabsWithContent.add("video");
  tabsWithContent.add("vattax");
  tabsWithContent.add("photo");
  tabsWithContent.add("inventory");
  tabsWithContent.add("dubbing");
  tabsWithContent.add("broadcast");
  tabsWithContent.add("disputes");
  tabsWithContent.add("pricewatcher");
  tabsWithContent.add("swarm");
  tabsWithContent.add("boimela");
  tabsWithContent.add("synthesizer");
  tabsWithContent.add("sheet");
  tabsWithContent.add("research");
  tabsWithContent.add("code");
  tabsWithContent.add("diagram");
  tabsWithContent.add("doc");
  // Sources and History always show when panel is open — they provide contextual depth
  tabsWithContent.add("sources");
  tabsWithContent.add("history");
  // Also show any previously mounted tabs
  mounted.forEach((tab) => tabsWithContent.add(tab));

  const visibleTabs = TABS.filter(({ id }) => tabsWithContent.has(id));

  return (
    <div className="fixed inset-x-0 bottom-0 top-12 z-50 md:relative md:top-0 md:inset-auto md:z-0 flex flex-col h-[calc(100vh-3rem)] md:h-full border-t md:border-t-0 md:border-l border-border/60 bg-background w-full shrink-0 rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none animate-in slide-in-from-bottom-6 md:slide-in-from-right-4 duration-300">

      {/* Mobile Top Grabber Bar */}
      <div className="md:hidden flex flex-col items-center justify-center pt-2 pb-1 bg-muted/40 rounded-t-3xl border-b border-border/30">
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mb-1" />
        <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Swipe down or tap close</span>
      </div>

      {/* ── Clean Single-Artifact Header & Switcher (DeepSeek Minimalist Standard) ── */}
      <div className="flex items-center justify-between shrink-0 border-b border-border/60 bg-muted/20 px-3 py-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {(() => {
            const currentTab = TABS.find((t) => t.id === activeTab) || TABS[4];
            const TabIcon = currentTab.Icon;
            return (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-background border border-border/70 shadow-xs">
                <TabIcon className={`h-3.5 w-3.5 shrink-0 ${currentTab.color}`} />
                <span className="text-xs font-bold text-foreground truncate">{currentTab.label}</span>
              </div>
            );
          })()}

          {/* Clean Progressive Disclosure Dropdown */}
          <div className="relative flex items-center">
            <select
              value={activeTab || "slides"}
              onChange={(e) => handleTabChange(e.target.value as ArtifactTab)}
              className="h-7 pl-2 pr-6 rounded-lg text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 transition cursor-pointer appearance-none"
              aria-label="Switch Artifact Canvas"
            >
              <option value="slides">📽️ Slides</option>
              <option value="sheet">📊 Financial Sheet</option>
              <option value="research">🔬 Deep Research</option>
              <option value="code">💻 Code Engine</option>
              <option value="doc">📄 Document</option>
              <option value="boimela">📖 বইমেলা 3D</option>
              <option value="marketing">🚀 Marketing Studio</option>
              <option value="commerce">📦 Commerce & MFS</option>
            </select>
            <ChevronDown className="h-3 w-3 text-muted-foreground absolute right-1.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {/* 1-Click Copy Raw Content */}
          <button
            type="button"
            onClick={handleCopyContent}
            aria-label="Copy artifact content"
            className="flex shrink-0 items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
            title={copied ? "Copied to clipboard!" : "Copy raw artifact content"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Version dropdown */}
          <div className="relative flex items-center">
            <History className="h-3 w-3 text-muted-foreground absolute left-1.5 pointer-events-none" />
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              aria-label="Select artifact version"
              className="h-7 pl-5 pr-2 rounded-lg text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 transition cursor-pointer appearance-none"
            >
              <option value="v3">v3 (Current)</option>
              <option value="v2">v2 (-15m)</option>
              <option value="v1">v1 (Initial)</option>
            </select>
          </div>

          {/* Maximize / Minimize Full-Width Toggle */}
          <button
            type="button"
            onClick={() => {
              if (onToggleMaximize) onToggleMaximize();
              else setInternalMaximized((m) => !m);
            }}
            aria-label={effectiveMaximized ? "Minimize artifact panel" : "Maximize artifact panel"}
            className="hidden sm:flex shrink-0 items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
            title={effectiveMaximized ? "Restore split view" : "Maximize canvas view"}
          >
            {effectiveMaximized ? (
              <Minimize2 className="h-3.5 w-3.5 text-brand" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                const title = activeTab ? `${activeTab.toUpperCase()} Artifact` : "Shared Artifact";
                window.location.href = `/community?action=newPost&title=${encodeURIComponent(title)}`;
              }
            }}
            aria-label="Share artifact to Community"
            className="hidden sm:flex shrink-0 items-center gap-1 h-7 px-2 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition cursor-pointer"
          >
            Share
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close artifact panel"
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Content area — tabs stay mounted once opened ── */}
      <div className="flex-1 min-h-0 relative overflow-hidden">

        {mounted.has("approvals") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "approvals" ? "block" : "hidden"}`}>
            <ApprovalsArtifact />
          </div>
        )}

        {mounted.has("slides") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "slides" ? "block" : "hidden"}`}>
            <SlidesArtifact initialTopic={slidesTopic} isStreaming={isStreaming} />
          </div>
        )}

        {mounted.has("boimela") && (
          <div className={`absolute inset-0 overflow-y-auto flex flex-col ${activeTab === "boimela" ? "block" : "hidden"}`}>
            <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between px-4">
              <span className="text-xs font-semibold text-rose-400">📖 অমর একুশে ৩ডি বই প্রিভিউ</span>
              <a
                href="/writing-studio"
                className="text-[11px] font-bold text-rose-300 hover:text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 px-2.5 py-1 rounded-md transition flex items-center gap-1"
              >
                <span>রাইটিং স্টুডিওতে খুলুন</span>
                <span>➔</span>
              </a>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BoiMela3DPageFlipPreview />
            </div>
          </div>
        )}

        {mounted.has("commerce") && (
          <div className={`absolute inset-0 overflow-y-auto p-4 flex flex-col items-center justify-start ${activeTab === "commerce" ? "block" : "hidden"}`}>
            <div className="w-full max-w-2xl space-y-6">
              <FCommerceBlueprints />

              <div className="border-t border-border/40 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Transaction & Courier Consignment</h4>
                <CommerceActionCard
                  order={{
                    invoiceNumber: "INV-2026-8891",
                    recipientName: "তানভীর আহমেদ",
                    recipientPhone: "01711000000",
                    recipientAddress: "House 12, Road 4, Dhanmondi, Dhaka",
                    codAmount: 1850,
                    deliveryCharge: 60,
                  }}
                  payment={{
                    trxId: "BK99281726X",
                    amount: 1850,
                    provider: "bkash",
                    senderPhone: "01711000000",
                    status: "verified",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {mounted.has("swarm") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "swarm" ? "block" : "hidden"}`}>
            <MultiAgentSwarmFlow onPopulateTab={(tab) => handleTabChange(tab)} />
          </div>
        )}

        {mounted.has("synthesizer") && (
          <div className={`absolute inset-0 overflow-y-auto p-4 flex items-center justify-center ${activeTab === "synthesizer" ? "block" : "hidden"}`}>
            <PonytailSynthesizerCard />
          </div>
        )}

        {mounted.has("sheet") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "sheet" ? "block" : "hidden"}`}>
            <SheetArtifact initialData={sheetData} isStreaming={isStreaming} />
          </div>
        )}

        {mounted.has("research") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "research" ? "block" : "hidden"}`}>
            <DeepResearchArtifact initialQuery={researchQuery} isStreaming={isStreaming} />
          </div>
        )}

        {mounted.has("code") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "code" ? "block" : "hidden"}`}>
            <CodeArtifact
              initialCode={codeSnippet}
              initialLanguage={codeLanguage}
              filename={codeFilename}
              isStreaming={isStreaming}
            />
          </div>
        )}

        {mounted.has("diagram") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "diagram" ? "block" : "hidden"}`}>
            <DiagramArtifact isStreaming={isStreaming} />
          </div>
        )}

        {mounted.has("doc") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "doc" ? "block" : "hidden"}`}>
            <DocArtifact
              initialTitle={docTitle}
              initialContent={docContent}
              targetPage={docPage}
              targetBbox={docBbox}
              sourceRef={docSourceRef}
              isStreaming={isStreaming}
            />
          </div>
        )}

        {mounted.has("community") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "community" ? "block" : "hidden"}`}>
            <CommunityArtifact />
          </div>
        )}

        {mounted.has("career") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "career" ? "block" : "hidden"}`}>
            <CareerStudioArtifact />
          </div>
        )}

        {mounted.has("whatsapp") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "whatsapp" ? "block" : "hidden"}`}>
            <WhatsAppOrderSimulator />
          </div>
        )}

        {mounted.has("voicepitch") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "voicepitch" ? "block" : "hidden"}`}>
            <VoicePitchToDeck onExportToSlides={(topic) => handleTabChange("slides")} />
          </div>
        )}

        {mounted.has("promptlab") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "promptlab" ? "block" : "hidden"}`}>
            <PromptLabArtifact />
          </div>
        )}

        {mounted.has("legal") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "legal" ? "block" : "hidden"}`}>
            <LegalContractArtifact />
          </div>
        )}

        {mounted.has("arena") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "arena" ? "block" : "hidden"}`}>
            <ModelArenaArtifact />
          </div>
        )}

        {mounted.has("twin") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "twin" ? "block" : "hidden"}`}>
            <TwinArtifact />
          </div>
        )}

        {mounted.has("leads") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "leads" ? "block" : "hidden"}`}>
            <LeadScraperArtifact />
          </div>
        )}

        {mounted.has("seo") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "seo" ? "block" : "hidden"}`}>
            <SeoContentArtifact />
          </div>
        )}

        {mounted.has("flows") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "flows" ? "block" : "hidden"}`}>
            <ChatbotFlowArtifact />
          </div>
        )}

        {mounted.has("video") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "video" ? "block" : "hidden"}`}>
            <VideoScriptArtifact />
          </div>
        )}

        {mounted.has("vattax") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "vattax" ? "block" : "hidden"}`}>
            <VatTaxArtifact />
          </div>
        )}

        {mounted.has("photo") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "photo" ? "block" : "hidden"}`}>
            <ProductPhotoArtifact />
          </div>
        )}

        {mounted.has("inventory") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "inventory" ? "block" : "hidden"}`}>
            <SupplyChainArtifact />
          </div>
        )}

        {mounted.has("dubbing") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "dubbing" ? "block" : "hidden"}`}>
            <VoiceDubbingArtifact />
          </div>
        )}

        {mounted.has("broadcast") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "broadcast" ? "block" : "hidden"}`}>
            <BroadcastCampaignArtifact />
          </div>
        )}

        {mounted.has("disputes") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "disputes" ? "block" : "hidden"}`}>
            <DisputeResolutionArtifact />
          </div>
        )}

        {mounted.has("pricewatcher") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "pricewatcher" ? "block" : "hidden"}`}>
            <PriceWatcherArtifact />
          </div>
        )}

        {mounted.has("overnight") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "overnight" ? "block" : "hidden"}`}>
            <OvernightReconciliationArtifact />
          </div>
        )}

        {mounted.has("webgpu") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "webgpu" ? "block" : "hidden"}`}>
            <WebGpuEngineArtifact />
          </div>
        )}

        {mounted.has("marketing") && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === "marketing" ? "block" : "hidden"}`}>
            <MarketingGrowthArtifact />
          </div>
        )}

        {/* Sources tab — contextual depth per spec */}
        {activeTab === "sources" && (
          <div className="absolute inset-0 overflow-y-auto p-6">
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Globe className="h-4 w-4 text-blue-400" />
                Sources
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sources referenced in this conversation will appear here. Send a research query to populate this tab.
              </p>
            </div>
          </div>
        )}

        {/* History tab — session output history per spec */}
        {activeTab === "history" && (
          <div className="absolute inset-0 overflow-y-auto p-6">
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-orange-400" />
                Session History
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prior outputs, artifacts, and generated files from this session will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Pillar 3: Terminal Console Drawer ── */}
      {showTerminal && (
        <ReplitTerminalConsole
          isStreaming={isStreaming}
          onClose={() => setShowTerminal(false)}
          className="m-2 shrink-0 border-t border-slate-800"
        />
      )}
    </div>
  );
}
