"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  SpellCheck,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  CheckCheck,
  Trash2,
  Wand2,
  CheckCircle2,
  Languages,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import ButtonPasteText from "@/components/buttons/ButtonPasteText";
import ButtonSampleText from "@/components/buttons/ButtonSampleText";
import ButtonInsertDocumentText from "@/components/buttons/ButtonInsertDocumentText";
import SendToWritingStudioButton from "@/components/tools/common/SendToWritingStudioButton";
import useScreenSize from "@/hooks/ui/useScreenSize";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import { GrammarIssue } from "@/lib/tools/grammar/types";
import { trackToolUsed } from "@/lib/posthog";
import { trySamples } from "@/_mock/trySamples";

const SAMPLE_MODELS = [
  { name: "English Sample", text: trySamples.grammar.English },
  { name: "Bangla Sample", text: trySamples.grammar.Bangla },
  { name: "Academic Draft", text: "The data shows that there is many factors influencing the outcome and its not clear why the participants was absent." },
  { name: "Business Email", text: "Please find attached the document you requested for. I hope this finds you well and let me know if you need further informations." },
];

const ISSUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  grammar: { bg: "bg-rose-500/15", text: "text-rose-500", border: "border-rose-500/30" },
  spelling: { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30" },
  style: { bg: "bg-blue-500/15", text: "text-blue-500", border: "border-blue-500/30" },
  punctuation: { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30" },
};

export default function GrammarCheckerClient() {
  const [text, setText] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");
  const [copied, setCopied] = useState(false);
  const [enableEdit, setEnableEdit] = useState(true);
  const [mobileTab, setMobileTab] = useState<"editor" | "result">("editor");

  const { check, applySingleCorrection, applyAll, isChecking, result, error } = useGrammarCheck();
  const { width } = useScreenSize();
  const isMobile = width <= 1024;

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const maxWords = 1500;
  const issues = result?.issues || [];
  const grammarCount = issues.filter((i) => i.type === "grammar").length;
  const spellingCount = issues.filter((i) => i.type === "spelling").length;
  const styleCount = issues.filter((i) => i.type === "style").length;
  const punctuationCount = issues.filter((i) => i.type === "punctuation").length;

  const healthScore = Math.max(70, Math.min(100, 100 - issues.length * 6));

  const handleCheck = async (overrideInput?: string) => {
    const inputToUse = overrideInput || text;
    if (!inputToUse.trim() || isChecking) return;
    if (!enableEdit) {
      setEnableEdit(true);
      return;
    }

    const res = await check(inputToUse, selectedLang);
    if (res) {
      trackToolUsed("grammar-checker", wordCount);
      setEnableEdit(false);
      if (isMobile) setMobileTab("result");
      toast.success(`Analysis complete: Found ${res.issues.length} suggestions`);
    }
  };

  const handleApplyCorrection = async (issue: GrammarIssue) => {
    const corrected = await applySingleCorrection(issue);
    if (corrected) {
      setText(corrected);
      toast.success(`Applied: ${issue.original} ➔ ${issue.replacement}`);
    }
  };

  const handleApplyAll = async () => {
    const corrected = await applyAll();
    if (corrected) {
      setText(corrected);
      toast.success("Applied all corrections!");
    }
  };

  const handleClear = () => {
    setText("");
    setEnableEdit(true);
    setMobileTab("editor");
  };

  const handleSampleClick = (sampleText: string) => {
    setText(sampleText);
    setEnableEdit(true);
  };

  const copyToClipboard = () => {
    const textToCopy = result?.correctedText || text;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copied clean text to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 md:py-6 space-y-3">
      {/* ── Studio Top Controls Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
        {/* Left: Language Selector */}
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-brand shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Language:</span>
          <select
            id="grammar-lang-select"
            name="grammarLanguage"
            aria-label="Select Language for Grammar Check"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-border/80 bg-background font-semibold text-foreground outline-none cursor-pointer focus:border-brand"
          >
            <option value="en">🇺🇸 English</option>
            <option value="bn">🇧🇩 বাংলা (Bengali)</option>
            <option value="bn-banglish">🇧🇩 Banglish</option>
          </select>
        </div>

        {/* Right: Category Count Indicators */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold">Categories:</span>
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-[11px]">Grammar ({grammarCount})</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-[11px]">Spelling ({spellingCount})</span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 font-bold text-[11px]">Style ({styleCount})</span>
        </div>
      </div>

      {/* ── Mobile Tab Switcher (Always Active & Accessible) ── */}
      {isMobile && (
        <div
          role="tablist"
          aria-label="Grammar checker mobile view switcher"
          className="flex items-center justify-center p-1 rounded-xl bg-muted/60 border border-border/80"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "editor"}
            onClick={() => setMobileTab("editor")}
            className={cn(
              "flex-1 h-10 px-3 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5",
              mobileTab === "editor"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Input Text</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
              {wordCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "result"}
            onClick={() => setMobileTab("result")}
            className={cn(
              "flex-1 h-10 px-3 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5",
              mobileTab === "result"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Diagnostics</span>
            {result ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand/15 text-brand font-bold font-mono">
                {issues.length} {issues.length === 1 ? "issue" : "issues"}
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Preview
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── DUAL-PANE STUDIO CONTAINER (Exact AI Detector Side-by-Side Cards) ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── LEFT CARD: Input Editor ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-328px)] max-h-[600px] min-h-[400px] lg:h-[calc(100vh-280px)]",
            isMobile && mobileTab !== "editor" ? "hidden" : "flex"
          )}
        >
          {/* Surface Area */}
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            <label htmlFor="grammar-input-text" className="sr-only">
              Enter or paste text to check for grammar, punctuation, and spelling errors
            </label>
            {enableEdit ? (
              <textarea
                id="grammar-input-text"
                name="grammarInputText"
                aria-label="Enter or paste text for grammar and spelling check"
                role="textbox"
                placeholder="Paste or type text here to detect grammar, punctuation, and spelling errors..."
                className="placeholder:text-muted-foreground/60 h-full w-full flex-1 resize-none overflow-y-auto bg-transparent p-4 text-sm md:text-base leading-relaxed break-words outline-none font-normal custom-scrollbar focus-visible:ring-1 focus-visible:ring-brand/40"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isChecking}
              />
            ) : (
              <div
                tabIndex={0}
                role="region"
                aria-label="Checked text with interactive grammar highlights"
                className="h-full w-full flex-1 overflow-y-auto p-4 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap text-foreground/90 font-normal custom-scrollbar focus-visible:outline-none"
              >
                {issues.length === 0 ? (
                  text
                ) : (
                  text.split(/(\s+)/).map((segment, idx) => {
                    const matchedIssue = issues.find(
                      (iss) => iss.original.toLowerCase() === segment.trim().toLowerCase()
                    );
                    if (!matchedIssue || !segment.trim()) {
                      return <span key={idx}>{segment}</span>;
                    }
                    const isGrammar = matchedIssue.type === "grammar";
                    const isSpelling = matchedIssue.type === "spelling";
                    return (
                      <span
                        key={idx}
                        onClick={() => handleApplyCorrection(matchedIssue)}
                        className={cn(
                          "underline decoration-wavy decoration-2 cursor-pointer font-medium transition-all px-0.5 rounded hover:bg-muted/80",
                          isGrammar
                            ? "decoration-rose-500 text-rose-600 dark:text-rose-400"
                            : isSpelling
                              ? "decoration-amber-500 text-amber-600 dark:text-amber-400"
                              : "decoration-blue-500 text-blue-600 dark:text-blue-400"
                        )}
                        title={`Click to fix: replace "${matchedIssue.original}" with "${matchedIssue.replacement}"`}
                      >
                        {segment}
                      </span>
                    );
                  })
                )}
              </div>
            )}

            {/* Empty State Floating Buttons */}
            {!text && (
              <div className="absolute inset-0 m-auto flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
                  <ButtonSampleText
                    sample={SAMPLE_MODELS[0].text}
                    onApply={(val) => setText(val)}
                  />
                  <span className="text-xs text-muted-foreground">Or</span>
                  <ButtonPasteText onApply={(val) => setText(val)} />
                  <span className="text-xs text-muted-foreground">Or</span>
                  <ButtonInsertDocumentText onApply={(val) => setText(val)} />
                </div>
              </div>
            )}
          </div>

          {/* Left Card Action Bar (InputActions layout) */}
          <div className="shrink-0 h-12 px-4 bg-muted/30 border-t border-border/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap text-muted-foreground font-mono">
                <b>{wordCount}</b> / {maxWords} words
              </span>
              {text && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={handleClear}
                        aria-label="Clear all input text"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear text</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <Button
              onClick={() => handleCheck()}
              disabled={!text.trim() || isChecking}
              className="h-8 px-4 md:h-9 md:px-5 rounded-xl text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs cursor-pointer transition active:scale-[0.98]"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Checking…
                </>
              ) : !enableEdit ? (
                <>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </>
              ) : (
                <>
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  Fix Grammar
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ── RIGHT CARD: Output Scorecard & Interactive Diagnostics ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-328px)] max-h-[600px] min-h-[400px] lg:h-[calc(100vh-280px)]",
            isMobile && mobileTab !== "result" ? "hidden" : "flex"
          )}
        >
          {!result && !isChecking ? (
            /* Empty State: Sample Text Options & Feature Card */
            <div className="flex flex-1 flex-col p-6 justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <strong className="block text-sm font-bold text-foreground">Try Sample Text</strong>
                <div className="grid grid-cols-2 gap-3">
                  {SAMPLE_MODELS.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSampleClick(item.text)}
                      className="bg-muted/40 hover:bg-muted border border-border/60 flex h-10 cursor-pointer items-center justify-start gap-2.5 rounded-xl px-3 text-left transition text-foreground"
                    >
                      <SpellCheck className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="text-xs font-semibold truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                <span className="text-xs font-bold text-foreground block">Intelligent Syntax Correction</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Scans across 100+ grammatical rules including subject-verb agreement, dangling modifiers, spelling variations, Oxford commas, and tone consistency.
                </p>
              </div>
            </div>
          ) : isChecking ? (
            /* Loading State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-brand/20 border-t-brand animate-spin" />
                <SpellCheck className="absolute inset-0 m-auto h-5 w-5 text-brand animate-pulse" />
              </div>
              <h3 className="text-xs font-bold text-foreground">Analyzing Grammar & Agreement</h3>
              <p className="text-[11px] text-muted-foreground">Detecting syntax flaws and spelling anomalies...</p>
            </div>
          ) : (
            /* Output Result State (Score Dial & Interactive Fix Cards) */
            <div className="flex flex-1 flex-col overflow-hidden justify-between">
              {/* Header Bar */}
              <div className="h-12 border-b border-border/50 px-4 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-brand/10 text-brand border-brand/30 text-xs font-bold">
                    {issues.length} {issues.length === 1 ? "Issue" : "Issues"} Found
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  {issues.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleApplyAll}
                      className="h-8 px-3 text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg shadow-xs cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Fix All ({issues.length})
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Copy corrected text"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <SendToWritingStudioButton
                    text={result?.correctedText || text}
                    title="Grammar Checked Document"
                    source="tool"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Main Scorecard & Diagnostics */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Circular Score Gauge Meter */}
                <div className={cn(
                  "flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border",
                  issues.length === 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/20 border-border/40"
                )}>
                  <div className="relative flex size-28 shrink-0 items-center justify-center">
                    <div
                      className="absolute h-full w-full rounded-full border-6"
                      style={{ borderColor: "#10b91d20" }}
                    />
                    <div
                      className="absolute h-full w-full rounded-full border-6"
                      style={{
                        borderColor: issues.length === 0 ? "#10b91d" : "#3b82f6",
                        clipPath: `inset(${100 - healthScore}% 0 0 0)`,
                      }}
                    />
                    <p className={cn("text-base font-bold font-mono", issues.length === 0 ? "text-emerald-500" : "text-brand")}>
                      {healthScore}%
                    </p>
                  </div>

                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                        {issues.length === 0 ? "Writing Health: Flawless" : "Writing Health Score"}
                      </span>
                      {issues.length === 0 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {issues.length === 0 ? "Zero syntax or spelling errors detected" : `${issues.length} suggested corrections ready to apply`}
                    </p>
                  </div>
                </div>

                {/* Interactive Fix Cards List */}
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                  {issues.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center text-xs text-emerald-600 font-medium">
                      🎉 Great job! No grammatical or spelling errors found.
                    </div>
                  ) : (
                    issues.map((issue, idx) => {
                      const color = ISSUE_COLORS[issue.type] || ISSUE_COLORS.grammar;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-border/60 bg-card hover:border-border transition flex items-center justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border", color.bg, color.text, color.border)}>
                                {issue.type}
                              </span>
                              <span className="text-xs text-muted-foreground line-through truncate max-w-[100px]">
                                {issue.original}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs font-bold text-emerald-500 truncate max-w-[100px]">
                                {issue.replacement}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {issue.explanation || `Replace with "${issue.replacement}"`}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApplyCorrection(issue)}
                            className="h-6 px-2 text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded-lg shrink-0 cursor-pointer"
                          >
                            Apply
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
