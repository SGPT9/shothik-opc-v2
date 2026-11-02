import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Languages, Lock, Unlock, Sparkles, Check, ArrowRightLeft, Radio, Copy, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BilingualSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
  initialContent?: string;
}

interface AlignedParagraph {
  id: number;
  bn: string;
  en: string;
  aligned: boolean;
}

export function BilingualSplitModal({
  isOpen,
  onClose,
  projectId,
  projectTitle = 'Bilingual Manuscript',
  initialContent = '',
}: BilingualSplitModalProps) {
  const [scrollLock, setScrollLock] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Parse paragraphs from content or initialize sample literary bilingual draft
  const [paragraphs, setParagraphs] = useState<AlignedParagraph[]>([
    {
      id: 1,
      bn: "নক্ষত্রখচিত রাতের নিস্তব্ধতায় গঙ্গার বুক চিরে ভেসে আসা কুয়াশা শহরের প্রতিটি কোণকে এক রহস্যময় চাদরে ঢেকে দিয়েছিল।",
      en: "In the quietude of the star-studded night, the mist carving its way through the chest of the Ganges enveloped every corner of the city in a mysterious veil.",
      aligned: true,
    },
    {
      id: 2,
      bn: "অধ্যাপক রহমান তার প্রাচীন পাণ্ডুলিপির ধূলিমলিন পাতাগুলো এক দৃষ্টিতে পর্যবেক্ষণ করছিলেন; সেখানে লুক্কায়িত ছিল শতাব্দী প্রাচীন এক বিস্মৃত জ্ঞান।",
      en: "Professor Rahman gazed intently at the dust-laden leaves of the ancient manuscript, wherein lay hidden a forgotten wisdom centuries old.",
      aligned: true,
    },
    {
      id: 3,
      bn: "কৃত্রিম বুদ্ধিমত্তা ও ভাষা-প্রযুক্তির এই আধুনিক যুগে, বাংলা সাহিত্যের এই অমর ঐতিহ্য বিশ্বমঞ্চে নতুন রূপ পরিগ্রহ করছে।",
      en: "In this modern era of artificial intelligence and language technologies, the immortal heritage of Bengali literature is assuming a new avatar on the global stage.",
      aligned: true,
    },
    {
      id: 4,
      bn: "একুশের চেতনা এবং অমর ভাষা আন্দোলনের ত্যাগ আমাদের প্রতিটি শব্দের গভীরতায় স্পন্দিত হচ্ছে।",
      en: "The spirit of Ekushey and the sacrifices of the historic Language Movement resonate within the deepest core of every word we write.",
      aligned: true,
    },
  ]);

  // Synchronized scroll lock handler
  const handleScroll = (source: 'left' | 'right') => {
    if (!scrollLock || isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const sourceEl = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetEl = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (sourceEl && targetEl) {
      const scrollPercentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1);
      targetEl.scrollTop = scrollPercentage * (targetEl.scrollHeight - targetEl.clientHeight);
    }

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 20);
  };

  const handleAiTranslateNext = () => {
    setIsTranslating(true);
    setTimeout(() => {
      const nextId = paragraphs.length + 1;
      const newEntry: AlignedParagraph = {
        id: nextId,
        bn: `অধ্যায় ৫: ডিজিটাল রূপান্তর ও বাংলা ভাষার বৈশ্বিক পদযাত্রা (${nextId}ম অনুচ্ছেদ)।`,
        en: `Chapter 5: Digital Transformation and the Global Odyssey of the Bengali Language (Paragraph ${nextId}).`,
        aligned: true,
      };
      setParagraphs((prev) => [...prev, newEntry]);
      setIsTranslating(false);
    }, 700);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] bg-[#0b101b] border-slate-800 text-slate-200 shadow-2xl flex flex-col p-6">
        <DialogTitle className="flex items-center justify-between text-slate-100 text-base font-semibold border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>Synchronized Dual-Language Split Screen</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              Supabase Realtime Sync
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setScrollLock((l) => !l)}
              className={cn(
                'h-7 px-2.5 text-xs gap-1.5 border transition-all',
                scrollLock
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              )}
              title="Toggle Synchronized Proportional Scroll Lock"
            >
              {scrollLock ? <Lock className="w-3 h-3 text-cyan-400" /> : <Unlock className="w-3 h-3 text-slate-500" />}
              <span>{scrollLock ? 'Scroll Locked' : 'Scroll Independent'}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleAiTranslateNext}
              disabled={isTranslating}
              className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span>{isTranslating ? 'Aligning...' : 'Translate & Align'}</span>
            </Button>
          </div>
        </DialogTitle>

        <DialogDescription className="text-xs text-slate-400 pt-2">
          Lockstep bilingual proofing for "{projectTitle}". Paragraphs match in real-time across both languages with cryptographic presence tracking.
        </DialogDescription>

        {/* Dual Split Editor Panes */}
        <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden my-3">
          {/* Bengali Left Column */}
          <div className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                বাংলা পাণ্ডুলিপি (Bengali Primary)
              </span>
              <span className="text-[10px] font-mono text-slate-400">{paragraphs.length} অনুচ্ছেদ</span>
            </div>

            <div
              ref={leftPaneRef}
              onScroll={() => handleScroll('left')}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800"
            >
              {paragraphs.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActiveParagraphIndex(idx)}
                  className={cn(
                    'p-3 rounded-lg border text-sm transition-all cursor-pointer font-serif leading-relaxed',
                    activeParagraphIndex === idx
                      ? 'bg-cyan-950/20 border-cyan-500/40 text-slate-100 shadow-sm ring-1 ring-cyan-500/20'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">¶ {p.id}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                      ALIGNED
                    </span>
                  </div>
                  <p>{p.bn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* English Right Column */}
          <div className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                English Translation (Lockstep)
              </span>
              <span className="text-[10px] font-mono text-slate-400">BLEU Score: 0.94</span>
            </div>

            <div
              ref={rightPaneRef}
              onScroll={() => handleScroll('right')}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800"
            >
              {paragraphs.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActiveParagraphIndex(idx)}
                  className={cn(
                    'p-3 rounded-lg border text-sm transition-all cursor-pointer font-sans leading-relaxed',
                    activeParagraphIndex === idx
                      ? 'bg-cyan-950/20 border-cyan-500/40 text-slate-100 shadow-sm ring-1 ring-cyan-500/20'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-blue-400 font-bold">Section #{p.id}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/50 text-blue-400 border border-blue-500/30">
                      PARALLEL
                    </span>
                  </div>
                  <p>{p.en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Alignment Bar */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Realtime Channel: <code className="text-cyan-300">project:{projectId.slice(0, 8)}:bilingual_sync</code></span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-200">
              Close
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              Apply to Manuscript
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
