"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Languages,
  MessageSquare,
  Bot,
  Radio,
  ShieldCheck,
  StopCircle,
  Headphones,
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
import { logger } from "@/lib/logger";

export interface VoiceProfile {
  id: string;
  name: string;
  dialect: "dhakaiya" | "chatgaya" | "sylheti" | "standard_bangla";
  region: string;
  model: string;
  gender: "female" | "male";
  tempo: number;
  pitchShiftSemis: number;
  vernacularGreeting: string;
  previewAudioUrl: string;
  description: string;
}

export interface VoiceTurnMessage {
  id: string;
  speaker: "user" | "twin";
  text: string;
  dialectText?: string;
  dialect?: string;
  audioUrl?: string;
  timestamp: string;
}

export const DIALECT_VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "dhakaiya_panna",
    name: "Dhakaiya Panna (পান্না)",
    dialect: "dhakaiya",
    region: "Old Dhaka & Puran Dhaka Retail",
    model: "bangla-vits-v2",
    gender: "male",
    tempo: 1.15,
    pitchShiftSemis: 1.2,
    vernacularGreeting: "মামা খবর কি! লগে লগে কন, ১-ট্যাপে বিকাশ মারবেন নাকি পার্সেল পাঠাইবেন?",
    previewAudioUrl: "https://cdn.shothik.internal/audio/profiles/dhakaiya_panna_sample.wav",
    description: "High-energy Old Dhaka street rhythm for F-commerce, 1-tap bKash checkout, and fast inventory dispatch.",
  },
  {
    id: "chatgaya_nawab",
    name: "Chatgaya Nawab (নওয়াব)",
    dialect: "chatgaya",
    region: "Chittagong Port & Agrabad Logistics",
    model: "neural-vernacular-v3",
    gender: "male",
    tempo: 0.95,
    pitchShiftSemis: -0.8,
    vernacularGreeting: "গম আছেন নি ভাই? জাহাজের মাল খালাস অইয়ে, টেঁয়া কত পাঠাইতেন চান?",
    previewAudioUrl: "https://cdn.shothik.internal/audio/profiles/chatgaya_nawab_sample.wav",
    description: "Resonant coastal cadence tailored for maritime logistics, bulk commerce, and Agrabad banking.",
  },
  {
    id: "sylheti_surma",
    name: "Sylheti Surma (সুরমা)",
    dialect: "sylheti",
    region: "Sylhet Valley & London Diaspora",
    model: "kokoro-82m-quant",
    gender: "female",
    tempo: 1.05,
    pitchShiftSemis: 0.5,
    vernacularGreeting: "ভালা আছেন নি? লন্ডন থাকি টেকা আইছে, জমিনের দলিল আপডেট করমু নি?",
    previewAudioUrl: "https://cdn.shothik.internal/audio/profiles/sylheti_surma_sample.wav",
    description: "Melodic cadence tailored for foreign remittance tracking, diaspora deeds, and cross-border commerce.",
  },
  {
    id: "standard_ananya",
    name: "Standard Ananya (অনন্যা)",
    dialect: "standard_bangla",
    region: "National Standard / Dhaka Corporate",
    model: "kokoro-82m-quant",
    gender: "female",
    tempo: 1.0,
    pitchShiftSemis: 0.0,
    vernacularGreeting: "নমস্কার/সালাম! আমি আপনার শঠিক টুইন। আজ আপনার ব্যবসার কোন কাজটি সম্পন্ন করব?",
    previewAudioUrl: "https://cdn.shothik.internal/audio/profiles/standard_ananya_sample.wav",
    description: "Neutral broadcast Bengali suitable for enterprise boardrooms, regulatory reporting, and compliance.",
  },
];

const SAMPLE_DIALECT_PROMPTS = [
  {
    label: "💸 বিকাশ সেলস ও প্রফিট",
    prompt: "আজকের বিকাশ সেলস এবং নেট প্রফিট কত হয়েছে জানাও",
    dialectIntent: "MFS Ledger & Profit Reconciliation",
  },
  {
    label: "📦 স্টেডফাস্ট কুরিয়ার",
    prompt: "স্টেডফাস্ট কুরিয়ারে ধানমন্ডির পার্সেল বুকিং কনফার্ম করো",
    dialectIntent: "Steadfast Courier Booking",
  },
  {
    label: "🏷️ ঈদের মূল্যছাড়",
    prompt: "স্টোরফ্রন্ট হেডলাইনে ২০% ঈদের বিশেষ মূল্যছাড় লাইভ করো",
    dialectIntent: "No-Code Storefront Promo Update",
  },
  {
    label: "🚢 কাস্টমস মাল খালাস",
    prompt: "চট্টগ্রাম পোর্টের জাহাজের পণ্যের খালাস রিপোর্ট আপডেট করো",
    dialectIntent: "Port Logistics & Clearance",
  },
];

export interface MultiDialectVoiceTwinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

export function MultiDialectVoiceTwinModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: MultiDialectVoiceTwinModalProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("dhakaiya_panna");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [continuousVadMode, setContinuousVadMode] = useState<boolean>(false);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [bargeInDetected, setBargeInDetected] = useState<boolean>(false);

  const selectedProfile =
    DIALECT_VOICE_PROFILES.find((p) => p.id === selectedProfileId) || DIALECT_VOICE_PROFILES[0];

  const [conversation, setConversation] = useState<VoiceTurnMessage[]>([
    {
      id: "turn-0",
      speaker: "twin",
      text: selectedProfile.vernacularGreeting,
      dialectText: selectedProfile.vernacularGreeting,
      dialect: selectedProfile.dialect,
      audioUrl: selectedProfile.previewAudioUrl,
      timestamp: "Just now",
    },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Real-time Canvas Waveform / Spectrogram Animation
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      phase += isListening ? 0.18 : isSpeaking ? 0.12 : 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barCount = 36;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const centerDist = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
        let amplitude = 0.15;

        if (isListening) {
          amplitude = (0.25 + 0.65 * centerDist) * (0.6 + 0.4 * Math.sin(phase + i * 0.4));
        } else if (isSpeaking) {
          amplitude = (0.35 + 0.55 * centerDist) * (0.7 + 0.3 * Math.cos(phase + i * 0.3));
        } else {
          amplitude = 0.1 + 0.08 * Math.sin(phase + i * 0.2);
        }

        const barHeight = Math.max(4, amplitude * height);
        const y = (height - barHeight) / 2;

        // Color based on active state
        if (isListening) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + 0.6 * centerDist})`; // Red listening
        } else if (isSpeaking) {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + 0.6 * centerDist})`; // Emerald speaking
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + 0.3 * centerDist})`; // Idle blue
        }

        ctx.beginPath();
        if (typeof (ctx as any).roundRect === "function") {
          (ctx as any).roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [open, isListening, isSpeaking]);

  const handleSelectProfile = (profile: VoiceProfile) => {
    setSelectedProfileId(profile.id);
    setConversation((prev) => [
      ...prev,
      {
        id: `turn-sw_${Date.now()}`,
        speaker: "twin",
        text: profile.vernacularGreeting,
        dialectText: profile.vernacularGreeting,
        dialect: profile.dialect,
        audioUrl: profile.previewAudioUrl,
        timestamp: "Just now",
      },
    ]);
  };

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // If twin is speaking, trigger Barge-In interrupt!
    if (isSpeaking) {
      handleBargeIn();
    }

    setIsListening(true);
    setBargeInDetected(false);

    // Simulate voice turnaround for live browser testing
    setTimeout(() => {
      const sample = SAMPLE_DIALECT_PROMPTS[Math.floor(Math.random() * SAMPLE_DIALECT_PROMPTS.length)];
      handleSendTurn(sample.prompt);
    }, 1800);
  };

  const handleBargeIn = () => {
    setIsSpeaking(false);
    setActiveAudioPlaying(null);
    setBargeInDetected(true);
    logger.info("Barge-in interrupt triggered: Aborted active twin voice stream");
  };

  const handleSendTurn = (userText: string) => {
    setIsListening(false);
    setIsProcessing(true);

    const userMessage: VoiceTurnMessage = {
      id: `turn-usr-${Date.now()}`,
      speaker: "user",
      text: userText,
      timestamp: "Just now",
    };

    setConversation((prev) => [...prev, userMessage]);

    // Simulated API roundtrip to /api/v1/voice/twin/stream-bidirectional
    setTimeout(() => {
      setIsProcessing(false);
      setIsSpeaking(true);

      let reply = "আপনার নির্দেশ অনুযায়ী কার্যক্রম শুরু করা হয়েছে।";
      let dialectReply = reply;

      if (userText.includes("বিকাশ") || userText.includes("সেলস") || userText.includes("profit")) {
        if (selectedProfile.dialect === "dhakaiya") {
          dialectReply = "মামা, আজকের বিকাশ সেলস ৳৩৮,৫০০ টাকা আর নেট প্রফিট ৳৩২,১৫০ টাকা লগে লগে খাতা বন্ধ কইরা দিছি!";
        } else if (selectedProfile.dialect === "chatgaya") {
          dialectReply = "বিকাশের টেঁয়া ৩৮,৫০০ আইয়ে গেইয়ে ভাই, গম লাভ অইয়ে!";
        } else if (selectedProfile.dialect === "sylheti") {
          dialectReply = "বিকাশে টেকা আইছে ৩৮,৫০০, লন্ডন থাকি হিসাব ক্লিয়ার!";
        } else {
          dialectReply = "আজকের মোট বিকাশ বিক্রয় ৩৮,৫০০ টাকা এবং নিট মুনাফা ৩২,১৫০ টাকা সম্পন্ন হয়েছে।";
        }
      } else if (userText.includes("পার্সেল") || userText.includes("কুরিয়ার") || userText.includes("স্টেডফাস্ট")) {
        if (selectedProfile.dialect === "dhakaiya") {
          dialectReply = "স্টেডফাস্টে লগে লগে মাল ছাইড়া দিছি! ট্র্যাকিং কোড ST-882193 রেডি মামা!";
        } else {
          dialectReply = "স্টেডফাস্ট কুরিয়ারে পার্সেল কনফার্ম করা হয়েছে, কনসাইনমেন্ট আইডি ST-882193।";
        }
      } else {
        dialectReply = `${selectedProfile.name} হিসেবে অবিলম্বে আপনার নির্দেশ এক্সিকিউট করছি।`;
      }

      const twinMessage: VoiceTurnMessage = {
        id: `turn-twn-${Date.now()}`,
        speaker: "twin",
        text: reply,
        dialectText: dialectReply,
        dialect: selectedProfile.dialect,
        audioUrl: `https://cdn.shothik.internal/audio/synth/vits_${selectedProfile.id}_${Date.now()}.wav`,
        timestamp: "Just now",
      };

      setConversation((prev) => [...prev, twinMessage]);

      // Twin speaking duration simulation
      setTimeout(() => {
        setIsSpeaking(false);
      }, 3500);
    }, 600);
  };

  const handlePlayAudio = (turnId: string) => {
    setActiveAudioPlaying((prev) => (prev === turnId ? null : turnId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-neutral-950/95 border-neutral-800 text-neutral-100 p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header Bar */}
        <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Headphones className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                Autonomous Multi-Dialect Voice Studio
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/30 text-xs">
                  Kokoro & Bangla VITS
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                Real-time bi-directional speech streaming with demographic dialect adaptation & zero-lag barge-in.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-1 ${
                isSpeaking
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-950/40 animate-pulse"
                  : isListening
                  ? "border-red-500/50 text-red-400 bg-red-950/40 animate-pulse"
                  : isProcessing
                  ? "border-amber-500/50 text-amber-400 bg-amber-950/40"
                  : "border-neutral-800 text-neutral-400 bg-neutral-900"
              }`}
            >
              <Radio className="w-3 h-3 mr-1 inline" />
              {isSpeaking
                ? `Twin Speaking (${selectedProfile.dialect})`
                : isListening
                ? "Listening (VAD Active)..."
                : isProcessing
                ? "Synthesizing VITS Stream..."
                : "Studio Idle"}
            </Badge>
          </div>
        </div>

        {/* 60 FPS Canvas Visualizer Bar */}
        <div className="w-full bg-neutral-900/60 border-b border-neutral-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <canvas
              ref={canvasRef}
              width={260}
              height={36}
              className="rounded bg-neutral-950/80 border border-neutral-800/80"
              data-testid="voice-canvas-visualizer"
            />
            <span className="text-[11px] text-neutral-500">24kHz PCM16 • Sub-40ms TTFB</span>
          </div>

          {/* Barge-In Alert */}
          {bargeInDetected && (
            <span className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
              <Zap className="w-3 h-3" /> Barge-in: Twin interrupted
            </span>
          )}

          {/* Hands-Free Toggle */}
          <button
            type="button"
            onClick={() => setContinuousVadMode(!continuousVadMode)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
              continuousVadMode
                ? "bg-purple-950/40 border-purple-500/50 text-purple-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {continuousVadMode ? "Hands-Free VAD ON" : "Push-to-Talk Mode"}
          </button>
        </div>

        {/* Main Body: Dialect Grid + Conversation */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] max-h-[480px]">
          {/* Dialect Voice Profiles Selector (Left Column) */}
          <div className="md:col-span-5 border-r border-neutral-800/80 p-4 space-y-2.5 bg-neutral-900/20 overflow-y-auto">
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              Regional Dialect Profiles
            </div>

            {DIALECT_VOICE_PROFILES.map((profile) => {
              const isSelected = selectedProfileId === profile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-neutral-800/80 border-emerald-500/60 shadow-lg shadow-emerald-950/20"
                      : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40"
                  }`}
                  data-testid={`profile-card-${profile.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {profile.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-neutral-800 text-neutral-300 border-neutral-700">
                      {profile.tempo}x tempo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mb-2">{profile.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="text-emerald-400 font-mono">{profile.model}</span>
                    <span className="text-neutral-500">{profile.region}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversation Transcript & Controls (Right Column) */}
          <div className="md:col-span-7 flex flex-col justify-between bg-neutral-950">
            {/* Conversation Log */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 max-h-[300px]" data-testid="conversation-stream">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.speaker === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                      msg.speaker === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-semibold text-[10px] text-neutral-400 uppercase">
                        {msg.speaker === "user" ? "Founder" : `${selectedProfile.name}`}
                      </span>
                      {msg.dialect && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-emerald-400 border border-emerald-900/60">
                          {msg.dialect}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed font-medium">{msg.dialectText || msg.text}</p>
                    {msg.audioUrl && (
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(msg.id)}
                        className="mt-2 text-[10px] flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Volume2 className="w-3 h-3" />
                        {activeAudioPlaying === msg.id ? "Playing 24kHz stream..." : "Play Voice"}
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-4 py-2 border-t border-neutral-800/80 bg-neutral-900/30 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold whitespace-nowrap">
                Quick Prompts:
              </span>
              {SAMPLE_DIALECT_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendTurn(p.prompt)}
                  className="text-[11px] whitespace-nowrap bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-2.5 py-1 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "default"}
                  size="sm"
                  onClick={handleToggleListening}
                  className={`gap-2 rounded-xl font-medium ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                  data-testid="voice-mic-toggle"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? "Stop Listening" : "Tap to Speak"}
                </Button>

                {isSpeaking && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBargeIn}
                    className="border-neutral-700 text-amber-400 hover:bg-neutral-800 rounded-xl text-xs gap-1"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    Interrupt (Barge-In)
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero-Retention Voice Privacy</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
