"use client";

import { useState, useRef } from "react";
import { Search, Loader2, BookOpen, ExternalLink, Sparkles, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Source {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

interface ResearchResult {
  query: string;
  summary: string;
  sources: Source[];
  completedAt: number;
}

type ResearchState = "idle" | "loading" | "done" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Pre-fill query from chat context */
  initialQuery?: string;
}

export function DeepResearchArtifact({ initialQuery }: Props) {
  const [query,   setQuery]   = useState(initialQuery ?? "");
  const [state,   setState]   = useState<ResearchState>("idle");
  const [result,  setResult]  = useState<ResearchResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_DEERFLOW_BACKEND_URL ?? "http://localhost:8000";

  const handleSearch = async () => {
    if (!query.trim()) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("loading");
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), max_results: 6 }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Research backend returned ${res.status}`);

      const data = await res.json();
      setResult({
        query: query.trim(),
        summary: data.summary ?? data.answer ?? "No summary returned.",
        sources: (data.sources ?? data.results ?? []).map((s: any) => ({
          title:   s.title   ?? "Untitled",
          url:     s.url     ?? "#",
          snippet: s.snippet ?? s.content ?? "",
          domain:  (() => { try { return new URL(s.url).hostname.replace("www.", ""); } catch { return s.url; } })(),
        })),
        completedAt: Date.now(),
      });
      setState("done");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Research failed. Check that the backend is running.");
      setState("error");
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setState("idle");
  };

  const SUGGESTIONS = [
    "Latest trends in generative AI for startups",
    "How does token streaming work in LLMs?",
    "Best fundraising strategies for B2B SaaS",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="shrink-0 p-3 border-b border-border/60 bg-muted/10">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-2 focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/20 transition">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSearch(); }}
              placeholder="Research anything…"
              disabled={state === "loading"}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
              aria-label="Deep research query"
            />
          </div>
          {state === "loading" ? (
            <Button size="sm" variant="outline" onClick={handleStop}
              className="h-9 px-3 rounded-xl border-border/80 text-xs shrink-0">
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={handleSearch} disabled={!query.trim()}
              className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0">
              <Search className="h-3.5 w-3.5 mr-1" /> Search
            </Button>
          )}
        </div>

        {/* Suggestions */}
        {state === "idle" && !result && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => setQuery(s)}
                className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-indigo-400/50 transition">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">

        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-40" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Researching…</p>
              <p className="text-xs text-muted-foreground mt-0.5">Searching the web and synthesizing sources</p>
            </div>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-destructive mb-1">Research failed</p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                  Make sure the DeerFlow backend is running at <code className="font-mono">{BACKEND_URL}</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {state === "done" && result && (
          <>
            {/* Summary */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wide">AI Summary</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {result.sources.length} sources
                  </span>
                </div>
                <div className="space-y-2">
                  {result.sources.map((source, i) => (
                    <a key={i} href={source.url} target="_blank" rel="noopener noreferrer"
                      className="block rounded-xl border border-border/60 bg-card/60 p-3 hover:border-indigo-400/40 hover:bg-indigo-500/5 transition group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-300 transition">
                            {source.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{source.domain}</p>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-indigo-400 shrink-0 mt-0.5 transition" />
                      </div>
                      {source.snippet && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {source.snippet}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Idle state */}
        {state === "idle" && !result && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40">
              <Globe className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Deep Research</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Search the web and get an AI-synthesized summary with linked sources.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
