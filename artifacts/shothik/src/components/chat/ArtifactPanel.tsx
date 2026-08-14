"use client";

import { useState } from "react";
import { X, Presentation, Table2, BookOpen, Code2, History, Terminal, Network, FileText, Wand2 } from "lucide-react";
import { SlidesArtifact }       from "@/components/chat/artifacts/SlidesArtifact";
import { SheetArtifact }        from "@/components/chat/artifacts/SheetArtifact";
import { DeepResearchArtifact } from "@/components/chat/artifacts/DeepResearchArtifact";
import { CodeArtifact }         from "@/components/chat/artifacts/CodeArtifact";
import { DiagramArtifact }      from "@/components/chat/artifacts/DiagramArtifact";
import { DocArtifact }          from "@/components/chat/artifacts/DocArtifact";
import { PonytailSynthesizerCard } from "@/components/canvas/PonytailSynthesizerCard";
import { ReplitTerminalConsole } from "@/components/chat/ReplitTerminalConsole";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArtifactTab = "slides" | "sheet" | "research" | "code" | "diagram" | "doc" | "synthesizer";

interface TabConfig {
  id: ArtifactTab;
  label: string;
  Icon: React.ElementType;
  color: string;
}

const TABS: TabConfig[] = [
  { id: "slides",      label: "Slides",              Icon: Presentation, color: "text-indigo-400" },
  { id: "synthesizer", label: "Venture Synthesizer", Icon: Wand2,        color: "text-purple-400" },
  { id: "sheet",       label: "Sheet",               Icon: Table2,       color: "text-cyan-400"   },
  { id: "research",    label: "Research",            Icon: BookOpen,     color: "text-violet-400" },
  { id: "code",        label: "Code",                Icon: Code2,        color: "text-emerald-400"},
  { id: "diagram",     label: "Diagram",             Icon: Network,      color: "text-sky-400"    },
  { id: "doc",         label: "Doc",                 Icon: FileText,     color: "text-amber-400"  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtifactPanelProps {
  activeTab: ArtifactTab | null;
  onTabChange: (tab: ArtifactTab) => void;
  onClose: () => void;
  isStreaming?: boolean;

  // Handoff: pre-populate from chat context
  slidesTopic?: string;
  researchQuery?: string;
  sheetData?: string[][];
  codeSnippet?: string;
  codeLanguage?: string;
  codeFilename?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArtifactPanel({
  activeTab,
  onTabChange,
  onClose,
  isStreaming,
  slidesTopic,
  researchQuery,
  sheetData,
  codeSnippet,
  codeLanguage,
  codeFilename,
}: ArtifactPanelProps) {
  // Version History State (Pillar 5)
  const [selectedVersion, setSelectedVersion] = useState<string>("v3");
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  // Lazy-mount state
  const [mounted, setMounted] = useState<Set<ArtifactTab>>(() => 
    activeTab ? new Set([activeTab]) : new Set()
  );

  const handleTabChange = (tab: ArtifactTab) => {
    setMounted((prev) => new Set([...prev, tab]));
    onTabChange(tab);
  };

  if (!activeTab) return null;

  return (
    <div className="flex flex-col h-full border-l border-border/60 bg-background w-full shrink-0 animate-in slide-in-from-right-4 duration-300">

      {/* ── Tab bar ── */}
      <div className="flex items-center shrink-0 border-b border-border/60 bg-muted/20 px-2">
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto py-1.5 no-scrollbar">
          {TABS.map(({ id, label, Icon, color }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                aria-selected={isActive}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? color : ""}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
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

          <button
            type="button"
            onClick={() => setShowTerminal((prev) => !prev)}
            aria-label="Toggle terminal"
            className={`hidden sm:flex shrink-0 items-center gap-1 h-7 px-2 rounded-lg text-[10px] font-bold border transition ${
              showTerminal
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground"
            }`}
          >
            <Terminal className="h-3 w-3 text-emerald-400" />
            <span>Terminal</span>
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

        {mounted.has("slides") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "slides" ? "block" : "hidden"}`}>
            <SlidesArtifact initialTopic={slidesTopic} isStreaming={isStreaming} />
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
            <DocArtifact isStreaming={isStreaming} />
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
