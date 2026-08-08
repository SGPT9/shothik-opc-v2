import { useState, useCallback, useMemo } from "react";

export interface ChapterItem {
  id: string;
  title: string;
  synopsis: string;
  wordCount?: number;
}

export function useBookManuscript(initialChapters: ChapterItem[]) {
  const [chapters, setChapters] = useState<ChapterItem[]>(initialChapters);
  const [activeChapterId, setActiveChapterId] = useState<string>(initialChapters[0]?.id || "ch-1");

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) || chapters[0],
    [chapters, activeChapterId]
  );

  const totalWords = useMemo(
    () => chapters.reduce((acc, c) => acc + (c.wordCount || 4200), 0),
    [chapters]
  );

  const addChapter = useCallback((title: string, synopsis: string) => {
    const newId = `ch-${Date.now()}`;
    setChapters((prev) => [...prev, { id: newId, title, synopsis, wordCount: 0 }]);
    setActiveChapterId(newId);
  }, []);

  return {
    chapters,
    activeChapter,
    activeChapterId,
    totalWords,
    setActiveChapterId,
    addChapter,
    setChapters,
  };
}
