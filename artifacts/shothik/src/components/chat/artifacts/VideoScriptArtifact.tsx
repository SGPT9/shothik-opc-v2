"use client";

import { useState } from "react";
import {
  Video,
  Play,
  Copy,
  Check,
  Clapperboard,
  Sparkles,
  Download,
  Film,
  Music,
  Clock,
  Share2,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  durationSec: number;
  visualCue: string;
  voiceoverEn: string;
  voiceoverBn: string;
  audioMusic: string;
}

const DEFAULT_SCENES: ScriptScene[] = [
  {
    id: "s-1",
    sceneNumber: 1,
    durationSec: 3,
    visualCue: "Close-up of a damaged, unboxed package with frustrated customer face (Fast zoom effect).",
    voiceoverEn: "Still losing 20% of your e-commerce profits to fake Cash-on-Delivery orders?",
    voiceoverBn: "ভুয়া সিওডি অর্ডারের কারণে কি আপনার ব্যবসার ২০% লাভ নষ্ট হচ্ছে?",
    audioMusic: "Dramatic bass drop · Suspenseful beat",
  },
  {
    id: "s-2",
    sceneNumber: 2,
    durationSec: 5,
    visualCue: "Screen recording of Shothik automated WhatsApp notification with instant ৳200 bKash advance button.",
    voiceoverEn: "Meet Shothik Hermes. Automatically verify every order on WhatsApp and collect bKash advance in 1-click.",
    voiceoverBn: "ব্যবহার করুন সঠিক হার্মিস! ১-ক্লিকে হোয়াটসঅ্যাপে অর্ডার ভেরিফিকেশন এবং বিকাশ অ্যাডভান্স পেমেন্ট গ্রহণ করুন।",
    audioMusic: "Energetic upbeat tech synth",
  },
  {
    id: "s-3",
    sceneNumber: 3,
    durationSec: 4,
    visualCue: "Steadfast rider picking up pre-booked parcel with zero manual calls.",
    voiceoverEn: "Steadfast courier auto-booking with real-time OTP tracking across 64 districts.",
    voiceoverBn: "৬৪ জেলায় রিয়েল-টাইম ওটিপি সহ স্বয়ংক্রিয় স্টিডফাস্ট কুরিয়ার বুকিং সুবিধা।",
    audioMusic: "Fast-paced rhythm · Confident tempo",
  },
  {
    id: "s-4",
    sceneNumber: 4,
    durationSec: 3,
    visualCue: "Merchant smiling looking at skyrocketing green profit chart on smartphone.",
    voiceoverEn: "Cut returns to 3% today. Link in bio to start free!",
    voiceoverBn: "আজই আপনার রিটার্ন রেট ৩% এ নামিয়ে আনুন। ডেসক্রিপশনের লিংকে ক্লিক করে ফ্রি শুরু করুন!",
    audioMusic: "Inspiring resolution chime",
  },
];

export function VideoScriptArtifact() {
  const [scenes, setScenes] = useState<ScriptScene[]>(DEFAULT_SCENES);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<"tiktok" | "reels" | "youtube">("reels");

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0);

  const handleCopyScript = () => {
    const text = `# 🎬 Viral Short-Form Video Script (${platform.toUpperCase()})
**Total Duration:** ${totalDuration} Seconds | **Target:** Emerging-Market F-Commerce

${scenes
  .map(
    (s) => `### Scene ${s.sceneNumber} (${s.durationSec}s)
- **Visual Cue:** ${s.visualCue}
- **Audio / Music:** ${s.audioMusic}
- **Voiceover:** ${language === "en" ? s.voiceoverEn : s.voiceoverBn}`
  )
  .join("\n\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Viral Video Script & Storyboard Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-semibold">
                {totalDuration}s Short-Form
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Scene-by-scene visual cues, audio suggestions, and bilingual voiceover scripts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => setPlatform("reels")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                platform === "reels" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Reels
            </button>
            <button
              type="button"
              onClick={() => setPlatform("tiktok")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                platform === "tiktok" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              TikTok
            </button>
            <button
              type="button"
              onClick={() => setPlatform("youtube")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                platform === "youtube" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Shorts
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                language === "en" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                language === "bn" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              বাংলা
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border shadow-xs transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Script"}</span>
          </button>
        </div>
      </div>

      {/* ── Storyboard Scenes List ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center font-mono text-xs font-bold">
                  {scene.sceneNumber}
                </span>
                <span className="text-xs font-bold text-foreground">Scene {scene.sceneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-pink-400" />
                  <span>{scene.durationSec}s</span>
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <Music className="w-3 h-3" />
                  <span>{scene.audioMusic}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
                <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-pink-400 block">
                  📹 Visual & B-Roll Cue
                </span>
                <p className="text-muted-foreground leading-relaxed">{scene.visualCue}</p>
              </div>

              <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/20 space-y-1">
                <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-foreground block">
                  🎙️ Spoken Voiceover ({language === "en" ? "English" : "বাংলা"})
                </span>
                <p className="text-foreground leading-relaxed font-medium">
                  "{language === "en" ? scene.voiceoverEn : scene.voiceoverBn}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoScriptArtifact;
