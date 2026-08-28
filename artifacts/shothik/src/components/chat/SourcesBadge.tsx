import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
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
  /** If true, renders the Perplexity-style numbered row ABOVE answer content */
  variant?: 'row' | 'footer';
}

function getDomain(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function getFavicon(url?: string): string {
  const domain = getDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';
}

export function SourcesBadge({ sources, className, variant = 'row' }: SourcesBadgeProps) {
  if (!sources || sources.length === 0) return null;

  // ── Perplexity-style numbered row (default, above answer) ──────────────────
  if (variant === 'row') {
    return (
      <div className={cn('mb-4', className)}>
        <div className="flex items-center gap-1.5 mb-2">
          <Globe className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
            Sources
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sources.slice(0, 6).map((src, idx) => {
            const domain = getDomain(src.url);
            const favicon = getFavicon(src.url);
            return (
              <a
                key={src.id || idx}
                href={src.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                title={src.title}
                className="group flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-brand/40 hover:bg-brand/5 hover:text-foreground transition-all cursor-pointer select-none"
              >
                {/* Citation number */}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted/60 text-[9px] font-bold text-muted-foreground group-hover:bg-brand/20 group-hover:text-brand transition-colors">
                  {idx + 1}
                </span>
                {/* Favicon */}
                {favicon && (
                  <img
                    src={favicon}
                    alt=""
                    className="h-3.5 w-3.5 rounded-sm object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {/* Domain */}
                <span className="truncate max-w-[120px]">
                  {domain || src.title || 'Source'}
                </span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
              </a>
            );
          })}
          {sources.length > 6 && (
            <span className="flex items-center rounded-lg border border-border/40 bg-muted/10 px-2.5 py-1.5 text-[11px] text-muted-foreground/60 select-none">
              +{sources.length - 6} more
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Legacy footer badge style ──────────────────────────────────────────────
  return (
    <div className={cn('my-2 flex flex-wrap gap-2 font-sans text-xs', className)}>
      {sources.map((src, idx) => (
        <a
          key={src.id || idx}
          href={src.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-muted/40 hover:bg-muted/60 border border-border/60 text-muted-foreground transition group cursor-pointer select-none"
        >
          <Globe className="w-3.5 h-3.5 text-brand flex-shrink-0" />
          <span className="font-medium truncate max-w-[160px]">{src.title || src.domain || 'Source'}</span>
          <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </a>
      ))}
    </div>
  );
}
