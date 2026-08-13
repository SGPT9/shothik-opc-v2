import React, { useState } from "react";
import { SwarmAdversarialDebateService, type SwarmDebateResult } from "@/lib/infrastructure/swarm-adversarial-debate-service";

export interface SwarmAdversarialDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const SwarmAdversarialDebateModal: React.FC<SwarmAdversarialDebateModalProps> = ({
  isOpen,
  onClose,
  initialTopic = "Polsia OPC F-Commerce Store Rollout & bKash Micro-Payments",
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [debateResult, setDebateResult] = useState<SwarmDebateResult | null>(() =>
    SwarmAdversarialDebateService.runSwarmDebate(initialTopic)
  );

  if (!isOpen) return null;

  const handleRunDebate = () => {
    if (!topic.trim()) return;
    const res = SwarmAdversarialDebateService.runSwarmDebate(topic);
    setDebateResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🐝</span> Agent Swarm Adversarial Debate Engine
            </h2>
            <p className="text-xs text-slate-400">3-Agent Parallel Debate: Bull Growth Lead vs. Bear Risk Auditor vs. Consensus Chair</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Topic Input */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter business topic to stress-test via 3-Agent Swarm..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleRunDebate}
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-5 py-2.5 rounded-2xl transition-colors shrink-0"
          >
            Run Swarm Debate ➔
          </button>
        </div>

        {debateResult && (
          <div className="space-y-6">
            {/* 3 Columns for 3 Agents */}
            <div className="grid grid-cols-3 gap-4">
              {/* Agent 1 — Bull Growth Lead */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <span>🟢</span> {debateResult.bullPerspective.agentName}
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Score: {debateResult.bullPerspective.verdictScore}/100
                  </span>
                </div>
                <p className="text-slate-300 text-xs italic">{debateResult.bullPerspective.summary}</p>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {debateResult.bullPerspective.arguments.map((arg, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Agent 2 — Bear Risk Auditor */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-rose-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                    <span>🔴</span> {debateResult.bearPerspective.agentName}
                  </span>
                  <span className="bg-rose-950 text-rose-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Score: {debateResult.bearPerspective.verdictScore}/100
                  </span>
                </div>
                <p className="text-slate-300 text-xs italic">{debateResult.bearPerspective.summary}</p>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {debateResult.bearPerspective.arguments.map((arg, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Agent 3 — Consensus Chair */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-purple-400 text-xs flex items-center gap-1.5">
                    <span>⚖️</span> {debateResult.consensusChair.agentName}
                  </span>
                  <span className="bg-purple-950 text-purple-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Consensus: {debateResult.consensusScore}/100
                  </span>
                </div>
                <p className="text-slate-300 text-xs italic">{debateResult.consensusChair.summary}</p>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {debateResult.consensusChair.arguments.map((arg, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Final Verdict Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-bold text-white">Final Swarm Verdict</h4>
                  <p className="text-slate-400 text-[11px]">Synthesized by 3-Agent Swarm Consensus</p>
                </div>
              </div>
              <span className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono font-bold px-4 py-1.5 rounded-xl text-xs">
                {debateResult.finalDecision} ({debateResult.consensusScore}/100)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
