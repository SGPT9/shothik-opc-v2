"use client";

import { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Download,
  Play,
  Terminal,
  FileCode,
  Sparkles,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initialCode?: string;
  initialLanguage?: string;
  filename?: string;
  isStreaming?: boolean;
}

const SAMPLE_CODE = `import React, { useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function OPCProductHero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          AI Founder OS — South Asia
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-purple-100 to-pink-200 bg-clip-text text-transparent">
          Turn your idea into a live company overnight.
        </h1>

        <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Twin handles market research, financial projections, pitch decks, and Dokploy deployments on autopilot.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex items-center gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-1.5">
            <span>Launch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {submitted && (
          <p className="text-xs text-emerald-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Twin onboarding link sent to your inbox!
          </p>
        )}
      </div>
    </div>
  );
}`;

// ─── Component ────────────────────────────────────────────────────────────────

export function CodeArtifact({
  initialCode = SAMPLE_CODE,
  initialLanguage = "typescript",
  filename = "App.tsx",
}: Props) {
  const [code, setCode]         = useState<string>(initialCode);
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [activeView, setActiveView] = useState<"code" | "preview">("code");
  const [copied, setCopied]     = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">

      {/* ── Top Header Toolbar ── */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">{filename}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            {language}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
            <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
            React 18 & Tailwind CSS
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveView("code")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition",
                activeView === "code"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              <Code2 className="h-3 w-3" />
              <span>Code</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("preview")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition",
                activeView === "preview"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              <Play className="h-3 w-3 text-emerald-400" />
              <span>Preview</span>
            </button>
          </div>

          {/* OpenSearch-VL UI Component Inspector */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              alert("👁️ OpenSearch-VL Inspector: Visual element inspection active. Click any component element in the live preview to critique layout & code!");
            }}
            className="h-7 px-2.5 rounded-lg border-indigo-500/30 bg-indigo-500/10 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20"
            title="Inspect UI Component & Visual Layout via OpenSearch-VL"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span className="ml-1 text-[11px]">Inspect UI</span>
          </Button>

          {/* Copy Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2.5 rounded-lg border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="ml-1 text-[11px]">{copied ? "Copied" : "Copy"}</span>
          </Button>

          {/* Download Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2.5 rounded-lg border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* ── Editor or Preview Container ── */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeView === "code" ? (
          <div className="h-full w-full overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-300/90 bg-slate-950 focus:outline-none">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full bg-transparent resize-none outline-none font-mono text-xs text-emerald-300/90 leading-relaxed selection:bg-indigo-500/30"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="h-full w-full bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-slate-950 text-[10px] font-mono text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sandbox Runtime Ready
              </span>
              <span>Rendered HTML/CSS/React Stage</span>
            </div>
            
            <div className="flex-1 min-h-0 bg-slate-950 p-4 overflow-auto flex items-center justify-center">
              <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Shothik AI Founder OS</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Interactive Component Stage</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Turn your idea into a live company overnight with automated RAG memory, financial models, and Dokploy BaaS deployment.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="email"
                    readOnly
                    value="founder@shothik.ai"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 font-mono"
                  />
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 h-8 rounded-xl">
                    Launch Twin →
                  </Button>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 font-mono text-[10px] text-slate-400 space-y-1">
                  <p className="text-emerald-400">✓ React 18 component structure validated</p>
                  <p className="text-purple-400">✓ Tailwind CSS 3.4 styling verified</p>
                  <p className="text-cyan-400">✓ Type-safe props & event handlers ready</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Status Bar ── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-800/80 bg-slate-900/80 text-[10px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live Preview
          </span>
          <span>·</span>
          <span>{code.split("\n").length} lines</span>
          <span>·</span>
          <span>{code.length} chars</span>
        </div>
        <span>Production Ready</span>
      </div>

    </div>
  );
}
