"use client";

import { useState } from "react";
import { FileText, Download, Sparkles, Bold, Italic, List, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocArtifactProps {
  initialTitle?: string;
  initialContent?: string;
  isStreaming?: boolean;
}

export function DocArtifact({
  initialTitle = "Shothik Executive Business Briefing",
  initialContent = `Executive Briefing: Regional Market Entry Strategy

1. Core Problem Statement
High cash-on-delivery (COD) reconciliation friction and inventory stockouts affect 68% of regional merchants in South Asia.

2. Proposed AI BaaS Solution
Deploying Shothik's dual-pane workspace backed by InsForge Postgres BaaS and real-time SSE streaming engine reduces operational friction by 75%.

3. Financial & Revenue Projections
Targeting $2.4B Addressable Market with 75.4% gross margin and 3.2-month payback period.`,
  isStreaming = false,
}: DocArtifactProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-violet-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs font-bold text-slate-200 bg-transparent outline-none truncate border-b border-transparent hover:border-slate-700 focus:border-violet-500"
          />
          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30 text-[10px] font-mono">
            Document Writer
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-7 px-2.5 text-[11px] font-semibold border-slate-800 text-slate-300 hover:bg-slate-800 gap-1"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Download className="h-3 w-3 text-violet-400" />}
            {copied ? "Copied" : "Export Markdown"}
          </Button>
        </div>
      </div>

      {/* Rich Document Stage */}
      <div className="flex-1 min-h-0 p-6 overflow-auto bg-slate-950">
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono text-violet-400 uppercase font-bold tracking-wider">
              Rich Document Brief • Draft v3
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {content.split(" ").length} words
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[350px] bg-transparent resize-none outline-none font-sans text-sm text-slate-200 leading-relaxed selection:bg-violet-500/30"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
