import { useState, useCallback, useRef } from "react";

export function useWritingHistory(initialContent: string = "") {
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastSavedContent = useRef(initialContent);

  const pushHistory = useCallback(
    (newContent: string) => {
      if (newContent === lastSavedContent.current) return;
      lastSavedContent.current = newContent;

      setHistory((prev) => {
        const nextHistory = prev.slice(0, historyIndex + 1);
        return [...nextHistory, newContent];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      return history[prevIndex];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      return history[nextIndex];
    }
    return null;
  }, [history, historyIndex]);

  return {
    pushHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
