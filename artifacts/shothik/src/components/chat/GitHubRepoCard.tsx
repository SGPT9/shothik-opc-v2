import { useState, useCallback } from "react";
import { GitFork, Copy, Check, Download, GitPullRequest, ExternalLink, AlertCircle } from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";

// ── Loading orb + steps (mirrors the standalone app) ─────────────────────────
const STEPS = [
  "Fetching repository metadata",
  "Exploring file structure",
  "Reading README & docs",
  "Synthesizing AI prompt",
] as const;

function AnalysisLoader() {
  return (
    <div className="flex flex-col items-center py-8 gap-6">
      {/* Orb */}
      <div className="relative w-14 h-14">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 35%, #818cf8, #4f46e5 60%, #1e1b4b)",
            boxShadow: "0 0 32px rgba(99,102,241,0.5), 0 0 8px rgba(99,102,241,0.3)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "rgba(165,180,252,0.8)",
            borderRightColor: "rgba(165,180,252,0.3)",
            animation: "spin 1.4s linear infinite",
          }}
        />
      </div>

      {/* Title */}
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">
          Analyzing{" "}
          <span style={{ background: "linear-gradient(135deg,#818cf8,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Repository
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Claude is reading the codebase…</p>
      </div>

      {/* Steps */}
      <div className="w-full max-w-xs rounded-xl border border-white/[0.07] bg-black/20 overflow-hidden">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-2.5 px-3.5 py-2 border-b border-white/[0.05] last:border-0"
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            <span className="flex gap-0.5" aria-hidden>
              {[0, 1, 2].map((j) => (
                <span
                  key={j}
                  className="block h-1 w-1 rounded-full bg-indigo-400/70"
                  style={{ animation: `dotBounce 1.2s ${i * 0.18 + j * 0.15}s ease-in-out infinite` }}
                />
              ))}
            </span>
            <span className="text-[11px] text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
interface GitHubRepoCardProps {
  owner: string;
  repo: string;
  prompt: string;
  status: "loading" | "streaming" | "done" | "error";
  errorMessage?: string;
  issuesAnalysis?: string;
  issuesStatus?: "loading" | "streaming" | "done" | "error";
  onAnalyzeIssues?: () => void;
}

export function GitHubRepoCard({
  owner,
  repo,
  prompt,
  status,
  errorMessage,
  issuesAnalysis,
  issuesStatus,
  onAnalyzeIssues,
}: GitHubRepoCardProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "issues">("prompt");

  const handleCopy = useCallback(() => {
    const content = activeTab === "issues" ? issuesAnalysis : prompt;
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeTab, prompt, issuesAnalysis]);

  const handleDownload = useCallback(() => {
    const content = activeTab === "issues" ? issuesAnalysis : prompt;
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${owner}-${repo}-${activeTab}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTab, owner, repo, prompt, issuesAnalysis]);

  const showIssuesTab = issuesAnalysis || issuesStatus === "loading" || issuesStatus === "streaming";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 overflow-hidden">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]"
        style={{ background: "linear-gradient(135deg,rgba(79,70,229,0.12),rgba(99,102,241,0.06))" }}
      >
        {/* Repo badge */}
        <div className="flex items-center gap-2">
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            <GitFork className="w-3.5 h-3.5" />
            {owner}/{repo}
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          {status === "done" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              done
            </span>
          )}
          {(status === "loading" || status === "streaming") && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 animate-pulse">
              analyzing…
            </span>
          )}
        </div>

        {/* Actions */}
        {(status === "done" || status === "streaming") && prompt && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              title="Copy"
              className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownload}
              title="Download"
              className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tab switcher (only when issues tab becomes relevant) */}
      {showIssuesTab && (
        <div className="flex gap-1 px-3 pt-2">
          {(["prompt", "issues"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === tab ? "rgba(99,102,241,0.15)" : "transparent",
                border: activeTab === tab ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                color: activeTab === tab ? "#a5b4fc" : "var(--muted-foreground)",
              }}
            >
              {tab === "prompt" ? <GitFork className="w-3 h-3" /> : <GitPullRequest className="w-3 h-3" />}
              {tab === "prompt" ? "Architecture Prompt" : "Issues & PRs"}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        {/* Loading state */}
        {status === "loading" && <AnalysisLoader />}

        {/* Error state */}
        {status === "error" && (
          <div className="flex items-start gap-3 py-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Analysis failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{errorMessage || "Unknown error"}</p>
            </div>
          </div>
        )}

        {/* Content — Architecture Prompt */}
        {activeTab === "prompt" && (status === "streaming" || status === "done") && prompt && (
          <div className="text-sm leading-relaxed">
            <MarkdownMessage content={prompt} />
            {status === "streaming" && (
              <span
                className="inline-block w-[3px] h-4 ml-[3px] rounded-sm bg-indigo-400 align-middle"
                style={{ animation: "cursorBlink 0.9s step-start infinite" }}
                aria-hidden
              />
            )}
          </div>
        )}

        {/* Content — Issues & PRs */}
        {activeTab === "issues" && (
          <>
            {issuesStatus === "loading" && <AnalysisLoader />}
            {(issuesStatus === "streaming" || issuesStatus === "done") && issuesAnalysis && (
              <div className="text-sm leading-relaxed">
                <MarkdownMessage content={issuesAnalysis} />
                {issuesStatus === "streaming" && (
                  <span
                    className="inline-block w-[3px] h-4 ml-[3px] rounded-sm bg-indigo-400 align-middle"
                    style={{ animation: "cursorBlink 0.9s step-start infinite" }}
                    aria-hidden
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Analyze Issues CTA */}
        {status === "done" && !showIssuesTab && onAnalyzeIssues && (
          <div className="mt-4 pt-3 border-t border-white/[0.05]">
            <button
              onClick={() => {
                setActiveTab("issues");
                onAnalyzeIssues();
              }}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#a5b4fc",
              }}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              Analyze Issues & PRs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
