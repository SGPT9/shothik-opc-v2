

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sparkles, Clock, CheckCircle2, Loader2, HardDrive, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OvernightJobCardProps {
  jobId?: string;
  taskTitle: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  modelName?: string;
  estimatedCompletion?: string;
  currentStep?: string;
  progressPercent?: number;
  className?: string;
}

export function OvernightJobCard({
  jobId = 'job_' + Math.random().toString(36).substring(2, 9),
  taskTitle,
  status,
  modelName = 'Shothik Frontier Deep Think Engine',
  estimatedCompletion = '7:30 AM (Tonight)',
  currentStep = 'Deep research in progress...',
  progressPercent = 35,
  className,
}: OvernightJobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'my-3 rounded-xl border p-4 font-sans text-xs shadow-lg transition-all',
        status === 'completed'
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          : status === 'processing'
          ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 shadow-purple-500/10'
          : 'bg-slate-900/80 border-slate-800 text-slate-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
            <Moon className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-purple-100 flex items-center gap-1.5">
              <span>Tonight Deep Think Ticket</span>
              <span className="text-[10px] font-mono bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded">
                #{jobId}
              </span>
            </h4>
            <p className="text-[11px] text-purple-300/70 font-mono">{modelName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono">
          {status === 'processing' ? (
            <span className="flex items-center space-x-1 text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin inline" />
              <span>Processing</span>
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center space-x-1 text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 inline" />
              <span>Ready</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 inline" />
              <span>Queued</span>
            </span>
          )}
        </div>
      </div>

      {/* Task Summary */}
      <div className="space-y-2 font-mono">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Target Prompt / Goal:</span>
          <p className="text-slate-200 font-sans text-xs truncate">{taskTitle}</p>
        </div>

        {/* Progress Bar & Status */}
        {status === 'processing' && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] text-purple-300">
              <span>Step: {currentStep}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-purple-500/20">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Action Buttons */}
      {status === 'completed' && (
        <div className="mt-3 pt-2 border-t border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-300 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Morning Executive Briefing Ready</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded text-[10px]">
              💰 $42.50 API Cost Saved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
            <button
              onClick={() => alert("Opening interactive data sheet...")}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 transition text-[11px] text-left flex items-center gap-1.5"
            >
              <span>📊 Open Data Sheet</span>
            </button>
            <button
              onClick={() => alert("Launching Marp slide deck...")}
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 transition text-[11px] text-left flex items-center gap-1.5"
            >
              <span>🎴 Launch Slide Deck</span>
            </button>
          </div>
        </div>
      )}

      {status !== 'completed' && (
        <div className="mt-3 pt-2 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5 text-purple-300/80 font-mono">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>Unlimited Deep Research ($0 API Cost)</span>
          </div>

          <div className="flex items-center space-x-1 text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe to close browser</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
