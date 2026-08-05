

import React from "react";
import ChatGPTVoiceOrb from "@/components/voice/ChatGPTVoiceOrb";

export default function VoicePage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-2xl w-full flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Shothik LiveKit Advanced Voice
          </h1>
          <p className="text-sm text-slate-400">
            Powered by DiffusionGemma 2,000+ tok/s, OpenSearch-VL visual perception, and LiveKit WebRTC
          </p>
        </div>

        <ChatGPTVoiceOrb roomName="shothik-livekit-voice-session" />
      </div>
    </main>
  );
}
