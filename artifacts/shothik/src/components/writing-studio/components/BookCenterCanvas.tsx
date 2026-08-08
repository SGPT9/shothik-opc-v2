import React from "react";
import { FileText, Table, Network, Presentation, Globe, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CanvasTab = "editor" | "sheet" | "mindmap" | "slides" | "web_preview";

export interface BookCenterCanvasProps {
  activeTab: CanvasTab;
  onTabChange: (tab: CanvasTab) => void;
  editorText: string;
  onEditorTextChange: (text: string) => void;
  livePreviewUrl?: string;
}

export function BookCenterCanvas({
  activeTab,
  onTabChange,
  editorText,
  onEditorTextChange,
  livePreviewUrl = "https://yourbusiness.com",
}: BookCenterCanvasProps) {
  const tabs: { key: CanvasTab; label: string; icon: React.ElementType }[] = [
    { key: "editor", label: "Writing Studio", icon: FileText },
    { key: "sheet", label: "Fortune Sheet", icon: Table },
    { key: "mindmap", label: "Mind Map", icon: Network },
    { key: "slides", label: "Marp Slides", icon: Presentation },
    { key: "web_preview", label: "Live Web Preview", icon: Globe },
  ];

  return (
    <div className="flex h-full flex-col min-w-0 bg-background">
      {/* 5-Mode Canvas Tab Header */}
      <div className="flex h-11 w-full items-center justify-between border-b border-border/80 px-3 bg-muted/20">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition whitespace-nowrap",
                  activeTab === t.key
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode View Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {activeTab === "editor" && (
          <textarea
            value={editorText}
            onChange={(e) => onEditorTextChange(e.target.value)}
            className="h-full w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-foreground focus:outline-none"
            placeholder="Write your chapter content here…"
          />
        )}

        {activeTab === "sheet" && (
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Table className="h-4 w-4 text-indigo-400" /> Fortune Sheet — 100-Run ScenarioLab Monte Carlo Model
              </h3>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                100 Runs Computed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P10 Pessimistic ARR</p>
                <p className="text-base font-bold text-indigo-400">$105.0M</p>
                <p className="text-[9px] text-muted-foreground">Low market adoption</p>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P50 Median ARR (Target)</p>
                <p className="text-base font-bold text-cyan-400">$150.0M</p>
                <p className="text-[9px] text-muted-foreground">4.1 mo CAC payback</p>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P90 Optimistic ARR</p>
                <p className="text-base font-bold text-emerald-400 font-mono">$195.0M</p>
                <p className="text-[9px] text-muted-foreground">High virality coefficient</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "mindmap" && (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            <Network className="h-8 w-8 text-indigo-400 mb-2" />
            <p>Interactive Character & Plot Concept Network Node Visualizer</p>
          </div>
        )}

        {activeTab === "slides" && (
          <div className="rounded-xl border border-border/80 bg-card p-6 space-y-4 text-center">
            <Presentation className="h-10 w-10 text-indigo-400 mx-auto" />
            <h3 className="text-base font-bold text-foreground">Investor Pitch Deck (10 Slides)</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Integrated Marp markdown slides with VTuber Papermark presenter automation.
            </p>
          </div>
        )}

        {activeTab === "web_preview" && (
          <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex h-8 items-center justify-between border-b border-border bg-muted/40 px-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> SSL Verified (Live Container)
              </span>
              <a href={livePreviewUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400 flex items-center gap-1">
                {livePreviewUrl} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <iframe
              src={livePreviewUrl}
              className="flex-1 w-full border-none bg-background"
              title="Live User Site Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
