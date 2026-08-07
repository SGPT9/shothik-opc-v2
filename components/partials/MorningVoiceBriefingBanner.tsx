"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Sparkles, Sun } from "lucide-react";

export function MorningVoiceBriefingBanner() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [greetingText, setGreetingText] = useState(
    "Good morning Nusrat! While you slept, your 24/7 Tonight Engine answered 14 customer queries, ৳১৮,৫০০ BDT was verified via bKash, and 3 Steadfast courier pickups are ready on Canvas."
  );

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(greetingText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsPlaying(false);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
          <Sun className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Morning Coffee Spoken Voice Briefing
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LiveKit 18ms Audio Engine
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-100 mt-1 leading-snug">
            "{greetingText}"
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={togglePlay}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
            isPlaying
              ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
              : "bg-purple-600 text-white hover:bg-purple-500"
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          {isPlaying ? "Pause Spoken Briefing" : "▶ Listen to Briefing"}
        </button>
      </div>
    </div>
  );
}
