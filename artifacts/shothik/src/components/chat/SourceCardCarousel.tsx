import React, { useState } from "react";
import { Globe, ExternalLink, ShieldCheck, Quote, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SourceCardItem {
  id?: string | number;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  verbatimQuote?: string;
  reliability?: string;
  doi?: string;
}

export interface SourceCardCarouselProps {
  sources: SourceCardItem[];
  onSelectSource?: (source: SourceCardItem) => void;
  className?: string;
}

export function SourceCardCarousel({
  sources,
  onSelectSource,
  className,
}: SourceCardCarouselProps) {
  const [activeQuoteId, setActiveQuoteId] = useState<string | number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2 my-2 select-none", className)}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Verified Sources ({sources.length})</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Perplexity Pro Citation Grounding</span>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-border">
        {sources.map((src, idx) => {
          const id = src.id || idx;
          const isQuoteOpen = activeQuoteId === id;
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${src.domain}&sz=32`;

          return (
            <div
              key={id}
              className={cn(
                "flex flex-col justify-between shrink-0 w-64 p-3 rounded-xl border transition-all cursor-pointer group",
                isQuoteOpen
                  ? "bg-muted/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30"
                  : "bg-card/90 dark:bg-zinc-900/90 border-border/80 hover:border-border hover:bg-muted/40 shadow-xs"
              )}
              onClick={() => {
                setActiveQuoteId(isQuoteOpen ? null : id);
                onSelectSource?.(src);
              }}
            >
              <div>
                {/* Header: Favicon & Domain */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/40">
                    <img
                      src={faviconUrl}
                      alt={src.domain}
                      className="w-3.5 h-3.5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground truncate group-hover:text-foreground">
                    {src.domain}
                  </span>
                  {src.reliability && (
                    <span className="ml-auto text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {src.reliability}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h5 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
                  {src.title}
                </h5>

                {/* Snippet / Quote Preview */}
                {src.verbatimQuote && isQuoteOpen ? (
                  <div className="mt-2 p-2 rounded-lg bg-black/40 border border-cyan-500/30 text-[10px] text-cyan-200 leading-relaxed font-sans animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                      <Quote className="w-2.5 h-2.5" /> Verbatim Primary Quote
                    </div>
                    “{src.verbatimQuote}”
                  </div>
                ) : (
                  <p className="mt-1.5 text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {src.snippet || src.verbatimQuote}
                  </p>
                )}
              </div>

              {/* Card Footer: Citation Badge & Link */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px]">
                <span className="font-mono text-muted-foreground flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-[9px]">
                    {idx + 1}
                  </span>
                  Verified citation
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-0.5 text-muted-foreground hover:text-cyan-400 transition-colors"
                  title="Open source in new tab"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
