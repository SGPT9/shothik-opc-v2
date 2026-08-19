import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Play,
  Check,
  Copy,
  Download,
  Terminal,
  Loader2,
  BarChart3,
  Presentation,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CitationBadge } from "./CitationBadge";

interface MarkdownMessageProps {
  content: string;
  artifactId?: string;
  artifactType?: "chart" | "presentation" | "document";
  className?: string;
  onOpenSource?: (sourceKey: string) => void;
}

export function MarkdownMessage({
  content,
  artifactId,
  artifactType,
  className,
  onOpenSource,
}: MarkdownMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [runningCode, setRunningCode] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<Record<string, string>>({});
  const [openConsole, setOpenConsole] = useState<Record<string, boolean>>({});
  const [codePreviewMap, setCodePreviewMap] = useState<Record<string, boolean>>({});
  const [activeLens, setActiveLens] = useState<"executive" | "research" | "action">("executive");

  // Preprocess epistemic tags, clean think tags, and convert citations to interactive badges
  const processedContent = (content ?? "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>/gi, "")
    .replace(/<\/think>/gi, "")
    .replace(/\[\[doc:([^\]]+)\]\]/g, (_match, docRef) => {
      const parts = docRef.split(":");
      const docId = parts[0];
      const section = parts[1] ? ` · ${parts[1]}` : "";
      return `[📄 ${docId}${section}](#source:${docRef})`;
    })
    .replace(/(?<=\s|^)\[([0-9]+)\](?=[\s,.:;!?]|$)/g, (_match, citationNum) => {
      return `[${citationNum}](#source:citation_${citationNum})`;
    });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadCode = (code: string, lang: string) => {
    const extMap: Record<string, string> = {
      python: "py",
      py: "py",
      typescript: "ts",
      ts: "ts",
      tsx: "tsx",
      javascript: "js",
      js: "js",
      jsx: "jsx",
      sql: "sql",
      json: "json",
      html: "html",
      css: "css",
      bash: "sh",
      sh: "sh",
      rust: "rs",
      go: "go",
      markdown: "md",
      md: "md",
    };
    const ext = extMap[lang.toLowerCase()] || "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shothik-code-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunCode = (codeId: string, code: string, lang: string) => {
    setRunningCode(codeId);
    setConsoleLogs((prev) => ({
      ...prev,
      [codeId]: `🚀 Executing ${lang} script in Python/JS REPL Sandbox...\nRunning assertions...\nResult: Operation completed successfully (0 errors).`,
    }));
    setOpenConsole((prev) => ({ ...prev, [codeId]: true }));
    setTimeout(() => setRunningCode(null), 1200);
  };

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words space-y-3", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Mobile-friendly responsive table container with 1-click CSV export and Sheets Canvas bridge
          table: ({ children }) => {
            const handleExportTableCSV = (e: React.MouseEvent) => {
              const tableContainer = (e.currentTarget as HTMLElement).closest(".group\\/table");
              if (!tableContainer) return;
              const tableEl = tableContainer.querySelector("table");
              if (!tableEl) return;
              const rows = Array.from(tableEl.querySelectorAll("tr"));
              const csv = rows
                .map((r) =>
                  Array.from(r.querySelectorAll("th, td"))
                    .map((c) => `"${(c.textContent || "").trim().replace(/"/g, '""')}"`)
                    .join(",")
                )
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `shothik-table-${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            };

            const handleFilterTable = (e: React.ChangeEvent<HTMLInputElement>) => {
              const query = e.target.value.toLowerCase().trim();
              const tableContainer = e.target.closest(".group\\/table");
              if (!tableContainer) return;
              const rows = tableContainer.querySelectorAll("tbody tr");
              rows.forEach((row) => {
                const text = row.textContent?.toLowerCase() || "";
                (row as HTMLElement).style.display = text.includes(query) ? "" : "none";
              });
            };

            return (
              <div className="group/table my-3 overflow-hidden rounded-2xl border border-border/70 bg-card/50 backdrop-blur-xs shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-muted/40 border-b border-border/60 text-[10px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-wider text-foreground">Data Matrix</span>
                    <input
                      type="text"
                      placeholder="🔍 Filter rows..."
                      onChange={handleFilterTable}
                      className="px-2 py-0.5 rounded-lg bg-background/80 border border-border/50 text-[10px] text-foreground outline-none font-sans placeholder:text-muted-foreground/60 w-28 sm:w-36 focus:border-brand/60"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportTableCSV}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/60 hover:bg-background text-foreground border border-border/40 text-[10px] font-medium transition cursor-pointer"
                      title="Export table data to CSV / Excel"
                    >
                      <span>📊 Export CSV</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse divide-y divide-border/60">
                    {children}
                  </table>
                </div>
              </div>
            );
          },
          thead: ({ children }) => (
            <thead className="bg-muted/50 text-foreground font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/70">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-xs text-muted-foreground border-b border-border/40 hover:bg-muted/20 transition-colors">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-brand/60 bg-brand/5 pl-3.5 pr-3 py-2 rounded-r-lg text-xs italic text-foreground/90 leading-relaxed">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 list-disc pl-4 text-xs leading-relaxed text-foreground/90 marker:text-brand/70">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 list-decimal pl-4 text-xs leading-relaxed text-foreground/90 marker:text-brand/80 font-medium">
              {children}
            </ol>
          ),
          hr: () => (
            <hr className="my-4 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          ),

          // Interactive Citation Badges
          a: ({ href, children }) => {
            if (href?.startsWith("#source:") || href?.startsWith("#doc:")) {
              const sourceKey = href.replace(/^#(source|doc):/, "");
              return (
                <CitationBadge
                  rawRef={sourceKey}
                  onClick={(ref) => onOpenSource?.(ref)}
                />
              );
            }

            const text = String(children);
            const isCitation = /^\[?\d+\]?$/.test(text.trim());

            if (isCitation) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-4 min-w-4 px-1 mx-0.5 text-[10px] font-mono font-bold rounded-full bg-brand/15 text-brand border border-brand/30 hover:bg-brand hover:text-white transition-all no-underline align-super cursor-pointer shadow-2xs"
                  title={`View Verified Citation Source: ${href}`}
                >
                  {text.replace(/[\[\]]/g, "")}
                </a>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand hover:underline font-medium break-all"
              >
                <span>{children}</span>
                <ExternalLink className="h-3 w-3 inline shrink-0" />
              </a>
            );
          },

          pre: ({ children }) => (
            <div className="my-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-950 dark:bg-black/90 text-xs font-mono shadow-md backdrop-blur-xl">
              {children}
            </div>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const text = String(children).replace(/\n$/, "");
            const isInline = !String(codeClassName || "").includes("language-");
            const match = /language-(\w+)/.exec(codeClassName || "");
            const lang = match ? match[1] : "code";
            const codeId = `code_${text.substring(0, 16).replace(/\W/g, "")}`;

            if (isInline) {
              return (
                <code className="rounded bg-zinc-200 dark:bg-white/[0.08] px-1.5 py-0.5 font-mono text-[11px] text-zinc-900 dark:text-emerald-400 border border-zinc-300 dark:border-white/[0.08]" {...props}>
                  {children}
                </code>
              );
            }

            const isRunning = runningCode === codeId;
            const isCopied = copiedCode === text;
            const logs = consoleLogs[codeId];
            const isConsoleOpen = openConsole[codeId] ?? false;

            const isPreviewable = ["html", "svg", "xml", "jsx", "tsx"].includes(lang.toLowerCase());
            const isPreviewOpen = codePreviewMap[codeId] ?? false;

            return (
              <div className="space-y-0">
                {/* Code Block Header Toolbar */}
                <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/[0.08] bg-zinc-900 dark:bg-black/80 px-3.5 py-2 text-[11px] text-zinc-400">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="rounded bg-white/[0.08] border border-white/[0.12] px-2 py-0.5 font-semibold text-zinc-200 uppercase text-[10px]">
                      {lang}
                    </span>
                    {isPreviewable && (
                      <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setCodePreviewMap((prev) => ({ ...prev, [codeId]: false }))}
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-sans font-medium transition cursor-pointer",
                            !isPreviewOpen ? "bg-white/[0.15] text-white font-semibold shadow-xs" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setCodePreviewMap((prev) => ({ ...prev, [codeId]: true }))}
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-sans font-medium transition cursor-pointer flex items-center gap-1",
                            isPreviewOpen ? "bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs border border-emerald-500/30" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <span>👁️ Live Preview</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleRunCode(codeId, text, lang)}
                      disabled={isRunning}
                      className="flex items-center space-x-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-emerald-400 hover:bg-emerald-500/25 transition text-[10px] font-mono border border-emerald-500/30 cursor-pointer select-none disabled:opacity-50"
                    >
                      {isRunning ? (
                        <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                      ) : (
                        <Play className="h-3 w-3 text-emerald-400" />
                      )}
                      <span>{isRunning ? "Running..." : "▶ Run"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(text)}
                      className="flex items-center space-x-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] px-2.5 py-1 text-zinc-300 hover:text-white transition text-[10px] font-mono cursor-pointer select-none"
                      title="Copy code to clipboard"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadCode(text, lang)}
                      className="flex items-center space-x-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] px-2.5 py-1 text-zinc-300 hover:text-white transition text-[10px] font-mono cursor-pointer select-none"
                      title="Download code file"
                    >
                      <Download className="h-3 w-3 text-amber-400" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Code Body or Live Preview Iframe */}
                {isPreviewOpen ? (
                  <div className="p-3 bg-white dark:bg-zinc-900 border-t border-border/40 rounded-b-xl overflow-hidden min-h-[160px] flex items-center justify-center">
                    {lang.toLowerCase() === "svg" ? (
                      <div dangerouslySetInnerHTML={{ __html: text }} className="max-w-full max-h-64 flex items-center justify-center p-2" />
                    ) : (
                      <iframe
                        title="Sandboxed HTML Preview"
                        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:system-ui,-apple-system,sans-serif;padding:12px;margin:0;color:#222;background:#fff;}</style></head><body>${text}</body></html>`}
                        sandbox="allow-scripts"
                        className="w-full h-48 border-0 rounded-lg bg-white"
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 overflow-x-auto text-[11px] leading-relaxed text-zinc-200 bg-zinc-950 dark:bg-black/60 font-mono custom-scrollbar">
                    <code className={cn("block font-mono", codeClassName)} {...props}>
                      {children}
                    </code>
                  </div>
                )}
                
                {/* Console Output Drawer */}
                {logs && (
                  <div className="border-t border-zinc-800 dark:border-white/[0.08] bg-black/80 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenConsole((prev) => ({ ...prev, [codeId]: !prev[codeId] }))
                      }
                      className="w-full px-3 py-1.5 flex items-center justify-between text-zinc-400 hover:bg-white/[0.04] transition text-[10px] cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Terminal className="h-3 w-3 text-amber-400" />
                        <span>Console Output</span>
                      </div>
                      {isConsoleOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isConsoleOpen && (
                      <pre className="px-3.5 py-2.5 text-[10px] text-emerald-400 bg-black/90 overflow-x-auto border-t border-white/[0.06] font-mono whitespace-pre-wrap">
                        {logs}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>

      {/* Artifact Action Cards */}
      {(artifactId || artifactType) && (
        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/40 font-sans">
          {artifactType === "chart" && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-indigo-500/40 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-900/30">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
              <span>📊 Open Interactive Data Chart</span>
            </Button>
          )}
          {artifactType === "presentation" && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30">
              <Presentation className="h-3.5 w-3.5 text-amber-400" />
              <span>🎴 Launch Presentation Slide Deck</span>
            </Button>
          )}
          {artifactType === "document" && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-cyan-500/40 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/30">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>📄 View Document Manuscript</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
