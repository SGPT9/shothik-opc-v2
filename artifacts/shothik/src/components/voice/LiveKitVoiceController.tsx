"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Radio, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LiveKitVoiceControllerProps {
  roomName?: string;
  onStateChange?: (state: "connected" | "disconnected" | "talking") => void;
}

export default function LiveKitVoiceController({
  roomName = "shothik-voice-room",
  onStateChange,
}: LiveKitVoiceControllerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantName: "Merchant-User" }),
      });
      const data = await res.json();
      if (data.success) {
        setIsConnected(true);
        setServerUrl(data.serverUrl);
        setActiveSpeaker("South-Asian-Voice-AI (Bangla/Urdu/English)");
        onStateChange?.("connected");
      }
    } catch (err) {
      console.error("Failed to issue LiveKit token", err);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setActiveSpeaker(null);
    onStateChange?.("disconnected");
  };

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-xl max-w-sm w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {isConnected ? "LiveKit WebRTC Active" : "Voice AI Standby"}
          </span>
        </div>
        <Zap className="h-4 w-4 text-indigo-400" />
      </div>

      {isConnected ? (
        <div className="space-y-3 pt-1">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="text-slate-400 text-[10px]">Active Speaker</p>
              <p className="font-semibold text-emerald-300">{activeSpeaker}</p>
            </div>
            <Volume2 className="h-4 w-4 text-emerald-400 animate-bounce" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1.5 border-slate-700 hover:bg-slate-800"
            >
              {isMuted ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : <Mic className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              size="sm"
              className="text-xs"
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Connect Code-Mixed Voice Agent</span>
        </Button>
      )}
    </div>
  );
}
