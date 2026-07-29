'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Terminal,
  Cpu,
  Play,
  Square,
  Sparkles,
  Table,
  Presentation,
  Network,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Layers,
  Download,
  Send,
} from 'lucide-react';
import { useDeerFlowStream, DeerFlowEvent } from '@/hooks/useDeerFlowStream';
import { cn } from '@/lib/utils';

export interface ReplitBookWorkspaceProps {
  initialTitle?: string;
  initialChapters?: { id: string; title: string; synopsis: string }[];
  onExport?: (format: 'pdf' | 'epub' | 'docx') => void;
}

export function ReplitBookWorkspace({
  initialTitle = 'Untitled Masterpiece',
  initialChapters = [
    { id: 'ch-1', title: 'Chapter 1: The Quantum Horizon', synopsis: 'Introduction to the core conflict.' },
    { id: 'ch-2', title: 'Chapter 2: The Singularity Event', synopsis: 'Escalation of stakes and discovery.' },
  ],
  onExport,
}: ReplitBookWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'sheet' | 'mindmap' | 'slides'>('editor');
  const [activeChapterId, setActiveChapterId] = useState<string>(initialChapters[0]?.id || 'ch-1');
  const [leftNavOpen, setLeftNavOpen] = useState<boolean>(true);
  const [rightConsoleOpen, setRightConsoleOpen] = useState<boolean>(true);
  const [editorText, setEditorText] = useState<string>(
    '# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight...'
  );
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const {
    isStreaming,
    activeNode,
    activeAgent,
    activeTool,
    streamedText,
    events,
    error,
    startStream,
    stopStream,
  } = useDeerFlowStream({
    onToken: (token) => {
      setEditorText((prev) => prev + token);
    },
    onComplete: (finalOutput) => {
      console.log('DeerFlow generation complete');
    },
  });

  const handleRunAgent = (type: 'deep_research' | 'slide_generation' | 'sheet_analysis' | 'general' = 'general') => {
    if (!customPrompt.trim() && type === 'general') return;
    const promptToRun = customPrompt.trim() || `Draft and enrich ${initialChapters.find((c) => c.id === activeChapterId)?.title}`;
    startStream(promptToRun, type, { chapterId: activeChapterId, bookTitle: initialTitle });
    setCustomPrompt('');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0b0f19] text-slate-200 overflow-hidden font-sans border border-slate-800">
      {/* Top IDE Header Bar */}
      <header className="h-12 border-b border-slate-800/80 bg-[#0d1322] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>Shothik IDE</span>
          </div>
          <span className="text-slate-600">/</span>
          <div className="flex items-center space-x-2 bg-slate-800/50 px-2.5 py-1 rounded text-xs text-slate-300 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>{initialTitle}</span>
          </div>
        </div>

        {/* Center Action Tabs */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Writing Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
              activeTab === 'sheet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Fortune Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('mindmap')}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
              activeTab === 'mindmap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Mind Map</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
              activeTab === 'slides'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Marp Slides</span>
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExport?.('epub')}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export EPUB/PDF</span>
          </button>
        </div>
      </header>

      {/* Main Multi-Pane Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Explorer & Outline Pane */}
        <AnimatePresence initial={false}>
          {leftNavOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-slate-800 bg-[#0d1322] flex flex-col overflow-hidden"
            >
              <div className="p-3 border-b border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Story Outline</span>
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 py-1">Chapters</div>
                {initialChapters.map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => setActiveChapterId(chap.id)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-md text-xs transition flex items-center space-x-2',
                      activeChapterId === chap.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    )}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{chap.title}</span>
                  </button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle Left Nav Button */}
        <button
          onClick={() => setLeftNavOpen(!leftNavOpen)}
          className="h-full border-r border-slate-800 bg-[#0d1322] hover:bg-slate-800/80 px-1 text-slate-500 hover:text-slate-200 flex items-center justify-center transition"
        >
          {leftNavOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Center Canvas Area */}
        <main className="flex-1 flex flex-col bg-[#0b0f19] overflow-hidden relative">
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'editor' && (
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="w-full h-full bg-transparent text-slate-200 font-mono text-sm leading-relaxed outline-none resize-none"
                placeholder="Start typing or trigger DeerFlow AI Co-Writer..."
              />
            )}

            {activeTab === 'sheet' && (
              <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-6 text-slate-400">
                <Table className="w-12 h-12 text-cyan-400 mb-3" />
                <h3 className="text-sm font-semibold text-slate-200">Fortune Sheet AI Spreadsheet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                  DeerFlow Python REPL data analyst is connected. Trigger automated formula calculations and data cleaning.
                </p>
              </div>
            )}

            {activeTab === 'mindmap' && (
              <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-6 text-slate-400">
                <Network className="w-12 h-12 text-purple-400 mb-3" />
                <h3 className="text-sm font-semibold text-slate-200">Mind Elixir Narrative Canvas</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                  Hierarchical story mind map powered by DeerFlow LeadAgent outline planner.
                </p>
              </div>
            )}

            {activeTab === 'slides' && (
              <div className="w-full h-full flex flex-col bg-[#080c14] border border-slate-800 rounded-lg p-6 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Presentation className="w-6 h-6 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Marp Presentation Slide Deck</h3>
                      <p className="text-xs text-slate-400">DeerFlow Docker marp-cli compiler connected</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '#';
                      alert('Triggering DeerFlow PowerPoint (.pptx) deck compile in Docker...');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PPTX</span>
                  </button>
                </div>

                {/* Interactive Slide Preview Cards */}
                <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pr-2">
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 flex flex-col justify-between shadow-lg relative group">
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded w-fit">Slide 1 — Title</span>
                    <div className="my-4">
                      <h4 className="text-lg font-bold text-white tracking-tight">{initialTitle}</h4>
                      <p className="text-xs text-slate-400 mt-1">Generated by Shothik Web & DeerFlow 2.0 SuperAgent Swarm</p>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Theme: Dark Glassmorphic</span>
                      <span>Marp v2.4</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg relative group hover:border-slate-700 transition">
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded w-fit">Slide 2 — Executive Summary</span>
                    <div className="my-4 space-y-1.5">
                      <p className="text-xs text-slate-300">• Deep Research synthesis across arXiv & PubMed</p>
                      <p className="text-xs text-slate-300">• Automated data analytics via Python REPL</p>
                      <p className="text-xs text-slate-300">• Multi-channel publishing to Amazon & Apple</p>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Layout: Bullets & Data</span>
                      <span>Marp v2.4</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Replit Agent Console & Terminal Log Viewer */}
        <AnimatePresence initial={false}>
          {rightConsoleOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-slate-800 bg-[#0d1322] flex flex-col overflow-hidden"
            >
              {/* Console Header */}
              <div className="p-3 border-b border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Replit Agent Console</span>
                </span>
                {isStreaming ? (
                  <button
                    onClick={stopStream}
                    className="flex items-center space-x-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-0.5 rounded text-[11px] font-medium border border-red-500/30"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Ready
                  </span>
                )}
              </div>

              {/* Status Banner */}
              <div className="bg-slate-900/60 p-3 border-b border-slate-800/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Active Agent:</span>
                  <span className="font-mono text-indigo-300 font-semibold">{activeAgent || 'LeadEditor'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Current Node:</span>
                  <span className="font-mono text-cyan-300">{activeNode || 'idle'}</span>
                </div>
                {activeTool && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Active Tool:</span>
                    <span className="font-mono text-amber-300">{activeTool}</span>
                  </div>
                )}
              </div>

              {/* Event & Terminal Logs */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-2 bg-[#090d16]">
                {events.length === 0 ? (
                  <div className="text-slate-600 italic py-4 text-center">
                    Agent execution trace logs will appear here when triggered.
                  </div>
                ) : (
                  events.map((ev, idx) => (
                    <div key={idx} className="border-b border-slate-800/40 pb-1 text-slate-300">
                      <span className="text-indigo-400">[{ev.node || 'agent'}]</span>{' '}
                      <span className="text-slate-400">{ev.event}</span>
                      {ev.content && <p className="text-slate-300 mt-0.5 whitespace-pre-wrap">{ev.content}</p>}
                    </div>
                  ))
                )}
                {error && <div className="text-red-400 bg-red-950/40 p-2 rounded border border-red-800/50">{error}</div>}
              </div>

              {/* Prompt Execution Input */}
              <div className="p-3 border-t border-slate-800 bg-[#0d1322] space-y-2">
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunAgent('general')}
                    placeholder="Ask DeerFlow agent..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    onClick={() => handleRunAgent('general')}
                    disabled={isStreaming}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <button
                    onClick={() => handleRunAgent('deep_research')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 py-1 rounded text-center border border-slate-700"
                  >
                    Deep Research
                  </button>
                  <button
                    onClick={() => handleRunAgent('slide_generation')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-amber-300 py-1 rounded text-center border border-slate-700"
                  >
                    Generate Deck
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-7 border-t border-slate-800 bg-[#0a0d16] px-4 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DeerFlow Engine: Port 8000</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1 text-slate-400">
            <Database className="w-3 h-3 text-indigo-400" />
            <span>InsForge DB Connected</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-500">
          <span>Words: {editorText.split(/\s+/).filter(Boolean).length}</span>
          <span>Chars: {editorText.length}</span>
        </div>
      </footer>
    </div>
  );
}
