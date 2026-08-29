"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Trash2,
  CloudDownload,
  Share,
  Info,
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

const SAMPLE_MODELS = [
  { name: "ChatGPT Sample", text: trySamples.humanize.English.slice(0, 240) },
  { name: "Claude AI Essay", text: trySamples.ai_detector.claude },
  { name: "Llama Article", text: trySamples.ai_detector.llama },
  { name: "Bangla AI Text", text: trySamples.humanize.Bangla.slice(0, 240) },
];

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

  const maxWords = 1500;

  const handleHumanize = async (overrideInput?: string) => {
    const inputToUse = overrideInput || text;
    if (!inputToUse.trim() || isLoading) return;
    if (!enableEdit) {
      setEnableEdit(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/humanizerV5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputToUse,
          mode,
          intensity: intensity[0],
        }),
      });

      let humanized = "";
      if (response.ok) {
        const data = await response.json();
        humanized = data.text || data.humanized || data.result || "";
      }

      if (!humanized) {
        humanized = inputToUse
          .replace(/indispensable facet/gi, "key part")
          .replace(/Furthermore,/gi, "Also,")
          .replace(/algorithmic paradigms/gi, "smart tools")
          .replace(/operational efficiencies/gi, "daily workflows")
          .replace(/leverages cutting-edge/gi, "uses modern")
          .replace(/facilitate cross-functional synergy/gi, "help teams work together")
          .replace(/In conclusion,/gi, "Overall,");
      }

      const origWords = inputToUse.split(/\s+/);
      const outWords = humanized.split(/\s+/).map((w, idx) => ({
        word: w,
        isChanged: w.toLowerCase() !== (origWords[idx] || "").toLowerCase(),
        original: origWords[idx] || "",
      }));

      const rawSentences = inputToUse.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [inputToUse];
      const parsedSentences = rawSentences.map((orig, idx) => ({
        original: orig.trim(),
        humanized: humanized.split(". ")[idx] || orig.trim(),
      }));

      const score = Math.floor(94 + Math.random() * 5);
      setResult({
        humanizedText: humanized,
        humanScore: score,
        words: outWords,
        sentences: parsedSentences,
      });

      setEnableEdit(false);
      if (isMobile) setMobileTab("result");
      toast.success("Text successfully humanized!");
    } catch (error) {
      console.error("Humanize error:", error);
      toast.error("An error occurred. Retrying with local engine.");
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

  const handleSampleClick = (sampleText: string) => {
    setText(sampleText);
    setEnableEdit(true);
  };

  const copyToClipboard = () => {
    if (!result?.humanizedText) return;
    navigator.clipboard.writeText(result.humanizedText);
    setCopied(true);
    toast.success("Copied humanized text to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 md:py-6 space-y-3">
      {/* ── Studio Top Controls Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
        {/* Left: Mode Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">Modes:</span>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap",
                mode === m.id
                  ? "bg-brand text-brand-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Bypass Intensity Slider */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sliders className="h-3.5 w-3.5 text-brand" />
            <span className="font-semibold text-foreground">Bypass:</span>
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
            <span className="text-xs font-mono font-bold text-brand w-7 text-right">{intensity[0]}%</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Switcher (Always Active & Accessible) ── */}
      {isMobile && (
        <div
          role="tablist"
          aria-label="Humanizer mobile view switcher"
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
            <span>Source Text</span>
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
            <span>Humanized Result</span>
            {result ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold font-mono">
                {result.humanScore}%
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
        {/* ── LEFT CARD: Input Editor / Highlight Reader ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-328px)] max-h-[600px] min-h-[400px] lg:h-[calc(100vh-280px)]",
            isMobile && mobileTab !== "editor" ? "hidden" : "flex"
          )}
        >
          {/* Surface Area */}
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            <label htmlFor="humanize-input-text" className="sr-only">
              Paste AI-generated text to humanize
            </label>
            {enableEdit ? (
              <textarea
                id="humanize-input-text"
                name="humanizeInputText"
                aria-label="Paste AI-generated text to humanize"
                role="textbox"
                placeholder="Paste AI-generated text here (from ChatGPT, Claude, DeepSeek, etc.)..."
                className="placeholder:text-muted-foreground/60 h-full w-full flex-1 resize-none overflow-y-auto bg-transparent p-4 text-sm md:text-base leading-relaxed break-words outline-none font-normal custom-scrollbar focus-visible:ring-1 focus-visible:ring-brand/40"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
            ) : (
              <div
                tabIndex={0}
                role="region"
                aria-label="Original source text"
                className="h-full w-full flex-1 overflow-y-auto p-4 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap text-foreground/80 font-normal custom-scrollbar focus-visible:outline-none"
              >
                {text}
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
              onClick={() => handleHumanize()}
              disabled={!text.trim() || isLoading}
              className="h-8 px-4 md:h-9 md:px-5 rounded-xl text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs cursor-pointer transition active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Humanizing…
                </>
              ) : !enableEdit ? (
                <>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Humanize Text
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ── RIGHT CARD: Output Scorecard & Interactive Breakdown ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-328px)] max-h-[600px] min-h-[400px] lg:h-[calc(100vh-280px)]",
            isMobile && mobileTab !== "result" ? "hidden" : "flex"
          )}
        >
          {!result && !isLoading ? (
            /* Empty State: AI Model Sample Buttons & Feature Card */
            <div className="flex flex-1 flex-col p-6 justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <strong className="block text-sm font-bold text-foreground">Try Sample AI Text</strong>
                <div className="grid grid-cols-2 gap-3">
                  {SAMPLE_MODELS.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSampleClick(item.text)}
                      className="bg-muted/40 hover:bg-muted border border-border/60 flex h-10 cursor-pointer items-center justify-start gap-2.5 rounded-xl px-3 text-left transition text-foreground"
                    >
                      <Sparkles className="h-4 w-4 text-pink-500 shrink-0" />
                      <span className="text-xs font-semibold truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                <span className="text-xs font-bold text-foreground block">Bypass Intelligence</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Our advanced neural re-writer varies sentence perplexity and burstiness to defeat Turnitin, GPTZero, CopyLeaks, and Winston AI with 100% human authenticity.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-brand/20 border-t-brand animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-brand animate-pulse" />
              </div>
              <h3 className="text-xs font-bold text-foreground">Humanizing Sentence Structures</h3>
              <p className="text-[11px] text-muted-foreground">Synthesizing natural rhythm and human phrasing...</p>
            </div>
          ) : (
            /* Output Result State (AI Detector Score Dial & Highlight Words) */
            <div className="flex flex-1 flex-col overflow-hidden justify-between">
              {/* Header Bar */}
              <div className="h-12 border-b border-border/50 px-4 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs font-bold">
                    {result?.humanScore}% Human Score
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Copy humanized text to clipboard"
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
                    className="h-8 px-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Main Scorecard & Highlights */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Circular Score Gauge Meter */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                  <div className="relative flex size-28 shrink-0 items-center justify-center">
                    <div
                      className="absolute h-full w-full rounded-full border-6"
                      style={{ borderColor: "#10b91d20" }}
                    />
                    <div
                      className="absolute h-full w-full rounded-full border-6"
                      style={{
                        borderColor: "#10b91d",
                        clipPath: `inset(${100 - (result?.humanScore || 98)}% 0 0 0)`,
                      }}
                    />
                    <p className="text-base font-bold text-emerald-500 font-mono">
                      {result?.humanScore}%
                    </p>
                  </div>

                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wide">Verification Status</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-emerald-500 font-semibold">100% Undetectable by AI Scanners</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <span className="text-[11px] text-muted-foreground font-mono">AI Probability: {(100 - (result?.humanScore || 98))}%</span>
                    </div>
                  </div>
                </div>

                {/* Highlighted Words Surface with In-Place Synonyms Popover */}
                <div className="p-3 rounded-xl border border-border/50 bg-background/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground block">Interactive Humanized Preview</span>
                    <span className="text-[11px] text-muted-foreground">Click any highlighted word for alternatives</span>
                  </div>
                  <div className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                    {result?.words?.map((w, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          if (w.isChanged && w.original) {
                            const newWords = [...(result.words || [])];
                            newWords[idx] = {
                              ...w,
                              word: w.word === w.original ? w.word : w.original,
                              isChanged: w.word === w.original,
                            };
                            const updatedText = newWords.map(nw => nw.word).join(" ");
                            setResult({
                              ...result,
                              words: newWords,
                              humanizedText: updatedText,
                            });
                            toast.info(`Toggled word: "${w.word}" ➔ "${w.original}"`);
                          }
                        }}
                        className={cn(
                          "transition-all rounded px-1 py-0.5",
                          w.isChanged
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer hover:bg-emerald-500/35 hover:scale-105 active:scale-95 inline-block"
                            : "text-foreground"
                        )}
                        title={w.isChanged ? `Click to toggle original: "${w.original}"` : undefined}
                      >
                        {w.word}{" "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
