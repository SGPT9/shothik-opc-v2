

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Globe, Anchor, Plus, X, Search, Sparkles } from 'lucide-react';
import { StoryBibleMemoryService, StoryLoreEntry } from '@/lib/story-bible-memory';
import { cn } from '@/lib/utils';

export interface StoryBibleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  className?: string;
}

export function StoryBibleDrawer({ isOpen, onClose, projectId = 'proj-default', className }: StoryBibleDrawerProps) {
  const [entries, setEntries] = useState<StoryLoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'character' | 'setting' | 'plot_hook'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'character' | 'setting' | 'plot_hook'>('character');

  useEffect(() => {
    if (isOpen) {
      loadLore();
    }
  }, [isOpen, projectId]);

  const loadLore = async () => {
    const list = await StoryBibleMemoryService.getLoreForProject(projectId);
    if (list.length === 0) {
      setEntries([
        {
          id: 'lore-1',
          projectId: projectId,
          category: 'character',
          name: 'Dr. Elena Vance',
          details: 'Lead quantum astrophysicist. Skeptical, fiercely protective of her research team.',
          updatedAt: Date.now(),
        },
        {
          id: 'lore-2',
          projectId: projectId,
          category: 'setting',
          name: 'Aethelgard Station',
          details: 'Deep-space orbital lab built in 2042. Houses the prime quantum engine.',
          updatedAt: Date.now(),
        },
        {
          id: 'lore-3',
          projectId: projectId,
          category: 'plot_hook',
          name: 'The Singularity Leak',
          details: 'Unexplained energy spike in Sector 7 during Chapter 2.',
          updatedAt: Date.now(),
        },
      ]);
    } else {
      setEntries(list);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    await StoryBibleMemoryService.saveLore(projectId, newCategory, newTitle, newContent);
    setNewTitle('');
    setNewContent('');
    await loadLore();
  };

  const filteredEntries = entries.filter((item) => {
    const matchesCategory = activeTab === 'all' || item.category === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          className={cn(
            'fixed right-0 top-0 bottom-0 w-[360px] bg-[#0b0f19] border-l border-slate-800 shadow-2xl z-50 flex flex-col font-sans text-xs text-slate-300',
            className
          )}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 bg-[#0d1322] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Story Bible & Lore Vault</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>2 Co-authors Live</span>
              </span>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-800/80 bg-[#080c14] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search characters, lore, hooks..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-1">
              {(['all', 'character', 'setting', 'plot_hook'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={cn(
                    'px-2 py-1 rounded text-[10px] font-medium capitalize transition',
                    activeTab === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  )}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Lore List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#05070e]">
            {filteredEntries.length === 0 ? (
              <div className="text-center text-slate-600 py-8 italic">No matching lore entries found.</div>
            ) : (
              filteredEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded font-mono uppercase',
                        item.category === 'character' && 'bg-indigo-500/20 text-indigo-300',
                        item.category === 'setting' && 'bg-cyan-500/20 text-cyan-300',
                        item.category === 'plot_hook' && 'bg-amber-500/20 text-amber-300'
                      )}
                    >
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed mb-2">{item.details}</p>
                  
                  {/* MateClaw-Style Bidirectional Wiki Tag */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/50 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-indigo-400/80">
                      <span>[[{item.name}]]</span>
                    </span>
                    <span className="text-slate-500">Auto-Linked</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddEntry} className="p-3 border-t border-slate-800 bg-[#090d16] space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Entry title (e.g. Elena Vance)"
                className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
              <select
                value={newCategory}
                onChange={(e: any) => setNewCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none"
              >
                <option value="character">Character</option>
                <option value="setting">Setting</option>
                <option value="plot_hook">Plot Hook</option>
              </select>
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Entry description..."
              rows={2}
              className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none"
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || !newContent.trim()}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium rounded transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save to Story Bible</span>
            </button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
