import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  Radio,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

export interface AudioNarrationPlayerProps {
  text: string;
  title?: string;
  defaultPersona?: "ayesha_sales" | "nusrat_banking" | "zara_corporate" | "tania_casual" | string;
  onAudioReady?: (audioUrl: string) => void;
  className?: string;
  compact?: boolean;
}

interface PersonaOption {
  id: string;
  name: string;
  dialect?: string;
  description?: string;
}

const FALLBACK_PERSONAS: PersonaOption[] = [
  {
    id: "ayesha_sales",
    name: "Ayesha (Sales & Commerce)",
    dialect: "Standard Dhaka Bangla",
    description: "Empathetic, clear, commercial",
  },
  {
    id: "nusrat_banking",
    name: "Nusrat (Banking & FinTech)",
    dialect: "Formal Pramit Bangla",
    description: "Reassuring, structured, finance",
  },
  {
    id: "zara_corporate",
    name: "Zara (Enterprise Executive)",
    dialect: "Bilingual Bangla-English",
    description: "Professional, crisp executive tone",
  },
  {
    id: "tania_casual",
    name: "Tania (Conversational Companion)",
    dialect: "Colloquial Dhakaiya",
    description: "Warm, natural storytelling",
  },
];

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export const AudioNarrationPlayer: React.FC<AudioNarrationPlayerProps> = ({
  text,
  title = "Bangla Voice AI Narration",
  defaultPersona = "ayesha_sales",
  onAudioReady,
  className,
  compact = false,
}) => {
  const [personas, setPersonas] = useState<PersonaOption[]>(FALLBACK_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<string>(defaultPersona);
  const [speed, setSpeed] = useState<number>(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean text from HTML/markdown tags for clean TTS input
  const cleanText = useMemo(() => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [text]);

  // Fetch available personas on mount
  useEffect(() => {
    let isMounted = true;
    async function loadPersonas() {
      try {
        const res = await fetch("/api/v1/voice/personas");
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.personas && isMounted) {
          if (Array.isArray(data.personas)) {
            setPersonas(data.personas);
          } else if (typeof data.personas === "object") {
            const list: PersonaOption[] = Object.entries(data.personas).map(
              ([key, val]: [string, any]) => ({
                id: key,
                name: val.name || key,
                dialect: val.dialect,
                description: val.default_emotion || val.description,
              })
            );
            if (list.length > 0) {
              setPersonas(list);
            }
          }
        }
      } catch (err) {
        // Fallback to FALLBACK_PERSONAS
      }
    }
    loadPersonas();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup audio upon component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Update playback speed whenever speed state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Synthesize text with selected persona
  const handleSynthesize = useCallback(async () => {
    if (!cleanText) {
      toast.warn("No text provided for audio narration");
      return;
    }

    setIsSynthesizing(true);
    setErrorMsg(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const res = await fetch("/api/v1/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          persona: selectedPersona,
          speed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate Bangla Voice AI audio");
      }

      const generatedAudioUrl =
        data.audioUrl || (data.audioBase64 ? `data:audio/wav;base64,${data.audioBase64}` : null);

      if (!generatedAudioUrl) {
        throw new Error("No audio payload received from Voice AI engine");
      }

      setAudioUrl(generatedAudioUrl);
      setLatencyMs(data.latencyMs || null);
      setCurrentTime(0);
      onAudioReady?.(generatedAudioUrl);
      toast.success(`Voice narration synthesized in ${data.latencyMs || 0}ms!`);

      // Auto play after synthesis
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 150);
    } catch (err: any) {
      const msg = err.message || "Synthesis error";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSynthesizing(false);
    }
  }, [cleanText, selectedPersona, speed, onAudioReady]);

  // Toggle play / pause
  const togglePlayPause = () => {
    if (!audioUrl) {
      handleSynthesize();
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (newValues: number[]) => {
    const target = newValues[0];
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    const safeTitle = (title || "narration")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    a.download = `${safeTitle}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloaded narration WAV file");
  };

  const selectedPersonaObj = personas.find((p) => p.id === selectedPersona) || personas[0];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-gradient-to-b from-card via-card/95 to-muted/20 p-4 shadow-sm transition-all",
        compact ? "p-3 space-y-2.5" : "space-y-4",
        className
      )}
      data-testid="audio-narration-player"
    >
      {/* Hidden HTML5 Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || 0);
              audioRef.current.playbackRate = speed;
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onError={() => {
            setIsPlaying(false);
            setErrorMsg("Playback error occurred with the generated audio");
          }}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>{title}</span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              >
                Voice AI
              </Badge>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {selectedPersonaObj?.name} · {selectedPersonaObj?.dialect || "Bengali"}
            </p>
          </div>
        </div>

        {/* Persona Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedPersona}
            onValueChange={(val) => {
              setSelectedPersona(val);
              // Invalidate current audio so user re-synthesizes with new persona
              setAudioUrl(null);
              setIsPlaying(false);
            }}
          >
            <SelectTrigger
              className="h-7 text-xs bg-background/80 border-border/60 min-w-[150px]"
              data-testid="select-persona"
            >
              <SelectValue placeholder="Choose Persona" />
            </SelectTrigger>
            <SelectContent>
              {personas.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold">{p.name}</span>
                    {p.description && (
                      <span className="text-[10px] text-muted-foreground">{p.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Playback Bar & Waveform */}
      <div className="space-y-3">
        {/* Equalizer Visualizer Bars */}
        <div className="flex items-center justify-center gap-1 h-10 px-2 py-1 bg-muted/40 rounded-lg overflow-hidden border border-border/30">
          {[18, 42, 28, 65, 85, 45, 95, 70, 40, 90, 60, 35, 75, 50, 80, 30, 60, 45, 90, 25].map(
            (baseHeight, idx) => {
              const activeHeight = isPlaying ? Math.min(100, Math.max(20, (baseHeight + (idx % 3) * 15))) : 16;
              return (
                <span
                  key={idx}
                  className={cn(
                    "w-1 rounded-full transition-all duration-150",
                    isPlaying
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-teal-300 animate-pulse"
                      : "bg-muted-foreground/30 h-1.5"
                  )}
                  style={{
                    height: isPlaying ? `${activeHeight}%` : "6px",
                    animationDelay: `${(idx * 70) % 600}ms`,
                  }}
                />
              );
            }
          )}
        </div>

        {/* Time Progress & Scrubber */}
        <div className="space-y-1">
          <Slider
            value={[currentTime]}
            max={duration > 0 ? duration : 100}
            step={0.1}
            disabled={!audioUrl}
            onValueChange={handleSeek}
            className="cursor-pointer"
            data-testid="audio-scrubber"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={togglePlayPause}
              disabled={isSynthesizing || !cleanText}
              data-testid="button-play-pause"
              className={cn(
                "h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-xs",
                audioUrl
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              ) : audioUrl ? (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Synthesize & Listen</span>
                </>
              )}
            </Button>

            {audioUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSynthesize}
                disabled={isSynthesizing || !cleanText}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="Re-synthesize Audio"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Regenerate</span>
              </Button>
            )}
          </div>

          {/* Speed Selector & Download */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50 text-[11px] font-mono">
              {SPEED_OPTIONS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSpeed(rate)}
                  className={cn(
                    "px-1.5 py-0.5 rounded transition-all cursor-pointer",
                    speed === rate
                      ? "bg-background text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={!audioUrl}
              data-testid="button-download-wav"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Download WAV file"
            >
              <Download className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">WAV</span>
            </Button>
          </div>
        </div>

        {/* Latency & Telemetry Footer */}
        {latencyMs !== null && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3 text-emerald-500" />
              Latency: {latencyMs}ms (Voice AI GPU Kernel)
            </span>
            <span className="font-mono">24kHz 16-bit PCM WAV</span>
          </div>
        )}

        {/* Error notification if synthesis or audio failed */}
        {errorMsg && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioNarrationPlayer;
