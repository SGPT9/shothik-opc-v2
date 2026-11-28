import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  FileCheck,
  Layers,
  ArrowRight,
  BookOpen,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeslopFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: "critical" | "warning" | "suggestion";
  originalText: string;
  suggestedRevision: string;
  startOffset: number;
  endOffset: number;
  line: number;
  explanation: string;
  vernacularTip?: string;
}

export interface DeslopAuditData {
  projectId: string;
  cleanlinessScore: number;
  slopDensityPer1kWords: number;
  wordCount: number;
  issueCount: number;
  rubricSummary: Record<
    string,
    {
      name: string;
      count: number;
      description: string;
    }
  >;
  findings: DeslopFinding[];
  analyzedAt: string;
}

export interface SemanticDeslopModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  currentContent?: string;
  onApplyRevision?: (newContent: string) => void;
}

export const SemanticDeslopModal: React.FC<SemanticDeslopModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  currentContent = "",
  onApplyRevision,
}) => {
  const [activeTab, setActiveTab] = useState<"findings" | "diff" | "rubric">("findings");
  const [selectedRuleFilter, setSelectedRuleFilter] = useState<string>("all");
  const [auditData, setAuditData] = useState<DeslopAuditData | null>(null);
  const [workingText, setWorkingText] = useState<string>("");
  const [originalText, setOriginalText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rewriting, setRewriting] = useState<boolean>(false);
  const [appliedCount, setAppliedCount] = useState<number>(0);
  const [projectedScore, setProjectedScore] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dismissedFindingIds, setDismissedFindingIds] = useState<Set<string>>(new Set());

  // Run audit when modal opens
  useEffect(() => {
    if (isOpen) {
      const textToAudit = currentContent.trim().length > 0 ? currentContent : "";
      setWorkingText(textToAudit);
      setOriginalText(textToAudit);
      setDismissedFindingIds(new Set());
      setAppliedCount(0);
      setSuccessMsg(null);
      fetchAudit(textToAudit);
    }
  }, [isOpen, projectId, currentContent]);

  const fetchAudit = async (customText?: string) => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const targetText = customText !== undefined ? customText : workingText;
      const res = await fetch(`/api/v1/projects/${projectId}/deslop/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: targetText,
          intensity: "standard",
          preserveVernacular: true,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAuditData(json.data);
        setProjectedScore(Math.min(100, json.data.cleanlinessScore + 25));
        if (!workingText && targetText) {
          setWorkingText(targetText);
          setOriginalText(targetText);
        }
      }
    } catch (err: any) {
      console.error("[deslop] Failed to fetch audit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySingleFinding = (finding: DeslopFinding) => {
    if (!workingText.includes(finding.originalText)) return;

    const updated = workingText.replace(finding.originalText, finding.suggestedRevision);
    setWorkingText(updated);
    setAppliedCount((prev) => prev + 1);

    // Dismiss from active list
    setDismissedFindingIds((prev) => {
      const next = new Set(prev);
      next.add(finding.id);
      return next;
    });

    setProjectedScore((prev) => Math.min(100, prev + 3));
    setSuccessMsg(`Applied replacement for: "${finding.originalText.substring(0, 25)}..."`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDismissFinding = (findingId: string) => {
    setDismissedFindingIds((prev) => {
      const next = new Set(prev);
      next.add(findingId);
      return next;
    });
  };

  const handleDeSlopAll = async () => {
    setRewriting(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/deslop/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: workingText,
          intensity: "standard",
          preserveVernacular: true,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setWorkingText(json.data.rewrittenText);
        setAppliedCount((prev) => prev + json.data.changesApplied);
        setProjectedScore(json.data.projectedCleanlinessScore);
        setSuccessMsg(`De-slopped entire manuscript! ${json.data.changesApplied} AI tropes eliminated.`);

        // Re-audit to update findings
        await fetchAudit(json.data.rewrittenText);
      }
    } catch (err: any) {
      console.error("[deslop] Rewrite failed:", err);
      setSuccessMsg("Failed to run full de-slop.");
    } finally {
      setRewriting(false);
    }
  };

  const handleApplyToEditor = () => {
    if (onApplyRevision && workingText) {
      onApplyRevision(workingText);
      setSuccessMsg("Updated editor manuscript with clean prose!");
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  const handleReset = () => {
    setWorkingText(originalText);
    setDismissedFindingIds(new Set());
    setAppliedCount(0);
    fetchAudit(originalText);
  };

  const handleLoadSampleSlop = () => {
    const demoSample = `Heavy rain struck the red brick arches of Curzon Hall. Inside the archives, Professor Rahman felt an overwhelming sense of melancholy as he opened the iron chest. This changed everything forever in ways they could not imagine. He was surrounded by pain, hope, and longing in the stale air. A palpable silence fell over the room as Dr. Elena looked up. Meanwhile, across the city, the censors were quietly assembling. তার মনে গভীর আশঙ্কার সৃষ্টি হলো যখন সে শুনল টেলিফোনটি বাজছে। পরিস্থিতি অত্যন্ত জটিল হয়ে গেল এবং সে আকস্মিকভাবে হতভম্ব হয়ে গেল।`;
    setWorkingText(demoSample);
    setOriginalText(demoSample);
    setDismissedFindingIds(new Set());
    setAppliedCount(0);
    fetchAudit(demoSample);
  };

  const activeFindings = (auditData?.findings || []).filter((f) => !dismissedFindingIds.has(f.id));

  const filteredFindings =
    selectedRuleFilter === "all"
      ? activeFindings
      : activeFindings.filter((f) => f.ruleId === selectedRuleFilter);

  const cleanliness = auditData?.cleanlinessScore ?? 75;
  const scoreColor =
    cleanliness >= 85
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : cleanliness >= 70
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-rose-400 border-rose-500/40 bg-rose-500/10";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[88vh] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold tracking-tight">
                  Semantic Prose De-Slopper
                </DialogTitle>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  7-Point Rubric
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Eliminate formulaic AI tropes, cliché metaphors, and synthetic emotion labeling while preserving Bengali vernacular idioms.
              </DialogDescription>
            </div>
          </div>

          {/* Cleanliness Metric Pill */}
          <div className="flex items-center gap-3">
            <div className={cn("px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5", scoreColor)}>
              <ShieldCheck className="h-4 w-4" />
              <span>Cleanliness: {cleanliness}/100</span>
            </div>

            <div className="px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground hidden sm:flex items-center gap-1">
              <span>Density: {auditData?.slopDensityPer1kWords ?? 0}/1k words</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchAudit()}
              disabled={loading}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span>Re-Scan</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-muted/10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("findings")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "findings"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Findings & Repairs ({activeFindings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("diff")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "diff"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Side-by-Side Diff</span>
            </button>

            <button
              onClick={() => setActiveTab("rubric")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "rubric"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>7-Point Craft Rubric</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {appliedCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset ({appliedCount} applied)</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleDeSlopAll}
              disabled={rewriting || loading || activeFindings.length === 0}
              className="h-7 px-3 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className={cn("h-3.5 w-3.5", rewriting && "animate-spin")} />
              <span>{rewriting ? "De-Slopping..." : "De-Slop All"}</span>
            </Button>
          </div>
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

          {/* TAB 1: Findings & Repairs */}
          {activeTab === "findings" && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/60">
                <button
                  onClick={() => setSelectedRuleFilter("all")}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-medium rounded-full cursor-pointer transition-colors",
                    selectedRuleFilter === "all"
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({activeFindings.length})
                </button>
                {auditData &&
                  Object.entries(auditData.rubricSummary).map(([key, item]) => {
                    const count = activeFindings.filter((f) => f.ruleId === key).length;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedRuleFilter(key)}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-medium rounded-full cursor-pointer transition-colors flex items-center gap-1",
                          selectedRuleFilter === key
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                            : "bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent"
                        )}
                      >
                        <span>{item.name.split(" ")[0]}</span>
                        <span className="opacity-70 text-[10px]">({count})</span>
                      </button>
                    );
                  })}
              </div>

              {/* Empty state */}
              {filteredFindings.length === 0 && (
                <div className="py-16 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Clean Manuscript! No Slop Detected</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Your prose adheres to the 7-point anti-slop rubric: physical sensory grounding, authentic vernacular idioms, and crisp momentum.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLoadSampleSlop}
                    className="h-8 text-xs font-semibold border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Audit Sample Chapter with AI Tropes & Slop</span>
                  </Button>
                </div>
              )}

              {/* Cards list */}
              <div className="space-y-3">
                {filteredFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 rounded-xl border border-border/80 bg-muted/15 hover:border-amber-500/40 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
                            finding.severity === "critical"
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              : finding.severity === "warning"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          )}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-xs font-semibold text-foreground">{finding.ruleName}</span>
                        <span className="text-[11px] text-muted-foreground">Line {finding.line}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismissFinding(finding.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplySingleFinding(finding)}
                          className="h-7 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>Accept Revision</span>
                        </Button>
                      </div>
                    </div>

                    {/* Diff Preview Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/80 block mb-1">
                          Original AI Phrase
                        </span>
                        <span className="line-through text-rose-300 font-mono text-[11px]">
                          "{finding.originalText}"
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 block mb-1">
                          Visceral Literary Replacement
                        </span>
                        <span className="text-emerald-300 font-medium text-[11px]">
                          "{finding.suggestedRevision}"
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>{finding.explanation}</span>
                      {finding.vernacularTip && (
                        <span className="text-amber-400 font-medium text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {finding.vernacularTip}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Side-by-Side Diff */}
          {activeTab === "diff" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[55vh]">
                <div className="flex flex-col rounded-xl border border-border bg-muted/10 overflow-hidden">
                  <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Original Manuscript
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Base Score: {auditData?.cleanlinessScore ?? 70}/100
                    </span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto font-serif text-sm leading-relaxed text-muted-foreground/90 whitespace-pre-wrap select-text">
                    {originalText || "No original text loaded."}
                  </div>
                </div>

                <div className="flex flex-col rounded-xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
                  <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      De-Slopped Clean Prose
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      Projected Score: {projectedScore}/100
                    </span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto font-serif text-sm leading-relaxed text-foreground whitespace-pre-wrap select-text">
                    {workingText || "Apply replacements or click De-Slop All to generate clean prose."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 7-Point Craft Rubric */}
          {activeTab === "rubric" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                The <strong>Semantic Prose De-Slopper</strong> enforces the rigorous literary craft standards championed in MFA workshops and InkOS systems. Rather than surface grammar checking, it diagnoses structural narrative fatigue caused by probabilistic language models.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] flex items-center justify-center font-bold">1</span>
                    Emotion Labeling (Telling vs Showing)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AI frequently writes "he felt a profound melancholy." The De-Slopper converts this into concrete physical evidence: a tightening jaw, cold fingers against damp stone, or a hitch in the throat.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">2</span>
                    Unsupported Thematic Conclusions
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Flags unearned declarations like "This changed everything forever" or "Little did they know." Cut directly to immediate sensory consequences.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">3</span>
                    Formulaic Triads (Rule of Three Cliché)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Eliminates predictable rhythmic chains of abstract nouns ("of pain, hope, and longing"). Collapses the trio into a single pungent sensory detail.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] flex items-center justify-center font-bold">4</span>
                    Generic AI Transitions
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Purges "A palpable silence fell", "In the blink of an eye", and "As fate would have it." Replaces with tactile scene progression.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center font-bold">5</span>
                    Decorative Purple Prose & Adjective Stacking
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Strips hollow modifier soup ("luminous tapestry", "kaleidoscope of emotions") in favor of specific nouns rooted in physical reality.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-bold">6</span>
                    Dead & Predictable Metaphors
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Identifies clichéd figurative language ("heart beat like a drum", "eyes like daggers") and revives them with fresh, scene-grounded imagery.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 md:col-span-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold">7</span>
                    Bengali Idiom Dilution (Synthetic Translation Trap)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Replaces mechanical translated phrasing ("তার মনে গভীর ভীতির সঞ্চার হলো") with authentic Bengali idioms and onomatopoeia ("বুকের ভেতর ছ্যাঁত করে উঠল", "মাথায় যেন আকাশ ভেঙে পড়ল", "রাগে গা রি রি করে উঠল", "কেঁচো খুঁড়তে সাপ বের হলো").
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Manuscript: {auditData?.wordCount ?? 0} words</span>
            <span>•</span>
            <span>Improvements Ready: {appliedCount} applied</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleApplyToEditor}
              disabled={!workingText || workingText === originalText}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply to Editor Manuscript</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SemanticDeslopModal;
