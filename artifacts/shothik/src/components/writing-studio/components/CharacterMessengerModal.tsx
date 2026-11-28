import React, { useState, useEffect, useRef } from "react";
import {
  X,
  MessageCircle,
  Mic,
  Play,
  Pause,
  Send,
  Volume2,
  Sparkles,
  Lock,
  Check,
  FileText,
  User,
  ShieldAlert,
  HelpCircle,
  Radio,
} from "lucide-react";

export interface CharacterContact {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  role: "protagonist" | "deuteragonist" | "antagonist" | "mentor" | "catalyst";
  avatar: string;
  status: "online" | "typing" | "away" | "offline";
  voicePersonaId: string;
  voiceName: string;
  dialect: string;
  personaMotto: string;
  hiddenSecret: string;
  lastActive: string;
}

export interface VoiceNotePayload {
  id: string;
  durationSeconds: number;
  waveformBars: number[];
  audioBase64: string;
  emotion: string;
  isSynthesized: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "author" | "character";
  characterId: string;
  text: string;
  timestamp: string;
  voiceNote?: VoiceNotePayload;
  secretLoreDisclosure?: {
    topic: string;
    confession: string;
  };
}

interface CharacterMessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditorText?: string;
  onApplyToManuscript?: (textToInject: string) => void;
  projectId?: string;
}

const PRESET_QUERIES = [
  "তুমি রূপার নীল শাড়িটি কেন নিতে চাইলে না?",
  "ওসি সাহেব তোমাকে কেন সন্দেহের চোখে দেখছেন?",
  "তোমার জীবনের অপ্রকাশিত সবচেয়ে বড় গোপন কথাটি কী?",
  "এই দৃশ্যের পরে তুমি কোথায় যাওয়ার পরিকল্পনা করছ?",
];

export const CharacterMessengerModal: React.FC<CharacterMessengerModalProps> = ({
  isOpen,
  onClose,
  activeEditorText = "",
  onApplyToManuscript,
  projectId = "default",
}) => {
  const [characters, setCharacters] = useState<CharacterContact[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>("char_himu");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateVoice, setGenerateVoice] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [appliedLoreId, setAppliedLoreId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load characters list
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/v1/projects/${projectId}/character-messenger/characters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.characters) {
          setCharacters(data.characters);
        }
      })
      .catch((err) => console.error("Failed to fetch character list", err));
  }, [isOpen, projectId]);

  // Load message history for selected character
  useEffect(() => {
    if (!isOpen || !selectedCharId) return;
    fetch(`/api/v1/projects/${projectId}/character-messenger/threads/${selectedCharId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.error("Failed to load thread messages", err));
  }, [isOpen, selectedCharId, projectId]);

  if (!isOpen) return null;

  const activeChar = characters.find((c) => c.id === selectedCharId) || characters[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || loading) return;

    setInputVal("");
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/character-messenger/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedCharId,
          userMessage: text,
          generateVoiceNote: generateVoice,
        }),
      });
      const data = await res.json();
      if (data.characterReply && data.authorMessage) {
        setMessages((prev) => [...prev, data.authorMessage, data.characterReply]);
      }
    } catch (err) {
      console.error("Failed to send character message", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlayVoice = (voice: VoiceNotePayload) => {
    if (playingVoiceId === voice.id) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(voice.id);
      // Construct audio data uri from base64
      const audioUrl = `data:audio/wav;base64,${voice.audioBase64}`;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingVoiceId(null);
      // Auto stop after duration
      setTimeout(() => setPlayingVoiceId(null), voice.durationSeconds * 1000);
    }
  };

  const handleInjectLore = (confession: string, loreId: string) => {
    if (onApplyToManuscript) {
      onApplyToManuscript(`\n\n[অপ্রকাশিত চরিত্র-ভাবনা: ${activeChar.nameBangla}]\n"${confession}"\n`);
      setAppliedLoreId(loreId);
      setTimeout(() => setAppliedLoreId(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                  Direct Character Messenger & Voice-Note Lore Chat
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Capability #22
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> 24kHz Neural Voice
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                চরিত্রের সাথে সরাসরি বার্তালাপ ও ভয়েস নোট — হিমু, বাদল, রূপা ও ওসি রফিকের অন্তরমহল
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Messenger View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Character Contacts */}
          <div className="w-64 border-r border-slate-800/80 bg-slate-950/40 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Story Characters ({characters.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {characters.map((char) => {
                const isSelected = char.id === selectedCharId;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`w-full flex items-start space-x-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-500/5"
                        : "hover:bg-slate-800/60 border border-transparent text-slate-300"
                    }`}
                  >
                    <div className="relative text-2xl shrink-0">
                      {char.avatar}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold truncate">{char.nameBangla}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{char.dialect}</p>
                      <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-slate-400">
                        {char.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Viewport */}
          <div className="flex-1 flex flex-col bg-slate-900/60 overflow-hidden">
            {/* Top Bar for Selected Character */}
            {activeChar && (
              <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{activeChar.avatar}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xs font-bold text-slate-200">{activeChar.nameBangla}</h3>
                      <span className="text-[10px] text-slate-500">({activeChar.nameEnglish})</span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-[10px] text-emerald-400 font-medium">In Persona</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">"{activeChar.personaMotto}"</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-slate-800 border border-slate-700/60 rounded-md text-[10px] text-slate-300 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400" />
                    {activeChar.voiceName}
                  </span>
                </div>
              </div>
            )}

            {/* Conversation Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isAuthor = msg.sender === "author";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAuthor ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center space-x-2 mb-1 text-[10px] text-slate-400">
                      <span>{isAuthor ? "Author (You)" : activeChar?.nameBangla}</span>
                    </div>

                    <div
                      className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed font-sans shadow-md ${
                        isAuthor
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none"
                          : "bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Interactive Voice Note Player Bubble */}
                      {msg.voiceNote && (
                        <div className="mt-3 p-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl flex items-center space-x-3">
                          <button
                            onClick={() => msg.voiceNote && handleTogglePlayVoice(msg.voiceNote)}
                            className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                          >
                            {playingVoiceId === msg.voiceNote.id ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>

                          {/* Dynamic Audio Waveform Frequency Visualizer */}
                          <div className="flex-1 flex items-center space-x-0.5 h-6">
                            {msg.voiceNote.waveformBars.map((bar, bIdx) => (
                              <span
                                key={bIdx}
                                style={{ height: `${Math.max(15, bar)}%` }}
                                className={`w-1 rounded-full transition-all ${
                                  playingVoiceId === msg.voiceNote?.id
                                    ? "bg-cyan-400"
                                    : "bg-slate-700"
                                }`}
                              />
                            ))}
                          </div>

                          <span className="text-[10px] font-mono text-cyan-300 shrink-0">
                            0:{Math.round(msg.voiceNote.durationSeconds).toString().padStart(2, "0")}
                          </span>
                        </div>
                      )}

                      {/* Secret Lore Disclosure Box */}
                      {msg.secretLoreDisclosure && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-amber-300">
                            <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              Secret Lore Unlocked: {msg.secretLoreDisclosure.topic}
                            </span>
                            <button
                              onClick={() =>
                                msg.secretLoreDisclosure &&
                                handleInjectLore(msg.secretLoreDisclosure.confession, msg.id)
                              }
                              className="text-[10px] px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-medium transition-all"
                            >
                              {appliedLoreId === msg.id ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" /> Injected
                                </span>
                              ) : (
                                "Inject to Manuscript"
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed italic">
                            "{msg.secretLoreDisclosure.confession}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-5 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto text-xs">
              <span className="text-[10px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Inquire:
              </span>
              {PRESET_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded-full transition-all shrink-0 text-[10px]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Bottom Message Input Bar */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center space-x-3">
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-400 hover:text-slate-200 select-none shrink-0">
                <input
                  type="checkbox"
                  checked={generateVoice}
                  onChange={(e) => setGenerateVoice(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] flex items-center gap-1">
                  <Mic className="w-3 h-3 text-cyan-400" /> Voice Note
                </span>
              </label>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Ask ${activeChar?.nameBangla || "character"} anything in persona...`}
                className="flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 font-sans"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputVal.trim()}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
