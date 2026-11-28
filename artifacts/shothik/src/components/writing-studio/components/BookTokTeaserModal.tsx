import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Clapperboard,
  Play,
  Pause,
  Sparkles,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Video,
  Flame,
  Smartphone,
  Check,
  RotateCcw,
  Download,
  Film
} from "lucide-react";

export type VisemeType =
  | "silence"
  | "viseme_aa"
  | "viseme_E"
  | "viseme_I"
  | "viseme_O"
  | "viseme_U"
  | "viseme_PP"
  | "viseme_FF";

export interface VisemeKeyframe {
  timeSeconds: number;
  viseme: VisemeType;
  mouthOpenRatio: number;
  mouthSpreadRatio: number;
  eyeBlink: boolean;
}

export interface KineticSubtitleWord {
  text: string;
  startTime: number;
  endTime: number;
  highlight: boolean;
}

export interface BookTokTeaserManifest {
  id: string;
  projectId: string;
  title: string;
  templateId: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  durationSeconds: number;
  characterName: string;
  personaId: string;
  avatarStyle: string;
  hookLine: string;
  scriptText: string;
  callToAction: string;
  hookViralScore: number;
  kineticSubtitles: KineticSubtitleWord[];
  visemeTimeline: VisemeKeyframe[];
  audioBase64: string;
  backgroundAmbience: string;
  socialHashtags: string[];
  updatedAt: string;
}

interface BookTokTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  currentManuscriptText?: string;
}

export const BookTokTeaserModal: React.FC<BookTokTeaserModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  currentManuscriptText = "",
}) => {
  const [teaser, setTeaser] = useState<BookTokTeaserManifest | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("tpl_midnight_hook");
  const [scriptInput, setScriptInput] = useState(
    "রাত আড়াইটায় দরজায় কে কড়া নাড়ল জানেন? আপনি কল্পনাও করতে পারবেন না... পুরো উপন্যাস পড়তে এখনই রকমারি বা সেবা প্রকাশনীতে বুক করুন।"
  );
  const [isRendering, setIsRendering] = useState(false);
  const [isExtractingHook, setIsExtractingHook] = useState(false);
  const [isExported, setIsExported] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load current teaser
  const loadTeaser = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/booktok/current`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTeaser(json.data);
          setScriptInput(json.data.scriptText);
        }
      }
    } catch (err) {
      console.warn("[BookTok] Load failed", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTeaser();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen, projectId]);

  // Extract viral hook from manuscript
  const handleExtractHook = async () => {
    setIsExtractingHook(true);
    const textToScan =
      currentManuscriptText ||
      "বুড়িগঙ্গার ওপার থেকে হঠাৎ এক অচেনা চিৎকার ভেসে এলো। হিমু থমকে দাঁড়াল। রাত আড়াইটার কুয়াশায় ঢাকা শহরের রাজপথ ডুবে আছে।";

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/booktok/generate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manuscriptExcerpt: textToScan,
          templateId: selectedTemplate,
          characterName: "হিমু (Himu)",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.scriptText) {
          setScriptInput(json.data.scriptText);
        }
      }
    } catch (err) {
      console.error("[BookTok] Hook extraction failed", err);
    } finally {
      setIsExtractingHook(false);
    }
  };

  // Render Teaser Reel
  const handleRenderTeaser = async () => {
    setIsRendering(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/booktok/render-teaser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${projectTitle} 15s Hook`,
          templateId: selectedTemplate,
          characterName: "হিমু (Himu)",
          personaId: "ayesha_sales",
          scriptText: scriptInput,
          aspectRatio: "9:16",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTeaser(json.data);
          setCurrentTime(0);
        }
      }
    } catch (err) {
      console.error("[BookTok] Render failed", err);
    } finally {
      setIsRendering(false);
    }
  };

  // Play / Pause video simulation
  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsPlaying(false);
      return;
    }

    if (!teaser) return;

    const audioUrl = `data:audio/wav;base64,${teaser.audioBase64}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const startTime = Date.now() - currentTime * 1000;

    const updateLoop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= teaser.durationSeconds) {
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }
      setCurrentTime(elapsed);
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      })
      .catch((e) => {
        console.warn("Audio play prevented", e);
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      });
  };

  // Get active viseme shape at currentTime
  const currentViseme = useMemo(() => {
    if (!teaser || !isPlaying) return { viseme: "viseme_silence", mouthOpen: 0.1, blink: false };
    const frame = teaser.visemeTimeline.find(
      (v) => Math.abs(v.timeSeconds - currentTime) < 0.04
    );
    if (!frame) return { viseme: "viseme_aa", mouthOpen: 0.6, blink: false };
    return {
      viseme: frame.viseme,
      mouthOpen: frame.mouthOpenRatio,
      blink: frame.eyeBlink,
    };
  }, [teaser, currentTime, isPlaying]);

  // Get active subtitle word at currentTime
  const activeSubtitle = useMemo(() => {
    if (!teaser) return null;
    return teaser.kineticSubtitles.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );
  }, [teaser, currentTime]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xs">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>BookTok & Reels Lip-Sync Teaser Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono font-normal">
                  9:16 Viseme Lip-Sync
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Viseme-synced animated character portrait video generator producing 15-second teaser clips for social media.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExtractHook}
              disabled={isExtractingHook}
              className="h-8 text-xs font-semibold gap-1.5 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExtractingHook ? "Scanning Hook..." : "Extract Hook from Manuscript"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content: 2-Column Split (Smartphone Mockup + Config Controls) */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6 custom-scrollbar">
          {/* Left Column: 9:16 Vertical Smartphone Viewport (5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-[440px] rounded-3xl bg-neutral-950 border-4 border-neutral-800 shadow-2xl overflow-hidden flex flex-col justify-between p-3 select-none">
              {/* Smartphone Top Notch & Status */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-neutral-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-700" />
              </div>

              {/* Background Animated Neon Mesh */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-neutral-950 to-neutral-950 z-0">
                <div className="absolute top-10 left-4 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
              </div>

              {/* Center 2D Talking-Head Character Portrait */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center mt-6">
                <div className="relative w-32 h-32 rounded-2xl bg-neutral-900/90 border-2 border-rose-500/40 flex flex-col items-center justify-center shadow-lg overflow-hidden group">
                  {/* Character Eyes */}
                  <div className="flex items-center gap-6 mt-4">
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all ${
                        currentViseme.blink ? "h-0.5" : "h-3.5"
                      }`}
                    />
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all ${
                        currentViseme.blink ? "h-0.5" : "h-3.5"
                      }`}
                    />
                  </div>

                  {/* Character Hair & Head Silhouette */}
                  <div className="absolute top-1 text-[10px] font-mono text-muted-foreground uppercase">
                    হিমু (Himu)
                  </div>

                  {/* Animated Lip-Sync Mouth Morph */}
                  <div className="mt-8 flex items-center justify-center h-8">
                    <div
                      style={{
                        height: `${Math.max(4, currentViseme.mouthOpen * 22)}px`,
                        width: `${Math.max(16, (1 - currentViseme.mouthOpen * 0.3) * 26)}px`,
                        borderRadius:
                          currentViseme.viseme === "viseme_O" || currentViseme.viseme === "viseme_U"
                            ? "50%"
                            : "9999px",
                      }}
                      className="bg-rose-400 border border-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.7)] transition-all duration-75"
                    />
                  </div>

                  {/* Yellow Panjabi Collar Representation */}
                  <div className="absolute -bottom-2 w-24 h-6 bg-amber-400 rounded-t-xl border border-amber-300" />
                </div>

                {/* Kinetic Subtitles Banner */}
                <div className="mt-4 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-neutral-800 text-center max-w-[220px] min-h-[48px] flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-300 leading-snug drop-shadow-md">
                    {activeSubtitle?.text || teaser?.hookLine || "..."}
                  </span>
                </div>
              </div>

              {/* Right TikTok Action Rail */}
              <div className="absolute right-2 bottom-16 z-20 flex flex-col items-center gap-3.5 text-white">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center text-rose-400">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[9px] font-bold mt-0.5">48.2K</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center text-neutral-300">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[9px] font-bold mt-0.5">1,840</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center text-amber-400">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[9px] font-bold mt-0.5">12.5K</span>
                </div>
              </div>

              {/* Bottom Video Meta & Audio Ticker */}
              <div className="relative z-20 text-white text-[10px] space-y-1 mb-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>@shothik_author</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>
                <p className="text-[9px] text-neutral-300 line-clamp-1">{teaser?.callToAction}</p>
                <div className="flex items-center gap-1 text-[9px] text-neutral-400">
                  <Music className="w-3 h-3 text-rose-400 animate-spin" />
                  <span className="truncate">Original Sound - Shothik Voice AI (24kHz)</span>
                </div>
              </div>

              {/* Bottom Playback Scrubber */}
              <div className="relative z-30 w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${((currentTime / (teaser?.durationSeconds || 15)) * 100).toFixed(1)}%`,
                  }}
                  className="bg-rose-500 h-full transition-all duration-75"
                />
              </div>
            </div>

            {/* Play Button & Time Counter */}
            <div className="flex items-center gap-3 mt-3">
              <Button
                size="sm"
                onClick={togglePlay}
                className="h-8 px-4 text-xs font-bold gap-1.5 bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? "Pause Video" : "Play 9:16 Preview"}</span>
              </Button>
              <span className="text-xs font-mono text-muted-foreground">
                {currentTime.toFixed(1)}s / {teaser?.durationSeconds || 15}s
              </span>
            </div>
          </div>

          {/* Right Column: Template & Hook Editor (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Viral Index Card */}
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>TikTok & Reels Hook Retention Index</span>
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Optimized for the first 3 seconds retention spike on social recommendation algorithms.
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-rose-400 font-mono">
                  {teaser?.hookViralScore || 95}
                  <span className="text-xs text-muted-foreground font-normal">/100</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Grade A+ (Viral Hook)</span>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Social Teaser Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate("tpl_midnight_hook")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    selectedTemplate === "tpl_midnight_hook"
                      ? "bg-rose-500/15 border-rose-500 text-rose-300 font-bold"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <span className="block font-semibold">Midnight Hook</span>
                  <span className="text-[10px] text-muted-foreground">Thriller & Noir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate("tpl_character_confession")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    selectedTemplate === "tpl_character_confession"
                      ? "bg-rose-500/15 border-rose-500 text-rose-300 font-bold"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <span className="block font-semibold">Confession</span>
                  <span className="text-[10px] text-muted-foreground">Cult & Character</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate("tpl_plot_twist_betrayal")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    selectedTemplate === "tpl_plot_twist_betrayal"
                      ? "bg-rose-500/15 border-rose-500 text-rose-300 font-bold"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <span className="block font-semibold">Plot Betrayal</span>
                  <span className="text-[10px] text-muted-foreground">Mystery & Crime</span>
                </button>
              </div>
            </div>

            {/* Spoken Script & Hook Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  Spoken Script (15s Max)
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {scriptInput.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={4}
                value={scriptInput}
                onChange={(e) => setScriptInput(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-relaxed font-normal custom-scrollbar"
                placeholder="Enter 15-second teaser script..."
              />
            </div>

            {/* Social Tags */}
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Viral Tags
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {teaser?.socialHashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-muted px-2 py-0.5 rounded-md font-mono text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Render & Export Actions */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsExported(true);
                  setTimeout(() => setIsExported(false), 2000);
                }}
                className="h-8 text-xs font-semibold gap-1.5 border-border"
              >
                {isExported ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isExported ? "Reel Downloaded!" : "Export 9:16 Video (MP4)"}</span>
              </Button>

              <Button
                size="sm"
                onClick={handleRenderTeaser}
                disabled={isRendering || !scriptInput.trim()}
                className="h-8 px-4 text-xs font-bold gap-1.5 bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{isRendering ? "Synthesizing Lip-Sync..." : "Re-Render 15s Teaser"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span>25 FPS Viseme Lip-Sync Matrix active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">9:16 Vertical Smart Video</span>
            <Button size="sm" variant="outline" onClick={onClose} className="h-7 text-xs px-3">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookTokTeaserModal;
