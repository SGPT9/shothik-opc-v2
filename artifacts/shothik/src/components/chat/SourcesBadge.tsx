

import React from 'react';
import { Globe, ExternalLink, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SourceCitation {
  id: string;
  title: string;
  url?: string;
  domain?: string;
  snippet?: string;
  score?: number;
}

export interface SourcesBadgeProps {
  sources: SourceCitation[];
  className?: string;
}

export function SourcesBadge({ sources, className }: SourcesBadgeProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className={cn('my-2 flex flex-wrap gap-2 font-sans text-xs', className)}>
      {sources.map((src, idx) => (
        <a
          key={src.id || idx}
          href={src.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition group"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="font-medium truncate max-w-[160px]">{src.title || src.domain || 'Source'}</span>
          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-200 transition-colors" />
        </a>
      ))}
    </div>
  );
}
