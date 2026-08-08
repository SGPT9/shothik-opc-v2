"use client";

import { useEffect, useRef } from "react";
import { X, PhoneOff } from "lucide-react";
import ChatGPTVoiceOrb from "@/components/voice/ChatGPTVoiceOrb";

interface VoiceOverlayProps {
  isOpen: boolean;
  userName?: string;
  /** Called when user ends the call. Pass final transcript to populate composer. */
  onClose: (transcript?: string) => void;
}

/**
 * ChatGPT Advanced Voice Mode — fullscreen overlay.
 * Mounts over the chat page (z-50). Chat stays alive underneath.
 * Esc key / "End call" closes and can pass transcript back to composer.
 */
export function VoiceOverlay({ isOpen, userName, onClose }: VoiceOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Esc key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Shothik Voice Mode"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">Voice Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Keyboard hint */}
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">Esc</kbd>
            to end
          </span>

          {/* Close / End call */}
          <button
            type="button"
            onClick={() => onClose()}
            aria-label="End voice call"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition text-xs font-semibold"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            End call
          </button>
        </div>
      </div>

      {/* Orb — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatGPTVoiceOrb
          roomName="shothik-voice-room"
          userName={userName ?? "User"}
          onDisconnect={() => onClose()}
        />
      </div>
    </div>
  );
}
