

import React from "react";
import ChatGPTVoiceOrb from "@/components/voice/ChatGPTVoiceOrb";
import { Sparkles, HelpCircle, Flame, Keyboard } from "lucide-react";

export default function VoicePage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center p-8 text-white relative">
      {/* Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="max-w-6xl w-full flex flex-col space-y-8 relative z-10">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                Phase 3 Frontend
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold uppercase tracking-wider animate-pulse">
                UI Live Demo
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
              Shothik LiveKit Advanced Voice
            </h1>
            <p className="text-sm text-slate-400">
              Powered by DiffusionGemma 2,000+ tok/s, OpenSearch-VL visual perception, and LiveKit WebRTC
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Main Visualizer Orb Container */}
          <div className="flex justify-center">
            <ChatGPTVoiceOrb roomName="shothik-livekit-voice-session" />
          </div>

          {/* Quick Guides & Help Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            
            {/* Box 1 */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-start space-x-3.5">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Keyboard className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Keyboard Shortcuts</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-[10px] text-indigo-300">Ctrl + K</kbd> (or Cmd + K) to toggle speech mode instantly.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-start space-x-3.5">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Code-Mixed Prompting</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Ask: *"Translate this layout and build slides, একটু ফাস্ট করিস।"* and see it work seamlessly.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-start space-x-3.5">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Vision Mode (Screen-VL)</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  When Vision is active, the agent actively reads slide changes to formulate voice feedback.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
