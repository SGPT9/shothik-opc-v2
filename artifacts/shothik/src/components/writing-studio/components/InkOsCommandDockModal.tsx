import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Zap, ArrowRight, Command } from 'lucide-react';
import {
  INKOS_TOOLS,
  INKOS_PILLARS,
  type InkOsPillarId,
  type InkOsToolId,
  type InkOsToolItem,
} from '../config/inkos-tool-catalog';

interface InkOsCommandDockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: InkOsToolId) => void;
  studioCredits?: number;
}

export function InkOsCommandDockModal({
  isOpen,
  onClose,
  onSelectTool,
  studioCredits = 550,
}: InkOsCommandDockModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePillar, setActivePillar] = useState<InkOsPillarId | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return INKOS_TOOLS.filter((tool) => {
      if (activePillar !== 'all' && tool.pillar !== activePillar) return false;
      if (!q) return true;
      const numMatch = tool.capabilityNumber ? `#${tool.capabilityNumber}` : '';
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.titleBn.toLowerCase().includes(q) ||
        tool.shortLabel.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.slashCommand.toLowerCase().includes(q) ||
        numMatch.includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activePillar]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-14 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => e.stopPropagation()}
          data-testid="modal-inkos-command-dock"
          className="w-full max-w-4xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        >
          {/* Top Search Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/15 text-brand shrink-0">
              <Command className="w-4 h-4" />
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose();
                  if (e.key === 'Enter' && filteredTools.length > 0) {
                    onSelectTool(filteredTools[0].id);
                    onClose();
                  }
                }}
                placeholder="Search 45+ InkOS engines by name, বাংলা, /slash command, or #number (e.g. '1971', '/dialect', 'print')..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold shrink-0">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{studioCredits} Credits</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5-Pillar Category Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar bg-zinc-100/40 dark:bg-zinc-900/20 shrink-0">
            {INKOS_PILLARS.map((pillar) => {
              const isActive = activePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{pillar.emoji}</span>
                  <span>{pillar.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tool Cards Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 custom-scrollbar">
            {filteredTools.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No matching InkOS tools found</p>
                <p className="text-xs mt-1">Try searching for "dialogue", "1971", "print", "audio", or "bible".</p>
              </div>
            ) : (
              filteredTools.map((tool: InkOsToolItem) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  data-testid={`dock-tool-${tool.id}`}
                  className="group text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-brand/50 bg-white dark:bg-zinc-900/60 hover:bg-brand/5 dark:hover:bg-brand/10 transition-all flex flex-col justify-between gap-2 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-brand transition-colors">
                        <span className="text-base">{tool.emoji}</span>
                        <span className="truncate">{tool.title}</span>
                      </span>
                      {tool.capabilityNumber && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                          #{tool.capabilityNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-brand/90 dark:text-brand mb-1">
                      {tool.titleBn}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px]">
                    <span className="font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {tool.slashCommand}
                    </span>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded ${
                        tool.credits === 0
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {tool.credits === 0 ? '0 Credits (Free)' : `⚡ ${tool.credits} Cr`}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-500">
            <span>
              💡 Tip: You can also trigger any tool directly from the <strong>AI Co-Writer chat</strong> using <code>/slash</code> commands or suggested chips.
            </span>
            <span className="hidden sm:inline font-mono text-[10px]">Enter ↵ to launch · Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
