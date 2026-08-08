"use client";

import { useState } from "react";
import { X, Presentation, Table2, BookSearch, Code2 } from "lucide-react";
import { SlidesArtifact }       from "@/components/chat/artifacts/SlidesArtifact";
import { SheetArtifact }        from "@/components/chat/artifacts/SheetArtifact";
import { DeepResearchArtifact } from "@/components/chat/artifacts/DeepResearchArtifact";
import { CodeArtifact }         from "@/components/chat/artifacts/CodeArtifact";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArtifactTab = "slides" | "sheet" | "research" | "code";

interface TabConfig {
  id: ArtifactTab;
  label: string;
  Icon: React.ElementType;
  color: string;
}

const TABS: TabConfig[] = [
  { id: "slides",   label: "Slides",   Icon: Presentation, color: "text-indigo-400"  },
  { id: "sheet",    label: "Sheet",    Icon: Table2,       color: "text-cyan-400"    },
  { id: "research", label: "Research", Icon: BookSearch,   color: "text-violet-400"  },
  { id: "code",     label: "Code",     Icon: Code2,        color: "text-emerald-400" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtifactPanelProps {
  activeTab: ArtifactTab | null;
  onTabChange: (tab: ArtifactTab) => void;
  onClose: () => void;

  // Handoff: pre-populate from chat context
  slidesTopic?: string;
  researchQuery?: string;
  sheetData?: string[][];
  codeSnippet?: string;
  codeLanguage?: string;
  codeFilename?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ChatGPT Canvas-style right panel with four artifact tabs:
 * Slides · Sheet · Research · Code
 * All tabs lazy-mount once opened and stay alive (display:none on switch)
 * so in-progress state is never lost.
 */
export function ArtifactPanel({
  activeTab,
  onTabChange,
  onClose,
  slidesTopic,
  researchQuery,
  sheetData,
  codeSnippet,
  codeLanguage,
  codeFilename,
}: ArtifactPanelProps) {
  const [mounted, setMounted] = useState<Set<ArtifactTab>>(
    activeTab ? new Set([activeTab]) : new Set(),
  );

  const handleTabChange = (tab: ArtifactTab) => {
    setMounted((prev) => new Set([...prev, tab]));
    onTabChange(tab);
  };

  if (!activeTab) return null;

  return (
    <div className="flex flex-col h-full border-l border-border/60 bg-background w-full md:w-[440px] lg:w-[500px] xl:w-[560px] shrink-0 animate-in slide-in-from-right-4 duration-300">

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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? color : ""}`} />
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close artifact panel"
          className="ml-1 shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Content area — tabs stay mounted once opened ── */}
      <div className="flex-1 min-h-0 relative overflow-hidden">

        {mounted.has("slides") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "slides" ? "block" : "hidden"}`}>
            <SlidesArtifact initialTopic={slidesTopic} />
          </div>
        )}

        {mounted.has("sheet") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "sheet" ? "block" : "hidden"}`}>
            <SheetArtifact initialData={sheetData} />
          </div>
        )}

        {mounted.has("research") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "research" ? "block" : "hidden"}`}>
            <DeepResearchArtifact initialQuery={researchQuery} />
          </div>
        )}

        {mounted.has("code") && (
          <div className={`absolute inset-0 overflow-hidden ${activeTab === "code" ? "block" : "hidden"}`}>
            <CodeArtifact
              initialCode={codeSnippet}
              initialLanguage={codeLanguage}
              filename={codeFilename}
            />
          </div>
        )}
      </div>
    </div>
  );
}
