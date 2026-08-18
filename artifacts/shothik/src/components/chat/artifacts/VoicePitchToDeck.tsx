"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Presentation,
  Table2,
  Play,
  Square,
  ArrowRight,
  Upload,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Zap,
  Globe,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface VoicePitchDecomposition {
  title: string;
  industry: string;
  targetMarket: string;
  problemStatement: string;
  solutionSummary: string;
  keyMetrics: { label: string; value: string }[];
  suggestedSlides: { slideNum: number; title: string; tag: string }[];
}

const SAMPLE_PITCH_TEXT = `আসসালামু আলাইকুম, আমি বাংলাদেশের ই-কমার্স ও এফ-কমার্স মার্চেন্টদের জন্য একটি অল-ইন-ওয়ান অপারেটিং সিস্টেম তৈরি করতে চাই। বর্তমানে বাংলাদেশে প্রতিদিন ৩ লাখের বেশি পার্সেল বুকিং হয়, কিন্তু ২০ শতাংশ পার্সেল রিটার্ন আসে সিওডি ফ্রডের কারণে। আমাদের প্ল্যাটফর্মে থাকবে ১-ক্লিকে বিকাশ ও নগদ পেমেন্ট, রেডএক্স ও স্টিডফাস্ট কুরিয়ার ইন্টিগ্রেশন এবং স্বয়ংক্রিয় হোয়াটসঅ্যাপ কাস্টমার কনফার্মেশন।`;

export function VoicePitchToDeck({
  onExportToSlides,
  onExportToSheet,
}: {
  onExportToSlides?: (topic: string) => void;
  onExportToSheet?: (data: string[][]) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcriptText, setTranscriptText] = useState(SAMPLE_PITCH_TEXT);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [decomposition, setDecomposition] = useState<VoicePitchDecomposition | null>({
    title: "Shothik Hermes E-Commerce OS",
    industry: "F-Commerce Logistics & MFS FinTech",
    targetMarket: "Bangladesh (650M+ South Asian TAM)",
    problemStatement: "20% COD return rate due to unverified orders and manual courier coordination.",
    solutionSummary: "Automated WhatsApp confirmation, anti-fraud OTP, and instant bKash/Steadfast carrier webhook synchronization.",
    keyMetrics: [
      { label: "Target Daily Parcels", value: "300,000+" },
      { label: "Return Rate Reduction", value: "20% ➔ 3.2%" },
      { label: "Merchant GMV Target", value: "$14.5M BDT" },
    ],
    suggestedSlides: [
      { slideNum: 1, title: "Next-Gen Emerging Market Commerce", tag: "Executive Vision" },
      { slideNum: 2, title: "The $480M COD Return Friction", tag: "Problem Statement" },
      { slideNum: 3, title: "1-Click bKash & Courier Webhook Engine", tag: "Solution Architecture" },
      { slideNum: 4, title: "Unit Economics & 76.6% Gross Margin", tag: "Financial Model" },
      { slideNum: 5, title: "Go-to-Market & Viral WhatsApp Flywheel", tag: "Growth Strategy" },
    ],
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSynthesizePitch();
    } else {
      setIsRecording(true);
      setTranscriptText("");
    }
  };

  const handleSynthesizePitch = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setDecomposition({
        title: "Autonomous Emerging Market Logistics OS",
        industry: "E-Commerce Infrastructure",
        targetMarket: "Bangladesh & South Asia",
        problemStatement: "High COD return friction and fragmented payment tools.",
        solutionSummary: "AI-driven order verification, tokenized bKash PGW, and 1-click carrier dispatch.",
        keyMetrics: [
          { label: "Estimated TAM", value: "$10.4B" },
          { label: "Gross Margin", value: "76.6%" },
          { label: "Payback Period", value: "3.2 Months" },
        ],
        suggestedSlides: [
          { slideNum: 1, title: "Autonomous Logistics OS", tag: "Executive Vision" },
          { slideNum: 2, title: "COD Friction vs Shothik Engine", tag: "Problem vs Solution" },
          { slideNum: 3, title: "Multi-Carrier Gateway", tag: "Technical Architecture" },
          { slideNum: 4, title: "3-Scenario Financial Projection", tag: "Financial Modeling" },
        ],
      });
      setIsSynthesizing(false);
    }, 1200);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header Toolbar ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Voice Pitch-to-Deck Generator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                Speech-to-Deck AI
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Speak in Bengali or English to generate 8-slide decks, unit economics & WhatsApp campaigns
            </p>
          </div>
        </div>

        {decomposition && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onExportToSlides && onExportToSlides(decomposition.title)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Open in Slides</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Voice Recorder Studio Card */}
        <LiquidGlassCard glowColor="rgba(168, 85, 247, 0.15)">
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <button
              type="button"
              onClick={handleToggleRecord}
              className={cn(
                "w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl cursor-pointer shrink-0",
                isRecording
                  ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/40"
                  : "bg-purple-600 hover:bg-purple-500 text-white ring-4 ring-purple-500/20"
              )}
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              <span className="text-[9px] font-bold uppercase mt-1">
                {isRecording ? formatTime(recordDuration) : "Record"}
              </span>
            </button>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm font-bold text-foreground">
                  {isRecording ? "Listening to your startup pitch..." : "Record or paste your voice pitch idea"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  বাংলা / Banglish / English
                </span>
              </div>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Speak or paste your startup idea transcript here..."
                rows={3}
                className="w-full text-xs text-foreground/90 leading-relaxed bg-muted/20 border border-border/40 rounded-xl p-3 outline-none focus:border-purple-400 transition resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSynthesizePitch}
              disabled={isSynthesizing || !transcriptText.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md cursor-pointer shrink-0"
            >
              {isSynthesizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSynthesizing ? "Decomposing..." : "Generate Deck"}</span>
            </button>
          </div>
        </LiquidGlassCard>

        {/* AI Decomposition Results */}
        {decomposition && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Executive Summary & Metrics */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Executive Overview</span>
                  <span className="text-[10px] font-mono text-purple-400 font-semibold">{decomposition.industry}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{decomposition.title}</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1">
                    <span className="font-bold text-rose-400">⚠️ Problem:</span>
                    <p className="text-muted-foreground leading-relaxed">{decomposition.problemStatement}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1">
                    <span className="font-bold text-emerald-400">✅ Solution:</span>
                    <p className="text-muted-foreground leading-relaxed">{decomposition.solutionSummary}</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                {decomposition.keyMetrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-muted/15 border border-border/40 text-center space-y-1">
                    <span className="text-[10px] text-muted-foreground block truncate">{m.label}</span>
                    <span className="text-sm font-bold text-brand font-mono">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Suggested 16:9 Presentation Structure */}
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated 16:9 Deck Outline</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">5 Slides Structured</span>
              </div>

              <div className="space-y-2">
                {decomposition.suggestedSlides.map((slide) => (
                  <div
                    key={slide.slideNum}
                    className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between hover:bg-muted/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono font-bold text-xs flex items-center justify-center">
                        {slide.slideNum}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{slide.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-background/80 border border-border/40">
                      {slide.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoicePitchToDeck;
