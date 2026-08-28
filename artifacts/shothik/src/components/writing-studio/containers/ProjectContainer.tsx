import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ModeSwitcherHeader } from '../navigation/ModeSwitcherHeader';
import { PolishedWriteView } from '../PolishedWriteView';
import { PublishingPage } from '../PublishingPage';
import { FormattingView } from '@/components/tools/writing-studio/workspace/FormattingView';

type Mode = 'write' | 'format' | 'publish';

interface ProjectContainerProps {
  projectId?: string;
  initialMode?: Mode;
}

const RESEARCH_SECTIONS = ['abstract', 'intro', 'lit-review', 'methodology', 'results', 'discussion', 'conclusion', 'references'];
const ASSIGNMENT_SECTIONS = ['intro', 'body-1', 'body-2', 'conclusion', 'references'];
const AUTOSAVE_DEBOUNCE_MS = 1500;
const AUTOSAVE_INTERVAL_MS = 30_000;

function collectLocalStorageSections(projectId: string): Record<string, string> {
  const sections: Record<string, string> = {};
  for (const prefix of ['research-draft', 'assignment-draft']) {
    const allSections = prefix === 'research-draft' ? RESEARCH_SECTIONS : ASSIGNMENT_SECTIONS;
    for (const sectionId of allSections) {
      const key = `${prefix}-${projectId}-${sectionId}`;
      const value = localStorage.getItem(key);
      if (value) sections[key] = value;
    }
  }
  return sections;
}

function countWordsInSections(sections: Record<string, string>): number {
  let total = 0;
  for (const html of Object.values(sections)) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || '';
    total += text.trim().split(/\s+/).filter(Boolean).length;
  }
  return total;
}

export function ProjectContainer({
  projectId,
  initialMode = 'write',
}: ProjectContainerProps) {
  const { user } = useSelector((state: any) => state.auth);
  const userId = user?._id || user?.id || '';

  const [currentMode, setCurrentMode] = useState<Mode>(initialMode);
  const [projectName, setProjectName] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [migrationDone, setMigrationDone] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [savedSections, setSavedSections] = useState<Record<string, string> | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  // Fetch project from REST backend
  useEffect(() => {
    if (!projectId || !userId) return;

    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
          headers: { 'x-user-id': userId },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && active) {
            setProjectData(json.data);
            if (json.data.title) setProjectName(json.data.title);
          }
        }
      } catch (err) {
        console.warn('[ProjectContainer] Could not fetch project from cloud:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId, userId]);

  // Fetch sections from REST backend
  useEffect(() => {
    if (!projectId || !userId) return;

    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/v1/writing/sections/${encodeURIComponent(projectId)}`, {
          headers: { 'x-user-id': userId },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && active) {
            setSavedSections(json.data);
          }
        }
      } catch (err) {
        console.warn('[ProjectContainer] Could not fetch sections from cloud:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId, userId]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (projectData && projectData.title) {
      setProjectName(projectData.title);
    } else if (projectId) {
      const savedName = localStorage.getItem(`project-name-${projectId}`);
      if (savedName) setProjectName(savedName);
    }
  }, [projectData, projectId]);

  const handleSaveToCloud = useCallback(async () => {
    if (!projectId || isSaving || !isMounted.current) return;

    setIsSaving(true);
    try {
      const sections = collectLocalStorageSections(projectId);
      const wordCount = countWordsInSections(sections);

      const promises: Promise<any>[] = [
        fetch('/api/v1/writing/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId || 'guest',
          },
          body: JSON.stringify({
            localProjectId: projectId,
            sections,
          }),
        }),
      ];

      if (projectId) {
        const flatContent = Object.values(sections).join('\n');
        promises.push(
          fetch(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId || 'guest',
            },
            body: JSON.stringify({
              content: flatContent,
              wordCount,
            }),
          })
        );
      }

      await Promise.all(promises);
      if (isMounted.current) setLastSaved(new Date());
    } catch (err) {
      console.error('[ProjectContainer] Save failed:', err);
    } finally {
      if (isMounted.current) setIsSaving(false);
    }
  }, [projectId, isSaving, userId]);

  const handleSave = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSaveToCloud();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [handleSaveToCloud]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSaving) handleSaveToCloud();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [handleSaveToCloud, isSaving]);

  // Migration from local storage to cloud
  useEffect(() => {
    if (!projectId || !userId || migrationDone) return;
    const migrationKey = `cloud-migrated-${projectId}`;
    if (localStorage.getItem(migrationKey)) {
      setMigrationDone(true);
      return;
    }
    if (savedSections === null) {
      (async () => {
        try {
          const sections = collectLocalStorageSections(projectId);
          if (Object.keys(sections).length === 0) {
            localStorage.setItem(migrationKey, '1');
            setMigrationDone(true);
            return;
          }
          await fetch('/api/v1/writing/sections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({
              localProjectId: projectId,
              sections,
            }),
          });
          localStorage.setItem(migrationKey, '1');
          if (isMounted.current) setMigrationDone(true);
        } catch (err) {
          console.error('[ProjectContainer] Migration failed:', err);
          if (isMounted.current) setMigrationDone(true);
        }
      })();
    } else {
      setMigrationDone(true);
    }
  }, [projectId, userId, savedSections, migrationDone]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) setHistoryIndex((prev) => prev - 1);
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) setHistoryIndex((prev) => prev + 1);
  }, [history, historyIndex]);

  const handleModeChange = useCallback(
    (mode: Mode) => {
      handleSaveToCloud();
      setCurrentMode(mode);
    },
    [handleSaveToCloud]
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setProjectName(newTitle);
      if (projectId) localStorage.setItem(`project-name-${projectId}`, newTitle);
    },
    [projectId]
  );

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-brand-canvas">
      <ModeSwitcherHeader
        currentMode={currentMode}
        onModeChange={handleModeChange}
        projectName={projectName}
        onSave={handleSaveToCloud}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        lastSaved={lastSaved}
        isSaving={isSaving}
      />

      <div className="flex-1 overflow-hidden">
        {currentMode === 'write' && (
          <PolishedWriteView
            bookTitle={projectName}
            project={projectData ?? ({ _id: projectId, id: projectId, title: projectName, content: '', type: 'book' } as any)}
          />
        )}

        {currentMode === 'format' && (
          <FormattingView
            project={projectData || { _id: projectId, id: projectId, title: projectName }}
          />
        )}

        {currentMode === 'publish' && (
          <PublishingPage
            project={{ id: projectId, name: projectName }}
            onBackToEditor={() => setCurrentMode('write')}
          />
        )}
      </div>
    </div>
  );
}
