import React, { useState, useEffect } from "react";
import { AvatarOrb3D, type AvatarOrbRole } from "@/components/chat/AvatarOrb3D";
import {
  ChatGptVoiceAgentService,
  type VoiceExecutionActionType,
  type VoiceActionResponse,
} from "@/lib/voice/chatgpt-voice-agent-service";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Square,
  Sparkles,
  Zap,
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
  const [subtitleText, setSubtitleText] = useState<string>("কথা বলুন, আমি শুনছি…");

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
    setSubtitleText("চিন্তাভাবনা করা হচ্ছে…");

    setTimeout(() => {
      const res = ChatGptVoiceAgentService.executeVoiceAction("Voice Command", actionType, selectedLang);
      setActiveResponse(res);
      setSpeechState("speaking");
      setSubtitleText(res.speechTranscript || "আপনার নির্দেশ বাস্তবায়ন সম্পন্ন হয়েছে।");
    }, 600);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    if (!isMuted) {
      setSpeechState("idle");
      setSubtitleText("মাইক্রোফোন মিউট করা হয়েছে");
    } else {
      setSpeechState("listening");
      setSubtitleText("কথা বলুন, আমি শুনছি…");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-between p-6 sm:p-10 text-slate-100 animate-in fade-in duration-200 select-none">
      {/* ── Top Header Toolbar ── */}
      <div className="w-full max-w-2xl flex items-center justify-between border-b border-white/[0.06] pb-4">
        {/* Left Status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
            Shothik Voice Mode
          </span>
        </div>

        {/* Right: Language Selector */}
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          aria-label="Select voice language"
          className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium outline-none cursor-pointer focus:border-brand"
        >
          <option value="bn-BD">🇧🇩 বাংলা (ঢাকা)</option>
          <option value="bn-BD-banglish">🇧🇩 Banglish</option>
          <option value="en-US">🇺🇸 English (US)</option>
          <option value="en-GB">🇬🇧 English (UK)</option>
          <option value="hi-IN">🇮🇳 हिन्दी</option>
        </select>
      </div>

      {/* ── Main Center: ChatGPT Organic Breathing Voice Orb ── */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl my-auto relative">
        <div className="relative flex items-center justify-center">
          {/* Subtle Ambient Glow Aura */}
          <div className="absolute -inset-10 rounded-full bg-emerald-500/10 blur-3xl animate-pulse pointer-events-none" />

          {/* 3D Neural Fluid Orb */}
          <div className="w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center relative">
            <AvatarOrb3D
              role={activeRole}
              state={speechState}
              size={240}
              className="scale-100 hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Audio Engine Status */}
        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 border border-white/[0.06] px-3.5 py-1.5 rounded-full">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Low-Latency Neural Speech Engine</span>
        </div>

        {/* Live Subtitle Transcript Banner */}
        <div className="mt-6 w-full max-w-md bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 text-center shadow-2xl animate-fade-in">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            "{subtitleText}"
          </p>
        </div>
      </div>

      {/* ── Bottom Floating Dock (ChatGPT Style 3-Control Bar) ── */}
      <div className="w-full max-w-md flex items-center justify-center gap-5 border-t border-white/[0.06] pt-6">
        {/* Mute Mic */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-2xl border transition cursor-pointer active:scale-95",
            isMuted
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80"
          )}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Interrupt / Stop Speaking (Appears when AI is speaking) */}
        {speechState === "speaking" && (
          <button
            type="button"
            onClick={() => {
              setSpeechState("listening");
              setSubtitleText("কথা থামানো হয়েছে। আমি শুনছি…");
            }}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 transition cursor-pointer active:scale-95"
            title="Interrupt AI Speech"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        )}

        {/* End Voice Call (Clean Close) */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 transition cursor-pointer active:scale-95 font-bold"
          title="End Voice Session"
        >
          <PhoneOff className="w-6 h-6" />
        </button>

        {/* Quick Action Trigger */}
        <button
          type="button"
          onClick={() => triggerVoiceAction("create_order")}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition cursor-pointer active:scale-95"
          title="Test Voice Action"
        >
          <Zap className="w-5 h-5 text-amber-400" />
        </button>
      </div>
    </div>
  );
};

export default UnifiedVoiceStudioModal;
