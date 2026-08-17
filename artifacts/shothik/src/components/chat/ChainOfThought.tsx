

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Cpu, Terminal, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgentReasoningStep {
  id: string;
  node: string;
  agent: string;
  tool?: string;
  thought?: string;
  status: 'active' | 'completed' | 'pending';
  timestamp?: number;
}

export interface ChainOfThoughtProps {
  steps: AgentReasoningStep[];
  isStreaming?: boolean;
  executionMode?: 'realtime' | 'colibri_async' | 'airllm_frontier' | 'deepthink_async';
  className?: string;
}

export function ChainOfThought({ steps, isStreaming, executionMode, className }: ChainOfThoughtProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (!steps || steps.length === 0) return null;

  const activeStep = steps.find((s) => s.status === 'active');
  const completedCount = steps.filter((s) => s.status === 'completed').length;

  return (
    <div
      className={cn(
        'my-2 rounded-lg border border-slate-800 bg-[#0d1322]/80 overflow-hidden font-sans text-xs transition-all',
        className
      )}
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[#090d16] flex items-center justify-between hover:bg-slate-800/50 transition text-slate-300 cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="font-semibold text-slate-200">DeerFlow Reasoning</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
            {completedCount}/{steps.length} steps
          </span>
          {(executionMode === 'colibri_async' || executionMode === 'deepthink_async') && (
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-purple-400 inline" />
              <span>Colibri MoE</span>
            </span>
          )}
          {executionMode === 'airllm_frontier' && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-emerald-400 inline" />
              <span>Tonight Frontier Engine</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isStreaming && activeStep && (
            <span className="text-[10px] text-cyan-400 font-mono flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin inline" />
              <span>{activeStep.agent || activeStep.node}</span>
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 space-y-2 border-t border-slate-800/60 bg-[#070a12]"
          >
            {steps.map((step, idx) => (
              <div key={step.id || idx} className="flex items-start space-x-2 text-[11px] font-mono">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : step.status === 'active' ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0 mt-0.5" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-indigo-300 font-semibold">{step.agent || step.node}</span>
                    {step.tool && (
                      <span className="bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded text-[10px] flex items-center space-x-1">
                        <Terminal className="w-2.5 h-2.5 inline" />
                        <span>{step.tool}</span>
                      </span>
                    )}
                  </div>
                  {step.thought && <p className="text-slate-400 font-sans mt-0.5 whitespace-pre-wrap">{step.thought}</p>}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
