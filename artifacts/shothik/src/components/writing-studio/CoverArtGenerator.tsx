import React, { useState } from 'react';
import { Palette, Sparkles, Download, Image as ImageIcon, Loader2, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CoverArtGeneratorProps {
  bookTitle?: string;
  authorName?: string;
  className?: string;
}

export function CoverArtGenerator({
  bookTitle = 'অমর একুশে উপন্যাস',
  authorName = 'লেখক নাম',
  className,
}: CoverArtGeneratorProps) {
  const [style, setStyle] = useState<'amar-ekushey' | 'sci-fi' | 'thriller' | 'academic' | 'poetry'>('amar-ekushey');
  const [title, setTitle] = useState(bookTitle);
  const [author, setAuthor] = useState(authorName);
  const [subtitle, setSubtitle] = useState('একটি সমকালীন গবেষণা ও গল্প');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const styleGradients: Record<string, string> = {
    'amar-ekushey': 'from-red-950 via-slate-900 to-emerald-950',
    'sci-fi': 'from-indigo-950 via-slate-900 to-cyan-950',
    'thriller': 'from-amber-950 via-slate-950 to-red-950',
    'academic': 'from-slate-950 via-blue-950 to-slate-900',
    'poetry': 'from-purple-950 via-slate-900 to-rose-950',
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 800);
  };

  const handleDownload = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2400" viewBox="0 0 1600 2400">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#311042"/>
          </linearGradient>
        </defs>
        <rect width="1600" height="2400" fill="url(#bg)"/>
        <rect x="80" y="80" width="1440" height="2240" fill="none" stroke="#f59e0b" stroke-width="4" stroke-opacity="0.3" rx="16"/>
        <text x="800" y="450" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#f59e0b" text-anchor="middle" letter-spacing="8">${subtitle.toUpperCase()}</text>
        <text x="800" y="850" font-family="'SolaimanLipi', Arial, sans-serif" font-size="110" font-weight="900" fill="#ffffff" text-anchor="middle">${title}</text>
        <line x1="600" y1="1000" x2="1000" y2="1000" stroke="#f59e0b" stroke-width="6"/>
        <text x="800" y="1950" font-family="'SolaimanLipi', Arial, sans-serif" font-size="54" font-weight="bold" fill="#e2e8f0" text-anchor="middle">${author}</text>
        <text x="800" y="2150" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="#64748b" text-anchor="middle" letter-spacing="4">AMAR EKUSHEY 6x9 STANDARD · 300 DPI</text>
      </svg>
    `;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-cover-300dpi.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('p-5 rounded-2xl bg-slate-900/90 border border-slate-800 font-sans text-xs text-slate-300 space-y-4 shadow-xl', className)}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
          <Palette className="w-5 h-5" />
          <span>Amar Ekushey AI Book Cover Generator</span>
        </div>
        <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          6×9 Inch · 300 DPI Print Ready
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Settings Column */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Book Title (বইয়ের নাম)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Author Name (লেখকের নাম)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Cover Theme & Layout</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['amar-ekushey', 'sci-fi', 'thriller', 'academic', 'poetry'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStyle(st)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-[11px] font-medium capitalize border transition-all text-left',
                    style === st
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  {st.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-950/40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Typesetting 300 DPI Cover...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate Amar Ekushey Cover</span>
              </>
            )}
          </button>
        </div>

        {/* Live Preview Column */}
        <div className="flex flex-col items-center justify-center border border-slate-800 rounded-2xl p-4 bg-slate-950/80 min-h-[260px]">
          {generated ? (
            <div className="relative group w-full flex flex-col items-center">
              <div className={cn(
                "w-40 h-60 rounded-xl p-4 flex flex-col justify-between shadow-2xl border border-amber-500/30 bg-gradient-to-br",
                styleGradients[style] || styleGradients['amar-ekushey']
              )}>
                <div className="text-center">
                  <p className="text-[8px] font-mono uppercase tracking-widest text-amber-400/80 mb-1">{subtitle}</p>
                  <h4 className="text-base font-black text-white leading-tight mt-2 line-clamp-3">{title}</h4>
                </div>
                <div className="text-center border-t border-white/10 pt-2">
                  <p className="text-[10px] font-bold text-slate-200">{author}</p>
                  <p className="text-[7px] text-slate-500 mt-0.5">SHOTHIK BOIMELA PRESS</p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="mt-3 flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print-Ready SVG (300 DPI)</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-500 space-y-2 p-6">
              <BookOpen className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-xs font-medium text-slate-400">Ready to design your book cover.</p>
              <p className="text-[10px] text-slate-600">Supports SolaimanLipi Bangla fonts and Nilkhet 6×9 standards.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
