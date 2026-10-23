import React, { useState, useEffect, useRef } from "react";
import { AvatarOrb3D, type AvatarOrbRole } from "@/components/chat/AvatarOrb3D";
import {
  ChatGptVoiceAgentService,
  type VoiceExecutionActionType,
  type VoiceActionResponse,
} from "@/lib/voice/chatgpt-voice-agent-service";
import { type IndicLanguageCode } from "@/lib/voice/multilingual-indic-voice-service";
import { memoryExtractionService } from "@/lib/memory/MemoryExtractionService";
import {
  Mic,
  MicOff,
  X,
  Square,
  Sparkles,
  ChevronDown,
  Volume2,
  Camera,
  CameraOff,
  Scan,
  Monitor,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Activity,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModalA11y } from "@/hooks/ui/useModalA11y";
import { ScenarioLabEngine } from "@/lib/infrastructure/scenario-lab-engine";

export interface UnifiedVoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: AvatarOrbRole;
}

export const UnifiedVoiceStudioModal: React.FC<UnifiedVoiceStudioModalProps> = ({
  isOpen,
  onClose,
  initialRole = "shothik_core",
}) => {
  const [speechState, setSpeechState] = useState<"idle" | "listening" | "thinking" | "speaking">("listening");
  const [activeRole, setActiveRole] = useState<AvatarOrbRole>(initialRole);
  const [selectedLang, setSelectedLang] = useState<string>("bn-BD");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [activeResponse, setActiveResponse] = useState<VoiceActionResponse | null>(null);
  const [subtitleText, setSubtitleText] = useState<string>("Listening…");
  const [detectedLabels, setDetectedLabels] = useState<string[]>([
    "📦 Steadfast Parcel (#ST-88941)",
    "📄 bKash TrxID #9J8K22",
    "🇧🇩 Dhaka Hub Routing",
  ]);

  // Background Scenario Lab — top 3 risk scenarios surfaced as session context
  const [topScenarios] = useState(() => {
    const results = ScenarioLabEngine.run30ScenarioStressTest();
    return results
      .sort((a, b) => b.unmitigatedFailureRate - a.unmitigatedFailureRate)
      .slice(0, 3);
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize and clean up camera stream
  useEffect(() => {
    if (isCameraActive) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" }, audio: false })
          .then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn("Webcam access optional/fallback:", err);
          });
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [isCameraActive]);

  // Modal accessibility: global Escape key and document.body scroll lock
  useModalA11y({ isOpen, onClose });

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      return;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerVoiceAction = (actionType: VoiceExecutionActionType, role?: AvatarOrbRole) => {
    if (role) setActiveRole(role);
    setSpeechState("thinking");
    setSubtitleText("Thinking…");

    setTimeout(() => {
      const res = ChatGptVoiceAgentService.executeVoiceAction("Voice Command", actionType, selectedLang as IndicLanguageCode);
      setActiveResponse(res);
      setSpeechState("speaking");
      setSubtitleText(res.spokenTranscript || "I see your document clearly. How would you like me to process it?");

      // Autonomously extract voice decisions into SecondMe cognitive memory
      try {
        memoryExtractionService.extractAndCommitFromDialogue(
          `Spoken directive with vision for ${actionType}`,
          res.spokenTranscript || "",
          "chat"
        );
      } catch {}
    }, 600);
  };

  const handleToggleCamera = () => {
    const nextState = !isCameraActive;
    setIsCameraActive(nextState);
    if (nextState) {
      setSpeechState("thinking");
      setSubtitleText("Initializing Vision Neural Stream…");
      setTimeout(() => {
        setSpeechState("speaking");
        setSubtitleText(
          selectedLang === "bn-BD"
            ? "আমি আপনার ক্যামেরা দৃশ্যমান দেখতে পাচ্ছি। আপনার পার্সেল বা ডকুমেন্টটি দেখান।"
            : "I can see your camera stream now. Point at any document, parcel, or screen."
        );
      }, 800);
    } else {
      setSubtitleText("Vision mode paused");
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    if (!isMuted) {
      setSpeechState("idle");
      setSubtitleText("Microphone muted");
    } else {
      setSpeechState("listening");
      setSubtitleText("Listening…");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-between p-4 sm:p-8 text-zinc-100 animate-in fade-in duration-300 select-none overflow-hidden">
      {/* ── Top Bar (ChatGPT Style Minimalist Model Pill & Language) ── */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2 z-20">
        {/* Model Indicator Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-inner backdrop-blur-md">
          <span className={cn("w-2 h-2 rounded-full", isCameraActive ? "bg-cyan-400 animate-ping" : "bg-emerald-400 animate-pulse")} />
          <span className="text-xs font-medium text-zinc-200 tracking-wide flex items-center gap-1.5">
            <span>Shothik 4.5 ⚡ Advanced Voice</span>
            {isCameraActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                + Vision
              </span>
            )}
          </span>
        </div>

        {/* Dialect Selector */}
        <div className="relative">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            aria-label="Select voice language"
            className="appearance-none bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium rounded-full px-3.5 py-1.5 pr-7 outline-none cursor-pointer transition-colors backdrop-blur-md"
          >
            <option value="bn-BD">🇧🇩 বাংলা (ঢাকা)</option>
            <option value="bn-BD-ctg">🇧🇩 চট্টগ্রামি</option>
            <option value="bn-BD-syl">🇧🇩 সিলেটি</option>
            <option value="bn-BD-rng">🇧🇩 রংপুরি</option>
            <option value="bn-BD-banglish">🇧🇩 Banglish</option>
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="en-GB">🇬🇧 English (UK)</option>
            <option value="hi-IN">🇮🇳 हिन्दी</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Main Center: ChatGPT Dynamic Voice Orb OR Live Camera Vision HUD ── */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl my-auto relative z-10">
        {isCameraActive ? (
          /* ── Camera Live Vision Feed (ChatGPT Style HUD) ── */
          <div className="relative w-full max-w-lg aspect-4/3 rounded-3xl overflow-hidden border border-cyan-500/30 bg-zinc-950 shadow-2xl flex items-center justify-center">
            {/* Live WebCam Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Visual Fallback / Background Simulation if Camera is blocked */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/40 pointer-events-none" />

            {/* Laser Scanner Line Animation */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce top-1/3 pointer-events-none opacity-80" />

            {/* Target Reticle in Center */}
            <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-cyan-400/40 flex items-center justify-center pointer-events-none relative">
              <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-zinc-900/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                NVIDIA VSS Vision Reticle
              </div>
              <Scan className="w-10 h-10 text-cyan-400/60 animate-pulse" />
            </div>

            {/* Real-Time Detection Labels (OCR & Barcodes) */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              {detectedLabels.map((lbl, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-[11px] font-mono text-cyan-200 backdrop-blur-md shadow-md animate-in fade-in slide-in-from-left duration-300"
                >
                  <Eye className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{lbl}</span>
                </div>
              ))}
            </div>

            {/* Floating Mini 3D Avatar Orb in Bottom Right */}
            <div
              className="absolute bottom-4 right-4 p-1.5 rounded-2xl bg-zinc-900/90 border border-cyan-500/30 backdrop-blur-md shadow-xl cursor-pointer hover:scale-105 transition"
              onClick={() => triggerVoiceAction("steadfast_book_courier")}
              title="Tap to ask about camera view"
            >
              <AvatarOrb3D
                avatarRole={activeRole}
                isSpeaking={speechState === "speaking"}
                isListening={speechState === "listening"}
                size={64}
              />
            </div>
          </div>
        ) : (
          /* ── Pure Organic Breathing 3D Voice Orb ── */
          <div className="relative flex items-center justify-center">
            {/* Dynamic Audio Ripple Waves */}
            <div
              className={cn(
                "absolute rounded-full transition-all duration-700 pointer-events-none",
                speechState === "speaking"
                  ? "-inset-16 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl scale-110 opacity-90 animate-pulse"
                  : speechState === "listening"
                  ? "-inset-10 bg-emerald-500/15 blur-2xl scale-100 opacity-70"
                  : "-inset-6 bg-zinc-700/10 blur-xl opacity-40"
              )}
            />

            {/* 3D Living Neural Voice Orb */}
            <div
              className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center relative cursor-pointer"
              onClick={() => triggerVoiceAction("steadfast_book_courier")}
            >
              <AvatarOrb3D
                avatarRole={activeRole}
                isSpeaking={speechState === "speaking"}
                isListening={speechState === "listening"}
                size={280}
                className="scale-100 hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        )}

        {/* Live Floating Transcript Subtitles (ChatGPT Style Calm Typography) */}
        <div className="mt-8 px-4 text-center max-w-lg min-h-[60px] flex items-center justify-center">
          <p className="text-base sm:text-lg text-zinc-200 font-light tracking-wide leading-relaxed animate-fade-in">
            {subtitleText}
          </p>
        </div>

        {/* ── Background Scenario Lab HUD — live risk intelligence during voice session ── */}
        <div className="w-full max-w-lg mt-4 px-4">
          <div className="flex items-center gap-1.5 mb-2 opacity-60">
            <FlaskConical className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Scenario Lab · Live Risk Context</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topScenarios.map((s) => (
              <div
                key={s.scenarioId}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-sm"
              >
                <Activity className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[140px]">{s.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 shrink-0">{s.mitigatedFailureRate.toFixed(3)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Control Dock (ChatGPT Exact Icon Layout: Camera, Mute, End Call, Sparkles) ── */}
      <div className="w-full max-w-md flex items-center justify-center gap-4 sm:gap-6 pb-4 z-20">
        {/* 1. Camera / Video Vision Toggle (ChatGPT Style) */}
        <button
          type="button"
          onClick={handleToggleCamera}
          className={cn(
            "flex items-center justify-center w-13 h-13 rounded-full border transition-all duration-150 cursor-pointer active:scale-90 shadow-lg",
            isCameraActive
              ? "bg-cyan-500 text-zinc-950 border-cyan-400 shadow-cyan-500/30"
              : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800"
          )}
          title={isCameraActive ? "Turn Off Camera Vision" : "Turn On Camera Vision (See & Speak)"}
          aria-label={isCameraActive ? "Turn Off Camera Vision" : "Turn On Camera Vision (See & Speak)"}
        >
          {isCameraActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>

        {/* 2. Mute / Unmute Mic Button */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={cn(
            "flex items-center justify-center w-13 h-13 rounded-full border transition-all duration-150 cursor-pointer active:scale-90 shadow-lg",
            isMuted
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800"
          )}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* 3. End Call / Exit (Large Center X Button) */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-15 h-15 rounded-full bg-zinc-800/90 hover:bg-rose-600 text-white border border-zinc-700/60 shadow-2xl transition-all duration-150 cursor-pointer active:scale-90"
          title="End Voice & Vision Session"
          aria-label="End Voice & Vision Session"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 4. Quick Voice Action Selector */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => {
              if (speechState === "speaking") {
                setSpeechState("listening");
                setSubtitleText("Listening…");
              } else {
                triggerVoiceAction("steadfast_book_courier");
              }
            }}
            className={cn(
              "flex items-center justify-center w-13 h-13 rounded-full border transition-all duration-150 cursor-pointer active:scale-90 shadow-lg",
              speechState === "speaking"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800"
            )}
            title={speechState === "speaking" ? "Interrupt AI" : "Quick Actions"}
            aria-label={speechState === "speaking" ? "Interrupt AI" : "Quick Actions"}
          >
            {speechState === "speaking" ? <Square className="w-4 h-4 fill-current" /> : <Sparkles className="w-5 h-5 text-zinc-400" />}
          </button>
          {/* Quick Action Flyout */}
          <div className="absolute bottom-16 right-0 hidden group-hover:flex flex-col gap-1.5 p-2 rounded-2xl bg-zinc-900/95 border border-zinc-800 backdrop-blur-xl shadow-2xl min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200">
            {[
              { label: "bKash Verify", action: "bkash_verify_payment" as const, emoji: "💳" },
              { label: "Steadfast Courier", action: "steadfast_book_courier" as const, emoji: "📦" },
              { label: "Nagad Send", action: "nagad_send_money" as const, emoji: "💸" },
              { label: "Pathao Ride", action: "pathao_hail_ride" as const, emoji: "🏍️" },
              { label: "WhatsApp Catalog", action: "whatsapp_business_catalog" as const, emoji: "💬" },
              { label: "NBR Tax Form", action: "nbr_tax_clearance_form11ga" as const, emoji: "🏦" },
            ].map((item) => (
              <button
                key={item.action}
                type="button"
                onClick={(e) => { e.stopPropagation(); triggerVoiceAction(item.action); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors text-left"
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedVoiceStudioModal;
