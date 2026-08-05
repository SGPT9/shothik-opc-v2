"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Sparkles, Volume2, Eye } from "lucide-react";

export interface ChatGPTVoiceOrbProps {
  roomName?: string;
  userName?: string;
  onDisconnect?: () => void;
}

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

export default function ChatGPTVoiceOrb({
  roomName = "shothik-voice-room",
  userName = "Developer",
  onDisconnect,
}: ChatGPTVoiceOrbProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(true);
  const [latencyMs, setLatencyMs] = useState(18);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas animation for ChatGPT-style glowing fluid orb
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      step += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = 80;

      ctx.clearRect(0, 0, width, height);

      // Determine state dynamic multipliers
      let amplitude = 6;
      let glowColorStart = "rgba(56, 189, 248, 0.9)"; // Cyan
      let glowColorEnd = "rgba(129, 140, 248, 0.4)"; // Indigo

      if (voiceState === "listening") {
        amplitude = 12 + Math.sin(step * 3) * 6;
        glowColorStart = "rgba(52, 211, 153, 0.95)"; // Emerald
      } else if (voiceState === "thinking") {
        amplitude = 4;
        glowColorStart = "rgba(251, 191, 36, 0.9)"; // Amber
      } else if (voiceState === "speaking") {
        amplitude = 18 + Math.cos(step * 4) * 10;
        glowColorStart = "rgba(244, 63, 94, 0.95)"; // Rose / Bright Purple
        glowColorEnd = "rgba(168, 85, 247, 0.5)";
      }

      // Outer ambient glow ring
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * 1.8
      );
      gradient.addColorStop(0, glowColorStart);
      gradient.addColorStop(0.7, glowColorEnd);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Inner organic fluid orb wave
      ctx.fillStyle = glowColorStart;
      ctx.beginPath();
      const points = 36;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave = Math.sin(angle * 4 + step) * amplitude + Math.cos(angle * 6 - step * 1.5) * (amplitude * 0.5);
        const r = baseRadius + wave;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [voiceState]);

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-[620px] bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-hidden text-white font-sans">
      {/* Background Subtle Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top Bar Header */}
      <div className="relative z-10 flex items-center justify-between w-full px-4 py-2 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide text-slate-200">Shothik LiveKit Voice</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
            {latencyMs}ms latency
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsVisionEnabled(!isVisionEnabled)}
            className={`p-2 rounded-xl border transition-all ${
              isVisionEnabled
                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle Vision-Language Screen Perception"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center ChatGPT Style Fluid Glowing Orb Canvas */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center w-72 h-72">
          <canvas ref={canvasRef} width={300} height={300} className="w-full h-full" />
        </div>

        {/* Dynamic Voice State Status Badge */}
        <div className="mt-6 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span className="text-xs font-medium tracking-wider uppercase text-slate-300">
            {voiceState === "idle" && "Listening for prompt..."}
            {voiceState === "listening" && "User Speaking..."}
            {voiceState === "thinking" && "DiffusionGemma 2,000 tok/s Thinking..."}
            {voiceState === "speaking" && "Shothik Speaking..."}
          </span>
        </div>
      </div>

      {/* Bottom Floating Control Panel */}
      <div className="relative z-10 flex items-center space-x-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 px-6 py-3 rounded-full shadow-2xl">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3.5 rounded-full border transition-all duration-200 ${
            isMuted
              ? "bg-rose-600/20 border-rose-500 text-rose-400 hover:bg-rose-600/30"
              : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
          }`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* State Simulator Buttons for Demo */}
        <div className="flex items-center space-x-1.5 bg-slate-950/60 p-1 rounded-full border border-slate-800">
          {(["idle", "listening", "thinking", "speaking"] as VoiceState[]).map((state) => (
            <button
              key={state}
              onClick={() => setVoiceState(state)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-all capitalize ${
                voiceState === state
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {state}
            </button>
          ))}
        </div>

        <button
          onClick={onDisconnect}
          className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-lg transition-all duration-200"
          title="End Voice Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
