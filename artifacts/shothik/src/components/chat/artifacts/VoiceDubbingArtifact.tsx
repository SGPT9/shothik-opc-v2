"use client";

import { useState } from "react";
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Download,
  Sliders,
  Sparkles,
  RefreshCw,
  Share2,
  Globe2,
  Waveform,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface VoiceProfile {
  id: string;
  name: string;
  dialect: string;
  tone: string;
  avatar: string;
  sampleAudio: string;
}

const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "v-dhaka",
    name: "Tanvir (Dhakaiya Pro)",
    dialect: "Dhakaiya & Formal Bengali",
    tone: "Confident, Clear, Engaging",
    avatar: "🎙️",
    sampleAudio: "স্বাগতম! সঠিক হার্মিসে আপনার ব্যবসাকে করুন সম্পূর্ণ অটোমেটেড।",
  },
  {
    id: "v-chittagong",
    name: "Nusrat (Chatgaiya Tone)",
    dialect: "Chittagonian & Standard Bangla",
    tone: "Warm, Friendly, Conversational",
    avatar: "🎧",
    sampleAudio: "অনার পার্সেল পৌছি গিয়ে! ট্র্যাকিং কোড দিয়ে বিকাশ পেমেন্ট করুন।",
  },
  {
    id: "v-sylhet",
    name: "Farhan (Sylheti Accent)",
    dialect: "Sylheti & Regional Bangla",
    tone: "Approachable, Trustworthy",
    avatar: "📻",
    sampleAudio: "আপনার বুকিং কনফার্ম করা হয়েছে। ধন্যবাদ সঠিকের সাথে থাকার জন্য।",
  },
  {
    id: "v-en-bd",
    name: "Ayesha (Global Tech English)",
    dialect: "Bangladeshi English Accent",
    tone: "Professional, Crisp, Modern",
    avatar: "🔊",
    sampleAudio: "Welcome to Shothik Hermes. Streamline your COD parcel operations today.",
  },
];

export function VoiceDubbingArtifact() {
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICE_PROFILES[0]);
  const [text, setText] = useState(VOICE_PROFILES[0].sampleAudio);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 3500);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3500);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>AI Voice Clone & Multilingual Dubbing Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                Bangla Regional TTS
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Regional Bengali dialect cloning, pitch synthesis, and low-latency audio delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? "Synthesizing..." : "Synthesize Voice"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left Column: Voice Profiles */}
        <div className="md:col-span-5 flex flex-col h-full bg-card/40 overflow-y-auto p-4 space-y-3">
          <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
            Select Voice Actor & Regional Dialect
          </span>

          {VOICE_PROFILES.map((vp) => (
            <div
              key={vp.id}
              onClick={() => {
                setSelectedVoice(vp);
                setText(vp.sampleAudio);
              }}
              className={cn(
                "p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5",
                selectedVoice.id === vp.id
                  ? "bg-purple-500/10 border-purple-500 shadow-sm ring-1 ring-purple-500/30"
                  : "bg-card border-border/70 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{vp.avatar}</span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{vp.name}</h4>
                    <span className="text-[10px] text-purple-400 font-mono font-semibold">
                      {vp.dialect}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/60">
                  {vp.tone}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Audio Editor & Waveform */}
        <div className="md:col-span-7 flex flex-col h-full bg-background p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase font-mono">
              Script to Synthesize (English or বাংলা)
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-xs font-medium bg-card border border-border rounded-xl p-3 outline-none focus:border-purple-400 leading-relaxed resize-none"
            />
          </div>

          {/* Audio Tuning Sliders */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border border-border bg-card/60">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Speed:</span>
                <span className="font-bold text-purple-400">{speed}x</span>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.5}
                step={0.05}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Pitch Shift:</span>
                <span className="font-bold text-purple-400">{pitch > 0 ? `+${pitch}` : pitch} semitones</span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={1}
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Waveform Player Card */}
          <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{selectedVoice.name}</h4>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    48kHz · 24-bit Lossless Audio
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="p-2 rounded-xl bg-card border border-border hover:border-purple-400 text-muted-foreground hover:text-foreground transition cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Waveform Animation */}
            <div className="h-12 flex items-center justify-between gap-1 px-2 bg-card/80 border border-border/80 rounded-xl overflow-hidden">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all duration-200",
                    isPlaying ? "bg-purple-400 animate-pulse" : "bg-muted-foreground/30",
                    i % 3 === 0 ? "h-8" : i % 2 === 0 ? "h-5" : "h-3"
                  )}
                  style={{
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceDubbingArtifact;
