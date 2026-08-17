"use client";

import { useState, useEffect } from "react";
import { Mic, Square, X, Sparkles, Volume2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LiquidGlassCard, type LiquidGlassPalette } from "./LiquidGlassCard";
import { AvatarOrb3D, type AvatarOrbRole } from "./AvatarOrb3D";

export interface VoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscript: (text: string) => void;
  initialRole?: AvatarOrbRole;
}

const ROLE_OPTIONS: { id: AvatarOrbRole; label: string; palette: LiquidGlassPalette }[] = [
  { id: "shothik_core", label: "Shothik Core", palette: "indigo" },
  { id: "sales_twin", label: "Sales Twin Ayesha", palette: "bkash" },
  { id: "steadfast_logistics", label: "Logistics Twin", palette: "steadfast" },
  { id: "tax_advisor", label: "Tax & Finance", palette: "tax_gold" },
];

export function VoicePopup({
  isOpen,
  onClose,
  onSendTranscript,
  initialRole = "shothik_core",
}: VoicePopupProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedRole, setSelectedRole] = useState<AvatarOrbRole>(initialRole);

  const activeOption = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript("");
      return;
    }

    // Connect audio stream
    const t1 = setTimeout(() => setIsListening(true), 600);

    // Dynamic transcript demo stream
    const t2 = setTimeout(() => setTranscript("I need to review our monthly sales numbers and generate a dispatch manifest..."), 2500);
    const t3 = setTimeout(
      () =>
        setTranscript(
          "I need to review our monthly sales numbers and generate a dispatch manifest for 50 Steadfast courier deliveries via bKash settlement."
        ),
      4500
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <LiquidGlassCard
        intensity="vibrant"
        palette={activeOption.palette}
        className="relative flex flex-col items-center justify-center w-full max-w-lg p-8 shadow-2xl rounded-3xl text-slate-100"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Top Meta Header */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300 mb-2">
          <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Dual-Voice Sync (Bangla / English)</span>
        </div>

        {/* 3D Holographic Avatar Orb with Reactive Concentric Waves */}
        <div className="my-6">
          <AvatarOrb3D
            size={120}
            isListening={isListening}
            isSpeaking={!isListening && !!transcript}
            avatarRole={selectedRole}
          />
        </div>

        {/* Transcript Box */}
        <div className="w-full mb-6 text-center">
          <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase opacity-90 mb-2 flex items-center justify-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            {isListening ? "Listening & Live Transcribing..." : "Connecting Voice Engine..."}
          </h3>
          <div className="min-h-20 flex items-center justify-center px-4 py-3 rounded-2xl bg-black/25 border border-white/5 backdrop-blur-md">
            <p className="text-sm sm:text-base text-slate-100 font-medium text-center leading-relaxed">
              {transcript || <span className="text-slate-400 italic">Speak naturally in Bangla or English...</span>}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all duration-300 shadow-xl cursor-pointer select-none",
              isListening
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40"
            )}
            onClick={() => {
              if (isListening && transcript) {
                onSendTranscript(transcript);
                onClose();
              } else {
                onClose();
              }
            }}
          >
            {isListening ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
          </Button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}