import { useState, useCallback } from 'react';

export interface InlineRewriteState {
  isOpen: boolean;
  selectedText: string;
  rewrittenText: string;
  prompt: string;
  isStreaming: boolean;
  error: string | null;
}

export type RewritePreset = 'punchy' | 'show-dont-tell' | 'academic' | 'banglish' | 'grammar-fix' | 'expand';

export const REWRITE_PRESETS: { id: RewritePreset; label: string; prompt: string }[] = [
  { id: 'punchy', label: '⚡ Punchy & Tight', prompt: 'Tighten the prose, cut fluff, and make sentence structures dynamic.' },
  { id: 'show-dont-tell', label: '🎭 Show, Don’t Tell', prompt: 'Convert abstract statements into sensory details, actions, and character behavior.' },
  { id: 'academic', label: '🎓 Academic & Formal', prompt: 'Elevate vocabulary and maintain scholarly, objective, research-backed tone.' },
  { id: 'banglish', label: '🇧🇩 Banglish / Colloquial', prompt: 'Infuse natural Bangladeshi urban dialogue and code-mixed cadence.' },
  { id: 'grammar-fix', label: '✨ Fix Grammar', prompt: 'Correct syntax, punctuation, subject-verb agreement, and spelling.' },
  { id: 'expand', label: '📖 Expand Scene', prompt: 'Flesh out atmosphere, emotional resonance, and world details.' },
];

export function useInlineRewrite(onApplyReplacement?: (newText: string) => void) {
  const [state, setState] = useState<InlineRewriteState>({
    isOpen: false,
    selectedText: '',
    rewrittenText: '',
    prompt: '',
    isStreaming: false,
    error: null,
  });

  const openRewrite = useCallback((selectedText: string) => {
    if (!selectedText.trim()) return;
    setState({
      isOpen: true,
      selectedText,
      rewrittenText: '',
      prompt: '',
      isStreaming: false,
      error: null,
    });
  }, []);

  const closeRewrite = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false, isStreaming: false }));
  }, []);

  const executeRewrite = useCallback(async (customPrompt?: string, presetId?: RewritePreset) => {
    const activePrompt = customPrompt || (presetId ? REWRITE_PRESETS.find(p => p.id === presetId)?.prompt : '') || 'Improve the clarity, tone, and flow of this text.';
    
    setState(prev => ({
      ...prev,
      prompt: activePrompt,
      isStreaming: true,
      error: null,
      rewrittenText: ''
    }));

    try {
      // Local heuristic AI rewrite simulation / dev fallback
      const original = state.selectedText;
      let transformed = original;

      if (presetId === 'punchy') {
        transformed = original.replace(/\b(very|really|quite|somewhat|in order to)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
      } else if (presetId === 'grammar-fix') {
        transformed = original.charAt(0).toUpperCase() + original.slice(1).trim();
        if (!/[.!?]$/.test(transformed)) transformed += '.';
      } else if (presetId === 'academic') {
        transformed = `Evidently, ${original.toLowerCase().replace(/it is obvious that/gi, '')}`;
      } else if (presetId === 'banglish') {
        transformed = `${original} — ekdom perfect context e fit hoye geche.`;
      } else {
        transformed = `${original.trim()} (Enhanced with refined flow and atmospheric depth).`;
      }

      // Simulate streaming chunks
      const words = transformed.split(' ');
      let current = '';
      for (let i = 0; i < words.length; i++) {
        current += (i === 0 ? '' : ' ') + words[i];
        setState(prev => ({ ...prev, rewrittenText: current }));
        await new Promise(r => setTimeout(r, 25));
      }

      setState(prev => ({ ...prev, isStreaming: false }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: err.message || 'Rewrite failed',
      }));
    }
  }, [state.selectedText]);

  const acceptRewrite = useCallback(() => {
    if (state.rewrittenText && onApplyReplacement) {
      onApplyReplacement(state.rewrittenText);
    }
    closeRewrite();
  }, [state.rewrittenText, onApplyReplacement, closeRewrite]);

  return {
    ...state,
    openRewrite,
    closeRewrite,
    executeRewrite,
    acceptRewrite,
    setPrompt: (prompt: string) => setState(prev => ({ ...prev, prompt })),
  };
}
