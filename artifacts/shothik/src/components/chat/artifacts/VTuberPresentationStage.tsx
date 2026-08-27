"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  RefreshCw,
  Mic,
  Maximize2,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Upload,
  User,
  Radio,
  CheckCircle2,
  HelpCircle,
  Send,
  MessageSquareQuote,
} from "lucide-react";
import { AvatarOrb3D } from "@/components/chat/AvatarOrb3D";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import { cn } from "@/lib/utils";

interface VTuberPresentationStageProps {
  currentSlideIndex?: number;
  totalSlides?: number;
  slideTitle?: string;
  narrationScript?: string;
  speakerNotes?: string;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

type AvatarModelMode = "orb" | "anime" | "vrm";

interface InvestorQAItem {
  id: string;
  question: string;
  answer: string;
  askedAt: string;
}

export function VTuberPresentationStage({
  currentSlideIndex = 1,
  totalSlides = 8,
  slideTitle = "AI-Powered E-Commerce & Retail in Bangladesh",
  narrationScript = "Welcome to Shothik Hermes. We are demonstrating autonomous commerce orchestration across South Asia, reconciling bKash and Nagad payments with sub-second latency.",
  speakerNotes = "Highlight 1.85% MFS commission savings, Steadfast automated tracking, and 68% token reduction on Bengali prompts.",
  onNextSlide,
  onPrevSlide,
}: VTuberPresentationStageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.4);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [showScript, setShowScript] = useState(true);
  const [avatarMode, setAvatarMode] = useState<AvatarModelMode>("orb");
  const [customVrmName, setCustomVrmName] = useState<string | null>(null);
  const [qaInput, setQaInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [qaList, setQaList] = useState<InvestorQAItem[]>([
    {
      id: "qa-1",
      question: "How does Shothik ensure zero-leakage bKash payment verification?",
      answer: "We use an immutable cryptographic ledger paired with deterministic regex matching on SMS gateway webhooks and live MFS API callbacks.",
      askedAt: "2 mins ago",
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated audio waveform analyzer loop for lip-syncing
  useEffect(() => {
    let animationFrame: number;
    if (isPlaying || isAnswering) {
      const updateWaveform = () => {
        setAudioLevel(0.4 + Math.random() * 0.6);
        animationFrame = requestAnimationFrame(updateWaveform);
      };
      animationFrame = requestAnimationFrame(updateWaveform);
    } else {
      setAudioLevel(0.1);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, isAnswering]);

  const handleTogglePlay = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (!isPlaying) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(narrationScript);
        utterance.rate = speechSpeed;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const handleAskQuestion = () => {
    if (!qaInput.trim()) return;
    const q = qaInput.trim();
    setQaInput("");
    setIsAnswering(true);

    setTimeout(() => {
      const newAnswer: InvestorQAItem = {
        id: `qa-${Date.now()}`,
        question: q,
        answer: `Thank you for asking: regarding "${q.slice(0, 40)}...", our multi-agent architecture utilizes DSpark speculative draft routing to provide answers in sub-50ms with verified citations.`,
        askedAt: "Just now",
      };

      setQaList((prev) => [newAnswer, ...prev]);
      setIsAnswering(false);

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(newAnswer.answer);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    }, 1200);
  };

  return (
    <LiquidGlassCard palette="indigo" className="p-4 space-y-4 border border-border/60">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Open-LLM-VTuber Narration Stage</h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              Slide {currentSlideIndex} of {totalSlides} · Live Lip-Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowScript((p) => !p)}
            className={cn(
              "px-2 py-1 text-[10px] font-medium rounded-md border transition cursor-pointer",
              showScript
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {showScript ? "Hide Script" : "Show Script"}
          </button>
        </div>
      </div>

      {/* Main Stage Grid: Avatar Canvas + Slide Pitch Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* 3D Audio-Reactive Avatar Orb */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-black/40 border border-border/40 relative overflow-hidden group">
          <div className="w-40 h-40 relative flex items-center justify-center">
            <AvatarOrb3D
              size={150}
              isSpeaking={isPlaying || isAnswering}
              avatarRole="sales_twin"
            />
            {(isPlaying || isAnswering) && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono animate-pulse">
                <Radio className="h-2.5 w-2.5 animate-spin" /> LIVE AUDIO
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-foreground">Ayesha (Pitch Co-Founder)</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          </div>
        </div>

        {/* Slide Context & Audio Controls */}
        <div className="md:col-span-7 space-y-3">
          <div>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Current Slide</span>
            <h3 className="text-sm font-bold text-foreground leading-snug">{slideTitle}</h3>
          </div>

          {/* Audio Playback Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleTogglePlay}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer",
                isPlaying
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20"
              )}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              {isPlaying ? "Pause Narration" : "Narrate Slide"}
            </button>

            <div className="flex items-center gap-1 rounded-xl bg-muted/40 border border-border/40 p-0.5">
              <button
                onClick={onPrevSlide}
                disabled={!onPrevSlide || currentSlideIndex <= 1}
                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-muted-foreground">
                {currentSlideIndex}/{totalSlides}
              </span>
              <button
                onClick={onNextSlide}
                disabled={!onNextSlide || currentSlideIndex >= totalSlides}
                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Speaker Notes */}
          {speakerNotes && (
            <div className="rounded-xl border border-border/30 bg-muted/20 p-2.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">💡 Key Speaker Notes: </span>
              {speakerNotes}
            </div>
          )}
        </div>
      </div>

      {/* Script Drawer */}
      {showScript && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs leading-relaxed text-zinc-200">
          <span className="text-[10px] font-bold text-indigo-400 block mb-1">NARRATION SCRIPT:</span>
          "{narrationScript}"
        </div>
      )}

      {/* Interactive Investor Q&A Drawer */}
      <div className="border-t border-border/40 pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <MessageSquareQuote className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Investor Q&A</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Ask avatar any pitch question</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={qaInput}
            onChange={(e) => setQaInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
            placeholder="Ask question: e.g. What is the CAC payback period?"
            className="flex-1 rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
          <button
            onClick={handleAskQuestion}
            disabled={!qaInput.trim() || isAnswering}
            className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-3 w-3" />
            Ask
          </button>
        </div>

        {/* Q&A Stream List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {qaList.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/40 bg-muted/10 p-2.5 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">Investor: "{item.question}"</span>
                <span>{item.askedAt}</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed pl-2 border-l border-indigo-500/40">
                <span className="text-indigo-400 font-semibold">Avatar:</span> {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </LiquidGlassCard>
  );
}
