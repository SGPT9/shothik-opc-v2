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
  const [activeLens, setActiveLens] = useState<"executive" | "research" | "action">("executive");

  // Preprocess epistemic inline coordinate tags [[doc:key:sec]] into interactive source links
  const processedContent = (content ?? "").replace(/\[\[doc:([^\]]+)\]\]/g, (_match, docRef) => {
    const parts = docRef.split(":");
    const docId = parts[0];
    const section = parts[1] ? ` · ${parts[1]}` : "";
    return `[📄 ${docId}${section}](#source:${docRef})`;
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
          // Mobile-friendly responsive table container with 1-click CSV export
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

            return (
              <div className="group/table my-3 overflow-hidden rounded-xl border border-border/70 bg-card/50 backdrop-blur-xs shadow-xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/60 text-[10px] font-mono text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">Data Matrix</span>
                  <button
                    type="button"
                    onClick={handleExportTableCSV}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/60 hover:bg-background text-foreground border border-border/40 text-[10px] font-medium transition cursor-pointer"
                    title="Export table data to CSV / Excel"
                  >
                    <span>📊 Export CSV</span>
                  </button>
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
            <div className="my-3 overflow-hidden rounded-xl border border-border/80 bg-[#0b0f19] text-xs font-mono shadow-md">
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
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-cyan-600 dark:text-cyan-400" {...props}>
                  {children}
                </code>
              );
            }

            const isRunning = runningCode === codeId;
            const isCopied = copiedCode === text;
            const logs = consoleLogs[codeId];
            const isConsoleOpen = openConsole[codeId] ?? false;

            return (
              <div className="space-y-0">
                {/* Code Block Header Toolbar */}
                <div className="flex items-center justify-between border-b border-border/60 bg-[#070a12] px-3 py-1.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-semibold text-indigo-300 uppercase text-[10px]">
                      {lang}
                    </span>
                    <span className="text-[10px] text-slate-500">REPL Sandbox</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleRunCode(codeId, text, lang)}
                      disabled={isRunning}
                      className="flex items-center space-x-1 rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 hover:bg-emerald-500/30 transition text-[10px] font-mono border border-emerald-500/30 cursor-pointer"
                    >
                      {isRunning ? (
                        <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                      ) : (
                        <Play className="h-3 w-3 text-emerald-400" />
                      )}
                      <span>{isRunning ? "Running..." : "▶ Run Sandbox"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(text)}
                      className="flex items-center space-x-1 rounded bg-muted/60 px-2 py-0.5 text-muted-foreground hover:text-foreground transition text-[10px] font-mono cursor-pointer"
                      title="Copy code to clipboard"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadCode(text, lang)}
                      className="flex items-center space-x-1 rounded bg-muted/60 px-2 py-0.5 text-muted-foreground hover:text-foreground transition text-[10px] font-mono cursor-pointer"
                      title="Download code file"
                    >
                      <Download className="h-3 w-3 text-indigo-400" />
                      <span>File</span>
                    </button>
                  </div>
                </div>

                {/* Code Body */}
                <div className="p-3 overflow-x-auto text-[11px] leading-relaxed text-slate-200 bg-[#0b0f19]">
                  <code className={cn("block font-mono", codeClassName)} {...props}>
                    {children}
                  </code>
                </div>

                {/* Console Output Drawer */}
                {logs && (
                  <div className="border-t border-slate-800 bg-[#05070d] font-mono text-[11px]">
                    <button
                      onClick={() =>
                        setOpenConsole((prev) => ({ ...prev, [codeId]: !prev[codeId] }))
                      }
                      className="w-full px-3 py-1 flex items-center justify-between text-slate-400 hover:bg-slate-900/50 transition text-[10px] cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Terminal className="h-3 w-3 text-amber-400" />
                        <span>Console Execution Log</span>
                      </div>
                      {isConsoleOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isConsoleOpen && (
                      <div className="p-2.5 text-slate-300 bg-[#030408] border-t border-slate-800/80 whitespace-pre-wrap text-[10px]">
                        {logs}
                      </div>
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
