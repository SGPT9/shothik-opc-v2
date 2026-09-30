/**
 * Agent Decision Explanation Modal (Subsystem 5)
 * Explains "Why did the agent do this?" with epistemic provenance, tool call trace, and capability seam selection rationale.
 */

import React from 'react';
import { HelpCircle, Brain, Cpu, ShieldCheck, ChevronRight, X, Sparkles, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalA11y } from '@/hooks/ui/useModalA11y';

export interface AgentDecisionInfo {
  agentName: string;
  agentHandle: string;
  userPrompt: string;
  decisionReasoning: string;
  toolsInvoked: string[];
  capabilitySeamUsed?: string;
  providerSelected?: string;
  epistemicConfidence: number; // 0 - 100
}

export interface AgentDecisionExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionInfo: AgentDecisionInfo;
}

export function AgentDecisionExplanationModal({
  isOpen,
  onClose,
  decisionInfo,
}: AgentDecisionExplanationModalProps) {
  useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-decision-title"
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/40">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="agent-decision-title" className="font-semibold text-base text-white">Agent Decision Audit</h3>
              <p className="text-xs text-purple-400 font-mono">@{decisionInfo.agentHandle} ({decisionInfo.agentName})</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close agent decision audit dialog"
            className="min-w-[36px] min-h-[36px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Epistemic Confidence Score */}
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-200">Epistemic Confidence Score</span>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-900 text-purple-200">
            {decisionInfo.epistemicConfidence}% Confidence
          </span>
        </div>

        {/* Reasoning Rationale */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-cyan-400" />
            <span>Why the agent chose this execution path:</span>
          </span>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs leading-relaxed text-neutral-300">
            {decisionInfo.decisionReasoning}
          </div>
        </div>

        {/* Capability Seam Resolution */}
        {decisionInfo.capabilitySeamUsed ? (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>DSH Capability Seam Resolution</span>
            </span>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-amber-300 flex items-center justify-between">
              <span>Seam: {decisionInfo.capabilitySeamUsed}</span>
              <span className="text-neutral-400">Provider: {decisionInfo.providerSelected}</span>
            </div>
          </div>
        ) : null}

        {/* Invoked Tools */}
        {decisionInfo.toolsInvoked.length > 0 ? (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Invoked Tool Chain</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {decisionInfo.toolsInvoked.map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer Dismiss Button */}
        <div className="pt-2 border-t border-neutral-800 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="min-h-[36px] px-4 text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
