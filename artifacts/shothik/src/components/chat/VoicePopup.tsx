import { useState, useEffect } from "react";
import { Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LiquidGlassCard } from "./LiquidGlassCard.js";
import { AvatarOrb3D } from "./AvatarOrb3D.js";

export interface VoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscript: (text: string) => void;
}

export function VoicePopup({ isOpen, onClose, onSendTranscript }: VoicePopupProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript("");
      return;
    }

    // Simulate connecting
    const t1 = setTimeout(() => setIsListening(true), 800);

    // Simulate transcript
    const t2 = setTimeout(() => setTranscript("I was wondering if we could look at the sales data..."), 3000);
    const t3 = setTimeout(() => setTranscript("I was wondering if we could look at the sales data from last quarter and compare it against the projections."), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <LiquidGlassCard
        intensity="vibrant"
        glowColor="rgba(99, 102, 241, 0.25)"
        className="relative flex flex-col items-center justify-center w-full max-w-md p-8 shadow-2xl rounded-3xl"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full text-muted-foreground hover:bg-muted/50 cursor-pointer"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* 3D Holographic Avatar Orb */}
        <div className="my-6">
          <AvatarOrb3D
            size={96}
            isListening={isListening}
            isSpeaking={!isListening && !!transcript}
            avatarRole="shothik_core"
          />
        </div>

        <div className="mb-6 text-center">
          <h3 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase opacity-90 mb-2">
            {isListening ? "Listening & Transcribing..." : "Connecting Voice Engine..."}
          </h3>
          <div className="min-h-16 flex items-center justify-center px-4">
            <p className="text-base text-foreground font-medium text-center leading-relaxed line-clamp-3">
              {transcript || <span className="text-muted-foreground italic">Speak naturally in Bangla or English...</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-2">
          <Button
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all duration-300 shadow-xl cursor-pointer",
              isListening ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 animate-pulse" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
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