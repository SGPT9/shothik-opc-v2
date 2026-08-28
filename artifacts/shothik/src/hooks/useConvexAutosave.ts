import { useState, useEffect, useRef, useCallback } from 'react';

interface ConvexAutosaveResult {
  isSaving: boolean;
  lastCloudSave: Date | null;
  cloudError: string | null;
  cloudContent: string | null;
  cloudWordCount: number;
}

export function useConvexAutosave(
  localProjectId: string | undefined,
  content: string,
  wordCount: number,
  userId?: string
): ConvexAutosaveResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastCloudSave, setLastCloudSave] = useState<Date | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudContent, setCloudContent] = useState<string | null>(null);
  const [cloudWordCount, setCloudWordCount] = useState<number>(0);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContent = useRef<string>('');

  // Initial fetch of saved content from cloud
  useEffect(() => {
    if (!localProjectId || !userId) return;

    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/v1/writing/autosave/${encodeURIComponent(localProjectId)}`, {
          headers: {
            'x-user-id': userId,
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          setCloudContent(json.data.content || null);
          setCloudWordCount(json.data.wordCount || 0);
          if (json.data.savedAt) {
            setLastCloudSave(new Date(json.data.savedAt));
          }
        }
      } catch (err) {
        console.warn('[useConvexAutosave] Failed to load autosave snapshot:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [localProjectId, userId]);

  const save = useCallback(async (id: string, text: string, wc: number) => {
    if (text === lastSavedContent.current) return;
    setIsSaving(true);
    setCloudError(null);
    try {
      const res = await fetch('/api/v1/writing/autosave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'guest',
        },
        body: JSON.stringify({
          localProjectId: id,
          content: text,
          wordCount: wc,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Autosave failed');

      lastSavedContent.current = text;
      setLastCloudSave(new Date());
      setCloudContent(text);
      setCloudWordCount(wc);
    } catch (err: any) {
      setCloudError(err?.message || 'Cloud sync failed');
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!localProjectId || !content) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      save(localProjectId, content, wordCount);
    }, 4000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, localProjectId, wordCount, save]);

  return {
    isSaving,
    lastCloudSave,
    cloudError,
    cloudContent,
    cloudWordCount,
  };
}
