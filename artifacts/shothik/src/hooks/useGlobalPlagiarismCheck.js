import { useCallback, useMemo } from "react";

import { adaptToLegacy } from "@/adapters/LegacyPlagiarismAdapter";
import usePlagiarismReport from "./usePlagiarismReport";

const useGlobalPlagiarismCheck = (text, options) => {
  const resolvedOptions = typeof options === "object" ? options : { liveWeb: options };
  const {
    loading,
    report,
    error,
    inlineError,
    fromCache,
    triggerCheck,
    retryWithBackoff,
    manualRefresh,
    reset,
  } = usePlagiarismReport(text ?? "", resolvedOptions);

  // Adapt to legacy format for backward compatibility
  const legacyData = useMemo(() => {
    return adaptToLegacy(report);
  }, [report]);

  const runCheck = useCallback(
    (forceRefreshOrOptions = false) => {
      if (typeof forceRefreshOrOptions === "boolean") {
        return triggerCheck({ forceRefresh: forceRefreshOrOptions, liveWeb: resolvedOptions?.liveWeb });
      }
      return triggerCheck({
        liveWeb: resolvedOptions?.liveWeb,
        ...(forceRefreshOrOptions || {}),
      });
    },
    [triggerCheck, resolvedOptions?.liveWeb],
  );

  return {
    loading,
    // Legacy format (for backward compatibility)
    score: legacyData.score,
    results: legacyData.results,
    // New fields (for new components)
    exactMatches: report?.exactMatches ?? [],
    allSources: report?.sources ?? [],
    citations: report?.citations ?? [],
    language: report?.language,
    exactPlagiarismPercentage: report?.exactPlagiarismPercentage ?? null,
    totalChunks: report?.summary?.totalChunks ?? null,
    // Full report (for components that need it)
    report,
    error,
    inlineError,
    fromCache,
    reset,
    triggerCheck: runCheck,
    retryWithBackoff,
    manualRefresh: () => manualRefresh(),
  };
};

export default useGlobalPlagiarismCheck;
