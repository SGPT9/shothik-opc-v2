import { useState, useEffect } from "react";
import { Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface VoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscript: (text: string) => void;
}

export function VoicePopup({ isOpen, onClose, onSendTranscript }: VoicePopupProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [dots, setDots] = useState<number[]>([10, 20, 15, 25, 10]);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript("");
      return;
    }

    // Simulate connecting
    const t1 = setTimeout(() => setIsListening(true), 800);

    // Simulate waveform
    const interval = setInterval(() => {
      if (isListening) {
        setDots(prev => prev.map(() => Math.random() * 20 + 5));
      }
    }, 150);

    // Simulate transcript
    const t2 = setTimeout(() => setTranscript("I was wondering if we could look at the sales data..."), 3000);
    const t3 = setTimeout(() => setTranscript("I was wondering if we could look at the sales data from last quarter and compare it against the projections."), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [isOpen, isListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center justify-center w-full max-w-md p-8 bg-card border border-border shadow-2xl rounded-3xl">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full text-muted-foreground hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="mb-8 mt-4 text-center">
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase opacity-80 mb-2">
            {isListening ? "Listening..." : "Connecting..."}
          </h3>
          <div className="h-16 flex items-center justify-center px-4">
            <p className="text-lg text-foreground font-medium text-center leading-relaxed line-clamp-3">
              {transcript || <span className="opacity-0">Placeholder</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-10 h-12">
          {dots.map((height, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 rounded-full bg-brand transition-all duration-150 ease-out",
                isListening ? "opacity-100" : "opacity-30 h-2"
              )}
              style={{ height: isListening ? `${height}px` : undefined }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            size="icon"
            className={cn(
              "w-16 h-16 rounded-full transition-all duration-300 shadow-lg",
              isListening ? "bg-red-500 hover:bg-red-600 text-white" : "bg-brand hover:bg-brand/90 text-white"
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
            {isListening ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}