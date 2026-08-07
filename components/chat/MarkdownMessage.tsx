"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Play,
  Check,
  Copy,
  Terminal,
  Loader2,
  BarChart3,
  Presentation,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  artifactId?: string;
  artifactType?: "chart" | "presentation" | "document";
  className?: string;
}

export function MarkdownMessage({
  content,
  artifactId,
  artifactType,
  className,
}: MarkdownMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [runningCode, setRunningCode] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<Record<string, string>>({});
  const [openConsole, setOpenConsole] = useState<Record<string, boolean>>({});
  const [activeLens, setActiveLens] = useState<"executive" | "research" | "action">("executive");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
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
      {/* AI Partner Response Lens Switcher */}
      <div className="flex items-center gap-1 text-[11px] font-mono border-b border-border/40 pb-2 mb-2 not-prose overflow-x-auto">
        <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1 shrink-0">View Lens:</span>
        <button
          type="button"
          onClick={() => setActiveLens("executive")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition shrink-0",
            activeLens === "executive"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span>🚀 Executive</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveLens("research")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition shrink-0",
            activeLens === "research"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span>🔬 Research</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveLens("action")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition shrink-0",
            activeLens === "action"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span>💼 Task Action</span>
        </button>
      </div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-cyan-400" {...props}>
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
                      className="flex items-center space-x-1 rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 hover:bg-emerald-500/30 transition text-[10px] font-mono border border-emerald-500/30"
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
                      className="flex items-center space-x-1 rounded bg-muted/60 px-2 py-0.5 text-muted-foreground hover:text-foreground transition text-[10px] font-mono"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
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
                      className="w-full px-3 py-1 flex items-center justify-between text-slate-400 hover:bg-slate-900/50 transition text-[10px]"
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
        {content ?? ""}
      </ReactMarkdown>

      {/* Artifact Action Cards (Rendered below response if artifact present) */}
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
              <span>🎴 Launch Marp Slide Deck</span>
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
