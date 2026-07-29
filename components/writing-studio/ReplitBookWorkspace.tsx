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
  Mic,
  MicOff,
} from 'lucide-react';
import { useDeerFlowStream, DeerFlowEvent } from '@/hooks/useDeerFlowStream';
import { useVoiceDictation } from '@/hooks/useVoiceDictation';
import { StoryBibleDrawer } from '@/components/writing-studio/StoryBibleDrawer';
import { ManuscriptAuditor } from '@/components/writing-studio/ManuscriptAuditor';
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
  const [storyBibleOpen, setStoryBibleOpen] = useState<boolean>(false);
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
  const [editorText, setEditorText] = useState<string>(
    '# Chapter 1: The Quantum Horizon\n\nThe event horizon shimmered under the harsh starlight...'
  );
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const { isListening, transcript, startListening, stopListening } = useVoiceDictation();

  React.useEffect(() => {
    if (transcript) {
      setCustomPrompt(transcript);
    }
  }, [transcript]);

  const handlePromptChange = (val: string) => {
    setCustomPrompt(val);
    if (val.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const applySlashCommand = (cmd: string) => {
    if (cmd === '/research') {
      setCustomPrompt('Perform deep research across arXiv and PubMed on ');
    } else if (cmd === '/slides') {
      setCustomPrompt('Compile an 8-slide presentation deck on ');
    } else if (cmd === '/sheet') {
      setCustomPrompt('Analyze chapter word counts and perplexity metrics in Python REPL');
    }
    setShowSlashMenu(false);
  };

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
            onClick={() => setStoryBibleOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-xs text-indigo-300 rounded border border-indigo-500/40 transition font-medium"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Story Bible</span>
          </button>

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
      <div className="flex-1 flex overflow-hidden relative">
        <StoryBibleDrawer isOpen={storyBibleOpen} onClose={() => setStoryBibleOpen(false)} />

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
          <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-4">
            {activeTab === 'editor' && (
              <>
                <ManuscriptAuditor text={editorText} />
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  className="w-full flex-1 bg-transparent text-slate-200 font-mono text-sm leading-relaxed outline-none resize-none min-h-[400px]"
                  placeholder="Start typing or trigger DeerFlow AI Co-Writer..."
                />
              </>
            )}

            {activeTab === 'sheet' && (
              <div className="w-full h-full flex flex-col bg-[#080c14] border border-slate-800 rounded-lg p-6 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Table className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Fortune Sheet AI Data Grid</h3>
                      <p className="text-xs text-slate-400">DeerFlow Docker Python REPL data analyst connected</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>pandas v2.2 active</span>
                  </span>
                </div>

                {/* Interactive Data Table Matrix Preview */}
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                  <table className="w-full border-collapse text-xs font-mono text-slate-300">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                        <th className="p-2.5 text-left font-semibold">Row</th>
                        <th className="p-2.5 text-left font-semibold">A: Chapter ID</th>
                        <th className="p-2.5 text-left font-semibold">B: Word Count</th>
                        <th className="p-2.5 text-left font-semibold">C: Perplexity Score</th>
                        <th className="p-2.5 text-left font-semibold">D: Python Formula Output</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-2.5 text-slate-500 font-bold">1</td>
                        <td className="p-2.5 text-cyan-300">ch-1</td>
                        <td className="p-2.5 text-slate-200">2,450</td>
                        <td className="p-2.5 text-emerald-400">24.5 (Human voice)</td>
                        <td className="p-2.5 text-amber-300">df['B'].sum() = 4,920</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-2.5 text-slate-500 font-bold">2</td>
                        <td className="p-2.5 text-cyan-300">ch-2</td>
                        <td className="p-2.5 text-slate-200">2,470</td>
                        <td className="p-2.5 text-emerald-400">26.1 (Human voice)</td>
                        <td className="p-2.5 text-amber-300">df['C'].mean() = 25.3</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'mindmap' && (
              <div className="w-full h-full flex flex-col bg-[#080c14] border border-slate-800 rounded-lg p-6 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Network className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Mind Map Narrative Canvas</h3>
                      <p className="text-xs text-slate-400">Hierarchical story graph powered by DeerFlow LeadEditor outline planner</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded border border-purple-500/30">
                    4 Active Story Nodes
                  </span>
                </div>

                {/* Interactive Node Graph Preview */}
                <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto pr-2">
                  <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-4 flex flex-col justify-between shadow-md">
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded w-fit mb-2">Core Thesis / Main Concept</span>
                    <h4 className="text-sm font-bold text-white">{initialTitle}</h4>
                    <p className="text-xs text-slate-400 mt-1">Central plot structure and overarching narrative arc.</p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition">
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded w-fit mb-2">Character Arc 1</span>
                    <h4 className="text-sm font-bold text-white">Protagonist Journey</h4>
                    <p className="text-xs text-slate-400 mt-1">Conflict $\rightarrow$ Discovery $\rightarrow$ Resolution.</p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition">
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded w-fit mb-2">Chapter Swarm Node</span>
                    <h4 className="text-sm font-bold text-white">Parallel Authoring Graph</h4>
                    <p className="text-xs text-slate-400 mt-1">Chapters 1-5 drafting in parallel via Docker.</p>
                  </div>
                </div>
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
              <div className="p-3 border-t border-slate-800 bg-[#0d1322] space-y-2 relative">
                {showSlashMenu && (
                  <div className="absolute bottom-14 left-3 right-3 bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-2xl z-30 space-y-1">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-0.5">Quick Actions</div>
                    <button
                      onClick={() => applySlashCommand('/research')}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-xs text-cyan-300 flex items-center justify-between"
                    >
                      <span>/research</span>
                      <span className="text-[10px] text-slate-500">Deep Research arXiv & PubMed</span>
                    </button>
                    <button
                      onClick={() => applySlashCommand('/slides')}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-xs text-amber-300 flex items-center justify-between"
                    >
                      <span>/slides</span>
                      <span className="text-[10px] text-slate-500">Compile Marp PPTX Deck</span>
                    </button>
                    <button
                      onClick={() => applySlashCommand('/sheet')}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-xs text-emerald-300 flex items-center justify-between"
                    >
                      <span>/sheet</span>
                      <span className="text-[10px] text-slate-500">Python REPL Data Analysis</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunAgent('general')}
                    placeholder={isListening ? 'Listening to voice...' : 'Ask DeerFlow agent (or type /)...'}
                    className={cn(
                      'flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500 transition',
                      isListening && 'border-red-500/60 ring-1 ring-red-500/40 animate-pulse'
                    )}
                  />
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                      'p-1.5 rounded transition border',
                      isListening
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-bounce'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700'
                    )}
                    title={isListening ? 'Stop Voice Dictation' : 'Start Voice Dictation'}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
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
