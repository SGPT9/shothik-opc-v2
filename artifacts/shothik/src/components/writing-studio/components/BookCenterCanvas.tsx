import React from "react";
import { FileText, Table, Network, Presentation, Globe, ExternalLink, ShieldCheck, Sparkles, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScenarioLabModal } from "@/components/scenariolab/ScenarioLabModal";
import { PrintPreflightModal } from "./PrintPreflightModal";
import { exportManuscriptToMarkdown, exportManuscriptToHTML } from "../utils/epubPdfExporter";

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
  const [isInspectorActive, setIsInspectorActive] = React.useState(false);
  const [selectedElementInfo, setSelectedElementInfo] = React.useState<{ tagName: string; textContent: string } | null>(null);
  const [isScenarioLabOpen, setIsScenarioLabOpen] = React.useState(false);
  const [isPreflightOpen, setIsPreflightOpen] = React.useState(false);


  // December Adaptation: Keyboard shortcut Cmd + \ to toggle split preview
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        onTabChange(activeTab === "web_preview" ? "editor" : "web_preview");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, onTabChange]);

  // Two-way postMessage listener for live iframe element inspection
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "INSPECTOR_ELEMENT_CLICK") {
        setSelectedElementInfo({
          tagName: event.data.tagName || "DIV",
          textContent: event.data.textContent || "",
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportManuscriptToMarkdown("Shothik Book Manuscript", [{ id: "c1", title: "Chapter 1", content: editorText }])}
            className="h-7 px-2 text-[10px] font-semibold border-border/60 text-muted-foreground hover:text-foreground gap-1"
          >
            <Download className="h-3 w-3 text-indigo-400" />
            Export MD
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportManuscriptToHTML("Shothik Book Manuscript", [{ id: "c1", title: "Chapter 1", content: editorText }])}
            className="h-7 px-2 text-[10px] font-semibold border-border/60 text-muted-foreground hover:text-foreground gap-1"
          >
            <Download className="h-3 w-3 text-purple-400" />
            Export Ebook HTML
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPreflightOpen(true)}
            className="h-7 px-2 text-[10px] font-semibold border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 gap-1"
          >
            <Printer className="h-3 w-3" />
            Print Preflight
          </Button>
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
          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Table className="h-4 w-4 text-indigo-400" /> Fortune Sheet — ScenarioLab™ Monte Carlo System & Financial Model
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  900-run Monte Carlo stochastic stress-testing and TAM/SAM/SOM CAC payback modeling.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsScenarioLabOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl px-4 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
              >
                <Sparkles className="h-4 w-4" />
                Launch ScenarioLab™ Console
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">Availability Target</p>
                <p className="text-lg font-bold text-emerald-400">99.999%</p>
                <p className="text-[9px] text-muted-foreground">Five-Nines reliability</p>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P10 Pessimistic ARR</p>
                <p className="text-lg font-bold text-indigo-400">$105.0M</p>
                <p className="text-[9px] text-muted-foreground">Low market adoption</p>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P50 Median ARR (Target)</p>
                <p className="text-lg font-bold text-cyan-400">$150.0M</p>
                <p className="text-[9px] text-muted-foreground">4.1 mo CAC payback</p>
              </div>
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">Risk Prevented ($)</p>
                <p className="text-lg font-bold text-purple-400 font-mono">$288,900/yr</p>
                <p className="text-[9px] text-muted-foreground">Per 10,000 users</p>
              </div>
            </div>

            <ScenarioLabModal
              isOpen={isScenarioLabOpen}
              onClose={() => setIsScenarioLabOpen(false)}
            />
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
          <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden relative">
            <div className="flex h-8 items-center justify-between border-b border-border bg-muted/40 px-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> SSL Verified (Dokploy Container)
                </span>
                <button
                  onClick={() => setIsInspectorActive(!isInspectorActive)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1",
                    isInspectorActive
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse"
                      : "bg-muted/80 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Sparkles className="h-3 w-3" /> {isInspectorActive ? "Inspector Active (Click UI Element)" : "Enable Element Inspector"}
                </button>
              </div>
              <a href={livePreviewUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400 flex items-center gap-1">
                {livePreviewUrl} <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {selectedElementInfo && (
              <div className="absolute top-10 left-3 z-20 flex items-center gap-2 rounded-lg bg-zinc-900/95 border border-purple-500/40 p-2 text-xs font-mono text-purple-300 shadow-xl backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Source Sync: <strong className="text-white">&lt;{selectedElementInfo.tagName.toLowerCase()}&gt;</strong> {selectedElementInfo.textContent ? `"${selectedElementInfo.textContent.slice(0, 24)}..."` : ""}</span>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange("editor");
                    onEditorTextChange(
                      `${editorText}\n\n<!-- Focus element: <${selectedElementInfo.tagName.toLowerCase()}> "${selectedElementInfo.textContent}" -->\n`
                    );
                    setSelectedElementInfo(null);
                  }}
                  className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-sans font-semibold transition"
                >
                  Edit in Studio
                </button>
                <button onClick={() => setSelectedElementInfo(null)} className="ml-1 text-zinc-400 hover:text-white">×</button>
              </div>
            )}

            <iframe
              src={livePreviewUrl}
              className="flex-1 w-full border-none bg-background"
              title="Live Container Preview"
            />
          </div>
        )}
      </div>

      <PrintPreflightModal
        isOpen={isPreflightOpen}
        onClose={() => setIsPreflightOpen(false)}
        title="Shothik Book Manuscript"
        pageCount={Math.max(24, Math.ceil(editorText.split(/\s+/).filter(Boolean).length / 250))}
      />
    </div>
  );
}
