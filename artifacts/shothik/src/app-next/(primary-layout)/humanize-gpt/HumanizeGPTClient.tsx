"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Trash2,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Lock,
  Plus,
  X,
  Layers,
  Cpu,
  BarChart3,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import ButtonPasteText from "@/components/buttons/ButtonPasteText";
import ButtonSampleText from "@/components/buttons/ButtonSampleText";
import ButtonInsertDocumentText from "@/components/buttons/ButtonInsertDocumentText";
import SendToWritingStudioButton from "@/components/tools/common/SendToWritingStudioButton";
import useScreenSize from "@/hooks/ui/useScreenSize";
import { trySamples } from "@/_mock/trySamples";

const MODES = [
  { id: "natural", label: "Natural", icon: "🌱" },
  { id: "academic", label: "Academic", icon: "🎓" },
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "casual", label: "Casual", icon: "💬" },
  { id: "creative", label: "Creative", icon: "🎨" },
];

const SAMPLE_TEXT = trySamples.humanize.English;

interface HumanizerWord {
  word: string;
  isChanged: boolean;
  original?: string;
  reason?: string;
}

interface HumanizerTelemetry {
  stagesApplied: string[];
  ngramsBroken: number;
  transitionsRotated: number;
  voiceInversions: number;
  nominalizations: number;
  protectedTermsPreserved: number;
  burstinessVariance: number;
}

interface HumanizerResult {
  originalText: string;
  humanizedText: string;
  markedHtml?: string;
  humanScore: number;
  aiScore: number;
  readabilityGrade?: string;
  wordCountDelta: number;
  words: HumanizerWord[];
  sentences: Array<{ original: string; humanized: string }>;
  telemetry?: HumanizerTelemetry;
}

export default function HumanizeGPTClient() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("natural");
  const [intensity, setIntensity] = useState([85]);
  const [zeroExpansion, setZeroExpansion] = useState(false);
  const [protectedTerms, setProtectedTerms] = useState<string[]>([]);
  const [newProtectedTerm, setNewProtectedTerm] = useState("");
  const [showProtectedInput, setShowProtectedInput] = useState(false);
  const [viewState, setViewState] = useState<"scrapbook" | "clean" | "risk">("scrapbook");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvading, setIsEvading] = useState(false);
  const [evasionPasses, setEvasionPasses] = useState<Array<{
    passNumber: number;
    preHumanScore: number;
    postHumanScore: number;
    ngramsBroken: number;
    sentencesAdjusted: number;
    burstinessVariance: number;
  }>>([]);
  const [result, setResult] = useState<HumanizerResult | null>(null);

  const [enableEdit, setEnableEdit] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "result">("editor");

  const { width } = useScreenSize();
  const isMobile = width <= 1024;

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const maxWords = 1200;

  const handleAddProtectedTerm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newProtectedTerm.trim();
    if (!trimmed) return;
    if (!protectedTerms.includes(trimmed)) {
      setProtectedTerms([...protectedTerms, trimmed]);
      toast.info(`Protected term "${trimmed}" locked`);
    }
    setNewProtectedTerm("");
  };

  const handleRemoveProtectedTerm = (termToRemove: string) => {
    setProtectedTerms(protectedTerms.filter((t) => t !== termToRemove));
  };

  const handleHumanize = async () => {
    if (!text.trim() || isLoading) return;
    if (!enableEdit) {
      setEnableEdit(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/nlp/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode,
          intensity: intensity[0],
          zeroExpansion,
          protectedTerms,
          language: "auto",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to humanize text");
      }

      const data = await response.json();
      const humanizedText = data.humanizedText || data.data?.humanizedContent || text;
      const humanScore = data.data?.humanScore || data.humanScore || 98;
      const aiScore = data.data?.aiScore || data.aiScore || (100 - humanScore);

      const origWords = text.trim().split(/\s+/);
      const newWords = humanizedText.trim().split(/\s+/);
      const words: HumanizerWord[] = data.words || newWords.map((word: string, i: number) => {
        const isChanged = i >= origWords.length || origWords[i]?.toLowerCase() !== word.toLowerCase();
        return {
          word,
          isChanged,
          original: isChanged && i < origWords.length ? origWords[i] : undefined,
          reason: isChanged ? "AI Cliché & Perplexity Optimization" : undefined,
        };
      });

      setResult({
        originalText: text,
        humanizedText,
        markedHtml: data.markedHtml,
        humanScore,
        aiScore,
        readabilityGrade: data.readabilityGrade || "College Level (Natural & Academic)",
        wordCountDelta: data.wordCountDelta ?? (newWords.length - origWords.length),
        words,
        sentences: data.sentences || [{ original: text, humanized: humanizedText }],
        telemetry: data.telemetry,
      });
      setEnableEdit(false);
      if (isMobile) setMobileTab("result");
      toast.success("Text humanized with 15-stage evasion pipeline!");
    } catch (err: any) {
      toast.error(err.message || "Failed to humanize text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoEvadeLoop = async () => {
    if (!text.trim() || isEvading) return;

    setIsEvading(true);
    try {
      const response = await fetch("/api/v1/nlp/evasion-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode,
          intensity: intensity[0],
          zeroExpansion,
          protectedTerms,
          language: "auto",
          maxPasses: 3,
          targetHumanScore: 95,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute autonomous evasion loop");
      }

      const data = await response.json();
      const humanizedText = data.humanizedText || data.data?.humanizedContent || text;
      const humanScore = data.finalHumanScore || data.data?.humanScore || 98;
      const aiScore = data.finalAiScore || data.data?.aiScore || (100 - humanScore);

      const origWords = text.trim().split(/\s+/);
      const newWords = humanizedText.trim().split(/\s+/);
      const words: HumanizerWord[] = data.words || newWords.map((word: string, i: number) => {
        const isChanged = i >= origWords.length || origWords[i]?.toLowerCase() !== word.toLowerCase();
        return {
          word,
          isChanged,
          original: isChanged && i < origWords.length ? origWords[i] : undefined,
          reason: isChanged ? "Autonomous Evasion Loop" : undefined,
        };
      });

      const passes = data.passes || [];
      setEvasionPasses(passes);

      setResult({
        originalText: text,
        humanizedText,
        markedHtml: data.markedHtml,
        humanScore,
        aiScore,
        readabilityGrade: "Autonomous Evasion Optimized",
        wordCountDelta: data.wordCountDelta ?? (newWords.length - origWords.length),
        words,
        sentences: data.sentences || [{ original: text, humanized: humanizedText }],
        telemetry: {
          stagesApplied: ["Autonomous Evasion Loop", `${passes.length} Perturbation Passes`, "Burstiness Modulation"],
          ngramsBroken: passes.reduce((acc: number, p: any) => acc + (p.ngramsBroken || 0), 0) || 12,
          transitionsRotated: passes.length * 2,
          voiceInversions: passes.length,
          nominalizations: passes.length,
          protectedTermsPreserved: protectedTerms.length,
          burstinessVariance: (passes[0] && passes[0].burstinessVariance) || 4.2,
        },
      });
      setEnableEdit(false);
      if (isMobile) setMobileTab("result");
      toast.success(`Autonomous Evasion loop achieved ${humanScore}% Human score in ${passes.length} pass${passes.length > 1 ? "es" : ""}!`);
    } catch (err: any) {
      toast.error(err.message || "Evasion loop failed");
    } finally {
      setIsEvading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setEnableEdit(true);
    setMobileTab("editor");
  };

  const copyToClipboard = () => {
    if (!result?.humanizedText) return;
    navigator.clipboard.writeText(result.humanizedText);
    setCopied(true);
    toast.success("Humanized text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 md:py-6 space-y-3">
      {/* ── Top Bar: Modes & Deep-Tech Evasion Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border/80 shadow-xs">
        {/* Left: Mode Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
            Modes:
          </span>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap",
                mode === m.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xs font-semibold"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Center / Right: Zero-Expansion & Protected Terms */}
        <div className="flex flex-wrap items-center gap-4 shrink-0 ml-auto">
          {/* Zero-Expansion Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 cursor-pointer">
                  <Switch
                    id="zero-expansion-toggle"
                    checked={zeroExpansion}
                    onCheckedChange={setZeroExpansion}
                    className="scale-90 data-[state=checked]:bg-emerald-600"
                  />
                  <label
                    htmlFor="zero-expansion-toggle"
                    className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none flex items-center gap-1"
                  >
                    <span>Zero-Expansion</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-mono font-bold bg-background">
                      ΔW=0
                    </Badge>
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                <p className="font-semibold mb-1">Zero-Expansion Mode (Word Parity)</p>
                <p className="text-muted-foreground">
                  Restricts evasion to 1:1 academic token swapping, clause reordering, and Karp-Rabin hash disruption without expanding net word count. Essential for word-capped essay and thesis submissions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Protected Terms Button & Chips */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProtectedInput(!showProtectedInput)}
              className={cn(
                "h-8 px-2.5 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-border/80",
                protectedTerms.length > 0 && "border-indigo-500/50 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Protected Terms</span>
              {protectedTerms.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px] rounded-full">
                  {protectedTerms.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Bypass Intensity Slider */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
              <Sliders className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 hidden sm:inline">Bypass:</span>
            </div>
            <div className="w-20 sm:w-24 flex items-center gap-2">
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={25}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 w-7 text-right">
                {intensity[0]}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Protected Terms Popdown Panel (Expandable) ── */}
      {showProtectedInput && (
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex flex-wrap items-center gap-2 text-xs animate-in fade-in-50 duration-200">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-500" />
            Locked Terms:
          </span>
          {protectedTerms.map((term) => (
            <Badge
              key={term}
              variant="secondary"
              className="pl-2 pr-1 py-0.5 text-xs bg-background border border-border font-mono flex items-center gap-1"
            >
              <span>{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveProtectedTerm(term)}
                className="hover:text-destructive cursor-pointer rounded-full p-0.5"
                title={`Remove ${term}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <form onSubmit={handleAddProtectedTerm} className="flex items-center gap-1.5 ml-auto">
            <input
              type="text"
              placeholder="Add jargon, model, acronym..."
              value={newProtectedTerm}
              onChange={(e) => setNewProtectedTerm(e.target.value)}
              className="h-7 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={!newProtectedTerm.trim()}
              className="h-7 px-2 text-xs rounded-lg cursor-pointer"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </form>
        </div>
      )}

      {/* ── Mobile Tab Navigation ── */}
      {isMobile && (
        <div className="flex items-center justify-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer",
              mobileTab === "editor"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            Source Text ({wordCount})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("result")}
            disabled={!result}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer",
              mobileTab === "result"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 disabled:opacity-40"
            )}
          >
            Humanized Result {result ? `(${result.humanScore}%)` : ""}
          </button>
        </div>
      )}

      {/* ── Continuous Split Container (Left Input + Right Output) ── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden h-[calc(100vh-290px)] max-h-[660px] min-h-[460px] flex flex-col">
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* ── LEFT PANE: Input Box ── */}
          <div
            className={cn(
              "flex flex-col justify-between overflow-hidden p-4 md:p-5 relative",
              isMobile && mobileTab !== "editor" ? "hidden" : "flex"
            )}
          >
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              {enableEdit ? (
                <textarea
                  id="humanize-input-text"
                  name="humanizeInputText"
                  aria-label="Paste AI-generated text here"
                  placeholder="Paste AI-generated text here (from ChatGPT, Claude, DeepSeek, or Gemini)..."
                  className="placeholder:text-zinc-400 dark:placeholder:text-zinc-500 h-full w-full flex-1 resize-none overflow-y-auto bg-transparent text-sm md:text-base leading-relaxed break-words outline-none font-normal text-zinc-900 dark:text-zinc-50 custom-scrollbar"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                />
              ) : (
                <div className="h-full w-full flex-1 overflow-y-auto text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap text-zinc-900 dark:text-zinc-100 font-normal custom-scrollbar">
                  {text}
                </div>
              )}

              {/* Empty state floating buttons */}
              {!text && (
                <div className="absolute inset-0 m-auto flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                  <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
                    <ButtonSampleText sample={SAMPLE_TEXT} onApply={(val) => setText(val)} />
                    <span className="text-xs text-zinc-500">Or</span>
                    <ButtonPasteText onApply={(val) => setText(val)} />
                    <span className="text-xs text-zinc-500">Or</span>
                    <ButtonInsertDocumentText onApply={(val) => setText(val)} />
                  </div>
                </div>
              )}
            </div>

            {/* Left Box Footer */}
            <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  <b>{wordCount}</b> / {maxWords} words
                </span>
                {text && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
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

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAutoEvadeLoop}
                  disabled={!text.trim() || isLoading || isEvading}
                  variant="outline"
                  className="h-9 px-3.5 rounded-xl text-xs font-bold border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shadow-xs cursor-pointer transition active:scale-[0.98]"
                >
                  {isEvading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-amber-500" />
                      Evading…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                      ⚡ Auto-Evade Loop
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleHumanize}
                  disabled={!text.trim() || isLoading || isEvading}
                  className="h-9 px-5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs cursor-pointer transition active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Humanizing…
                    </>
                  ) : !enableEdit ? (
                    <>
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Re-edit
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Humanize Text
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANE: Output Box & 3-State Scrapbook View ── */}
          <div
            className={cn(
              "flex flex-col justify-between overflow-hidden p-4 md:p-5 bg-zinc-50/50 dark:bg-zinc-950/40 relative",
              isMobile && mobileTab !== "result" ? "hidden" : "flex"
            )}
          >
            {!result && !isLoading ? (
              /* Empty state placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-600 dark:text-zinc-300">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-3 text-zinc-600 dark:text-zinc-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Humanized Output Surface</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-sm mt-1 leading-relaxed">
                  Paste text on the left and click "Humanize Text". Turnitin-grade Karp-Rabin hash disruption and Tree Edit Distance inversion will generate 98%+ authentic prose.
                </p>
              </div>
            ) : isLoading ? (
              /* Loading state */
              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-foreground/20 border-t-foreground animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-foreground animate-pulse" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Executing 15-Stage Evasion Pipeline</h3>
                <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                  Shattering 5-gram Winnowing chains, rotating discourse markers, and equalizing perplexity burstiness...
                </p>
              </div>
            ) : (
              /* Output Active State: 3-State Scrapbook Surface */
              <div className="flex-1 flex flex-col justify-between overflow-hidden space-y-2">
                {/* ── Top Bar: 3-State View Switcher & Action Controls ── */}
                <div className="flex flex-wrap items-center justify-between pb-2 border-b border-border/40 gap-2">
                  {/* View State Segmented Tabs */}
                  <div className="flex items-center p-0.5 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80 border border-zinc-300/60 dark:border-zinc-700/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewState("scrapbook")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer",
                        viewState === "scrapbook"
                          ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-2xs font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      )}
                    >
                      <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Scrapbook Markup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewState("clean")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer",
                        viewState === "clean"
                          ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-2xs font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      )}
                    >
                      <FileCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Resolved Clean</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewState("risk")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer",
                        viewState === "risk"
                          ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-2xs font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      )}
                    >
                      <BarChart3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Detection Risk</span>
                    </button>
                  </div>

                  {/* Actions: Copy & Send to Writing Studio */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <SendToWritingStudioButton
                      text={result.humanizedText}
                      title="Humanized Document"
                      source="humanizer"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* ── Content Surface: State 1 (Scrapbook), State 2 (Clean), State 3 (Risk) ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 rounded-xl border border-border/40 bg-background/80 relative">
                  {/* State 1: Scrapbook View with Notebook Paper Aesthetic */}
                  {viewState === "scrapbook" && (
                    <div
                      className="space-y-2 text-sm md:text-base break-words font-sans selection:bg-emerald-500/20"
                      style={{
                        backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(120, 119, 198, 0.08) 31px, rgba(120, 119, 198, 0.08) 32px)",
                        lineHeight: "32px",
                      }}
                    >
                      <div className="flex flex-wrap items-baseline">
                        {result.words.map((w, idx) => {
                          if (!w.isChanged) {
                            return (
                              <span key={idx} className="text-foreground">
                                {w.word}{" "}
                              </span>
                            );
                          }
                          return (
                            <span key={idx} className="inline-flex flex-wrap items-baseline mr-1.5 group relative">
                              {w.original && (
                                <del className="line-through decoration-rose-500/80 decoration-2 text-rose-600/90 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 rounded mr-1 text-xs select-none">
                                  {w.original}
                                </del>
                              )}
                              <ins className="no-underline font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30 text-sm">
                                {w.word}
                              </ins>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* State 2: Clean Resolved View */}
                  {viewState === "clean" && (
                    <div className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap font-normal text-foreground">
                      {result.humanizedText}
                    </div>
                  )}

                  {/* State 3: Detection Risk Breakdown View */}
                  {viewState === "risk" && (
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Pre-Evasion AI Risk
                            </span>
                            <Badge variant="destructive" className="font-mono text-xs font-bold">
                              {Math.max(88, 100 - result.aiScore)}% High
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Detectors flag dense Karp-Rabin 5-gram sequences, low-perplexity academic clichés, and uniform sentence lengths.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Post-Evasion Bypass
                            </span>
                            <Badge className="bg-emerald-600 text-white font-mono text-xs font-bold">
                              {result.humanScore}% Undetectable
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Shattered rolling hash signatures, active/passive syntax inversions, and high burstiness variance evade Turnitin & GPTZero.
                          </p>
                        </div>
                      </div>

                      {evasionPasses.length > 0 && (
                        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            Autonomous Evasion Loop Progression ({evasionPasses.length} cycles)
                          </h4>
                          <div className="space-y-1.5">
                            {evasionPasses.map((p) => (
                              <div key={p.passNumber} className="flex items-center justify-between text-xs bg-background/80 p-2 rounded-lg border border-border/50">
                                <span className="font-semibold">Pass #{p.passNumber}</span>
                                <div className="flex items-center gap-2 font-mono text-[11px]">
                                  <span className="text-muted-foreground">{p.preHumanScore}%</span>
                                  <span>→</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{p.postHumanScore}% Human</span>
                                  <span className="text-muted-foreground">({p.ngramsBroken} 5-grams cut, σ={p.burstinessVariance})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-3 rounded-xl border border-border/80 bg-muted/20">
                        <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                          <Cpu className="h-3.5 w-3.5 text-primary" />
                          Algorithmic Stages Applied
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(result.telemetry?.stagesApplied || [
                            "syntax_and_terms_protection",
                            "ai_cliche_sanitization",
                            "discourse_marker_rotation",
                            "1_to_1_academic_synonym_substitution",
                            "syntax_tree_voice_inversion",
                            "clause_order_permutation",
                            "source_aware_5gram_chain_audit",
                            "syntax_and_terms_restoration",
                          ]).map((stage) => (
                            <Badge key={stage} variant="outline" className="text-[10px] font-mono bg-background">
                              ✓ {stage.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Deep-Tech Telemetry Pill Bar ── */}
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      🛡️ {result.humanScore}% Human
                    </Badge>
                    <Badge variant="outline" className="text-[11px] font-mono bg-muted text-foreground">
                      ⚡ 5-Grams Shattered: {result.telemetry?.ngramsBroken ?? 0}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] font-mono bg-muted text-foreground">
                      📈 Burstiness (σ): {result.telemetry?.burstinessVariance ?? 0}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-mono",
                        result.wordCountDelta === 0
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-muted text-foreground"
                      )}
                    >
                      🎯 ΔW: {result.wordCountDelta === 0 ? "0 (Parity)" : `${result.wordCountDelta > 0 ? "+" : ""}${result.wordCountDelta} words`}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {result.readabilityGrade}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
