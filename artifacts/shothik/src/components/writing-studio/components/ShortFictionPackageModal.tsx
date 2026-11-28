import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Users,
  Image as ImageIcon,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Flame,
  Check,
  Palette,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShortFictionChapter {
  chapterNumber: number;
  title: string;
  synopsis: string;
  wordCount: number;
  cliffhanger: string;
  draftText: string;
}

export interface CommercialPackage {
  packageId: string;
  projectId: string;
  title: string;
  subtitle: string;
  logline: string;
  genre: string;
  targetAudience: string;
  sellingPoints: string[];
  backCoverBlurb: string;
  targetTropes: string[];
  characters: Array<{
    name: string;
    role: string;
    motivation: string;
    contradiction: string;
    visualPrompt: string;
  }>;
  coverArtPrompts: {
    frontCover: string;
    styleReference: string;
    typographyNote: string;
    colorPalette: string[];
  };
  chapters: ShortFictionChapter[];
  totalWordCount: number;
  estimatedReadingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShortFictionPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onApplyChapters?: (chapters: Array<{ id: string; title: string; synopsis: string; wordCount: number; content: string }>) => void;
}

export const ShortFictionPackageModal: React.FC<ShortFictionPackageModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onApplyChapters,
}) => {
  const [data, setData] = useState<CommercialPackage | null>(null);
  const [activeTab, setActiveTab] = useState<"chapters" | "sales" | "characters" | "cover" | "generator">("chapters");
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Generator form state
  const [customGenre, setCustomGenre] = useState<string>("Historical Mystery Thriller");
  const [customPremise, setCustomPremise] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchPackage();
    }
  }, [isOpen, projectId]);

  const fetchPackage = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/short-fiction`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err: any) {
      console.error("[short-fiction] Failed to fetch package:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/short-fiction/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          genre: customGenre,
          premise: customPremise.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setActiveTab("chapters");
        setSuccessMsg("Generated fresh 12-chapter commercial fiction package!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error("[short-fiction] Generation failed:", err);
      setSuccessMsg("Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyToManuscript = async () => {
    if (!data) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/short-fiction/apply-chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data?.chapters) {
        if (onApplyChapters) {
          onApplyChapters(json.data.chapters);
        }
        setSuccessMsg("Deployed all 12 chapters into active manuscript!");
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error("[short-fiction] Failed to apply chapters:", err);
    } finally {
      setApplying(false);
    }
  };

  const handleDownloadMarkdown = () => {
    window.open(`/api/v1/projects/${projectId}/short-fiction/export-markdown`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[96vw] h-[90vh] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold tracking-tight">
                  Automated Commercial Short-Fiction Package Studio
                </DialogTitle>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  InkOS Short Run
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  12 Chapters Complete
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                1-click end-to-end commercial fiction generator: serialized 12-chapter manuscript, logline, pitch deck, character dossiers, and cover prompts.
              </DialogDescription>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1 rounded-lg border border-border bg-muted/30 text-xs flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-foreground">{data?.totalWordCount ?? 0} words</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-indigo-400 font-semibold">{data?.estimatedReadingTimeMinutes ?? 0} min read</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadMarkdown}
              className="h-8 gap-1.5 text-xs cursor-pointer"
              title="Download Full Package & Chapters as Markdown"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pitch Deck .md</span>
            </Button>

            <Button
              size="sm"
              onClick={handleApplyToManuscript}
              disabled={applying || !data}
              className="h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className={cn("h-3.5 w-3.5", applying && "animate-spin")} />
              <span>{applying ? "Deploying..." : "Deploy 12 Chapters to Studio"}</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-muted/10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("chapters")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "chapters"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>12-Chapter Sequence</span>
            </button>

            <button
              onClick={() => setActiveTab("sales")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "sales"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Commercial Pitch & Blurb</span>
            </button>

            <button
              onClick={() => setActiveTab("characters")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "characters"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Character Dossiers</span>
            </button>

            <button
              onClick={() => setActiveTab("cover")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "cover"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>AI Cover Art Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("generator")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "generator"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Custom Generator</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={fetchPackage}
            disabled={loading}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-muted-foreground hover:text-foreground text-xs">
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: 12-Chapter Sequence */}
          {activeTab === "chapters" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  High-retention serialized short fiction: 12 self-contained chapters, each ending on a cliffhanger.
                </span>
                <span className="font-semibold text-foreground">
                  Ready for instant injection into Studio chapter hierarchy
                </span>
              </div>

              <div className="space-y-2.5">
                {data?.chapters.map((ch) => {
                  const isExpanded = expandedChapter === ch.chapterNumber;
                  return (
                    <div
                      key={ch.chapterNumber}
                      className="rounded-xl border border-border/80 bg-muted/15 overflow-hidden transition-colors hover:border-indigo-500/30"
                    >
                      <button
                        onClick={() => setExpandedChapter(isExpanded ? null : ch.chapterNumber)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-indigo-500/15 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/25">
                            {ch.chapterNumber}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-foreground">{ch.title}</div>
                            <div className="text-[11px] text-muted-foreground">{ch.synopsis}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {ch.wordCount} words
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-border/40 space-y-3 bg-muted/5">
                          {/* Cliffhanger Callout */}
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2">
                            <Flame className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider block">
                                Chapter Cliffhanger Hook
                              </span>
                              <span className="text-amber-200/90 text-xs">{ch.cliffhanger}</span>
                            </div>
                          </div>

                          {/* Chapter Draft Text */}
                          <div className="p-3.5 rounded-lg bg-background/80 border border-border text-xs font-serif leading-relaxed text-foreground/90 whitespace-pre-wrap select-text">
                            {ch.draftText}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Commercial Pitch & Blurb */}
          {activeTab === "sales" && data && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Logline Box */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  High-Concept Commercial Logline
                </span>
                <p className="font-serif text-sm text-foreground/90 leading-relaxed italic">
                  "{data.logline}"
                </p>
              </div>

              {/* Selling Points */}
              <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2.5">
                <span className="text-xs font-bold text-foreground block">
                  3 Hard-Hitting Commercial Selling Points
                </span>
                <div className="space-y-2">
                  {data.sellingPoints.map((sp, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-foreground/90">
                      {sp}
                    </div>
                  ))}
                </div>
              </div>

              {/* Back Cover Blurb */}
              <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Back Cover Blurb (Amazon Kindle & Rokomari Optimized)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Ready for Print Preflight
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-background/80 border border-border text-xs font-serif leading-relaxed text-foreground/90 whitespace-pre-wrap select-text">
                  {data.backCoverBlurb}
                </div>
              </div>

              {/* Target Tropes */}
              <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Target Genre Tropes Checklist
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.targetTropes.map((trope, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-medium"
                    >
                      ✓ {trope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Character Dossiers */}
          {activeTab === "characters" && data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.characters.map((char, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border/80 bg-muted/15 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">{char.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                        {char.role}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground/80">Motivation: </span>
                        {char.motivation}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground/80">Core Contradiction: </span>
                        {char.contradiction}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-1">
                    <span className="font-bold text-foreground text-[10px] uppercase tracking-wider block">
                      AI Visual Portrait Prompt
                    </span>
                    <p className="italic font-serif">"{char.visualPrompt}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: AI Cover Art Studio */}
          {activeTab === "cover" && data && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold text-foreground">
                      DALL-E 3 / Midjourney v6 Master Prompt
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(data.coverArtPrompts.frontCover)}
                    className="h-7 text-xs cursor-pointer gap-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Copy Prompt</span>
                  </Button>
                </div>

                <div className="p-3.5 rounded-lg bg-background/80 border border-border font-mono text-xs text-foreground/90 leading-relaxed select-text">
                  {data.coverArtPrompts.frontCover}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground pt-1">
                  <div>
                    <span className="font-semibold text-foreground">Style Reference: </span>
                    {data.coverArtPrompts.styleReference}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Typography Placement: </span>
                    {data.coverArtPrompts.typographyNote}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-3">
                  <span className="text-xs font-semibold text-foreground">Curated Color Palette:</span>
                  <div className="flex items-center gap-1.5">
                    {data.coverArtPrompts.colorPalette.map((color, idx) => (
                      <div
                        key={idx}
                        className="h-6 w-8 rounded border border-border shadow-sm flex items-center justify-center text-[9px] font-mono text-white/90"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Custom Generator */}
          {activeTab === "generator" && (
            <div className="max-w-2xl mx-auto p-5 rounded-xl border border-border bg-muted/15 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">Re-Generate 12-Chapter Commercial Package</h4>
                <p className="text-xs text-muted-foreground">
                  Select a commercial genre and custom premise to generate a complete 12-chapter fiction package.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Commercial Genre</label>
                  <select
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    <option value="Historical Mystery Thriller">Historical Mystery Thriller (1952 Curzon Noir)</option>
                    <option value="Cyberpunk Dhaka Noir">Cyberpunk Dhaka Noir (Augmented Bio-Hacker Rebellion)</option>
                    <option value="Folk Gothic Supernatural">Folk Gothic Supernatural (Sundarbans River Curse)</option>
                    <option value="Campus Academic Intrigue">Campus Academic Intrigue (Stolen Syndicate Papers)</option>
                    <option value="Romantic Melodrama">Romantic Melodrama (Cross-Border Linguistic Longing)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Custom Premise / Seed (Optional)</label>
                  <textarea
                    rows={3}
                    value={customPremise}
                    onChange={(e) => setCustomPremise(e.target.value)}
                    placeholder="Enter custom premise or characters to steer the 12-chapter generation..."
                    className="w-full p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs resize-none"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full h-8 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer"
                >
                  <Sparkles className={cn("h-3.5 w-3.5", generating && "animate-spin")} />
                  <span>{generating ? "Generating Complete Package..." : "Generate 12-Chapter Package"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Package ID: {data?.packageId ?? "—"}</span>
            <span>•</span>
            <span>Status: Commercial Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>

            <Button
              size="sm"
              onClick={handleApplyToManuscript}
              disabled={applying || !data}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Deploy 12 Chapters to Studio</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortFictionPackageModal;
