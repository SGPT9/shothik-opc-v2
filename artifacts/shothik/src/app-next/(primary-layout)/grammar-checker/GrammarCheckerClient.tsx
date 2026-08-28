"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Wand2,
  SpellCheck,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import SendToWritingStudioButton from "@/components/tools/common/SendToWritingStudioButton";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import { GrammarIssue } from "@/lib/tools/grammar/types";
import { trackToolUsed } from "@/lib/posthog";

const SAMPLE_TEXTS = [
  {
    label: "English Sample",
    text: "She dont know about the meeting yesterday and their was no reminder sent. Each of the student have submitted there reports.",
  },
  {
    label: "Bangla Sample",
    text: "আমরা আগামী কালকে ঢাকা যাবো এবং তাহাদের সাথে মিটিং করব।",
  },
];

const ISSUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  grammar: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/30" },
  spelling: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  style: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  punctuation: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
};

export default function GrammarCheckerClient() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const { check, applySingleCorrection, applyAll, isChecking, result, error } = useGrammarCheck();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const issues = result?.issues || [];

  const handleCheck = async () => {
    if (!text.trim() || isChecking) return;
    const res = await check(text, selectedLang);
    if (res) {
      trackToolUsed("grammar-checker", wordCount);
      toast.success(`Analysis complete: Found ${res.issues.length} suggested improvements`);
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

  const copyToClipboard = () => {
    const textToCopy = result?.correctedText || text;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copied clean text to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Group issues by type
  const grammarCount = issues.filter((i) => i.type === "grammar").length;
  const spellingCount = issues.filter((i) => i.type === "spelling").length;
  const styleCount = issues.filter((i) => i.type === "style").length;
  const punctuationCount = issues.filter((i) => i.type === "punctuation").length;

  // Correctness score
  const healthScore = Math.max(70, Math.min(100, 100 - issues.length * 6));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* ── Top Header Banner (AI Detector Standard) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
              <SpellCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Grammar & Spell Fix
            </h1>
            <Badge variant="outline" className="bg-brand/10 text-brand border-brand/30 font-semibold text-xs">
              7-Language NLP
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Detect and fix complex grammar, punctuation, subject-verb agreement, and spelling errors in English, বাংলা, and Banglish.
          </p>
        </div>

        {/* Quick Sample Selector & Language */}
        <div className="flex items-center gap-3 overflow-x-auto">
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

          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                setText(sample.text);
                if (sample.label.includes("Bangla")) setSelectedLang("bn");
                else setSelectedLang("en");
              }}
              className="text-xs px-3 py-1.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted font-medium text-foreground transition cursor-pointer whitespace-nowrap"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* ── Main Dual Card Grid (AI Detector Side-by-Side Standard) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── LEFT PANE: Source Text Input ── */}
        <Card className="border border-border/80 shadow-md flex flex-col justify-between overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Input Text</span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {wordCount} Words
              </Badge>
            </div>
            {text && (
              <button
                type="button"
                onClick={() => setText("")}
                className="text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
            <Textarea
              id="grammar-input-text"
              name="grammarInputText"
              aria-label="Text to Check for Grammar and Spelling"
              placeholder="Paste or type text to check for grammar, spelling, and phrasing improvements..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[260px] md:min-h-[320px] text-sm md:text-base resize-none border-0 focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60 leading-relaxed font-normal"
            />

            <div className="pt-3 border-t border-border/40">
              <Button
                onClick={handleCheck}
                disabled={!text.trim() || isChecking}
                className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 bg-brand hover:bg-brand/90 text-brand-foreground cursor-pointer transition active:scale-[0.99]"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Grammar & Syntax Rules…
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Check Grammar (1-Click Analysis)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── RIGHT PANE: Scorecard & Interactive Corrections ── */}
        <Card className="border border-border/80 shadow-md flex flex-col justify-between overflow-hidden bg-card/90">
          <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grammar Diagnostics</span>
              {result && (
                <Badge variant="outline" className="bg-brand/10 text-brand border-brand/30 text-[10px] font-bold">
                  {issues.length} {issues.length === 1 ? "Issue" : "Issues"} Found
                </Badge>
              )}
            </div>

            {/* Top Right Action Bar */}
            {result && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
                  className="h-8 px-2.5 text-xs font-semibold"
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
            {!result && !isChecking ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground min-h-[260px]">
                <div className="w-14 h-14 rounded-3xl bg-muted/60 border border-border/80 flex items-center justify-center mb-3 text-muted-foreground/80">
                  <SpellCheck className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Ready to Check Grammar</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Enter your text on the left and click "Check Grammar". Instant corrections and diagnostic scores will appear here.
                </p>
              </div>
            ) : isChecking ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[260px] space-y-4 animate-in fade-in">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
                  <SpellCheck className="absolute inset-0 m-auto h-6 w-6 text-brand animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Checking Grammar & Syntax</h3>
                  <p className="text-xs text-muted-foreground mt-1">Evaluating tense agreement, spelling, punctuation, and readability...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {/* ── Writing Health Score Dial Header (AI Detector UI/UX Replica) ── */}
                <div className={cn(
                  "p-3.5 rounded-2xl border flex items-center justify-between gap-4",
                  issues.length === 0
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-brand/10 border-brand/30"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-11 h-11 rounded-xl text-white font-bold text-base shadow-md",
                      issues.length === 0 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-brand shadow-brand/20"
                    )}>
                      {healthScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {issues.length === 0 ? "Writing Health: Flawless" : "Writing Health Score"}
                        </span>
                        {issues.length === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {issues.length === 0 ? "Zero errors detected across all rules" : `${issues.length} suggestions ready to apply`}
                      </span>
                    </div>
                  </div>

                  {issues.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleApplyAll}
                      className="h-8 px-3 text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground rounded-xl shadow-sm cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Fix All ({issues.length})
                    </Button>
                  )}
                </div>

                {/* ── Issue Category Pills ── */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-semibold">
                    <span className="text-[10px] block text-rose-500/80">Grammar</span>
                    {grammarCount}
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-semibold">
                    <span className="text-[10px] block text-amber-500/80">Spelling</span>
                    {spellingCount}
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-semibold">
                    <span className="text-[10px] block text-blue-500/80">Style</span>
                    {styleCount}
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                    <span className="text-[10px] block text-emerald-500/80">Punctuation</span>
                    {punctuationCount}
                  </div>
                </div>

                {/* ── Interactive Issue Cards List ── */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] custom-scrollbar pr-1">
                  {issues.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center text-xs text-emerald-600 font-medium">
                      🎉 Great job! No grammatical or spelling errors found in your text.
                    </div>
                  ) : (
                    issues.map((issue, idx) => {
                      const color = ISSUE_COLORS[issue.type] || ISSUE_COLORS.grammar;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-border/60 bg-card hover:border-border transition flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border", color.bg, color.text, color.border)}>
                                {issue.type}
                              </span>
                              <span className="text-xs text-muted-foreground line-through truncate max-w-[120px]">
                                {issue.original}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs font-bold text-emerald-500 truncate max-w-[120px]">
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
                            className="h-7 px-2.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded-lg shrink-0 cursor-pointer"
                          >
                            Apply Fix
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
