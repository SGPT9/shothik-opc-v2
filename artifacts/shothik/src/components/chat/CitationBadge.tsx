import { FileText, ExternalLink, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CitationBadgeProps {
  rawRef: string;
  onClick?: (ref: string) => void;
  className?: string;
}

export function CitationBadge({ rawRef, onClick, className }: CitationBadgeProps) {
  // rawRef can be:
  // "Financial_Report.pdf:p2:150,220,400,280"
  // "User-seeks-assistance:p1-node-p1"
  // "#source:Quarterly_Update.pdf:p3"
  const cleanRef = rawRef.replace(/^#source:|^#doc:/, "");
  const parts = cleanRef.split(":");
  const docId = parts[0] || "Document";
  const sectionOrPage = parts[1] || "";
  const hasBbox = parts.length > 2 && parts[2]?.includes(",");

  let formattedPage = sectionOrPage;
  if (sectionOrPage.startsWith("p")) {
    formattedPage = `P.${sectionOrPage.substring(1)}`;
  }

  return (
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
  );
}

