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
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Trash2,
  FileText,
  Wand2,
  CheckCircle2,
  Languages,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import ButtonPasteText from "@/components/buttons/ButtonPasteText";
import ButtonSampleText from "@/components/buttons/ButtonSampleText";
import ButtonInsertDocumentText from "@/components/buttons/ButtonInsertDocumentText";
import SendToWritingStudioButton from "@/components/tools/common/SendToWritingStudioButton";
import useScreenSize from "@/hooks/ui/useScreenSize";
import useIsDark from "@/hooks/ui/useIsDark";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import { GrammarIssue } from "@/lib/tools/grammar/types";
import { trackToolUsed } from "@/lib/posthog";

const SAMPLE_TEXT_EN = "She dont know about the meeting yesterday and their was no reminder sent. Each of the student have submitted there reports.";
const SAMPLE_TEXT_BN = "আমরা আগামী কালকে ঢাকা যাবো এবং তাহাদের সাথে জরুরী মিটিং করব।";

const ISSUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  grammar: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/30" },
  spelling: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  style: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  punctuation: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
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
  const isDark = useIsDark();

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

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
      toast.success(`Applied fix: ${issue.original} ➔ ${issue.replacement}`);
    }
  };

  const handleApplyAll = async () => {
    const corrected = await applyAll();
    if (corrected) {
      setText(corrected);
      toast.success("Applied all grammar and spelling corrections!");
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
    <div className="container mx-auto max-w-7xl px-4 py-4 md:py-6 space-y-4">
      {/* ── Header & Language Switcher ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <SpellCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Grammar & Spell Fix
              <Badge variant="outline" className="bg-brand/10 text-brand border-brand/30 text-[10px] font-bold">
                7-Language NLP
              </Badge>
            </h1>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <select
            id="grammar-lang-select"
            name="grammarLanguage"
            aria-label="Select Language for Grammar Check"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-border/80 bg-card font-semibold text-foreground outline-none cursor-pointer focus:border-brand"
          >
            <option value="en">🇺🇸 English</option>
            <option value="bn">🇧🇩 বাংলা (Bengali)</option>
            <option value="bn-banglish">🇧🇩 Banglish</option>
          </select>
        </div>
      </div>

      {/* ── Mobile Tab Navigation (AI Detector Replica) ── */}
      {isMobile && (
        <div className="flex items-center justify-center p-1 rounded-xl bg-muted/60 border border-border/80">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer",
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
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer",
              mobileTab === "result" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground disabled:opacity-40"
            )}
          >
            Diagnostics {result ? `(${issues.length})` : ""}
          </button>
        </div>
      )}

      {/* ── Dual Studio Cards Container (Exact AI Detector Grid) ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── LEFT PANE: Input / Interactive View ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-320px)] max-h-[620px] min-h-[420px]",
            isMobile && mobileTab !== "editor" ? "hidden" : "flex"
          )}
        >
          {/* Card Header */}
          <div className="h-11 shrink-0 bg-muted/30 border-b border-border/40 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Input Text</span>
              <Badge variant="secondary" className="text-[10px] font-mono font-semibold">
                {wordCount} Words
              </Badge>
            </div>
            {text && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Card Text Area / Interactive Overlay */}
          <div className="relative flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
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
              <div className="h-full w-full flex-1 overflow-y-auto text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap text-foreground/90 font-normal custom-scrollbar">
                {text}
              </div>
            )}

            {/* Empty State Initial Action Buttons */}
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

          {/* Bottom Action Bar */}
          <div className="shrink-0 h-13 px-4 bg-muted/30 border-t border-border/50 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {text ? `${wordCount} words (${text.length} chars)` : "Ready for analysis"}
            </div>

            <Button
              onClick={handleCheck}
              disabled={!text.trim() || isChecking}
              className="h-9 px-5 rounded-xl text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs cursor-pointer transition active:scale-[0.98]"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Checking…
                </>
              ) : !enableEdit ? (
                <>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Edit Text
                </>
              ) : (
                <>
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  Check Grammar
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ── RIGHT PANE: Output Diagnostics & Interactive Fixes ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-320px)] max-h-[620px] min-h-[420px]",
            isMobile && mobileTab !== "result" ? "hidden" : "flex"
          )}
        >
          {/* Card Header with Actions */}
          <div className="h-11 shrink-0 bg-muted/30 border-b border-border/40 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grammar Diagnostics</span>
              {result && (
                <Badge variant="outline" className="bg-brand/10 text-brand border-brand/30 text-[10px] font-bold">
                  {issues.length} {issues.length === 1 ? "Issue" : "Issues"}
                </Badge>
              )}
            </div>

            {result && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy Clean"}
                </Button>
                <SendToWritingStudioButton
                  text={result.correctedText || text}
                  title="Grammar Checked Document"
                  source="grammar"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs font-semibold"
                />
              </div>
            )}
          </div>

          {/* Main Output Display */}
          <div className="relative flex-1 min-h-0 flex flex-col p-4 overflow-hidden justify-between">
            {!result && !isChecking ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center mb-3 text-muted-foreground/80">
                  <SpellCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Diagnostics Appear Here</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Click "Check Grammar" to analyze syntax, punctuation, agreement, and spelling rules.
                </p>
              </div>
            ) : isChecking ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 animate-in fade-in">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-brand/20 border-t-brand animate-spin" />
                  <SpellCheck className="absolute inset-0 m-auto h-5 w-5 text-brand animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Checking Grammar & Syntax</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Evaluating sentence structure & agreement...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col justify-between overflow-hidden">
                {/* Writing Health Scorecard (AI Detector Style) */}
                <div className={cn(
                  "shrink-0 p-3 rounded-xl border flex items-center justify-between gap-3",
                  issues.length === 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-brand/10 border-brand/30"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold text-sm shadow-xs",
                      issues.length === 0 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-brand shadow-brand/20"
                    )}>
                      {healthScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground">
                          {issues.length === 0 ? "Writing Health: Flawless" : "Writing Health"}
                        </span>
                        {issues.length === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {issues.length === 0 ? "Zero errors detected" : `${issues.length} suggested corrections`}
                      </span>
                    </div>
                  </div>

                  {issues.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleApplyAll}
                      className="h-8 px-3 text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground rounded-xl shadow-xs cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Fix All ({issues.length})
                    </Button>
                  )}
                </div>

                {/* Issue Category Breakdown */}
                <div className="shrink-0 grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 font-semibold">
                    <span className="text-[9px] block text-rose-500/80">Grammar</span>
                    {grammarCount}
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-semibold">
                    <span className="text-[9px] block text-amber-500/80">Spelling</span>
                    {spellingCount}
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 font-semibold">
                    <span className="text-[9px] block text-blue-500/80">Style</span>
                    {styleCount}
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                    <span className="text-[9px] block text-emerald-500/80">Punctuation</span>
                    {punctuationCount}
                  </div>
                </div>

                {/* Interactive Issue Cards List */}
                <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
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
                          className="p-2.5 rounded-xl border border-border/60 bg-card hover:border-border transition flex items-center justify-between gap-3"
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
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
