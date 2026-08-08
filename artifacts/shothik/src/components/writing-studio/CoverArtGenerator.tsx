

import React, { useState } from 'react';
import { Palette, Sparkles, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CoverArtGeneratorProps {
  bookTitle?: string;
  className?: string;
}

export function CoverArtGenerator({ bookTitle = 'Untitled Masterpiece', className }: CoverArtGeneratorProps) {
  const [style, setStyle] = useState<'sci-fi' | 'fantasy' | 'thriller' | 'non-fiction'>('sci-fi');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop');
    }, 1500);
  };

  return (
    <div className={cn('p-5 rounded-xl bg-[#080c14] border border-slate-800 font-sans text-xs text-slate-300 space-y-4', className)}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
          <Palette className="w-5 h-5 text-indigo-400" />
          <span>AI Ebook Cover Art Generator</span>
        </div>
        <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
          300 DPI Amazon KDP & Apple Books
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Settings Column */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Cover Style Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {(['sci-fi', 'fantasy', 'thriller', 'non-fiction'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStyle(st)}
                  className={cn(
                    'px-2.5 py-1.5 rounded text-xs font-medium capitalize border transition',
                    style === st
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-md transition flex items-center justify-center space-x-1.5"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating 300 DPI Cover...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Ebook Cover</span>
              </>
            )}
          </button>
        </div>

        {/* Preview Column */}
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg p-4 bg-slate-900/60 min-h-[180px]">
          {previewUrl ? (
            <div className="relative group w-full h-full flex flex-col items-center">
              <img src={previewUrl} alt="Cover Preview" className="w-32 h-44 object-cover rounded shadow-2xl border border-slate-700" />
              <button
                onClick={() => alert('Downloading 300 DPI Cover for Amazon KDP...')}
                className="mt-3 flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Cover</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-500 space-y-1">
              <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">No cover generated yet.</p>
              <p className="text-[10px] text-slate-600">Click generate to build 300 DPI art.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
