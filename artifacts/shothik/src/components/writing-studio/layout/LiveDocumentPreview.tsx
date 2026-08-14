import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { ZoomIn, ZoomOut, RotateCcw, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveDocumentPreviewProps {
  content: string;
  title?: string;
  projectType?: "book" | "research" | "assignment";
  className?: string;
}

function parseMarkdownToHtml(src: string): string {
  if (!src) return "";
  // If already contains HTML tags like <p>, <h1>, etc.
  if (/<[a-z][\s\S]*>/i.test(src)) {
    return src;
  }
  return src
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n\n/gim, "</p><p>")
    .replace(/\n/gim, "<br/>");
}

export function LiveDocumentPreview({
  content,
  title = "Untitled Book",
  projectType = "book",
  className,
}: LiveDocumentPreviewProps) {
  const [displayedContent, setDisplayedContent] = useState(content);
  const [zoom, setZoom] = useState(1);
  const [paperTheme, setPaperTheme] = useState<"cream" | "white">("cream");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayedContent(content);
    }, 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content]);

  const isEmpty =
    !displayedContent ||
    displayedContent.replace(/<[^>]*>/g, "").trim().length === 0;

  const parsedHtml = parseMarkdownToHtml(displayedContent);

  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-hidden border-l border-border bg-muted/20 relative",
        className
      )}
      aria-label="Live document preview"
    >
      {/* Top Preview Control Bar */}
      <div className="h-9 shrink-0 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-xs px-3">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Live 6"×9" Proof
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPaperTheme(paperTheme === "cream" ? "white" : "cream")}
            className="px-2 py-0.5 text-[10px] font-mono rounded border border-border text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Toggle Paper Stock (Cream / White)"
          >
            {paperTheme === "cream" ? "📜 Cream" : "📄 White"}
          </button>

          <div className="flex items-center bg-muted/60 rounded p-0.5 text-muted-foreground">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:text-foreground cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="text-[10px] font-mono px-1 font-semibold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:text-foreground cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:text-foreground cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Proof Page Scroll Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex justify-center items-start">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-xs italic space-y-2">
            <BookOpen className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
            <span>Start typing or generate chapters to see real-time book proofing</span>
          </div>
        ) : (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            className="transition-transform duration-100 ease-out"
          >
            <PreviewPage
              html={parsedHtml}
              title={title}
              projectType={projectType}
              paperTheme={paperTheme}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewPage({
  html,
  title,
  projectType,
  paperTheme,
}: {
  html: string;
  title: string;
  projectType: "book" | "research" | "assignment";
  paperTheme: "cream" | "white";
}) {
  const bgClass =
    paperTheme === "cream"
      ? "bg-[#faf6ee] text-[#2c2416] border-[#e8dfce]"
      : "bg-white text-zinc-800 border-zinc-200";

  return (
    <div
      className={cn(
        "w-[420px] min-h-[594px] shadow-2xl shadow-black/25 px-12 py-14 font-serif rounded-xs border relative transition-colors duration-200",
        bgClass
      )}
    >
      {/* Running Book Header */}
      <div className="text-center opacity-40 text-[9px] uppercase tracking-[0.25em] mb-10 font-sans border-b border-current/10 pb-2">
        {title}
      </div>

      {/* Book Body Copy */}
      <div
        className="text-[13.5px] leading-[1.85] text-justify space-y-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-center [&_h1]:mb-6 [&_h1]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-2 [&_blockquote]:border-current/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-80"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />

      {/* Running Book Footer Page Number */}
      <div className="mt-12 text-center opacity-40 text-[10px] font-mono tracking-widest border-t border-current/10 pt-3">
        — 1 —
      </div>
    </div>
  );
}

export default LiveDocumentPreview;
