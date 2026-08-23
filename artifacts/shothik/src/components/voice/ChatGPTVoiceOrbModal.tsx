import React, { useState } from "react";
import {
  ChatGptVoiceAgentService,
  type VoiceExecutionActionType,
  type VoiceActionResponse,
} from "@/lib/voice/chatgpt-voice-agent-service";
import { AvatarOrb3D, type AvatarOrbRole } from "@/components/chat/AvatarOrb3D";

export interface ChatGPTVoiceOrbModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: AvatarOrbRole;
}

export const ChatGPTVoiceOrbModal: React.FC<ChatGPTVoiceOrbModalProps> = ({
  isOpen,
  onClose,
  initialRole = "shothik_core",
}) => {
  const [orbState, setOrbState] = useState<"listening" | "thinking" | "speaking" | "idle">("idle");
  const [activeRole, setActiveRole] = useState<AvatarOrbRole>(initialRole);
  const [activeResponse, setActiveResponse] = useState<VoiceActionResponse | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerVoiceAction = (actionType: VoiceExecutionActionType, role?: AvatarOrbRole) => {
    if (role) setActiveRole(role);
    setOrbState("thinking");
    setTimeout(() => {
      const res = ChatGptVoiceAgentService.executeVoiceAction("Voice Command", actionType, "bn-BD");
      setActiveResponse(res);
      setOrbState("speaking");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-slate-100 animate-in fade-in duration-150">
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">ChatGPT Voice Mode — Shothik Execution</span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-[10px] font-mono">
          {(
            [
              { id: "shothik_core", label: "Core" },
              { id: "sales_twin", label: "Twin" },
              { id: "steadfast_logistics", label: "Courier" },
              { id: "tax_advisor", label: "Tax" },
            ] as const
          ).map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRole(role.id)}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                activeRole === role.id
                  ? "bg-brand/20 text-brand font-bold border border-brand/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Voice Mode"
          className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer select-none"
        >
          ✕
        </button>
      </div>

      {/* Center 3D Audio-Reactive Fluid Voice Orb */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        <div
          onClick={() => setOrbState(orbState === "idle" ? "listening" : "idle")}
          className="cursor-pointer group flex flex-col items-center justify-center relative p-6 rounded-full hover:scale-105 transition-transform"
          title="Click to toggle voice state"
        >
          <AvatarOrb3D
            size={144}
            isSpeaking={orbState === "speaking"}
            isListening={orbState === "listening"}
            avatarRole={activeRole}
          />
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 mt-3 tracking-widest">
            {orbState}
          </span>
        </div>

        {/* Spoken Action Transcript Subtitle */}
        <div className="max-w-md text-center space-y-2">
          {activeResponse ? (
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                {activeResponse.actionTitle}
              </span>
              <p className="text-sm font-medium text-slate-100 leading-relaxed">
                "{activeResponse.spokenTranscript}"
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              "কথা বলুন অথবা নিচের রিয়েল-ওয়ার্ল্ড অ্যাকশন সিলেক্ট করুন..."
            </p>
          )}
        </div>
      </div>

      {/* Bottom 1-Tap Execution Action Buttons */}
      <div className="w-full max-w-xl space-y-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center font-mono">1-Tap Real-World Voice Execution Actions</span>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => triggerVoiceAction("bkash_verify_payment", "sales_twin")}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500 p-3 rounded-2xl text-left space-y-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
              <span>📲</span> bKash Verify
            </div>
            <p className="text-[10px] text-slate-400">Auto 10-char TrxID check</p>
          </button>

          <button
            onClick={() => triggerVoiceAction("steadfast_book_courier", "steadfast_logistics")}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500 p-3 rounded-2xl text-left space-y-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
              <span>📦</span> Courier Book
            </div>
            <p className="text-[10px] text-slate-400">Steadfast WhatsApp parcel</p>
          </button>

          <button
            onClick={() => triggerVoiceAction("nbr_tax_clearance_form11ga", "tax_advisor")}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500 p-3 rounded-2xl text-left space-y-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>📜</span> NBR Form 11GA
            </div>
            <p className="text-[10px] text-slate-400">e-TIN Tax rebate clearance</p>
          </button>
        </div>
      </div>
    </div>
  );
};

