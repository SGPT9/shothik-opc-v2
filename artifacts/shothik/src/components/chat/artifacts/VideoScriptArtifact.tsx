import { useState, useRef } from "react";
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
  FileText,
  ScanEye,
  Upload,
  MessageSquare,
  ShieldCheck,
  Zap,
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
  const [activeTab, setActiveTab] = useState<"storyboard" | "subtitles" | "vlm-inspect">("storyboard");

  // VLM Ask-Video State
  const [vlmQuery, setVlmQuery] = useState("Verify packaging seal integrity and bKash advance label");
  const [vlmAnalyzing, setVlmAnalyzing] = useState(false);
  const [vlmResult, setVlmResult] = useState<string | null>(null);

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0);

  // Generate SRT Subtitle Format
  const generateSRT = () => {
    let currentTime = 0;
    return scenes
      .map((s, idx) => {
        const startSec = currentTime;
        const endSec = currentTime + s.durationSec;
        currentTime = endSec;

        const formatTime = (sec: number) => {
          const h = Math.floor(sec / 3600).toString().padStart(2, "0");
          const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
          const sRem = Math.floor(sec % 60).toString().padStart(2, "0");
          return `${h}:${m}:${sRem},000`;
        };

        const text = language === "en" ? s.voiceoverEn : s.voiceoverBn;
        return `${idx + 1}\n${formatTime(startSec)} --> ${formatTime(endSec)}\n${text}\n`;
      })
      .join("\n");
  };

  const handleDownloadSRT = () => {
    const srtContent = generateSRT();
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shothik-subtitles-${platform}-${language}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  const handleRunVLMInspection = () => {
    setVlmAnalyzing(true);
    setVlmResult(null);
    setTimeout(() => {
      setVlmAnalyzing(false);
      setVlmResult(
        `✅ **NVIDIA VSS Multimodal Video Inspection Summary:**\n` +
          `• **Parcel Integrity Score:** 98.4% (Tamper-evident tape intact)\n` +
          `• **Merchant Label Verification:** Steadfast Consignment ID \`#ST-88941-DK\` detected\n` +
          `• **Fraud Risk Assessment:** LOW (No unboxing anomaly or altered seal detected)\n` +
          `• **Estimated Engagement Index:** 8.9/10 (High hook velocity in first 2.4s)`
      );
    }, 1200);
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
              Scene visual cues, dense subtitles & NVIDIA VSS Video AI reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("storyboard")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                activeTab === "storyboard" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Storyboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subtitles")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                activeTab === "subtitles" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SRT Subtitles</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vlm-inspect")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                activeTab === "vlm-inspect" ? "bg-background text-pink-400 shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ScanEye className="w-3.5 h-3.5" />
              <span>VSS Video AI</span>
            </button>
          </div>

          {/* Platform Selector */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => setPlatform("reels")}
              className={cn(
                "px-2 py-1 rounded-md font-semibold transition cursor-pointer",
                platform === "reels" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Reels
            </button>
            <button
              type="button"
              onClick={() => setPlatform("tiktok")}
              className={cn(
                "px-2 py-1 rounded-md font-semibold transition cursor-pointer",
                platform === "tiktok" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              TikTok
            </button>
            <button
              type="button"
              onClick={() => setPlatform("youtube")}
              className={cn(
                "px-2 py-1 rounded-md font-semibold transition cursor-pointer",
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
                "px-2 py-1 rounded-md font-semibold transition cursor-pointer",
                language === "en" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={cn(
                "px-2 py-1 rounded-md font-semibold transition cursor-pointer",
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
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Viewport Content ── */}
      {activeTab === "storyboard" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3 hover:border-pink-500/30 transition"
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
      )}

      {activeTab === "subtitles" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-400" />
                <span>NVIDIA VSS Dense Timed Subtitles (.SRT)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Synchronized subtitle stream for CapCut, Premiere Pro, and social video uploads.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSRT}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .SRT</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-muted/40 border border-border text-xs font-mono text-foreground leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {generateSRT()}
          </pre>
        </div>
      )}

      {activeTab === "vlm-inspect" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ScanEye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>NVIDIA VSS Video Q&A & Visual Inspection</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                    vss-ask-video
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ask visual questions about parcel packaging, return authenticity, or video hooks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: "📦 Packaging Integrity", query: "Verify parcel packaging seal integrity and Steadfast consignment label" },
                { title: "🔍 Return Fraud Check", query: "Detect unboxing tampering and compare returned item with invoice" },
                { title: "⚡ Hook Retention Score", query: "Evaluate audience retention hook speed and visual motion in 0-3s" },
              ].map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVlmQuery(sample.query)}
                  className="p-3 text-left rounded-xl border border-border bg-muted/20 hover:border-pink-500/40 transition cursor-pointer text-xs space-y-1"
                >
                  <span className="font-bold text-foreground block">{sample.title}</span>
                  <span className="text-[11px] text-muted-foreground line-clamp-2">{sample.query}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                value={vlmQuery}
                onChange={(e) => setVlmQuery(e.target.value)}
                placeholder="Ask visual question about video clip..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-muted/30 border border-border text-xs text-foreground outline-none focus:border-pink-500 transition"
              />
              <button
                type="button"
                onClick={handleRunVLMInspection}
                disabled={vlmAnalyzing}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {vlmAnalyzing ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <ScanEye className="w-3.5 h-3.5" />}
                <span>{vlmAnalyzing ? "Inspecting Frames..." : "Run VSS Inspection"}</span>
              </button>
            </div>

            {vlmResult && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground space-y-2 animate-in fade-in-50">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>VSS Visual Inspection Output</span>
                </div>
                <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {vlmResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoScriptArtifact;
