"use client";

import { useState } from "react";
import {
  Send,
  Bot,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Bell,
  Volume2,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Zap,
  PhoneCall,
  Clock,
  Radio,
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

export interface TelegramVoiceBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

export function TelegramVoiceBriefingModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: TelegramVoiceBriefingModalProps) {
  const [telegramChatId, setTelegramChatId] = useState("@shothik_founder_bot");
  const [whatsappPhone, setWhatsappPhone] = useState("+8801700000000");
  const [dailyBriefingTime, setDailyBriefingTime] = useState("09:00 AM");
  const [briefingLanguage, setBriefingLanguage] = useState<"Banglish" | "Bangla" | "English">("Banglish");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const sampleBriefingText =
    briefingLanguage === "Bangla"
      ? `শুভ সকাল! গতকাল আপনার মোট bKash সেলস ৳৩৮,৫০০ টাকা। ৩টি নতুন হট লিড WhatsApp-এ রিপ্লাই করেছে। Steadfast কুরিয়ারে ৪টি পার্সেল ডেলিভারি সম্পন্ন হয়েছে।`
      : briefingLanguage === "Banglish"
      ? `Shuvo Shokal! Gotokal apnar total bKash sales ৳38,500 BDT. 3ta new hot lead WhatsApp e reply koreche. Steadfast courier e 4ta parcel delivered complete hoyeche.`
      : `Good morning! Yesterday's total bKash sales reached ৳38,500 BDT. 3 hot leads responded on WhatsApp. 4 parcels were delivered by Steadfast Courier.`;

  const handleSendTestBriefing = () => {
    setTestSent(true);
    saveOfflineTask({
      id: `briefing-task-${Date.now()}`,
      title: `Dispatched instant voice briefing to ${telegramChatId} & ${whatsappPhone}`,
      category: "Publish",
      status: "completed",
      cost: "1 Credit",
      updatedAt: Date.now(),
    });
    setTimeout(() => setTestSent(false), 4000);
  };

  const toggleAudioPreview = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio && typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(sampleBriefingText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] xl:max-w-5xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Telegram & WhatsApp Voice Briefing Autopilot</span>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 font-mono text-[10px]">
                  User 4 / Non-Technical Operator
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Receive daily audio P&L briefings and manage {companyName} entirely via voice without opening the dashboard.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSendTestBriefing}
              className="h-8 gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono"
              data-testid="button-send-test-briefing"
            >
              <Send className="h-3.5 w-3.5" /> Dispatch Test Briefing
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {testSent && (
          <div className="p-3 bg-cyan-950/60 border-b border-cyan-800/40 text-xs font-mono text-cyan-300 flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Voice & Text Briefing dispatched to Telegram ({telegramChatId}) and WhatsApp!</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-xs">
          {/* Audio Simulator Player */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="font-bold text-slate-200">Daily Morning Audio Briefing Preview</span>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px]">
                {briefingLanguage} Voice Engine
              </Badge>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              "{sampleBriefingText}"
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={toggleAudioPreview}
                  className="h-8 gap-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                  data-testid="button-play-audio-preview"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-cyan-400" /> Pause Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-cyan-400" /> Listen to Audio Voice
                    </>
                  )}
                </Button>
                <span className="text-[10px] text-slate-400">Duration: ~18s · Voice: Farhan (AI Co-Founder)</span>
              </div>

              <div className="flex items-center gap-1">
                {(["Banglish", "Bangla", "English"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setBriefingLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                      briefingLanguage === lang
                        ? "bg-cyan-500 text-slate-950 border-cyan-400"
                        : "border-slate-800 bg-slate-900 text-slate-400"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram Bot Setup */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Send className="h-4 w-4" />
                <span>Telegram Bot Integration</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Telegram Bot Handle / Chat ID</label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Send commands like <span className="text-cyan-300">/sales</span>, <span className="text-cyan-300">/leads</span>, or voice notes directly to the bot.
                </p>
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <PhoneCall className="h-4 w-4" />
                <span>WhatsApp Daily Audio Drop</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Scheduled Delivery:</span>
                  <span className="font-bold text-slate-200">{dailyBriefingTime} every morning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
