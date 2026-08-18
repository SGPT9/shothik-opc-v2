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
  ChevronLeft
} from "lucide-react";
import { AvatarOrb3D } from "@/components/chat/AvatarOrb3D";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import { cn } from "@/lib/utils";

interface VTuberPresentationStageProps {
  currentSlideIndex?: number;
  totalSlides?: number;
  slideTitle?: string;
  narrationScript?: string;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export function VTuberPresentationStage({
  currentSlideIndex = 1,
  totalSlides = 8,
  slideTitle = "AI-Powered E-Commerce & Retail in Bangladesh",
  narrationScript = "Welcome to Shothik Hermes. We are demonstrating autonomous commerce orchestration across South Asia, reconciling bKash and Nagad payments with sub-second latency.",
  onNextSlide,
  onPrevSlide,
}: VTuberPresentationStageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.4);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [showScript, setShowScript] = useState(true);

  // Simulated audio waveform analyzer loop
  useEffect(() => {
    let animationFrame: number;
    if (isPlaying) {
      const updateWaveform = () => {
        setAudioLevel(0.3 + Math.random() * 0.7);
        animationFrame = requestAnimationFrame(updateWaveform);
      };
      animationFrame = requestAnimationFrame(updateWaveform);
    } else {
      setAudioLevel(0.1);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

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

  return (
    <LiquidGlassCard palette="indigo" className="p-4 space-y-4 border border-border/60">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Open-LLM-VTuber Narration Stage</h4>
            <span className="text-[10px] text-muted-foreground font-mono">Slide {currentSlideIndex} of {totalSlides} · Live Lip-Sync</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSpeechSpeed((s) => (s === 1.0 ? 1.25 : s === 1.25 ? 1.5 : 1.0))}
            className="px-2 py-1 rounded bg-muted/60 hover:bg-muted text-[10px] font-mono font-bold text-muted-foreground hover:text-foreground transition"
            title="Adjust speech rate"
          >
            {speechSpeed}x
          </button>
          <button
            type="button"
            onClick={() => setShowScript((s) => !s)}
            className={cn(
              "px-2 py-1 rounded text-[10px] font-semibold transition",
              showScript ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            Script
          </button>
        </div>
      </div>

      {/* Center Stage: Avatar Orb + Waveform visualizer */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/30">
        <div className="relative shrink-0">
          <AvatarOrb3D isSpeaking={isPlaying} size={72} />
          {isPlaying && (
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <div>
            <span className="text-xs font-semibold text-foreground block truncate">{slideTitle}</span>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all duration-75",
                    isPlaying ? "bg-indigo-400" : "bg-muted-foreground/30"
                  )}
                  style={{
                    height: isPlaying ? `${Math.max(4, Math.sin(i + audioLevel * 10) * 18 + 8)}px` : "4px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm",
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-brand text-brand-foreground hover:opacity-90"
              )}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              <span>{isPlaying ? "Pause Narration" : "Play Lip-Sync Narration"}</span>
            </button>

            {onPrevSlide && (
              <button
                type="button"
                onClick={onPrevSlide}
                disabled={currentSlideIndex <= 1}
                className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {onNextSlide && (
              <button
                type="button"
                onClick={onNextSlide}
                disabled={currentSlideIndex >= totalSlides}
                className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Script Prompter Tray */}
      {showScript && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground font-mono leading-relaxed">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">
            🎙️ Teleprompter Script
          </span>
          {narrationScript}
        </div>
      )}
    </LiquidGlassCard>
  );
}

export default VTuberPresentationStage;
