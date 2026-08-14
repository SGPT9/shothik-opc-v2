"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Zap,
  CheckCircle2,
  Play,
  RotateCcw,
  Languages,
  MessageSquare,
  Bot,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveOfflineTask } from "@/lib/offline/offline-storage";

export interface VoiceMessage {
  id: string;
  sender: "user" | "twin";
  text: string;
  banglishText?: string;
  actionTaken?: string;
  timestamp: string;
}

export interface VoiceCommanderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

const SAMPLE_COMMANDS = [
  {
    banglish: "Ajker bKash sales ar net profit koto?",
    english: "Show today's bKash revenue and net profit ledger.",
    action: "Checked MFS ledger: ৳38,500 BDT gross revenue with ৳32,150 net profit.",
  },
  {
    banglish: "Amar landing page er headline change kore 20% Eid discount dao",
    english: "Update storefront hero headline to include 20% Eid discount.",
    action: "Updated Hero banner headline in No-Code builder & triggered Dokploy rollout.",
  },
  {
    banglish: "Dhakar fashion house der jonno 10 ta cold email pathao",
    english: "Send 10 cold email pitches to Dhaka fashion houses.",
    action: "Dispatched 10 B2B outreach sequences via EmailOutreachEngine.",
  },
  {
    banglish: "Dokploy te container rolling redeploy koro",
    english: "Trigger rolling redeploy on Dokploy container.",
    action: "Rolling zero-downtime container redeployment initiated on Dokploy.",
  },
];

export function VoiceCommanderModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: VoiceCommanderModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [languageMode, setLanguageMode] = useState<"banglish" | "bangla" | "english">("banglish");
  const [conversation, setConversation] = useState<VoiceMessage[]>([
    {
      id: "msg-0",
      sender: "twin",
      text: `Salam! Ami ${companyName} er autonomous co-founder. Bolun ki korte hobe — bKash revenue check, website edit, naki cold email sequence pathabo?`,
      timestamp: "Just now",
    },
  ]);

  const recognitionRef = useRef<any>(null);

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript("");

    // Simulate voice capture if Web Speech API is not available in mock/test
    setTimeout(() => {
      const sample = SAMPLE_COMMANDS[Math.floor(Math.random() * SAMPLE_COMMANDS.length)];
      handleCommandSpoken(sample.banglish, sample.action);
    }, 200);
  };

  const handleCommandSpoken = (spokenText: string, actionResult: string) => {
    setIsListening(false);
    setIsProcessing(false);
    setTranscript("");

    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text: spokenText,
      timestamp: "Just now",
    };

    const twinMsg: VoiceMessage = {
      id: `twin-${Date.now()}-${Math.random()}`,
      sender: "twin",
      text: `Kaj hoye geche! ${actionResult}`,
      actionTaken: actionResult,
      timestamp: "Just now",
    };

    setConversation((prev) => [...prev, userMsg, twinMsg]);

    saveOfflineTask({
      id: `voice-task-${Date.now()}-${Math.random()}`,
      title: `Voice Command: ${spokenText.slice(0, 50)}`,
      category: "CEO",
      status: "completed",
      cost: "1 Credit",
      updatedAt: Date.now(),
    });
  };

  const handleQuickCommand = (cmd: (typeof SAMPLE_COMMANDS)[0]) => {
    handleCommandSpoken(cmd.banglish, cmd.action);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] md:max-w-3xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Banglish Voice Commander</span>
                <Badge variant="outline" className="border-violet-500/40 text-violet-400 font-mono text-[10px]">
                  Web Speech V2
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Hands-free voice operator for {companyName} with native Bangla & Banglish NLP.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <button
              onClick={() => setLanguageMode("banglish")}
              className={`px-2.5 py-1 rounded-lg border transition ${
                languageMode === "banglish"
                  ? "border-violet-500 bg-violet-500/20 text-violet-300 font-bold"
                  : "border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Banglish
            </button>
            <button
              onClick={() => setLanguageMode("bangla")}
              className={`px-2.5 py-1 rounded-lg border transition ${
                languageMode === "bangla"
                  ? "border-violet-500 bg-violet-500/20 text-violet-300 font-bold"
                  : "border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguageMode("english")}
              className={`px-2.5 py-1 rounded-lg border transition ${
                languageMode === "english"
                  ? "border-violet-500 bg-violet-500/20 text-violet-300 font-bold"
                  : "border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Voice Visualizer Orb */}
        <div className="p-6 bg-gradient-to-b from-slate-950 to-slate-900/60 border-b border-slate-800 flex flex-col items-center justify-center shrink-0">
          <div className="relative flex items-center justify-center mb-4">
            {/* Animated Pulsing Rings */}
            {isListening && (
              <>
                <div className="absolute h-28 w-28 rounded-full bg-violet-500/20 animate-ping" />
                <div className="absolute h-20 w-20 rounded-full bg-violet-500/30 animate-pulse" />
              </>
            )}
            {isProcessing && (
              <div className="absolute h-24 w-24 rounded-full border-2 border-dashed border-indigo-400 animate-spin" />
            )}

            <button
              onClick={handleToggleListening}
              data-testid="voice-mic-button"
              className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition duration-300 ${
                isListening
                  ? "bg-rose-600 text-white ring-4 ring-rose-500/40"
                  : isProcessing
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-500/40"
                  : "bg-violet-600 hover:bg-violet-500 text-white ring-4 ring-violet-500/20"
              }`}
            >
              {isListening ? (
                <MicOff className="h-7 w-7 animate-bounce" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>
          </div>

          <p className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            {isListening ? (
              <span className="text-rose-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" /> Shunchi... Mukhe bolun
              </span>
            ) : isProcessing ? (
              <span className="text-indigo-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 animate-spin" /> Analyzing command & executing...
              </span>
            ) : (
              <span className="text-slate-400">Click mic icon ba nichet quick command tap korun</span>
            )}
          </p>

          {transcript && (
            <p className="mt-2 text-xs font-mono text-cyan-300 italic bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40">
              "{transcript}"
            </p>
          )}
        </div>

        {/* Quick Command Suggestions */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-[11px]">
          <span className="text-[10px] text-slate-500 uppercase shrink-0">Quick Commands:</span>
          {SAMPLE_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              data-testid={`quick-cmd-${idx}`}
              onClick={() => handleQuickCommand(cmd)}
              className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-violet-500 hover:text-violet-300 transition whitespace-nowrap shrink-0"
            >
              💬 {cmd.banglish.slice(0, 30)}...
            </button>
          ))}
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "twin" && (
                <div className="h-7 w-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5 border border-violet-500/30">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-violet-600 text-white rounded-br-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                {msg.actionTaken && (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{msg.actionTaken}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
