import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, RotateCcw, ArrowRight, Wand2, Loader2, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REWRITE_PRESETS, type RewritePreset } from './hooks/useInlineRewrite';

interface InlineDiffModalProps {
  isOpen: boolean;
  selectedText: string;
  rewrittenText: string;
  isStreaming: boolean;
  error: string | null;
  onClose: () => void;
  onAccept: () => void;
  onExecute: (customPrompt?: string, presetId?: RewritePreset) => void;
}

export function InlineDiffModal({
  isOpen,
  selectedText,
  rewrittenText,
  isStreaming,
  error,
  onClose,
  onAccept,
  onExecute,
}: InlineDiffModalProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [activePreset, setActivePreset] = useState<RewritePreset | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      if (!rewrittenText && !isStreaming) {
        onExecute(undefined, 'punchy');
        setActivePreset('punchy');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && rewrittenText && !isStreaming) {
        e.preventDefault();
        onAccept();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, rewrittenText, isStreaming, onAccept, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand/15 text-brand">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">AI Inline Rewrite</h3>
                <p className="text-[11px] text-muted-foreground">Qoderian-Style In-Place Manuscript Diff</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Diff Comparison */}
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Preset Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              {REWRITE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActivePreset(preset.id);
                    onExecute(undefined, preset.id);
                  }}
                  disabled={isStreaming}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-lg font-medium transition-all border',
                    activePreset === preset.id
                      ? 'border-brand/40 bg-brand/10 text-brand'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Split Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              {/* Original */}
              <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive/80">Original</span>
                  <span className="text-[10px] text-muted-foreground">{selectedText.split(/\s+/).length} words</span>
                </div>
                <p className="text-muted-foreground line-through opacity-80 whitespace-pre-wrap">{selectedText}</p>
              </div>

              {/* Rewritten */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/25 relative min-h-[90px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Rewritten</span>
                  {isStreaming && <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />}
                </div>
                <p className="text-foreground font-medium whitespace-pre-wrap">
                  {rewrittenText || (isStreaming ? 'Synthesizing rewrite...' : 'Select a preset or enter prompt below.')}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
                {error}
              </div>
            )}

            {/* Prompt Input */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-background focus-within:border-brand/50 transition-all">
              <Wand2 className="w-4 h-4 ml-2 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customPrompt.trim() && !isStreaming) {
                    e.preventDefault();
                    setActivePreset(null);
                    onExecute(customPrompt.trim());
                  }
                }}
                placeholder="Ask AI to refine (e.g. 'Make it more suspenseful', 'Add sensory metaphors')..."
                className="flex-1 px-2 py-1 text-xs bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => {
                  if (customPrompt.trim() && !isStreaming) {
                    setActivePreset(null);
                    onExecute(customPrompt.trim());
                  }
                }}
                disabled={!customPrompt.trim() || isStreaming}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-50 transition-all"
              >
                Refine
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Ctrl+Enter</kbd> to accept
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Discard (Esc)
              </button>
              <button
                onClick={onAccept}
                disabled={!rewrittenText || isStreaming}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Accept & Replace
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
