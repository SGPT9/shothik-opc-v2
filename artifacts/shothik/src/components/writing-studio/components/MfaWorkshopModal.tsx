import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Award,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  ShieldCheck,
  ChevronRight,
  Flame,
  FileText
} from "lucide-react";

interface RubricDimension {
  id: string;
  name: string;
  nameBn: string;
  weight: number;
  score: number;
  assessment: string;
  assessmentBn: string;
}

interface BlindPeerReview {
  id: string;
  reviewerAlias: string;
  cohort: string;
  peerScore: number;
  strongestBeat: string;
  frictionPoint: string;
  workshopPrescription: string;
  inspirationalAuthor: string;
}

interface WorkshopLineCritique {
  id: string;
  quote: string;
  type: "cliche" | "syntax_drag" | "subtext_gold" | "pacing_stumble";
  authorRole: "ta" | "peer" | "professor";
  authorName: string;
  critique: string;
  suggestedRevision: string;
}

interface MfaWorkshopData {
  projectId: string;
  activeRole: "student" | "ta" | "professor";
  userClaim: {
    sub: string;
    role: string;
    claims: {
      mfa_role: "student" | "ta" | "professor";
      institution: string;
      cohort_year: number;
      can_grade: boolean;
      can_endorse: boolean;
    };
  };
  compositeScore: number;
  letterGrade: string;
  gpa: number;
  professorVerdict: {
    headline: string;
    summary: string;
    strengths: string[];
    criticalRevisions: string[];
    recommendedReading: string[];
    rubricBreakdown: RubricDimension[];
  };
  blindReviews: BlindPeerReview[];
  lineCritiques: WorkshopLineCritique[];
  workshopActionPlan: {
    priority: "HIGH" | "MEDIUM" | "POLISH";
    step: string;
    craftRule: string;
  }[];
}

interface MfaWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptText: string;
  projectId?: string;
  onApplyRevision: (revisedText: string) => void;
}

export const MfaWorkshopModal: React.FC<MfaWorkshopModalProps> = ({
  isOpen,
  onClose,
  manuscriptText,
  projectId = "proj_demo_bengali",
  onApplyRevision
}) => {
  const [data, setData] = useState<MfaWorkshopData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"rubric" | "peers" | "marginalia" | "syllabus">("rubric");
  const [selectedRole, setSelectedRole] = useState<"student" | "ta" | "professor">("student");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const fetchWorkshopEvaluation = async (role: "student" | "ta" | "professor") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/mfa-workshop/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: manuscriptText || "",
          role
        })
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to evaluate MFA workshop:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkshopEvaluation(selectedRole);
    }
  }, [isOpen]);

  const handleRoleSwitch = async (newRole: "student" | "ta" | "professor") => {
    setSelectedRole(newRole);
    await fetchWorkshopEvaluation(newRole);
  };

  const handleApplySingleRevision = (revision: string) => {
    onApplyRevision(revision);
    setAppliedNotice("Line revision applied to manuscript!");
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-zinc-100">
                  MFA Creative Writing Classroom & Workshop Crucible
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Capability #27
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                বিশ্ববিদ্যালয় লেখক কর্মশালা: Custom Supabase Claims, Blind Peer Reviews & Rigorous Craft Rubrics
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchWorkshopEvaluation(selectedRole)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center space-x-1.5 border border-zinc-700 transition"
              title="Re-run workshop evaluation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
              <span>Re-Evaluate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Selector & Claims Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-zinc-900/80 border-b border-zinc-800/60">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-zinc-400">Simulate MFA Role:</span>
            <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
              <button
                onClick={() => handleRoleSwitch("student")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                  selectedRole === "student"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>🎓 MFA Fellow (Student)</span>
              </button>
              <button
                onClick={() => handleRoleSwitch("ta")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                  selectedRole === "ta"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>📝 Lead TA</span>
              </button>
              <button
                onClick={() => handleRoleSwitch("professor")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                  selectedRole === "professor"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>🏛️ Professor (Chair of Fiction)</span>
              </button>
            </div>
          </div>

          {data && (
            <div className="flex items-center space-x-2 text-xs text-zinc-400 bg-zinc-950/60 px-3 py-1 rounded-md border border-zinc-800/80">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Claims:</span>
              <code className="text-amber-300 font-mono text-[11px]">
                mfa_role: &quot;{data.userClaim.claims.mfa_role}&quot;
              </code>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300">
                can_grade: {data.userClaim.claims.can_grade ? "✅" : "❌"}
              </span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {appliedNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {data ? (
            <>
              {/* Scorecard Hero Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-950/30 to-zinc-900 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-amber-400/80 font-semibold">
                      MFA Letter Grade
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-extrabold text-amber-300">{data.letterGrade}</span>
                      <span className="text-sm text-zinc-400">({data.gpa.toFixed(1)} GPA)</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-2">
                    <span>Composite Score</span>
                    <span className="font-bold text-zinc-200">{data.compositeScore}/100</span>
                  </div>
                </div>

                <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-semibold text-zinc-200">
                        {data.professorVerdict.headline}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      {data.professorVerdict.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-zinc-800/60">
                    <span className="text-[11px] text-zinc-400">Recommended Syllabus:</span>
                    {data.professorVerdict.recommendedReading.slice(0, 2).map((book, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-amber-300/90 border border-zinc-700/60"
                      >
                        {book}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-zinc-800 space-x-4">
                <button
                  onClick={() => setActiveTab("rubric")}
                  className={`pb-2.5 text-xs font-medium transition flex items-center space-x-1.5 ${
                    activeTab === "rubric"
                      ? "border-b-2 border-amber-400 text-amber-400"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>5-Point Craft Rubric</span>
                </button>
                <button
                  onClick={() => setActiveTab("peers")}
                  className={`pb-2.5 text-xs font-medium transition flex items-center space-x-1.5 ${
                    activeTab === "peers"
                      ? "border-b-2 border-amber-400 text-amber-400"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Blind Peer Reviews ({data.blindReviews.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("marginalia")}
                  className={`pb-2.5 text-xs font-medium transition flex items-center space-x-1.5 ${
                    activeTab === "marginalia"
                      ? "border-b-2 border-amber-400 text-amber-400"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Line Annotations &amp; Revisions</span>
                </button>
                <button
                  onClick={() => setActiveTab("syllabus")}
                  className={`pb-2.5 text-xs font-medium transition flex items-center space-x-1.5 ${
                    activeTab === "syllabus"
                      ? "border-b-2 border-amber-400 text-amber-400"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Action Plan &amp; Craft Rules</span>
                </button>
              </div>

              {/* Tab 1: Rubric Matrix */}
              {activeTab === "rubric" && (
                <div className="space-y-4">
                  {data.professorVerdict.rubricBreakdown.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2 hover:border-zinc-700/80 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-zinc-100">{item.name}</span>
                          <span className="text-xs text-zinc-400 font-bengali">({item.nameBn})</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            Weight: {item.weight}%
                          </span>
                        </div>
                        <span className="text-sm font-bold text-amber-400">{item.score}/100</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-300 pt-1">
                        <p>{item.assessment}</p>
                        <p className="text-zinc-400 font-bengali italic">{item.assessmentBn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Blind Peer Reviews */}
              {activeTab === "peers" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.blindReviews.map((peer) => (
                    <div
                      key={peer.id}
                      className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">{peer.reviewerAlias}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold">
                            {peer.peerScore}/100
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500">{peer.cohort}</p>

                        <div className="pt-2 space-y-2 text-xs">
                          <div>
                            <span className="text-emerald-400 font-medium block">
                              ✦ Strongest Beat:
                            </span>
                            <p className="text-zinc-300 text-[11px] mt-0.5">{peer.strongestBeat}</p>
                          </div>
                          <div>
                            <span className="text-rose-400 font-medium block">
                              ⚠ Friction Point:
                            </span>
                            <p className="text-zinc-300 text-[11px] mt-0.5">{peer.frictionPoint}</p>
                          </div>
                          <div>
                            <span className="text-sky-400 font-medium block">
                              ✍ Workshop Prescription:
                            </span>
                            <p className="text-zinc-300 text-[11px] mt-0.5">
                              {peer.workshopPrescription}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                        <span>Literary Kinship:</span>
                        <span className="text-zinc-300 font-medium">{peer.inspirationalAuthor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Marginalia & Line Critiques */}
              {activeTab === "marginalia" && (
                <div className="space-y-3">
                  {data.lineCritiques.map((lc) => (
                    <div
                      key={lc.id}
                      className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              lc.type === "cliche"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : lc.type === "syntax_drag"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {lc.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-zinc-400">{lc.authorName} ({lc.authorRole.toUpperCase()})</span>
                        </div>
                        <button
                          onClick={() => handleApplySingleRevision(lc.suggestedRevision)}
                          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs flex items-center space-x-1 transition"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Apply Line Revision</span>
                        </button>
                      </div>

                      <div className="text-xs font-mono bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 text-zinc-300">
                        &quot;{lc.quote}&quot;
                      </div>

                      <div className="text-xs text-zinc-300 flex items-start space-x-2 pt-1">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-zinc-400">{lc.critique}</p>
                          <div className="mt-1 text-emerald-300 font-medium font-bengali">
                            প্রস্তাবিত বিকল্প: {lc.suggestedRevision}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Syllabus & Action Plan */}
              {activeTab === "syllabus" && (
                <div className="space-y-4">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Immediate Workshop Revisions</span>
                    </h4>
                    <div className="space-y-2">
                      {data.workshopActionPlan.map((action, i) => (
                        <div
                          key={i}
                          className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-lg flex items-start space-x-3 text-xs"
                        >
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              action.priority === "HIGH"
                                ? "bg-rose-500/20 text-rose-300"
                                : action.priority === "MEDIUM"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {action.priority}
                          </span>
                          <div>
                            <span className="font-semibold text-zinc-200">{action.step}</span>
                            <p className="text-zinc-400 mt-0.5 font-bengali">{action.craftRule}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span>Professor&apos;s Recommended Syllabus</span>
                    </h4>
                    <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                      {data.professorVerdict.recommendedReading.map((item, idx) => (
                        <li key={idx} className="font-bengali">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-zinc-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
              <p className="text-xs">Convening the MFA Writers&apos; Workshop Crucible...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Simulated with Supabase Row-Level Security &amp; Custom Role Claims</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition"
            >
              Close
            </button>
            {data && data.lineCritiques.length > 0 && (
              <button
                onClick={() => handleApplySingleRevision(data.lineCritiques[0].suggestedRevision)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply Top Workshop Revision</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaWorkshopModal;
