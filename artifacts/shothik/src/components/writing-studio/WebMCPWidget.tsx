

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, ChevronDown, ChevronUp, CheckCircle2, ShieldAlert, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface McpToolTrace {
  id: string;
  toolName: string;
  status: 'executing' | 'success' | 'failed';
  timestamp: string;
  args?: Record<string, any>;
  resultSummary?: string;
}

export interface WebMCPWidgetProps {
  traces?: McpToolTrace[];
  className?: string;
}

export function WebMCPWidget({ traces = [], className }: WebMCPWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeTraces = traces.length > 0 ? traces : [
    {
      id: 'mcp-1',
      toolName: 'TavilySearch',
      status: 'success',
      timestamp: '18:56:02',
      args: { query: 'Quantum error correction 2026' },
      resultSummary: 'Retrieved 5 verified academic citations.',
    },
    {
      id: 'mcp-2',
      toolName: 'PythonREPL',
      status: 'success',
      timestamp: '18:56:15',
      args: { code: 'import pandas as pd; df.describe()' },
      resultSummary: 'Executed pandas analysis in Docker sandbox.',
    },
    {
      id: 'mcp-3',
      toolName: 'MarpCompiler',
      status: 'executing',
      timestamp: '18:56:28',
      args: { format: 'pptx', theme: 'glassmorphic' },
      resultSummary: 'Compiling 8-slide presentation deck...',
    },
  ];

  return (
    <div className={cn('my-2 border border-slate-800 bg-[#070a12] rounded-lg overflow-hidden font-sans text-xs', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[#0d1322] flex items-center justify-between hover:bg-slate-800/50 transition text-slate-300"
      >
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200">WebMCP Active Tools</span>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
            {activeTraces.length} tools active
          </span>
        </div>

        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 space-y-2 border-t border-slate-800 bg-[#05070e]"
          >
            {activeTraces.map((t) => (
              <div key={t.id} className="p-2 bg-slate-900/80 border border-slate-800 rounded font-mono text-[11px]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span className="font-semibold text-indigo-300">{t.toolName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{t.timestamp}</span>
                </div>
                <p className="text-slate-400 text-[10px] truncate">{t.resultSummary}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
