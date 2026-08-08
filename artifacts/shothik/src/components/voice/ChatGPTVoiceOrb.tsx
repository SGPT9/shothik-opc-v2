

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  Eye, 
  Settings, 
  MessageSquare, 
  Activity
} from "lucide-react";

export interface ChatGPTVoiceOrbProps {
  roomName?: string;
  userName?: string;
  onDisconnect?: () => void;
}

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface TranscriptMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

// Custom mock transcript database representing Shothik's code-mixed excellence
const MOCK_TRANSCRIPTS: Record<VoiceState, TranscriptMessage[]> = {
  idle: [
    { id: "1", sender: "ai", text: "Hello! I am your Shothik Voice Assistant. How can I help you today? (আমি আপনাকে কীভাবে সাহায্য করতে পারি?)", timestamp: "Just now" }
  ],
  listening: [
    { id: "1", sender: "ai", text: "Hello! I am your Shothik Voice Assistant. How can I help you today?", timestamp: "1m ago" },
    { id: "2", sender: "user", text: "Hey Shothik, can you translate this and design the slide presentation templates? একটু তাড়াতাড়ি করিস ভাইয়া।", timestamp: "Just now" }
  ],
  thinking: [
    { id: "1", sender: "ai", text: "Hello! I am your Shothik Voice Assistant. How can I help you today?", timestamp: "1m ago" },
    { id: "2", sender: "user", text: "Hey Shothik, can you translate this and design the slide presentation templates? একটু তাড়াতাড়ি করিস ভাইয়া।", timestamp: "30s ago" }
  ],
  speaking: [
    { id: "1", sender: "ai", text: "Hello! I am your Shothik Voice Assistant. How can I help you today?", timestamp: "2m ago" },
    { id: "2", sender: "user", text: "Hey Shothik, can you translate this and design the slide presentation templates? একটু তাড়াতাড়ি করিস ভাইয়া।", timestamp: "1m ago" },
    { id: "3", sender: "ai", text: "অবশ্যই ভাইয়া! I am processing your slides layout right now. I've detected that you need a clean, premium visual aesthetic. Presentation slides render শুরু হয়ে গেছে।", timestamp: "Just now" }
  ]
};

export default function ChatGPTVoiceOrb({
  roomName = "shothik-voice-room",
  userName = "Developer",
  onDisconnect,
}: ChatGPTVoiceOrbProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(true);
  const [latencyMs, setLatencyMs] = useState(18);
  const [activeTab, setActiveTab] = useState<"transcript" | "settings">("transcript");
  const [selectedVoice, setSelectedVoice] = useState("bangla-mix");
  const [temperature, setTemperature] = useState(0.7);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas animation for ChatGPT-style glowing fluid orb
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setVoiceState((prev) => (prev === "idle" ? "listening" : "idle"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Animate dynamic changes in latency randomly for realistic mock display
  useEffect(() => {
    const timer = setInterval(() => {
      setLatencyMs(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, Math.min(30, prev + delta));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Canvas Waveform rendering
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
      const baseRadius = 75;

      ctx.clearRect(0, 0, width, height);

      // Determine state dynamic multipliers
      let amplitude = 6;
      let glowColorStart = "rgba(99, 102, 241, 0.9)"; // Indigo
      let glowColorEnd = "rgba(168, 85, 247, 0.3)"; // Purple

      if (voiceState === "listening") {
        amplitude = 14 + Math.sin(step * 4) * 8;
        glowColorStart = "rgba(16, 185, 129, 0.95)"; // Emerald
        glowColorEnd = "rgba(99, 102, 241, 0.4)";
      } else if (voiceState === "thinking") {
        amplitude = 5 + Math.sin(step * 2) * 2;
        glowColorStart = "rgba(245, 158, 11, 0.9)"; // Amber
        glowColorEnd = "rgba(239, 68, 68, 0.3)";
      } else if (voiceState === "speaking") {
        amplitude = 20 + Math.cos(step * 5) * 12;
        glowColorStart = "rgba(244, 63, 94, 0.95)"; // Rose
        glowColorEnd = "rgba(168, 85, 247, 0.4)";
      }

      // Outer ambient glow ring
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.1,
        centerX,
        centerY,
        baseRadius * 1.9
      );
      gradient.addColorStop(0, glowColorStart);
      gradient.addColorStop(0.5, glowColorEnd);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Draw secondary background wave layers for premium organic fluid look
      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = layer === 0 
          ? "rgba(168, 85, 247, 0.15)" // Purple layer
          : layer === 1 
            ? "rgba(99, 102, 241, 0.2)" // Indigo layer
            : glowColorStart; // Core layer

        ctx.beginPath();
        const points = 48;
        const radiusOffset = layer * -8;
        const currentAmp = amplitude * (1 - layer * 0.25);
        const layerStep = step + layer * 1.5;

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wave = Math.sin(angle * (4 + layer) + layerStep) * currentAmp + 
                       Math.cos(angle * 5 - layerStep * 1.2) * (currentAmp * 0.4);
          const r = baseRadius + radiusOffset + wave;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [voiceState]);

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-5xl bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/80 shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden text-white font-sans">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Column: Fluid Orb Visualizer & Interactive Simulation Controls (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between items-center h-[540px] bg-slate-950/60 rounded-2xl border border-slate-800/50 p-6 relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <span className={`h-2.5 w-2.5 rounded-full ${
              voiceState === "speaking" ? "bg-rose-500 animate-pulse" :
              voiceState === "listening" ? "bg-emerald-500 animate-pulse" :
              voiceState === "thinking" ? "bg-amber-500 animate-pulse" :
              "bg-indigo-500"
            }`} />
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              {voiceState === "idle" && "Standby"}
              {voiceState === "listening" && "Listening"}
              {voiceState === "thinking" && "Processing"}
              {voiceState === "speaking" && "Speaking"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono">
              ping: {latencyMs}ms
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 font-mono">
              Opus @ 48kHz
            </span>
          </div>
        </div>

        {/* Center Orb & Wave Visualizer */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          <div className="relative flex items-center justify-center w-64 h-64">
            <canvas ref={canvasRef} width={280} height={280} className="w-full h-full" />
          </div>

          {/* SVG Micro-Waveform Audio Level indicator */}
          <div className="flex items-center space-x-1.5 h-6 mt-4">
            {Array.from({ length: 15 }).map((_, i) => {
              let heightValue = "h-1";
              let color = "bg-indigo-500/40";
              
              if (voiceState === "listening") {
                heightValue = i % 2 === 0 ? "h-3 animate-pulse" : "h-5 animate-pulse";
                color = "bg-emerald-400";
              } else if (voiceState === "speaking") {
                heightValue = i % 3 === 0 ? "h-4 animate-bounce" : "h-6 animate-bounce";
                color = "bg-rose-400";
              } else if (voiceState === "thinking") {
                heightValue = "h-1.5 animate-pulse";
                color = "bg-amber-400/80";
              }

              return (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-300 ${heightValue} ${color}`}
                  style={{ animationDelay: `${i * 75}ms` }}
                />
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mt-2 font-mono tracking-tight text-center">
            {voiceState === "idle" && "Click a state below to simulate voice conversation"}
            {voiceState === "listening" && "Capturing your audio stream..."}
            {voiceState === "thinking" && "DiffusionGemma 2B generating response..."}
            {voiceState === "speaking" && "Streaming audio output back..."}
          </p>
        </div>

        {/* Bottom Sim Action Bar */}
        <div className="w-full space-y-4">
          {/* State Selectors */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Simulate Backend Voice State</span>
            <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-full border border-slate-800/80 w-full max-w-sm justify-between">
              {(["idle", "listening", "thinking", "speaking"] as VoiceState[]).map((state) => (
                <button
                  key={state}
                  onClick={() => setVoiceState(state)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all capitalize ${
                    voiceState === state
                      ? state === "listening" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40" :
                        state === "thinking" ? "bg-amber-600 text-white shadow-lg shadow-amber-950/40" :
                        state === "speaking" ? "bg-rose-600 text-white shadow-lg shadow-rose-950/40" :
                        "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                isMuted
                  ? "bg-rose-950/40 border-rose-500/50 text-rose-300 hover:bg-rose-950/60"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? "Mic Muted" : "Mic Open"}</span>
            </button>

            <button
              onClick={() => setIsVisionEnabled(!isVisionEnabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                isVisionEnabled
                  ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-300 hover:bg-indigo-950/60"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Vision {isVisionEnabled ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={onDisconnect}
              className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 border border-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>

      </div>

      {/* Right Column: Dynamic Tabs (Transcript & Info / Settings Panel) (5 cols) */}
      <div className="lg:col-span-5 flex flex-col h-[540px] bg-slate-950/40 rounded-2xl border border-slate-800/40 overflow-hidden">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/30">
          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center justify-center space-x-2 transition-all ${
              activeTab === "transcript"
                ? "border-indigo-500 text-indigo-400 bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Transcript</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center justify-center space-x-2 transition-all ${
              activeTab === "settings"
                ? "border-indigo-500 text-indigo-400 bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Voice Presets</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
          {activeTab === "transcript" ? (
            <div className="space-y-4 flex flex-col justify-between h-full">
              {/* Message History Feed */}
              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                {MOCK_TRANSCRIPTS[voiceState].map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 font-mono mb-1">{msg.timestamp}</span>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status footer inside transcript */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">Dynamic Code-Mixing</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Shothik auto-detects English, Bangla, and Urdu speech. Seamlessly talk in code-mixed languages.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Voice Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accent / Voice Preset</label>
                  <select 
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="bangla-mix">Bangla Mix Accent (Male)</option>
                    <option value="bangla-female">Bangla Female Sweet Tone</option>
                    <option value="urdu-mix">Urdu/Hindi Mix Accent</option>
                    <option value="english-clear">Global English Pro Accent</option>
                  </select>
                </div>

                {/* Model Configuration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LLM Generation Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-indigo-600 border border-indigo-500 text-white rounded-xl py-2 text-center text-xs font-semibold">
                      DiffusionGemma 2B
                    </button>
                    <button className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300 rounded-xl py-2 text-center text-xs font-semibold">
                      Gemini 2.0 Flash
                    </button>
                  </div>
                </div>

                {/* Temperature slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Creativity (Temperature)</span>
                    <span className="font-mono text-indigo-400">{temperature}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5"
                  />
                </div>
              </div>

              {/* Server Stats */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider pb-1.5 border-b border-slate-800/50">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-Time Engine Metrics</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                  <div>Model Speed: <span className="text-emerald-400 font-bold">2,140 tok/s</span></div>
                  <div>Inference Latency: <span className="text-indigo-400">45ms</span></div>
                  <div>Silence Threshold: <span>-40dB</span></div>
                  <div>Voice Activity: <span className="text-emerald-400">99.8%</span></div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
