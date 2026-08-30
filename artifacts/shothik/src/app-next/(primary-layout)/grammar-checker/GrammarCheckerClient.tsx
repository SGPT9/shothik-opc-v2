"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const SAMPLE_TEXT_EN = trySamples.grammar.English;
const SAMPLE_TEXT_BN = trySamples.grammar.Bangla;

const ISSUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  grammar: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  spelling: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  style: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  punctuation: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
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

  const handleCheck = async () => {
    if (!text.trim() || isChecking) return;
    if (!enableEdit) {
      setEnableEdit(true);
      return;
    }

    const res = await check(text, selectedLang);
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
      {/* ── Integrated Top Language & Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border/80 shadow-xs">
        {/* Left: Language Selector */}
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Language:</span>
          <select
            id="grammar-lang-select"
            name="grammarLanguage"
            aria-label="Select Language for Grammar Check"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-border/80 bg-background font-medium text-foreground outline-none cursor-pointer"
          >
            <option value="en">🇺🇸 English</option>
            <option value="bn">🇧🇩 বাংলা (Bengali)</option>
            <option value="bn-banglish">🇧🇩 Banglish</option>
          </select>
        </div>

        {/* Right: Category Count Indicators */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Categories:</span>
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 font-mono text-[11px]">Grammar ({grammarCount})</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 font-mono text-[11px]">Spelling ({spellingCount})</span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 font-mono text-[11px]">Style ({styleCount})</span>
        </div>
      </div>

      {/* ── Mobile Tab Navigation ── */}
      {isMobile && (
        <div className="flex items-center justify-center p-1 rounded-xl bg-muted/60 border border-border/80">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer",
              mobileTab === "editor" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            )}
          >
            Input Text ({wordCount})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("result")}
            disabled={!result}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer",
              mobileTab === "result" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground disabled:opacity-40"
            )}
          >
            Diagnostics {result ? `(${issues.length})` : ""}
          </button>
        </div>
      )}

      {/* ── Unified Continuous Split Container (Left Input + Right Output) ── */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden h-[calc(100vh-320px)] max-h-[620px] min-h-[440px] flex flex-col">
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
          {/* ── LEFT PANE: Input Box ── */}
          <div className={cn(
            "flex flex-col justify-between overflow-hidden p-4 md:p-5 relative",
            isMobile && mobileTab !== "editor" ? "hidden" : "flex"
          )}>
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              {enableEdit ? (
                <textarea
                  id="grammar-input-text"
                  name="grammarInputText"
                  aria-label="Text to Check for Grammar and Spelling"
                  placeholder="Paste or type text here to detect grammar, punctuation, and spelling errors..."
                  className="placeholder:text-muted-foreground/60 h-full w-full flex-1 resize-none overflow-y-auto bg-transparent text-sm md:text-base leading-relaxed break-words outline-none font-normal custom-scrollbar"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isChecking}
                />
              ) : (
                <div
                  tabIndex={0}
                  role="region"
                  aria-label="Checked text with interactive grammar highlights"
                  className="h-full w-full flex-1 overflow-y-auto text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap text-foreground/90 font-normal custom-scrollbar focus-visible:outline-none"
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

              {/* Empty state floating buttons */}
              {!text && (
                <div className="absolute inset-0 m-auto flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                  <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
                    <ButtonSampleText
                      sample={selectedLang === "bn" ? SAMPLE_TEXT_BN : SAMPLE_TEXT_EN}
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

            {/* Left Box Footer */}
            <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
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
                          aria-label="Clear text"
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
                onClick={handleCheck}
                disabled={!text.trim() || isChecking}
                className="h-9 px-5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs cursor-pointer transition active:scale-[0.98]"
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
          </div>

          {/* ── RIGHT PANE: Diagnostics & Fixes ── */}
          <div className={cn(
            "flex flex-col justify-between overflow-hidden p-4 md:p-5 bg-zinc-50/50 dark:bg-zinc-950/40 relative",
            isMobile && mobileTab !== "result" ? "hidden" : "flex"
          )}>
            {!result && !isChecking ? (
              /* Empty state placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-600 dark:text-zinc-300">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-3 text-zinc-600 dark:text-zinc-300">
                  <SpellCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Grammar Diagnostics</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xs mt-1 leading-relaxed">
                  Enter text on the left and click "Fix Grammar" to detect grammatical, agreement, and spelling errors with 1-click fixes.
                </p>
              </div>
            ) : isChecking ? (
              /* Loading state */
              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white animate-spin" />
                  <SpellCheck className="absolute inset-0 m-auto h-5 w-5 text-zinc-900 dark:text-white animate-pulse" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Analyzing Grammar & Agreement</h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Checking syntax rules, punctuation, and typos...</p>
              </div>
            ) : (
              /* Output Active State */
              <div className="flex-1 flex flex-col justify-between overflow-hidden space-y-3">
                {/* Top Mini Header: Health Score & Fix All */}
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs font-mono font-bold", issues.length === 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700")}>
                      {healthScore}% Health
                    </Badge>
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
                      {issues.length === 0 ? "No errors found" : `${issues.length} corrections available`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {issues.length > 0 && (
                      <Button
                        size="sm"
                        onClick={handleApplyAll}
                        className="h-7 px-3 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg shadow-xs cursor-pointer"
                      >
                        <CheckCheck className="h-3.5 w-3.5 mr-1" />
                        Fix All ({issues.length})
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-7 px-2.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      {copied ? "Copied" : "Copy Clean"}
                    </Button>
                    <SendToWritingStudioButton
                      text={result?.correctedText || text}
                      title="Grammar Checked Document"
                      source="grammar"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Interactive Fix Cards */}
                <div className="flex-1 overflow-y-auto space-y-2 p-1 custom-scrollbar">
                  {issues.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-muted/40 border border-border/60 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <h4 className="text-xs font-bold text-foreground">Flawless Text</h4>
                      <p className="text-[11px] text-muted-foreground">No grammatical, spelling, or punctuation errors detected.</p>
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
                              <span className={cn("text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border", color.bg, color.text, color.border)}>
                                {issue.type}
                              </span>
                              <span className="text-xs text-muted-foreground line-through truncate max-w-[110px]">
                                {issue.original}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
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
                            className="h-6 px-2.5 text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-lg shrink-0 cursor-pointer"
                          >
                            Apply
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Color Legend */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-rose-500" />
                      <span>Grammar</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500" />
                      <span>Spelling</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-500" />
                      <span>Style</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold">{issues.length} suggestions</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
