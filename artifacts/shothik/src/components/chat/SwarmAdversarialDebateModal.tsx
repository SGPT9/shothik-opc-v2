import React, { useState, useEffect } from "react";
import { SwarmAdversarialDebateService, type SwarmDebateResult } from "@/lib/infrastructure/swarm-adversarial-debate-service";
import { memoryExtractionService } from "@/lib/memory/MemoryExtractionService";
import { CheckCircle2, ShieldAlert, Zap, Scale, Sparkles, X, ArrowRight, MessageSquare, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SwarmAdversarialDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  onOpenSource?: (sourceKey: string) => void;
}

export const SwarmAdversarialDebateModal: React.FC<SwarmAdversarialDebateModalProps> = ({
  isOpen,
  onClose,
  initialTopic = "Polsia OPC F-Commerce Store Rollout & bKash Micro-Payments",
  onOpenSource,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [activeTab, setActiveTab] = useState<"perspectives" | "timeline" | "checklist">("perspectives");
  const [debateResult, setDebateResult] = useState<SwarmDebateResult | null>(() =>
    SwarmAdversarialDebateService.runSwarmDebate(initialTopic)
  );

  const [isDeliberating, setIsDeliberating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunDebate = async () => {
    if (!topic.trim() || isDeliberating) return;
    setIsDeliberating(true);

    try {
      const res = await fetch("/api/v1/swarm/deliberate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: topic, topic }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          const fallback = SwarmAdversarialDebateService.runSwarmDebate(topic);
          const fullRes: SwarmDebateResult = {
            ...fallback,
            topic,
            synthesis: data.summary,
            debatedAt: new Date().toISOString(),
          };
          setDebateResult(fullRes);
          memoryExtractionService.extractAndCommit({
            prompt: `Swarm deliberation consensus on ${topic}`,
            response: fullRes.synthesis,
            source: "swarm",
          });
          setIsDeliberating(false);
          return;
        }
      }
      // If backend response did not have summary, use local engine
      const localRes = SwarmAdversarialDebateService.runSwarmDebate(topic);
      setDebateResult(localRes);
      memoryExtractionService.extractAndCommit({
        prompt: `Swarm deliberation consensus on ${topic}`,
        response: localRes.synthesis,
        source: "swarm",
      });
    } catch {
      // Fallback to local synchronous debate engine on network error
      const localRes = SwarmAdversarialDebateService.runSwarmDebate(topic);
      setDebateResult(localRes);
      memoryExtractionService.extractAndCommit({
        prompt: `Swarm deliberation consensus on ${topic}`,
        response: localRes.synthesis,
        source: "swarm",
      });
    } finally {
      setIsDeliberating(false);
    }
  };

  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\[doc:[^\]]+\]\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[\[doc:([^\]]+)\]\]$/);
      if (match) {
        const sourceKey = match[1];
        const labelParts = sourceKey.split(":");
        const docId = labelParts[0];
        const section = labelParts[1] ? ` · ${labelParts[1]}` : "";
        return (
          <button
            key={index}
            type="button"
            onClick={() => onOpenSource?.(sourceKey)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition cursor-pointer"
            title={`Inspect Grounded Source: ${sourceKey}`}
          >
            <span>📄 {docId}{section}</span>
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">🐝</span>
              <span>Autonomous Multi-Agent Swarm Deliberation</span>
            </h2>
            <p className="text-xs text-slate-400">
              Graph-based debate: Bull Growth Lead ↔ Bear Risk Auditor ↔ Tech Architect ↔ Consensus Chair
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer select-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Topic Input Bar */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && topic.trim()) {
                e.preventDefault();
                handleRunDebate();
              }
            }}
            placeholder="Enter business, technical, or regulatory topic to stress-test via 4-Agent Swarm..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            type="button"
            onClick={handleRunDebate}
            disabled={isDeliberating}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-2.5 rounded-2xl transition flex items-center gap-2 shrink-0 cursor-pointer select-none shadow-lg shadow-purple-900/30"
          >
            {isDeliberating ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Deliberating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run Deliberation Graph</span>
              </>
            )}
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("perspectives")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer select-none",
              activeTab === "perspectives"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Agent Perspectives</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer select-none",
              activeTab === "timeline"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Round-by-Round Graph Timeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("checklist")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer select-none",
              activeTab === "checklist"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Execution Action Checklist</span>
          </button>
        </div>

        {debateResult && (
          <div className="space-y-6">
            {/* Tab 1: Agent Perspectives */}
            {activeTab === "perspectives" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Agent 1 — Bull Growth Lead */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4 shadow-lg shadow-emerald-950/20">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <span>🟢</span> {debateResult.bullPerspective.agentName}
                    </span>
                    <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Score: {debateResult.bullPerspective.verdictScore}/100
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs italic">{debateResult.bullPerspective.summary}</p>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    {debateResult.bullPerspective.arguments.map((arg, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{renderTextWithCitations(arg)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    {Object.entries(debateResult.bullPerspective.keyMetrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[10px]">
                        <span className="text-slate-500">{k}:</span>
                        <span className="font-mono font-bold text-emerald-300">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent 2 — Bear Risk Auditor */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-rose-500/40 space-y-4 shadow-lg shadow-rose-950/20">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> {debateResult.bearPerspective.agentName}
                    </span>
                    <span className="bg-rose-950 border border-rose-500/30 text-rose-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Score: {debateResult.bearPerspective.verdictScore}/100
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs italic">{debateResult.bearPerspective.summary}</p>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    {debateResult.bearPerspective.arguments.map((arg, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold shrink-0">•</span>
                        <span>{renderTextWithCitations(arg)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    {Object.entries(debateResult.bearPerspective.keyMetrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[10px]">
                        <span className="text-slate-500">{k}:</span>
                        <span className="font-mono font-bold text-rose-300">{renderTextWithCitations(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent 3 — Tech Architect */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-500/40 space-y-4 shadow-lg shadow-cyan-950/20">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-cyan-400" /> {debateResult.techPerspective?.agentName ?? "Tech Architect"}
                    </span>
                    <span className="bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Score: {debateResult.techPerspective?.verdictScore ?? 88}/100
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs italic">{debateResult.techPerspective?.summary}</p>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    {debateResult.techPerspective?.arguments.map((arg, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold shrink-0">•</span>
                        <span>{renderTextWithCitations(arg)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    {debateResult.techPerspective &&
                      Object.entries(debateResult.techPerspective.keyMetrics).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[10px]">
                          <span className="text-slate-500">{k}:</span>
                          <span className="font-mono font-bold text-cyan-300">{v}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Timeline */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                {debateResult.rounds.map((round) => (
                  <div key={round.roundNumber} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-purple-300 flex items-center gap-2">
                      <span>🔄</span> {round.roundTitle}
                    </h4>
                    <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                      {round.transcript.map((t, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                            <span>{t.avatarEmoji}</span>
                            <span className="font-bold text-slate-200">{t.agentName}</span>
                          </div>
                          <p className="text-slate-300 pl-4">{renderTextWithCitations(t.statement)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Action Checklist */}
            {activeTab === "checklist" && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4">
                <h4 className="text-xs font-bold text-purple-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Mandatory Execution Action Checklist</span>
                </h4>
                <div className="space-y-2">
                  {debateResult.actionChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <input type="checkbox" defaultChecked className="mt-0.5 accent-purple-500 rounded" />
                      <span className="text-slate-200">{renderTextWithCitations(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Verdict Summary Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/50 flex flex-col md:flex-row items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/40">
                  <Scale className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Synthesized Swarm Verdict</h4>
                  <p className="text-slate-400 text-[11px]">
                    {debateResult.consensusChair.summary}
                  </p>
                </div>
              </div>
              <span className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono font-bold px-4 py-1.5 rounded-xl text-xs shrink-0">
                {debateResult.finalDecision} ({debateResult.consensusScore}/100)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
