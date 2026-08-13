import React, { useState } from "react";
import { StudentAssignmentSlideService, type StudentSlideDeck } from "@/lib/education/student-assignment-slide-service";
import { VTuberVoiceAvatarOverlay } from "@/components/voice/VTuberVoiceAvatarOverlay";

export interface StudentAssignmentSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentAssignmentSlideModal: React.FC<StudentAssignmentSlideModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState("AI in Modern South Asian Agriculture");
  const [researchNotes, setResearchNotes] = useState("Notes on satellite crop monitoring, bKash micro-loans, and IoT soil sensors.");
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const [deck, setDeck] = useState<StudentSlideDeck | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNarrationActive, setIsNarrationActive] = useState(false);

  if (!isOpen) return null;

  const handleGenerateDeck = () => {
    setIsGenerating(true);
    const generated = StudentAssignmentSlideService.generateStudentAssignmentDeck(topic, researchNotes);
    setDeck(generated);
    setActiveSlideIdx(0);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📊</span> Student Assignment Slide & VTuber Presenter
            </h2>
            <p className="text-xs text-slate-400">Generates Structured Presentation Decks, 3D VTuber Audio Script & Papermark Sharing Link</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Input Form */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Assignment Topic / Title</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Raw Research Notes / Text Abstract</label>
            <textarea
              rows={3}
              value={researchNotes}
              onChange={(e) => setResearchNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
            />
          </div>
          <button
            onClick={handleGenerateDeck}
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {isGenerating ? "Generating Multi-Slide Presentation..." : "🚀 Generate Multi-Slide Deck & 3D VTuber Narration"}
          </button>
        </div>

        {/* Generated Deck Preview & Controls */}
        {deck && (
          <div className="space-y-4">
            {/* Slide Navigation Buttons */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {deck.slides.map((s, idx) => (
                  <button
                    key={s.slideNumber}
                    onClick={() => setActiveSlideIdx(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeSlideIdx === idx ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                  >
                    Slide {s.slideNumber}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsNarrationActive(!isNarrationActive)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${isNarrationActive ? "bg-purple-600 text-white" : "bg-slate-800 text-purple-300 hover:bg-slate-700"}`}
              >
                <span>🎭</span> 3D VTuber Voice {isNarrationActive ? "Playing..." : "Narrate"}
              </button>
            </div>

            {/* Active Slide Canvas */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 min-h-[220px]">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono font-bold">Slide {deck.slides[activeSlideIdx].slideNumber} of {deck.slideCount}</span>
                <h3 className="text-lg font-bold text-white mt-1">{deck.slides[activeSlideIdx].title}</h3>
                {deck.slides[activeSlideIdx].subtitle && <p className="text-xs text-slate-400 italic">{deck.slides[activeSlideIdx].subtitle}</p>}
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                {deck.slides[activeSlideIdx].bulletPoints.map((bp, bpIdx) => (
                  <li key={bpIdx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>

              {/* VTuber Narration Script Box */}
              <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-500/30 text-xs text-purple-200 space-y-1">
                <p className="font-bold text-purple-300 text-[11px] flex items-center gap-1">
                  <span>🎙️</span> 3D VTuber Presenter Narration Script:
                </p>
                <p className="italic">"{deck.slides[activeSlideIdx].vtuberNarrationScript}"</p>
              </div>
            </div>

            {/* Papermark Export Link Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-emerald-400">Papermark Presentation Analytics Link</p>
                <p className="text-slate-400 font-mono text-[11px]">{deck.papermarkShareUrl}</p>
              </div>
              <a
                href={deck.papermarkShareUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-xs"
              >
                Open Papermark Link ↗
              </a>
            </div>
          </div>
        )}

        {/* 3D VTuber Avatar Overlay Component */}
        <VTuberVoiceAvatarOverlay
          avatarName="Academic Assignment Presenter"
          isActive={isNarrationActive}
          onClose={() => setIsNarrationActive(false)}
        />
      </div>
    </div>
  );
};
