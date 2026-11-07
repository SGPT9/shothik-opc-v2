

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlagiarismReport } from "@/types/plagiarism";

import CitationAnalysisPanel from "./CitationAnalysisPanel";
import EmptyReportState from "./EmptyReportState";
import ErrorStateCard from "./ErrorStateCard";
import OriginalityBadge from "./OriginalityBadge";
import ReportSectionList from "./ReportSectionList";
import ReportSummary from "./ReportSummary";
import ScanProgress from "./ScanProgress";
import { getOriginalityScore, type PlagiarismInlineError } from "./plagiarism-modernization";

interface PlagiarismResultsPanelProps {
  open: boolean;
  onToggle: () => void;
  report: PlagiarismReport | null;
  loading: boolean;
  fromCache: boolean;
  inputText: string;
  error: string | null;
  inlineError: PlagiarismInlineError | null;
  onRetry: () => void;
  activeMatchId?: string | null;
  onSectionClick?: (matchId: string) => void;
  citationAnalysis?: any;
  elapsedTime?: number;
}

export default function PlagiarismResultsPanel({
  open,
  onToggle,
  report,
  loading,
  fromCache,
  inputText,
  error,
  inlineError,
  onRetry,
  activeMatchId,
  onSectionClick,
  citationAnalysis,
  elapsedTime,
}: PlagiarismResultsPanelProps) {
  const hasReport = Boolean(report);
  const originality = getOriginalityScore(report);
  const matchCount = (report?.sections?.length ?? 0) + (report?.exactMatches?.length ?? 0);
  const auditHash =
    (report as any)?.auditHashSha256 ||
    (report as any)?.auditHash ||
    (report as any)?.auditSealSha256;
  const hasWebMatches =
    Boolean(
      (report?.sources && report.sources.length > 0) ||
      (report?.sections?.some((s) => s.sources && s.sources.length > 0)) ||
      (report?.exactMatches?.some((s) => s.sources && s.sources.length > 0)) ||
      auditHash
    );

  const handleSectionClick = (matchId: string) => {
    onSectionClick?.(matchId);
  };

  return (
    <motion.aside
      layout
      className={cn(
        "bg-card relative min-h-0 overflow-hidden rounded-xl shadow-sm",
        open ? "w-full xl:w-[420px] 2xl:w-[460px]" : "w-full xl:w-[68px]",
      )}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      aria-label="Plagiarism results panel"
    >
      <div className="border-b border-border flex items-start justify-between gap-3 px-4 py-4">
        <div className={cn("min-w-0", !open && "sr-only")}>
          <h2 className="text-lg font-semibold text-foreground">Plagiarism results</h2>
          <p className="text-sm text-muted-foreground">
            Review originality, matched sources, and section-level similarity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {open && hasReport ? <OriginalityBadge originality={originality} /> : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={open ? "Collapse plagiarism results panel" : "Expand plagiarism results panel"}
            onClick={onToggle}
          >
            {open ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="open-panel"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="flex h-full min-h-0 flex-col"
          >
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {inlineError ? (
                <ErrorStateCard
                  message={inlineError.shortMessage}
                  description={inlineError.detailMessage}
                  onRetry={onRetry}
                  retryLabel="Retry"
                />
              ) : error ? (
                <ErrorStateCard
                  message="Could not complete scan"
                  description={error}
                  onRetry={onRetry}
                  retryLabel="Retry"
                />
              ) : null}

              {loading ? (
                <ScanProgress
                  loading={loading}
                  elapsedTime={elapsedTime}
                  estimatedTotalTime={Math.max(120, Math.min(300, Math.ceil((inputText.length || 0) / 50)))}
                />
              ) : null}

              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Similarity breakdown
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {matchCount} matched section{matchCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={loading}>
                  <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>

              {hasReport && (hasWebMatches || auditHash) ? (
                <div
                  data-testid="badge-live-web-verified"
                  className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-emerald-700 dark:text-emerald-300"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold truncate">🌐 Live Web Sources Verified</span>
                  </div>
                  {auditHash ? (
                    <span
                      className="shrink-0 rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-800 dark:text-emerald-200"
                      title={`UGC Academic Audit Hash: ${auditHash}`}
                    >
                      seal:{String(auditHash).replace(/^sha256:/, "").slice(0, 10)}...
                    </span>
                  ) : null}
                </div>
              ) : null}

              <ReportSummary report={report} loading={loading} fromCache={fromCache} />

              {hasReport ? (
                <ReportSectionList
                  sections={report?.sections ?? []}
                  exactMatches={report?.exactMatches}
                  loading={loading}
                  activeMatchId={activeMatchId}
                  onSectionClick={handleSectionClick}
                />
              ) : !loading ? (
                <EmptyReportState
                  title={inputText.trim() ? "Scan when ready" : "Start a plagiarism scan"}
                  description={
                    inputText.trim()
                      ? "Run a scan to view originality, sources, and section-level matches."
                      : "Paste or upload text to begin originality analysis."
                  }
                />
              ) : null}

              {hasReport && citationAnalysis && !loading ? (
                <CitationAnalysisPanel analysis={citationAnalysis} />
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="closed-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-[420px] items-center justify-center"
          >
            <div className="flex -rotate-90 items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>Results</span>
              {hasReport ? <OriginalityBadge originality={originality} /> : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
