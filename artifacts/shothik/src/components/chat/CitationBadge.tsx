import { useState } from "react";
import { FileText, ExternalLink, Crosshair, Globe, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CitationBadgeProps {
  rawRef: string;
  onClick?: (ref: string) => void;
  className?: string;
  sourceUrl?: string;
  title?: string;
  snippet?: string;
}

export function CitationBadge({
  rawRef,
  onClick,
  className,
  sourceUrl,
  title,
  snippet,
}: CitationBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cleanRef = rawRef.replace(/^#source:|^#doc:/, "");

  // If numeric web citation e.g. "citation_1"
  if (cleanRef.startsWith("citation_")) {
    const num = cleanRef.replace("citation_", "");
    return (
      <span className="relative inline-block" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (sourceUrl) window.open(sourceUrl, "_blank");
            else onClick?.(cleanRef);
          }}
          title={title || `View Source [${num}]`}
          className={cn(
            "inline-flex items-center justify-center h-4 min-w-4 px-1.5 mx-0.5 text-[10px] font-mono font-bold rounded-full",
            "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500 hover:text-white transition-all duration-150",
            "no-underline align-super cursor-pointer shadow-xs hover:scale-110",
            className
          )}
        >
          {num}
        </button>

        {/* Perplexity-Style Hover Popover */}
        {isHovered && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-zinc-950/95 dark:bg-black/95 backdrop-blur-xl border border-zinc-800 dark:border-white/10 shadow-2xl text-left font-sans text-xs text-zinc-200 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium mb-1">
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{sourceUrl ? new URL(sourceUrl).hostname : `Source [${num}]`}</span>
              <ExternalLink className="h-2.5 w-2.5 ml-auto opacity-70" />
            </div>
            <div className="font-semibold text-zinc-100 line-clamp-1 mb-1">
              {title || `Verified Citation Source ${num}`}
            </div>
            {snippet && <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{snippet}</p>}
            <div className="mt-2 text-[9px] text-zinc-500 font-mono flex items-center gap-1">
              <span>Click to view original source</span>
            </div>
          </div>
        )}
      </span>
    );
  }

  const parts = cleanRef.split(":");
  const docId = parts[0] || "Document";
  const sectionOrPage = parts[1] || "";
  const hasBbox = parts.length > 2 && parts[2]?.includes(",");

  let formattedPage = sectionOrPage;
  if (sectionOrPage.startsWith("p")) {
    formattedPage = `P.${sectionOrPage.substring(1)}`;
  }

  return (
    <span className="relative inline-block" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.(cleanRef);
        }}
        title={`Click to view ${docId} ${formattedPage} in split-pane Document Canvas`}
        className={cn(
          "inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md font-mono text-[11px]",
          "border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 dark:text-cyan-300",
          "hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:text-cyan-200 hover:shadow-cyan-500/20 hover:shadow-sm transition",
          "cursor-pointer align-baseline select-none group",
          className
        )}
      >
        <FileText className="h-3 w-3 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform" />
        <span className="font-semibold truncate max-w-[120px]">{docId}</span>
        {sectionOrPage && (
          <span className="text-[10px] text-cyan-400/90 font-normal px-1 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/20">
            {formattedPage}
          </span>
        )}
        {hasBbox && (
          <Crosshair className="h-2.5 w-2.5 text-amber-400 shrink-0 animate-pulse" aria-label="Coordinate grounded highlight" />
        )}
        <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5 shrink-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Document Grounding Hover Card */}
      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-zinc-950/95 dark:bg-black/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl text-left font-sans text-xs text-zinc-200 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold mb-1">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{docId}</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Target: <span className="font-mono text-cyan-300">{formattedPage || "Full Manuscript"}</span>
          </div>
          {hasBbox && <p className="text-[10px] text-amber-400/90 mt-1">🎯 Exact coordinate bounding box indexed</p>}
          <div className="mt-2 text-[9px] text-zinc-500 font-mono">Click to open split Document Canvas</div>
        </div>
      )}
    </span>
  );
}

