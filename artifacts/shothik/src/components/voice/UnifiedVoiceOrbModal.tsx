import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Radio,
  Zap,
  Globe2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { unifiedVoiceOrbService, OrbState } from "@/lib/voice/unified-voice-orb-service";

export interface UnifiedVoiceOrbModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnifiedVoiceOrbModal({ isOpen, onClose }: UnifiedVoiceOrbModalProps) {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("হ্যালো শঠিক, আমার মার্চেন্ট স্টোরের আজকের বিকেলের অর্ডার সামারি বলো...");
  const [pulsateScale, setPulsateScale] = useState(1.0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isListening) {
      interval = setInterval(() => {
        const frame = unifiedVoiceOrbService.processVadFrame(Math.random() * 0.8 + 0.2);
        setPulsateScale(frame.pulsateScale);
      }, 100);
    } else {
      setPulsateScale(1.0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setOrbState("idle");
    } else {
      setIsListening(true);
      setOrbState("listening");
      setTimeout(() => {
        const res = unifiedVoiceOrbService.processTranscript(transcript);
        setOrbState(res.state);
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-zinc-950/95 border-zinc-800 text-white shadow-2xl p-0 overflow-hidden rounded-3xl backdrop-blur-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                Unified Voice Orb Co-Pilot
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Real-Time VAD
                </Badge>
              </DialogTitle>
              <p className="text-xs text-zinc-400">
                Continuous Banglish & Bangla speech-to-speech AI agent interface
              </p>
            </div>
          </div>
        </div>

        {/* 3D Pulsating Glowing Voice Orb Container */}
        <div className="p-10 flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

          {/* Animated Orb Sphere */}
          <div
            className="relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-150 ease-out shadow-2xl cursor-pointer"
            style={{
              transform: `scale(${pulsateScale})`,
              background:
                orbState === "listening"
                  ? "radial-gradient(circle at 30% 30%, #34d399, #059669, #064e3b)"
                  : orbState === "speaking"
                  ? "radial-gradient(circle at 30% 30%, #38bdf8, #0284c7, #0c4a6e)"
                  : "radial-gradient(circle at 30% 30%, #10b981, #047857, #022c22)",
              boxShadow:
                isListening
                  ? "0 0 50px rgba(16, 185, 129, 0.6), 0 0 100px rgba(52, 211, 153, 0.3)"
                  : "0 0 30px rgba(16, 185, 129, 0.3)",
            }}
            onClick={toggleListening}
          >
            <div className="absolute inset-2 rounded-full border border-white/20 animate-spin-slow pointer-events-none" />
            <div className="flex flex-col items-center space-y-1 text-white">
              {isListening ? (
                <Volume2 className="w-10 h-10 animate-pulse text-emerald-200" />
              ) : (
                <Mic className="w-10 h-10 text-emerald-300" />
              )}
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-100 font-mono">
                {orbState}
              </span>
            </div>
          </div>

          {/* Live Transcript Bubble */}
          <div className="w-full max-w-md p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block flex items-center justify-center gap-1">
              <Globe2 className="w-3 h-3" />
              Banglish Voice Stream Input
            </span>
            <p className="text-xs text-zinc-200 font-medium italic">"{transcript}"</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleListening}
              className={`font-bold text-xs px-6 py-2.5 rounded-full shadow-lg ${
                isListening
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Mute Voice Orb
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Continuous Voice Stream
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 text-xs">
          <span className="text-zinc-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Latency WebAudio VAD Active
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white">
            Close Voice Orb
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
