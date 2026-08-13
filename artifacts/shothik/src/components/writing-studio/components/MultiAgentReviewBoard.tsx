import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Play, Loader2, Sparkles, Shield, User, Clock, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditorialFinding {
  id: string;
  agentId: 'timeline' | 'voice' | 'facts' | 'tone';
  agentName: string;
  agentIcon: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedFix?: string;
  status: 'open' | 'applied';
}

export interface MultiAgentReviewBoardProps {
  chapterContent?: string;
  onApplyFix?: (fix: string) => void;
  className?: string;
}

const DEFAULT_FINDINGS: EditorialFinding[] = [
  {
    id: 'find-1',
    agentId: 'timeline',
    agentName: 'Timeline & Plot Auditor',
    agentIcon: '⏳',
    severity: 'medium',
    title: 'Temporal Jump in Section 2',
    description: 'Transition jumps from dawn to midnight without establishing the passage of time.',
    suggestedFix: 'Insert temporal bridge: "As dusk settled over the skyline, hours slipped away unnoticed."',
    status: 'open',
  },
  {
    id: 'find-2',
    agentId: 'voice',
    agentName: 'Character Voice Auditor',
    agentIcon: '🎭',
    severity: 'low',
    title: 'Dialogue Cadence Shift',
    description: 'Elena uses overly casual contraction inconsistent with her clinical background.',
    suggestedFix: 'Change "gonna check it" to "I will examine the diagnostic log."',
    status: 'open',
  },
  {
    id: 'find-3',
    agentId: 'facts',
    agentName: 'Fact & Citation Verifier',
    agentIcon: '🔬',
    severity: 'low',
    title: 'Quantum Engine Specification',
    description: 'Reference to Sector 7 matches Story Bible lore specifications.',
    status: 'applied',
  },
  {
    id: 'find-4',
    agentId: 'tone',
    agentName: 'Banglish & Tone Polisher',
    agentIcon: '🇧🇩',
    severity: 'high',
    title: 'Passive Voice in Action Climax',
    description: 'Excessive passive construction softens dramatic tension.',
    suggestedFix: 'Replace with active sensory verbs: "She seized the console, overriding the alert sequence."',
    status: 'open',
  },
];

export function MultiAgentReviewBoard({
  chapterContent = '',
  onApplyFix,
  className,
}: MultiAgentReviewBoardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [findings, setFindings] = useState<EditorialFinding[]>(DEFAULT_FINDINGS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'timeline' | 'voice' | 'facts' | 'tone'>('all');

  const handleRunAudit = async () => {
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsRunning(false);
  };

  const handleApply = (finding: EditorialFinding) => {
    if (finding.suggestedFix) {
      onApplyFix?.(finding.suggestedFix);
    }
    setFindings((prev) =>
      prev.map((f) => (f.id === finding.id ? { ...f, status: 'applied' } : f))
    );
  };

  const filtered = findings.filter(
    (f) => activeFilter === 'all' || f.agentId === activeFilter
  );

  const openCount = findings.filter((f) => f.status === 'open').length;

  return (
    <div className={cn('flex flex-col h-full bg-[#0a0e1a] text-slate-200 text-xs font-sans p-3 space-y-3', className)}>
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-100 text-sm">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>MateClaw 4-Agent Editorial Room</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {openCount === 0 ? 'All 4 agent audits clear' : `${openCount} open suggestions`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunAudit}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Auditing in progress...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Full Editorial Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1">
        {[
          { id: 'all', label: 'All Audits', count: findings.length },
          { id: 'timeline', label: '⏳ Timeline', count: findings.filter((f) => f.agentId === 'timeline').length },
          { id: 'voice', label: '🎭 Voice', count: findings.filter((f) => f.agentId === 'voice').length },
          { id: 'facts', label: '🔬 Facts', count: findings.filter((f) => f.agentId === 'facts').length },
          { id: 'tone', label: '🇧🇩 Tone', count: findings.filter((f) => f.agentId === 'tone').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as any)}
            className={cn(
              'px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1',
              activeFilter === tab.id
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            )}
          >
            <span>{tab.label}</span>
            <span className="text-[9px] opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.map((finding) => (
          <div
            key={finding.id}
            className={cn(
              'p-3 rounded-lg border transition',
              finding.status === 'applied'
                ? 'bg-slate-900/30 border-slate-800/40 opacity-60'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{finding.agentIcon}</span>
                <span className="font-semibold text-slate-200 text-xs">{finding.title}</span>
              </div>
              <span
                className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold',
                  finding.severity === 'high' && 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
                  finding.severity === 'medium' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                  finding.severity === 'low' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                )}
              >
                {finding.severity}
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed mb-2">{finding.description}</p>

            {finding.suggestedFix && (
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 mb-2 font-mono text-[11px] text-indigo-300">
                <span className="text-slate-500 mr-1.5">Fix:</span>
                {finding.suggestedFix}
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <span>{finding.agentName}</span>
              </span>

              {finding.status === 'open' ? (
                <button
                  type="button"
                  onClick={() => handleApply(finding)}
                  className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-[11px] font-medium transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Apply Fix</span>
                </button>
              ) : (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Applied</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
