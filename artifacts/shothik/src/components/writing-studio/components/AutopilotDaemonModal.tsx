import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Moon,
  Bot,
  Sparkles,
  Check,
  AlertTriangle,
  Send,
  MessageSquare,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  FileDiff,
  ShieldCheck,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DaemonConfig {
  enabled: boolean;
  scheduledTimeBST: string;
  channels: Array<"whatsapp" | "telegram" | "email">;
  modules: {
    continuityCheck: boolean;
    multiModelReview: boolean;
    bilingualSync: boolean;
  };
  webhookUrl: string;
}

export interface ConsistencyIssue {
  id: string;
  chapter: number;
  severity: "critical" | "warning" | "advisory";
  issue: string;
  suggestion: string;
}

export interface ModelCritique {
  geminiScore: number;
  geminiCritique: string;
  claudeScore: number;
  claudeCritique: string;
  consensusGrade: string;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  consistencyIssues: ConsistencyIssue[];
  critique: ModelCritique;
  bilingualSnippet: {
    bengali: string;
    english: string;
  };
}

export interface MobileApprovalCard {
  id: string;
  cardType: "continuity_fix" | "critique_recommendation" | "translation_sync";
  title: string;
  summary: string;
  previewDiff: {
    before: string;
    after: string;
  };
  status: "pending" | "approved" | "rejected";
  dispatchedAt: string;
}

export interface AutopilotState {
  projectId: string;
  status: "idle" | "running_consistency" | "running_critique" | "running_translation" | "dispatching" | "awaiting_approval";
  lastRunReport: AuditReport | null;
  pendingCards: MobileApprovalCard[];
  config: DaemonConfig;
  updatedAt: string;
}

interface AutopilotDaemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
  onApplyFixToManuscript?: (before: string, after: string) => void;
}

export const AutopilotDaemonModal: React.FC<AutopilotDaemonModalProps> = ({
  isOpen,
  onClose,
  projectId = "default",
  projectTitle = "Active Manuscript",
  onApplyFixToManuscript
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [state, setState] = useState<AutopilotState | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"cards" | "report" | "config">("cards");
  const [appliedCards, setAppliedCards] = useState<Set<string>>(new Set());

  const fetchState = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/autopilot`);
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
      }
    } catch (err) {
      console.error("Failed to load autopilot state", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchState();
    }
  }, [isOpen, fetchState]);

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/autopilot/run-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
      }
    } catch (err) {
      console.error("Autopilot manual run failed", err);
    } finally {
      setRunning(false);
    }
  };

  const handleResolveCard = async (cardId: string, resolution: "approved" | "rejected") => {
    if (!state) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/autopilot/resolve-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, resolution })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setState({
          ...state,
          pendingCards: state.pendingCards.map(c =>
            c.id === cardId ? { ...c, status: resolution } : c
          )
        });

        if (resolution === "approved" && onApplyFixToManuscript) {
          const card = state.pendingCards.find(c => c.id === cardId);
          if (card) {
            onApplyFixToManuscript(card.previewDiff.before, card.previewDiff.after);
            setAppliedCards(prev => new Set(prev).add(cardId));
          }
        }
      }
    } catch (err) {
      console.error("Failed to resolve card", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Autopilot Chapter Daemon & Mobile Push Dispatch
                </h2>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                  InkOS #9
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Overnight consistency checks, multi-model review crucible, and Telegram/WhatsApp mobile approval cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunNow}
              disabled={running}
              className="h-8 gap-1.5 text-xs font-semibold border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200"
            >
              <Sparkles className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
              <span>{running ? "Executing Nightshift..." : "Run Nightshift Now"}</span>
            </Button>

            <button
              onClick={onClose}
              className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 border-b border-zinc-800/80 bg-zinc-950/40 text-xs">
          <button
            onClick={() => setActiveTab("cards")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "cards"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Mobile Approval Cards ({state?.pendingCards.filter(c => c.status === "pending").length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "report"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Multi-Model Review & Consistency Audit</span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "config"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Schedule & Webhook Config</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
              <p className="text-sm">Connecting to Autopilot Chapter Daemon...</p>
            </div>
          ) : !state ? (
            <div className="text-center py-20 text-zinc-400">
              <p>Failed to retrieve Autopilot state.</p>
            </div>
          ) : (
            <>
              {activeTab === "cards" && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-zinc-200">
                        Daemon Online: Next scheduled execution at {state.config.scheduledTimeBST}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>Dispatch:</span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300 font-mono">
                        WhatsApp + Telegram
                      </span>
                    </div>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Pending Actionable Mobile Dispatch Cards
                    </h4>

                    {state.pendingCards.map(card => {
                      const isPending = card.status === "pending";
                      const isApproved = card.status === "approved";
                      const isApplied = appliedCards.has(card.id);

                      return (
                        <div
                          key={card.id}
                          className={`rounded-xl border p-4 transition-all ${
                            isPending
                              ? "border-zinc-800 bg-zinc-900/60"
                              : isApproved
                              ? "border-emerald-500/30 bg-emerald-950/10"
                              : "border-zinc-800/60 bg-zinc-950/40 opacity-70"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                                {card.cardType.replace("_", " ").toUpperCase()}
                              </span>
                              <h5 className="font-bold text-sm text-white">{card.title}</h5>
                            </div>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                isPending
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : isApproved
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              {card.status}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 mb-3">{card.summary}</p>

                          {/* Diff Box */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 mb-3">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-red-400">Current Manuscript:</span>
                              <p className="text-zinc-400 font-serif leading-relaxed line-through decoration-red-500/50">
                                {card.previewDiff.before}
                              </p>
                            </div>
                            <div className="space-y-1 sm:border-l sm:border-zinc-800 sm:pl-3">
                              <span className="text-[10px] uppercase font-bold text-emerald-400">Daemon Proposed Fix:</span>
                              <p className="text-emerald-300 font-serif leading-relaxed">
                                {card.previewDiff.after}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-zinc-500">
                              Dispatched {new Date(card.dispatchedAt).toLocaleTimeString()}
                            </span>

                            {isPending ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResolveCard(card.id, "rejected")}
                                  className="h-7 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  <span>Reject</span>
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleResolveCard(card.id, "approved")}
                                  className="h-7 gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Approve & Apply to Manuscript</span>
                                </Button>
                              </div>
                            ) : isApproved ? (
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" />
                                {isApplied ? "Applied into Active Editor" : "Approved"}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-500">Rejected</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "report" && state.lastRunReport && (
                <div className="space-y-6">
                  {/* Multi-Model Consensus Card */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase font-semibold text-indigo-400 tracking-wider">
                          Overnight Review Crucible
                        </span>
                        <h4 className="text-lg font-bold text-white tracking-tight mt-0.5">
                          Multi-Model Synthesis Verdict: {state.lastRunReport.critique.consensusGrade}
                        </h4>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Run: {new Date(state.lastRunReport.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Gemini 1.5 Pro */}
                      <div className="rounded-lg border border-purple-500/20 bg-purple-950/10 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-300">Gemini 1.5 Pro (Deep Narrative)</span>
                          <span className="text-xs font-mono font-bold text-purple-400">
                            {state.lastRunReport.critique.geminiScore}/100
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          "{state.lastRunReport.critique.geminiCritique}"
                        </p>
                      </div>

                      {/* Claude 3.5 Sonnet */}
                      <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">Claude 3.5 Sonnet (Pacing & Style)</span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {state.lastRunReport.critique.claudeScore}/100
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          "{state.lastRunReport.critique.claudeCritique}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cross-Chapter Consistency Audit */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Cross-Chapter Continuity & Logic Verifier
                    </h4>

                    <div className="space-y-2">
                      {state.lastRunReport.consistencyIssues.map(issue => (
                        <div
                          key={issue.id}
                          className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-200">
                              Chapter {issue.chapter} Consistency Check
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                issue.severity === "critical"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-zinc-400">{issue.issue}</p>
                          <div className="rounded bg-zinc-900 p-2 text-indigo-300 text-[11px] flex items-start gap-1">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-indigo-400" />
                            <span><strong>Recommended:</strong> {issue.suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bilingual Sync Card */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5 text-indigo-400" />
                      Synchronized Bilingual Mirror Segment
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Bengali Source</span>
                        <p className="text-zinc-200 font-serif leading-relaxed">
                          {state.lastRunReport.bilingualSnippet.bengali}
                        </p>
                      </div>
                      <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">English Mirror</span>
                        <p className="text-zinc-300 font-serif leading-relaxed">
                          {state.lastRunReport.bilingualSnippet.english}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "config" && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                    <h4 className="text-sm font-semibold text-white">Daemon Schedule & Modules</h4>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <div>
                          <span className="font-semibold text-zinc-200 block">Nightly Scheduled Execution</span>
                          <span className="text-zinc-400 text-[11px]">Triggers when laptop is in sleep mode</span>
                        </div>
                        <span className="font-mono text-indigo-400 font-bold">{state.config.scheduledTimeBST}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <div>
                          <span className="font-semibold text-zinc-200 block">Cross-Chapter Consistency Scanner</span>
                          <span className="text-zinc-400 text-[11px]">Flags prop, location, and character discrepancies</span>
                        </div>
                        <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">ACTIVE</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <div>
                          <span className="font-semibold text-zinc-200 block">Multi-Model Review Crucible</span>
                          <span className="text-zinc-400 text-[11px]">Simulates Gemini + Claude consensus</span>
                        </div>
                        <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">ACTIVE</span>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <span className="font-semibold text-zinc-200 block">Mobile Webhook Dispatch</span>
                          <span className="text-zinc-400 text-[11px]">Telegram / WhatsApp bot approval bridge</span>
                        </div>
                        <span className="font-mono text-zinc-400 text-[10px] truncate max-w-[200px]">{state.config.webhookUrl}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
