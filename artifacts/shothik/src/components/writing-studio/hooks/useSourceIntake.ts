import { useState, useCallback } from "react";

export interface ProjectSource {
  id: string;
  type: "pdf" | "url" | "youtube" | "text";
  title: string;
  text: string;
  preview: string;
}

export function useSourceIntake(initialSources: ProjectSource[] = [], maxSources: number = 5) {
  const [sources, setSources] = useState<ProjectSource[]>(initialSources);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addSource = useCallback(
    (newSource: ProjectSource) => {
      if (sources.length >= maxSources) {
        setError(`Maximum limit of ${maxSources} sources reached.`);
        return false;
      }
      setSources((prev) => [...prev, newSource]);
      setError(null);
      return true;
    },
    [maxSources, sources.length]
  );

  const removeSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setError(null);
  }, []);

  const clearSources = useCallback(() => {
    setSources([]);
    setError(null);
  }, []);

  return {
    sources,
    isLoading,
    loadingLabel,
    error,
    addSource,
    removeSource,
    clearSources,
    setIsLoading,
    setLoadingLabel,
    setError,
  };
}
