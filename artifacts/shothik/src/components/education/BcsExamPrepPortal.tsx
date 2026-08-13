import React, { useState } from "react";
import { BcsExamPrepService, type McqQuestion, type VivaQuestion, type ExamScorecardResult } from "@/lib/education/bcs-exam-prep-service";
import { VTuberVoiceAvatarOverlay } from "@/components/voice/VTuberVoiceAvatarOverlay";

export interface BcsExamPrepPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BcsExamPrepPortal: React.FC<BcsExamPrepPortalProps> = ({ isOpen, onClose }) => {
  const [candidateName, setCandidateName] = useState("Tanvir Ahmed");
  const [subject, setSubject] = useState("BCS Bangladesh Affairs");
  const [mode, setMode] = useState<"mcq" | "viva" | "scorecard">("mcq");

  // MCQ State
  const [mcqs, setMcqs] = useState<McqQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isLoadingMcqs, setIsLoadingMcqs] = useState(false);

  // Viva State
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>([]);
  const [vivaActive, setVivaActive] = useState(false);

  // Scorecard State
  const [scorecard, setScorecard] = useState<ExamScorecardResult | null>(null);

  if (!isOpen) return null;

  const handleGenerateMcqs = async () => {
    setIsLoadingMcqs(true);
    const questions = await BcsExamPrepService.generateMcqFromTextbook(subject, 3);
    setMcqs(questions);
    setIsLoadingMcqs(false);
  };

  const handleStartViva = async () => {
    const viva = await BcsExamPrepService.start3dVtuberVivaSession(candidateName);
    setVivaQuestions(viva);
    setVivaActive(true);
    setMode("viva");
  };

  const handleGradeExam = async () => {
    const answersArray = Object.values(selectedAnswers);
    const card = await BcsExamPrepService.gradeExamSubmission(candidateName, subject, answersArray, vivaQuestions.length);
    setScorecard(card);
    setMode("scorecard");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎓</span> BCS & University AI Exam Prep Portal
            </h2>
            <p className="text-xs text-slate-400">3D VTuber Viva Mock Interviews & Textbook MCQ Simulator</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Candidate & Subject Selector */}
        <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-slate-400 mb-1">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Target Exam Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="BCS Bangladesh Affairs">BCS Bangladesh Affairs (বাংলাদেশ বিষয়াবলী)</option>
              <option value="BCS General Knowledge">BCS International Affairs (আন্তর্জাতিক বিষয়াবলী)</option>
              <option value="English Literature">English Literature & Grammar</option>
              <option value="Analytical Math">Analytical Math & Mental Ability</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleGenerateMcqs}
              disabled={isLoadingMcqs}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl text-xs transition-colors"
            >
              {isLoadingMcqs ? "Generating..." : "Generate MCQs"}
            </button>
            <button
              onClick={handleStartViva}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-xl text-xs transition-colors"
            >
              Start 3D Viva 🎭
            </button>
          </div>
        </div>

        {/* Mode: MCQ Exam Simulator */}
        {mode === "mcq" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-emerald-400">MCQ Simulator ({mcqs.length} Questions Loaded)</h3>
              {mcqs.length > 0 && (
                <button onClick={handleGradeExam} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-1.5 rounded-xl">
                  Submit Exam & Grade ➔
                </button>
              )}
            </div>

            {mcqs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                Click <strong>"Generate MCQs"</strong> above to extract practice questions from textbook PDFs.
              </div>
            ) : (
              <div className="space-y-4">
                {mcqs.map((q, qIdx) => (
                  <div key={q.id} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <p className="font-semibold text-white">{qIdx + 1}. {q.questionBn}</p>
                    <p className="text-[11px] text-slate-400 italic">{q.questionEn}</p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {q.optionsBn.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                          className={`text-left p-2.5 rounded-xl border transition-colors ${selectedAnswers[qIdx] === optIdx ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-semibold" : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode: 3D VTuber Viva Mock Interview */}
        {mode === "viva" && (
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-400">3D VTuber Viva Mock Interview Simulator</h3>
              <button onClick={() => setMode("mcq")} className="text-xs text-slate-400 hover:text-white">← Return to MCQs</button>
            </div>

            {vivaQuestions.map((vq, idx) => (
              <div key={vq.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded-md text-[10px]">Viva Question #{idx + 1}</span>
                <p className="font-semibold text-white text-sm">{vq.questionBn}</p>
                <p className="text-slate-400 text-xs italic">{vq.questionEn}</p>
                <p className="text-[11px] text-emerald-400">💡 Candidate Viva Tip: {vq.vivaTip}</p>
              </div>
            ))}

            <button
              onClick={handleGradeExam}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              Complete Viva Interview & View Scorecard
            </button>
          </div>
        )}

        {/* Mode: Dual-Language Scorecard */}
        {mode === "scorecard" && scorecard && (
          <div className="space-y-4 bg-emerald-950/80 border border-emerald-500/50 p-6 rounded-2xl text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-emerald-400">🏆 Dual-Language Official Scorecard</h3>
              <span className="bg-emerald-500 text-slate-950 font-mono font-bold text-sm px-3 py-1 rounded-full">{scorecard.letterGrade}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-slate-200 border-y border-emerald-800/60 py-3">
              <p>Candidate: <strong className="text-white">{scorecard.candidateName}</strong></p>
              <p>Subject: <strong className="text-white">{scorecard.subject}</strong></p>
              <p>Score Percentage: <strong className="text-emerald-300 text-sm font-mono">{scorecard.percentage}%</strong></p>
              <p>MCQ Points: <strong className="text-white">{scorecard.mcqScore}/{scorecard.totalMcq}</strong></p>
            </div>
            <div className="space-y-1.5 text-slate-200">
              <p className="text-white font-medium">🇧🇩 বাংলা মূল্যায়ন:</p>
              <p className="text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">{scorecard.summaryBn}</p>
              <p className="text-white font-medium pt-2">🇬🇧 English Summary:</p>
              <p className="text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">{scorecard.summaryEn}</p>
            </div>
          </div>
        )}

        {/* 3D VTuber Avatar Overlay Component */}
        <VTuberVoiceAvatarOverlay
          avatarName="BCS AI Viva Examiner"
          isActive={vivaActive}
          onClose={() => setVivaActive(false)}
        />
      </div>
    </div>
  );
};
