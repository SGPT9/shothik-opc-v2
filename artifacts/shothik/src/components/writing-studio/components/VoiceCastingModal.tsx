import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Sparkles,
  Sliders,
  Users,
  Check,
  RotateCcw,
  Languages,
  Headphones,
  Radio,
  Share2,
  FileText,
  AlertCircle
} from "lucide-react";

export interface VoicePersonaMetadata {
  id: string;
  name: string;
  dialect: string;
  pitchHz: number;
  defaultEmotion: string;
  gender: string;
  timbreDescription: string;
}

export interface CharacterVoiceProfile {
  characterId: string;
  characterName: string;
  personaId: string;
  dialect: string;
  pitchOffsetSemitones: number;
  speakingRate: number;
  defaultEmotion: string;
  customPronunciations: Array<{ word: string; phoneticIpa: string }>;
  sampleLine: string;
  sampleAudioBase64?: string;
  updatedAt: string;
}

export interface RenderedClip {
  lineIndex: number;
  speaker: string;
  personaId: string;
  text: string;
  startTimeSeconds: number;
  durationSeconds: number;
  audioBase64: string;
  sampleRate: number;
  source: string;
}

interface VoiceCastingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  currentManuscriptText?: string;
}

export const VoiceCastingModal: React.FC<VoiceCastingModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  currentManuscriptText = "",
}) => {
  const [activeTab, setActiveTab] = useState<"roster" | "scene">("roster");
  const [personas, setPersonas] = useState<VoicePersonaMetadata[]>([]);
  const [characters, setCharacters] = useState<CharacterVoiceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [auditioningId, setAuditioningId] = useState<string | null>(null);
  const [playingClipIndex, setPlayingClipIndex] = useState<number | null>(null);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Multi-Cast Scene Director State
  const [sceneScript, setSceneScript] = useState<string>(
    `কথক: রাত তখন আড়াইটা। ঢাকার রাজপথ ধোঁয়াটে বৃষ্টির চাদরে মোড়া।\nহিমু: এত রাতে বৃষ্টিতে খালি পায়ে হাঁটার অনুভূতি অতুলনীয়।\nবাদল: হিমু ভাই, আপনার তো একটুও শীত করছে না?\nহিমু: শীতের আলাদা একটা গন্ধ আছে রে বাদল, খেয়াল করেছিস?`
  );
  const [isRenderingScene, setIsRenderingScene] = useState(false);
  const [renderedClips, setRenderedClips] = useState<RenderedClip[]>([]);
  const [totalSceneDuration, setTotalSceneDuration] = useState<number>(0);

  // Audio Playback Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Available Personas and Cast Roster
  const loadCastingData = async () => {
    setIsLoading(true);
    try {
      const [personasRes, rosterRes] = await Promise.all([
        fetch("/api/v1/voice-casting/available-personas"),
        fetch(`/api/v1/projects/${projectId}/voice-casting`),
      ]);

      if (personasRes.ok) {
        const pJson = await personasRes.json();
        if (pJson.data?.personas) setPersonas(pJson.data.personas);
      }

      if (rosterRes.ok) {
        const rJson = await rosterRes.json();
        if (rJson.data?.characters) setCharacters(rJson.data.characters);
      }
    } catch (err) {
      console.warn("[VoiceCasting] Error loading casting data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCastingData();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setAuditioningId(null);
      setPlayingClipIndex(null);
    }
  }, [isOpen, projectId]);

  // Play Audio Base64 (WAV 24kHz)
  const playAudioBase64 = (base64Data: string, onEnd?: () => void) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audioUrl = `data:audio/wav;base64,${base64Data}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      if (onEnd) onEnd();
    };

    audio.play().catch((e) => console.warn("Audio play prevented", e));
  };

  // Audition a Character Voice
  const handleAudition = async (char: CharacterVoiceProfile) => {
    setAuditioningId(char.characterId);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/voice-casting/audition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: char.characterName,
          personaId: char.personaId,
          text: char.sampleLine,
          emotion: char.defaultEmotion,
          pitchOffsetSemitones: char.pitchOffsetSemitones,
          speakingRate: char.speakingRate,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.audioBase64) {
          playAudioBase64(json.data.audioBase64, () => {
            setAuditioningId(null);
          });
        } else {
          setAuditioningId(null);
        }
      } else {
        setAuditioningId(null);
      }
    } catch (err) {
      console.error("[VoiceCasting] Audition failed", err);
      setAuditioningId(null);
    }
  };

  // Update Character Setting
  const updateCharacterSetting = async (
    charId: string,
    updates: Partial<CharacterVoiceProfile>
  ) => {
    const target = characters.find((c) => c.characterId === charId);
    if (!target) return;

    const merged = { ...target, ...updates };
    setCharacters((prev) => prev.map((c) => (c.characterId === charId ? merged : c)));

    try {
      await fetch(`/api/v1/projects/${projectId}/voice-casting/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      setSavedNotification(charId);
      setTimeout(() => setSavedNotification(null), 1500);
    } catch (err) {
      console.error("[VoiceCasting] Save failed", err);
    }
  };

  // Render Full Multi-Cast Scene Audio
  const handleRenderScene = async () => {
    if (!sceneScript.trim()) return;
    setIsRenderingScene(true);
    setRenderedClips([]);

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/voice-casting/render-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneText: sceneScript }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.clips) {
          setRenderedClips(json.data.clips);
          setTotalSceneDuration(json.data.totalDurationSeconds || 0);
        }
      }
    } catch (err) {
      console.error("[VoiceCasting] Render scene failed", err);
    } finally {
      setIsRenderingScene(false);
    }
  };

  // Play Single Rendered Clip
  const handlePlayClip = (clip: RenderedClip, index: number) => {
    if (playingClipIndex === index) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingClipIndex(null);
      return;
    }

    setPlayingClipIndex(index);
    playAudioBase64(clip.audioBase64, () => {
      setPlayingClipIndex(null);
    });
  };

  // Play All Scene Clips Sequentially
  const handlePlayFullScene = () => {
    if (renderedClips.length === 0) return;

    let currentIdx = 0;
    const playNext = () => {
      if (currentIdx >= renderedClips.length) {
        setPlayingClipIndex(null);
        return;
      }
      setPlayingClipIndex(currentIdx);
      playAudioBase64(renderedClips[currentIdx].audioBase64, () => {
        currentIdx++;
        setTimeout(playNext, 350); // 350ms pause between dialogue lines
      });
    };

    playNext();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Multi-Cast Voice Casting & Dialect Director</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono font-normal flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  24kHz Neural Voice AI (:8001)
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Multi-character vocal casting mapping character dialogue nodes directly to local 24kHz neural speech models.
              </DialogDescription>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("roster")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "roster"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cast Roster ({characters.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("scene")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "scene"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Tabletop Scene Director</span>
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Cast Roster */}
        {activeTab === "roster" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((char) => {
                const assignedPersona = personas.find((p) => p.id === char.personaId);
                const isAuditioning = auditioningId === char.characterId;
                const isSaved = savedNotification === char.characterId;

                return (
                  <div
                    key={char.characterId}
                    className="p-4 rounded-xl border border-border/80 bg-card hover:border-cyan-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Character Name & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                            {char.characterName.slice(0, 1)}
                          </div>
                          <h4 className="text-sm font-bold text-foreground">
                            {char.characterName}
                          </h4>
                        </div>
                        {isSaved && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                            <Check className="w-3 h-3" /> Saved
                          </span>
                        )}
                      </div>

                      {/* Persona & Dialect Selection */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Voice Persona
                          </label>
                          <select
                            value={char.personaId}
                            onChange={(e) =>
                              updateCharacterSetting(char.characterId, { personaId: e.target.value })
                            }
                            className="w-full text-xs bg-background border border-border rounded-md px-2 py-1 focus:ring-1 focus:ring-cyan-500"
                          >
                            {personas.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Dialect / Regional Register
                          </label>
                          <select
                            value={char.dialect}
                            onChange={(e) =>
                              updateCharacterSetting(char.characterId, { dialect: e.target.value })
                            }
                            className="w-full text-xs bg-background border border-border rounded-md px-2 py-1 focus:ring-1 focus:ring-cyan-500"
                          >
                            <option value="Standard Dhaka Bangla">Standard Dhaka Bangla</option>
                            <option value="Formal Pramit Bangla">Formal Pramit Bangla</option>
                            <option value="Colloquial Dhakaiya">Colloquial Dhakaiya</option>
                            <option value="Chittagonian">Chittagonian (চাটগাঁইয়া)</option>
                            <option value="Sylheti">Sylheti (সিলেটি)</option>
                            <option value="Bilingual Bangla-English">Bilingual Bangla-English</option>
                          </select>
                        </div>
                      </div>

                      {/* Emotion & Pacing Sliders */}
                      <div className="grid grid-cols-3 gap-2 mt-2.5">
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Default Emotion
                          </label>
                          <select
                            value={char.defaultEmotion}
                            onChange={(e) =>
                              updateCharacterSetting(char.characterId, { defaultEmotion: e.target.value })
                            }
                            className="w-full text-xs bg-background border border-border rounded-md px-2 py-1 focus:ring-1 focus:ring-cyan-500"
                          >
                            <option value="empathetic">Empathetic (সহমর্মী)</option>
                            <option value="warm">Warm (উষ্ণ/আন্তরিক)</option>
                            <option value="reassuring">Reassuring (আশ্বস্তকর)</option>
                            <option value="dramatic">Dramatic (নাটকীয়)</option>
                            <option value="professional">Professional (গম্ভীর)</option>
                            <option value="urgent">Urgent (উত্তেজিত)</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground mb-1">
                            <span>Pitch</span>
                            <span className="font-mono text-cyan-400">
                              {char.pitchOffsetSemitones > 0 ? `+${char.pitchOffsetSemitones}` : char.pitchOffsetSemitones} st
                            </span>
                          </div>
                          <input
                            type="range"
                            min={-6}
                            max={6}
                            step={1}
                            value={char.pitchOffsetSemitones}
                            onChange={(e) =>
                              updateCharacterSetting(char.characterId, {
                                pitchOffsetSemitones: Number(e.target.value),
                              })
                            }
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground mb-1">
                            <span>Rate</span>
                            <span className="font-mono text-cyan-400">{char.speakingRate}x</span>
                          </div>
                          <input
                            type="range"
                            min={0.8}
                            max={1.4}
                            step={0.05}
                            value={char.speakingRate}
                            onChange={(e) =>
                              updateCharacterSetting(char.characterId, {
                                speakingRate: Number(e.target.value),
                              })
                            }
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Sample Audition Line */}
                      <div className="mt-2.5">
                        <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                          Audition Line
                        </label>
                        <input
                          type="text"
                          value={char.sampleLine}
                          onChange={(e) =>
                            setCharacters((prev) =>
                              prev.map((c) =>
                                c.characterId === char.characterId
                                  ? { ...c, sampleLine: e.target.value }
                                  : c
                              )
                            )
                          }
                          onBlur={(e) =>
                            updateCharacterSetting(char.characterId, { sampleLine: e.target.value })
                          }
                          className="w-full text-xs bg-muted/30 border border-border/80 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Audition Button */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {assignedPersona?.timbreDescription || "24kHz Resonant"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAudition(char)}
                        disabled={isAuditioning}
                        className={`h-7 px-3 text-xs font-semibold gap-1.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer ${
                          isAuditioning ? "animate-pulse" : ""
                        }`}
                      >
                        {isAuditioning ? (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            <span>Speaking...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Audition Voice</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Scene Director */}
        {activeTab === "scene" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-cyan-400" />
                    <span>Tabletop Multi-Cast Scene Script</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Write or paste dialogue with speaker prefixes (e.g. "হিমু:", "বাদল:"). The engine auto-assigns voices!
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleRenderScene}
                  disabled={isRenderingScene || !sceneScript.trim()}
                  className="h-8 px-4 text-xs font-bold gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-black cursor-pointer"
                >
                  {isRenderingScene ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Scene...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Direct Multi-Cast Scene</span>
                    </>
                  )}
                </Button>
              </div>

              <textarea
                rows={5}
                value={sceneScript}
                onChange={(e) => setSceneScript(e.target.value)}
                className="w-full text-xs font-mono bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed custom-scrollbar"
                placeholder="কথক: বর্ণনা লিখুন...&#10;হিমু: সংলাপ...&#10;বাদল: সংলাপ..."
              />
            </div>

            {/* Rendered Dialogue Timeline */}
            {renderedClips.length > 0 && (
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400">
                      Rendered Scene Track ({renderedClips.length} dialogue clips)
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      Total: {totalSceneDuration}s
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePlayFullScene}
                    className="h-7 px-3 text-xs font-semibold gap-1.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Full Tabletop Scene</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {renderedClips.map((clip, idx) => {
                    const isPlaying = playingClipIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs transition flex items-center justify-between ${
                          isPlaying
                            ? "bg-cyan-500/15 border-cyan-500/60 shadow-xs"
                            : "bg-background/80 border-border/60 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePlayClip(clip, idx)}
                            className="w-7 h-7 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 cursor-pointer transition"
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{clip.speaker}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ({clip.startTimeSeconds}s - {(clip.startTimeSeconds + clip.durationSeconds).toFixed(1)}s)
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                                {clip.personaId}
                              </span>
                            </div>
                            <p className="text-foreground/90 mt-0.5 text-xs">{clip.text}</p>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                          {clip.durationSeconds}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block animate-pulse" />
            <span>Bangla 24kHz Audio AI Engine Ready (:8001)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">{characters.length} Voice Nodes Assigned</span>
            <Button size="sm" variant="outline" onClick={onClose} className="h-7 text-xs px-3">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCastingModal;
