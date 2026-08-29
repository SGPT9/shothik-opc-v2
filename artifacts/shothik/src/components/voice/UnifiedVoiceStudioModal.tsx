import React, { useState, useEffect } from "react";
import { AvatarOrb3D, type AvatarOrbRole } from "@/components/chat/AvatarOrb3D";
import {
  ChatGptVoiceAgentService,
  type VoiceExecutionActionType,
  type VoiceActionResponse,
} from "@/lib/voice/chatgpt-voice-agent-service";
import { memoryExtractionService } from "@/lib/memory/MemoryExtractionService";
import {
  Mic,
  MicOff,
  X,
  Square,
  Sparkles,
  ChevronDown,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [activeResponse, setActiveResponse] = useState<VoiceActionResponse | null>(null);
  const [subtitleText, setSubtitleText] = useState<string>("Listening…");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerVoiceAction = (actionType: VoiceExecutionActionType, role?: AvatarOrbRole) => {
    if (role) setActiveRole(role);
    setSpeechState("thinking");
    setSubtitleText("Thinking…");

    setTimeout(() => {
      const res = ChatGptVoiceAgentService.executeVoiceAction("Voice Command", actionType, selectedLang as IndicLanguageCode);
      setActiveResponse(res);
      setSpeechState("speaking");
      setSubtitleText(res.spokenTranscript || "I understand. How can I help you further?");

      // Autonomously extract voice decisions into SecondMe cognitive memory
      try {
        memoryExtractionService.extractAndCommitFromDialogue(
          `Spoken directive for ${actionType}`,
          res.spokenTranscript || "",
          "chat"
        );
      } catch {}
    }, 600);
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
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-between p-6 sm:p-12 text-zinc-100 animate-in fade-in duration-300 select-none">
      {/* ── Top Bar (ChatGPT Style Minimalist Model Pill & Language) ── */}
      <div className="w-full max-w-xl flex items-center justify-between pt-2">
        {/* Model Indicator Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300 tracking-wide">
            Shothik 4.5 ⚡ Advanced Voice
          </span>
        </div>

        {/* Dialect Selector */}
        <div className="relative">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            aria-label="Select voice language"
            className="appearance-none bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 text-xs font-medium rounded-full px-3.5 py-1.5 pr-7 outline-none cursor-pointer transition-colors"
          >
            <option value="bn-BD">🇧🇩 বাংলা (ঢাকা)</option>
            <option value="bn-BD-banglish">🇧🇩 Banglish</option>
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="en-GB">🇬🇧 English (UK)</option>
            <option value="hi-IN">🇮🇳 हिन्दी</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Main Center: ChatGPT Organic Breathing Voice Orb ── */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg my-auto relative">
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
          <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center relative cursor-pointer" onClick={() => triggerVoiceAction("steadfast_book_courier")}>
            <AvatarOrb3D
              avatarRole={activeRole}
              isSpeaking={speechState === "speaking"}
              isListening={speechState === "listening"}
              size={280}
              className="scale-100 hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Live Floating Transcript Subtitles (ChatGPT Style Calm Typography) */}
        <div className="mt-10 px-4 text-center max-w-md min-h-[60px] flex items-center justify-center">
          <p className="text-base sm:text-lg text-zinc-300 font-light tracking-wide leading-relaxed animate-fade-in">
            {subtitleText}
          </p>
        </div>
      </div>

      {/* ── Bottom Control Dock (ChatGPT Exact 3-Circle Layout) ── */}
      <div className="w-full max-w-sm flex items-center justify-center gap-6 pb-4">
        {/* 1. Mute / Unmute Button */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full border transition-all duration-150 cursor-pointer active:scale-90 shadow-lg",
            isMuted
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800"
          )}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* 2. End Call / Exit (Large Center X Button) */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/90 hover:bg-rose-600 text-white border border-zinc-700/60 shadow-2xl transition-all duration-150 cursor-pointer active:scale-90"
          title="End Voice Session"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 3. Interrupt / Stop Speaking Button */}
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
            "flex items-center justify-center w-14 h-14 rounded-full border transition-all duration-150 cursor-pointer active:scale-90 shadow-lg",
            speechState === "speaking"
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
              : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800"
          )}
          title={speechState === "speaking" ? "Interrupt AI" : "Tap to Speak"}
        >
          {speechState === "speaking" ? <Square className="w-4 h-4 fill-current" /> : <Sparkles className="w-5 h-5 text-zinc-400" />}
        </button>
      </div>
    </div>
  );
};

export default UnifiedVoiceStudioModal;
