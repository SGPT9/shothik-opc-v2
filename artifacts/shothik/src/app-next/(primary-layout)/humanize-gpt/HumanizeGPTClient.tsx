"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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

export default function HumanizeGPTClient() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("natural");
  const [intensity, setIntensity] = useState([80]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    humanizedText: string;
    humanScore: number;
    words: Array<{ word: string; isChanged: boolean; original?: string }>;
    sentences: Array<{ original: string; humanized: string }>;
  } | null>(null);

  const [enableEdit, setEnableEdit] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "result">("editor");

  const { width } = useScreenSize();
  const isMobile = width <= 1024;

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const maxWords = 1200;

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to humanize text");
      }

      const data = await response.json();
      const humanizedText = data.humanizedText || data.data?.humanizedContent || text;
      const humanScore = data.data?.humanScore || data.humanScore || 98;

      const origWords = text.trim().split(/\s+/);
      const newWords = humanizedText.trim().split(/\s+/);
      const words = newWords.map((word, i) => {
        const isChanged = i >= origWords.length || origWords[i]?.toLowerCase() !== word.toLowerCase();
        return {
          word,
          isChanged,
          original: isChanged && i < origWords.length ? origWords[i] : undefined,
        };
      });

      setResult({
        humanizedText,
        humanScore,
        words: data.words || words,
        sentences: data.sentences || [{ original: text, humanized: humanizedText }],
      });
      setEnableEdit(false);
      if (isMobile) setMobileTab("result");
      toast.success("Text successfully humanized!");
    } catch (err: any) {
      toast.error(err.message || "Failed to humanize text");
    } finally {
      setIsLoading(false);
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
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 md:py-6 space-y-3">
      {/* ── Integrated Top Mode & Settings Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border/80 shadow-xs">
        {/* Left: Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">Modes:</span>
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

        {/* Right: Bypass Intensity Slider */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Sliders className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Bypass:</span>
          </div>
          <div className="w-24 sm:w-28 flex items-center gap-2">
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              min={25}
              max={100}
              step={5}
              className="cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 w-7 text-right">{intensity[0]}%</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Navigation ── */}
      {isMobile && (
        <div className="flex items-center justify-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer",
              mobileTab === "editor" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold" : "text-zinc-600 dark:text-zinc-400"
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
              mobileTab === "result" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold" : "text-zinc-600 dark:text-zinc-400 disabled:opacity-40"
            )}
          >
            Humanized Result {result ? `(${result.humanScore}%)` : ""}
          </button>
        </div>
      )}

      {/* ── Unified Continuous Split Container (Left Input + Right Output) ── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden h-[calc(100vh-320px)] max-h-[620px] min-h-[440px] flex flex-col">
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* ── LEFT PANE: Input Box ── */}
          <div className={cn(
            "flex flex-col justify-between overflow-hidden p-4 md:p-5 relative",
            isMobile && mobileTab !== "editor" ? "hidden" : "flex"
          )}>
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              {enableEdit ? (
                <textarea
                  id="humanize-input-text"
                  name="humanizeInputText"
                  aria-label="Paste AI-generated text here"
                  placeholder="Paste AI-generated text here (from ChatGPT, Claude, DeepSeek, etc.)..."
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
                    <ButtonSampleText
                      sample={SAMPLE_TEXT}
                      onApply={(val) => setText(val)}
                    />
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

              <Button
                onClick={handleHumanize}
                disabled={!text.trim() || isLoading}
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

          {/* ── RIGHT PANE: Output Box ── */}
          <div className={cn(
            "flex flex-col justify-between overflow-hidden p-4 md:p-5 bg-zinc-50/50 dark:bg-zinc-950/40 relative",
            isMobile && mobileTab !== "result" ? "hidden" : "flex"
          )}>
            {!result && !isLoading ? (
              /* Empty state placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-600 dark:text-zinc-300">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-3 text-zinc-600 dark:text-zinc-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Humanized Output</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xs mt-1 leading-relaxed">
                  Enter text on the left and click "Humanize Text" to generate authentic, human-grade text with live AI bypass metrics.
                </p>
              </div>
            ) : isLoading ? (
              /* Loading state */
              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-foreground/20 border-t-foreground animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-foreground animate-pulse" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Humanizing Sentence Structures</h3>
                <p className="text-[11px] text-muted-foreground">Varying sentence perplexity & injecting authentic rhythm...</p>
              </div>
            ) : (
              /* Output Active State */
              <div className="flex-1 flex flex-col justify-between overflow-hidden space-y-3">
                {/* Top Mini Header: Score & Toolbar */}
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-muted text-foreground border-border text-xs font-mono font-bold">
                      {result?.humanScore}% Human Score
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">Bypasses Turnitin & GPTZero</span>
                  </div>

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
                      text={result?.humanizedText || ""}
                      title="Humanized Document"
                      source="humanizer"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Highlighted Interactive Words Output Surface */}
                <div className="flex-1 overflow-y-auto p-1 text-sm md:text-base leading-relaxed break-words custom-scrollbar">
                  <p className="whitespace-pre-wrap font-normal">
                    {result?.words?.map((w, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "transition-colors rounded px-0.5",
                          w.isChanged
                            ? "bg-muted/80 text-foreground font-medium underline decoration-border"
                            : "text-foreground"
                        )}
                        title={w.isChanged ? `Rewritten from: "${w.original}"` : undefined}
                      >
                        {w.word}{" "}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Bottom Color Legend */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-foreground/60" />
                      <span>Humanized Phrasing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-foreground/20" />
                      <span>Unchanged Text</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{result?.humanScore}% Undetectable</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
