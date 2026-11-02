import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Languages,
  Volume2,
  Play,
  Pause,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Sparkles,
  AlertTriangle,
  FileSearch,
  AudioWaveform,
  BookOpen,
  Info
} from "lucide-react";

export type PhonemeCategory =
  | "character_name"
  | "mythology_fantasy"
  | "geographic_landmark"
  | "cultural_archaic";

export interface PhoneticRuleEntry {
  id: string;
  projectId: string;
  grapheme: string;
  ipa: string;
  syllabification: string[];
  stressIndex: number;
  diacritics: {
    hasHasanta: boolean;
    hasChandrabindu: boolean;
    hasBishorgo: boolean;
    hasAnusvara: boolean;
    vowelMarkers: string[];
  };
  ssmlPhoneme: string;
  category: PhonemeCategory;
  notes: string;
  updatedAt: string;
}

export interface PhoneticRiskCandidate {
  word: string;
  suggestedIpa: string;
  syllabification: string[];
  hasCompound: boolean;
  hasChandrabindu: boolean;
  hasBishorgo: boolean;
  riskLevel: "high" | "medium";
}

interface PhonemeTunerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  currentManuscriptText?: string;
}

export const PhonemeTunerModal: React.FC<PhonemeTunerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  currentManuscriptText = "",
}) => {
  const [activeTab, setActiveTab] = useState<"dictionary" | "scanner">("dictionary");
  const [entries, setEntries] = useState<PhoneticRuleEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PhonemeCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [auditioningWord, setAuditioningWord] = useState<string | null>(null);
  const [copiedSsmlId, setCopiedSsmlId] = useState<string | null>(null);

  // New Word Transcriber Form
  const [transcribeInput, setTranscribeInput] = useState("");
  const [derivedIpa, setDerivedIpa] = useState("");
  const [derivedSyllables, setDerivedSyllables] = useState<string[]>([]);
  const [derivedCategory, setDerivedCategory] = useState<PhonemeCategory>("character_name");
  const [derivedNotes, setDerivedNotes] = useState("");

  // Manuscript Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [riskCandidates, setRiskCandidates] = useState<PhoneticRiskCandidate[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Dictionary
  const loadDictionary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/phonemes`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.entries) setEntries(json.data.entries);
      }
    } catch (err) {
      console.warn("[PhonemeTuner] Failed to load dictionary", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDictionary();
    } else {
      if (audioRef.current) audioRef.current.pause();
      setAuditioningWord(null);
    }
  }, [isOpen, projectId]);

  // Real-time Bengali -> IPA & Syllables transcription
  const handleTranscribeInput = async (word: string) => {
    setTranscribeInput(word);
    if (!word.trim()) {
      setDerivedIpa("");
      setDerivedSyllables([]);
      return;
    }

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/phonemes/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setDerivedIpa(json.data.ipa || "");
          setDerivedSyllables(json.data.syllabification || []);
        }
      }
    } catch (err) {
      console.warn("[PhonemeTuner] Transcribe failed", err);
    }
  };

  // Add symbol from IPA Palette to current IPA input
  const insertIpaSymbol = (symbol: string) => {
    setDerivedIpa((prev) => `${prev}${symbol}`);
  };

  // Save new Phonetic Entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcribeInput.trim() || !derivedIpa.trim()) return;

    const payload = {
      grapheme: transcribeInput.trim(),
      ipa: derivedIpa.trim(),
      syllabification: derivedSyllables,
      stressIndex: 0,
      category: derivedCategory,
      notes: derivedNotes.trim(),
    };

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/phonemes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setEntries((prev) => [json.data, ...prev.filter((item) => item.id !== json.data.id)]);
        }
      }

      setTranscribeInput("");
      setDerivedIpa("");
      setDerivedSyllables([]);
      setDerivedNotes("");
    } catch (err) {
      console.error("[PhonemeTuner] Save failed", err);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/v1/projects/${projectId}/phonemes/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[PhonemeTuner] Delete failed", err);
    }
  };

  // Play Audio Audition
  const handleAudition = async (word: string, ipa?: string) => {
    setAuditioningWord(word);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/phonemes/preview-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, ipa }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.audioBase64) {
          if (audioRef.current) audioRef.current.pause();
          const audio = new Audio(`data:audio/wav;base64,${json.data.audioBase64}`);
          audioRef.current = audio;
          audio.onended = () => setAuditioningWord(null);
          audio.play().catch(() => setAuditioningWord(null));
        } else {
          setAuditioningWord(null);
        }
      } else {
        setAuditioningWord(null);
      }
    } catch (err) {
      setAuditioningWord(null);
    }
  };

  // Scan Manuscript for Pronunciation Risks
  const handleScanManuscript = async () => {
    const textToScan = currentManuscriptText || "রাতের অন্ধকারে সোমেশ্বরী নদীর তীরে নৈঋত কোণে বাঁশঝাড় কাঁপছিল। অন্তরীক্ষে তখন বিদ্যুৎ চমকাচ্ছিল।";
    setIsScanning(true);
    setRiskCandidates([]);

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/phonemes/scan-manuscript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manuscriptText: textToScan }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.candidates) {
          setRiskCandidates(json.data.candidates);
        }
      }
    } catch (err) {
      console.error("[PhonemeTuner] Scan failed", err);
    } finally {
      setIsScanning(false);
    }
  };

  // Copy SSML Tag
  const handleCopySsml = (ssml: string, id: string) => {
    navigator.clipboard.writeText(ssml);
    setCopiedSsmlId(id);
    setTimeout(() => setCopiedSsmlId(null), 1500);
  };

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
      const cleanQ = searchQuery.toLowerCase();
      const matchesQuery =
        !cleanQ ||
        e.grapheme.toLowerCase().includes(cleanQ) ||
        e.ipa.toLowerCase().includes(cleanQ) ||
        e.notes.toLowerCase().includes(cleanQ);
      return matchesCategory && matchesQuery;
    });
  }, [entries, selectedCategory, searchQuery]);

  // Common Bengali IPA palette
  const IPA_PALETTE = ["ɔ", "o", "a", "iː", "uː", "e", "oi̯", "ou̯", "t̪ʰ", "d̪ʱ", "ʈʰ", "ɖʱ", "pʰ", "bʱ", "ŋ", "~̃", "ʃ", "ɽ"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xs">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Phoneme & Diacritic Pronunciation Tuner</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30 font-mono font-normal">
                  IPA + SSML Engine
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Ensure 100% pronunciation accuracy for fantasy names, Bengali diacritics, and regional terms.
              </DialogDescription>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("dictionary")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "dictionary"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Phoneme Dictionary ({entries.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("scanner");
                if (riskCandidates.length === 0) handleScanManuscript();
              }}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "scanner"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Manuscript Audit</span>
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Dictionary */}
        {activeTab === "dictionary" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {/* Quick Word Transcriber Form */}
            <form
              onSubmit={handleSaveEntry}
              className="p-4 rounded-xl border border-pink-500/30 bg-pink-500/5 space-y-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Transcribe & Syllabify Bengali Proper Noun
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Syllable & SSML Compiler
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                    Bengali Word (বাংলা শব্দ)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. সোমেশ্বরী, মহিষাসুর"
                    value={transcribeInput}
                    onChange={(e) => handleTranscribeInput(e.target.value)}
                    className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                    IPA Transcription (ফনেটিক রূপ)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ʃomeʃːoriː"
                    value={derivedIpa}
                    onChange={(e) => setDerivedIpa(e.target.value)}
                    className="w-full text-xs font-mono bg-background border border-border rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={derivedCategory}
                    onChange={(e) => setDerivedCategory(e.target.value as PhonemeCategory)}
                    className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="character_name">চরিত্রের নাম (Character Name)</option>
                    <option value="mythology_fantasy">কাল্পনিক/পৌরাণিক (Mythology & Fantasy)</option>
                    <option value="geographic_landmark">ভৌগোলিক স্থান (Geographic Landmark)</option>
                    <option value="cultural_archaic">ঐতিহ্যবাহী/প্রাচীন (Cultural & Archaic)</option>
                  </select>
                </div>
              </div>

              {/* IPA Quick Palette */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-semibold text-muted-foreground mr-1">
                  Insert IPA Symbol:
                </span>
                {IPA_PALETTE.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => insertIpaSymbol(sym)}
                    className="px-1.5 py-0.5 rounded bg-muted hover:bg-pink-500/20 hover:text-pink-400 text-[11px] font-mono border border-border/60 transition cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Syllables Preview & Save */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs">
                  {derivedSyllables.length > 0 && (
                    <>
                      <span className="text-[11px] text-muted-foreground">Syllables:</span>
                      {derivedSyllables.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 font-mono text-[11px] border border-pink-500/30"
                        >
                          {s}
                        </span>
                      ))}
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={!transcribeInput.trim() || !derivedIpa.trim()}
                  className="h-7 px-3 text-xs font-semibold gap-1.5 bg-pink-500 hover:bg-pink-600 text-black cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save to Dictionary</span>
                </Button>
              </div>
            </form>

            {/* Search & Category Filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter dictionary by Bangla name, IPA or notes..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  All ({entries.length})
                </button>
                <button
                  onClick={() => setSelectedCategory("character_name")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                    selectedCategory === "character_name"
                      ? "bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Characters
                </button>
                <button
                  onClick={() => setSelectedCategory("geographic_landmark")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                    selectedCategory === "geographic_landmark"
                      ? "bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Landmarks
                </button>
              </div>
            </div>

            {/* Entries Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEntries.map((entry) => {
                const isAuditioning = auditioningWord === entry.grapheme;
                const isCopied = copiedSsmlId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-pink-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      {/* Top Bar: Word, IPA, Category */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-foreground">
                            {entry.grapheme}
                          </h4>
                          <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                            /{entry.ipa}/
                          </span>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {entry.category.replace("_", " ")}
                        </span>
                      </div>

                      {/* Syllables Breakdown */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-muted-foreground font-semibold">Syllables:</span>
                        {entry.syllabification.map((syl, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-secondary/80 text-secondary-foreground px-1.5 py-0.5 rounded font-mono"
                          >
                            {syl}
                          </span>
                        ))}
                      </div>

                      {/* Diacritic Tags */}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {entry.diacritics.hasHasanta && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 font-mono border border-blue-500/30">
                            ্ হসন্ত (Hasanta)
                          </span>
                        )}
                        {entry.diacritics.hasChandrabindu && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
                            ঁ চন্দ্রবিন্দু (Nasal)
                          </span>
                        )}
                        {entry.diacritics.hasBishorgo && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 font-mono border border-purple-500/30">
                            ঃ বিসর্গ (Aspirate)
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {entry.notes && (
                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopySsml(entry.ssmlPhoneme, entry.id)}
                          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Copy SSML Tag"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400 mr-1" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              <span>SSML</span>
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="h-6 px-1.5 text-destructive/70 hover:text-destructive cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAudition(entry.grapheme, entry.ipa)}
                        disabled={isAuditioning}
                        className="h-6 px-2.5 text-xs font-semibold gap-1 border-pink-500/40 text-pink-400 hover:bg-pink-500/10 cursor-pointer"
                      >
                        {isAuditioning ? (
                          <>
                            <Volume2 className="w-3 h-3 animate-spin" />
                            <span>Tuning...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Audition</span>
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

        {/* Tab 2: Manuscript Audit */}
        {activeTab === "scanner" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-pink-400" />
                    <span>Manuscript Phonetic Ambiguity Scanner</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Scans your current chapter to detect complex conjuncts (যুক্তাক্ষর), nasal diacritics, and rare mythological terms.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleScanManuscript}
                  disabled={isScanning}
                  className="h-8 px-4 text-xs font-bold gap-1.5 bg-pink-500 hover:bg-pink-600 text-black cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isScanning ? "Scanning..." : "Re-Scan Manuscript"}</span>
                </Button>
              </div>
            </div>

            {/* Risk Candidates Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground">
                Detected Ambiguous Proper Nouns ({riskCandidates.length})
              </span>

              {riskCandidates.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">No untuned phonetic risks detected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All compound and diacritic terms in the current text are covered by your dictionary.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {riskCandidates.map((candidate, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-pink-500/40 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{candidate.word}</span>
                          <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded">
                            /{candidate.suggestedIpa}/
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                          <span>Syllables:</span>
                          <span className="font-mono text-foreground/80">{candidate.syllabification.join(" - ")}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTranscribeInput(candidate.word);
                          setDerivedIpa(candidate.suggestedIpa);
                          setDerivedSyllables(candidate.syllabification);
                          setActiveTab("dictionary");
                        }}
                        className="h-7 px-3 text-xs font-semibold border-pink-500/40 text-pink-400 hover:bg-pink-500/10 cursor-pointer"
                      >
                        Tune Word
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 inline-block animate-pulse" />
            <span>Bangla Phonemic Normalizer & SSML Compiler Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">{entries.length} tuned pronunciations</span>
            <Button size="sm" variant="outline" onClick={onClose} className="h-7 text-xs px-3">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhonemeTunerModal;
