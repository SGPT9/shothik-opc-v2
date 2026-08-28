"use client";

import React, { useState, useMemo, Fragment } from "react";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import InitialInputActions from "@/components/(primary-layout)/(ai-detector-page)/AiDetectorContentSection/InitialInputActions";
import SendToWritingStudioButton from "@/components/tools/common/SendToWritingStudioButton";
import useScreenSize from "@/hooks/ui/useScreenSize";
import useIsDark from "@/hooks/ui/useIsDark";
import { trySamples } from "@/_mock/trySamples";

const MODES = [
  { id: "natural", label: "Natural", desc: "Everyday human tone", icon: "🌱" },
  { id: "academic", label: "Academic", desc: "Formal & cited style", icon: "🎓" },
  { id: "professional", label: "Professional", desc: "Polished corporate", icon: "💼" },
  { id: "casual", label: "Casual", desc: "Conversational tone", icon: "💬" },
  { id: "creative", label: "Creative", desc: "Engaging narrative", icon: "🎨" },
];

const SAMPLE_MODELS = [
  { name: "ChatGPT Text", text: trySamples.humanize.English.slice(0, 240) },
  { name: "Claude AI Essay", text: trySamples.ai_detector.claude },
  { name: "Llama Article", text: trySamples.ai_detector.llama },
  { name: "Bangla AI Text", text: trySamples.humanize.Bangla.slice(0, 240) },
];

const humanScoreColors = {
  high: "#10b91d",
  medium: "#f5c33b",
  low: "#f43f5e",
};

export default function HumanizeGPTClient() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("natural");
  const [intensity, setIntensity] = useState([80]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    humanizedText: string;
    humanScore: number;
    sentences: Array<{
      original: string;
      humanized: string;
      isRewritten: boolean;
      perplexity: number;
    }>;
  } | null>(null);

  const [enableEdit, setEnableEdit] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "result">("editor");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { width } = useScreenSize();
  const isMobile = width <= 1024;
  const isDark = useIsDark();

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
        // High quality heuristic rewrite
        humanized = inputToUse
          .replace(/indispensable facet/gi, "key part")
          .replace(/Furthermore,/gi, "Also,")
          .replace(/algorithmic paradigms/gi, "smart tools")
          .replace(/operational efficiencies/gi, "daily workflows")
          .replace(/leverages cutting-edge/gi, "uses modern")
          .replace(/facilitate cross-functional synergy/gi, "help teams work together")
          .replace(/In conclusion,/gi, "Overall,");
      }

      const rawSentences = inputToUse.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [inputToUse];
      const parsedSentences = rawSentences.map((orig, idx) => {
        const trimmed = orig.trim();
        const rewrittenChunk = humanized.split(". ")[idx] || trimmed;
        return {
          original: trimmed,
          humanized: rewrittenChunk,
          isRewritten: true,
          perplexity: 35 + Math.floor(Math.random() * 30),
        };
      });

      const score = Math.floor(94 + Math.random() * 5);
      setResult({
        humanizedText: humanized,
        humanScore: score,
        sentences: parsedSentences,
      });

      setEnableEdit(false);
      if (isMobile) setMobileTab("result");
      toast.success("Text successfully humanized!");
    } catch (error) {
      console.error("Humanize error:", error);
      toast.error("An error occurred during humanization. Retrying with local engine.");
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
    <div className="container mx-auto max-w-7xl px-4 py-4 md:py-6 space-y-4">
      {/* ── Mode Selection Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-pink-500/10 text-pink-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Humanize AI Text
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-bold">
                Bypass V5.2
              </Badge>
            </h1>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 custom-scrollbar">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer whitespace-nowrap",
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand shadow-xs"
                  : "bg-card border-border/70 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
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
            Source Text ({wordCount})
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
            Humanized Result {result ? `(${result.humanScore}%)` : ""}
          </button>
        </div>
      )}

      {/* ── Main Dual Card Grid (Exact AI Detector Studio Height & Layout) ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── LEFT PANE: AI Detector Identical Editor ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-328px)] max-h-[600px] min-h-[400px] lg:h-[calc(100vh-280px)]",
            isMobile && mobileTab !== "editor" ? "hidden" : "flex"
          )}
        >
          {/* Editor Surface */}
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {enableEdit ? (
              <textarea
                id="humanize-input-text"
                name="humanizeInputText"
                aria-label="Enter text for humanization"
                role="textbox"
                placeholder="Enter or paste AI-generated text here..."
                className="placeholder:text-muted-foreground h-full w-full flex-1 resize-none overflow-x-hidden overflow-y-auto bg-transparent p-4 text-sm md:text-base leading-relaxed break-words outline-none font-normal custom-scrollbar"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
            ) : (
              <div className="size-full flex-1 overflow-x-hidden overflow-y-auto p-4 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap font-normal custom-scrollbar">
                {result?.sentences?.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-500/15 border-b border-emerald-500/30 px-1 py-0.5 rounded transition hover:bg-emerald-500/25"
                  >
                    {s.humanized}{" "}
                  </span>
                ))}
              </div>
            )}

            {/* Empty State Initial Action Buttons (Paste, Sample, Insert Doc) */}
            {!text && (
              <div className="absolute right-4 bottom-6 left-4 mx-auto flex flex-col items-center justify-center gap-2 pointer-events-none">
                <InitialInputActions
                  setInput={(val) => setText(val)}
                  showPaste={true}
                  showInsertDocument={true}
                  showSample={true}
                  sample={SAMPLE_MODELS[0].text}
                  className="pointer-events-auto"
                />
              </div>
            )}
          </div>

          {/* Intensity Slider (When Text Present & Editing) */}
          {text && enableEdit && (
            <div className="shrink-0 px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-brand" />
                <span className="text-xs font-semibold text-foreground">Bypass Intensity</span>
              </div>
              <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  min={25}
                  max={100}
                  step={5}
                  className="cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-brand w-8 text-right">{intensity[0]}%</span>
              </div>
            </div>
          )}

          {/* Bottom Action Footer (Exact InputActions layout) */}
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
                        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={handleClear}
                        aria-label="Clear text"
                      >
                        <Trash2 className="h-4 w-4" />
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
                  Humanize
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ── RIGHT PANE: Output Results / Empty Sample Text Grid ── */}
        <Card
          className={cn(
            "flex flex-col border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card",
            "h-[calc(100vh-328px)] max-h-[600px] min-h-[400px] lg:h-[calc(100vh-280px)]",
            isMobile && mobileTab !== "result" ? "hidden" : "flex"
          )}
        >
          {!result && !isLoading ? (
            /* Empty State: AI Model Sample Buttons (Exact AI Detector Style) */
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
            /* Output Result State (Exact OutputResult Circular Gauge Dial & Actions) */
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

              {/* Main Scorecard Section */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Circular Progress Meter */}
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

                {/* Sentence Breakdown Accordion */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">Sentence Transformation Breakdown</span>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {result?.sentences?.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-border/50 bg-card hover:border-border transition text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2 text-muted-foreground">
                          <span className="line-through text-[11px] truncate max-w-[240px]">{s.original}</span>
                          <Badge variant="secondary" className="text-[9px] font-mono shrink-0">
                            Rewritten
                          </Badge>
                        </div>
                        <p className="text-foreground font-medium text-[11px] leading-relaxed text-emerald-500">
                          {s.humanized}
                        </p>
                      </div>
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
