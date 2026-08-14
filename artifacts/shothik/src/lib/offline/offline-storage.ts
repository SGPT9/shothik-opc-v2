/**
 * Offline-First Storage & Synchronization Engine
 * Provides persistent local caching for manuscripts, tasks, and Needle 2 micro-tools
 * on low-RAM mobile devices with intermittent or 0 network connectivity.
 */

export interface OfflineDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  syncedWithCloud?: boolean;
}

const MEMORY_CACHE = new Map<string, OfflineDocument>();

export function saveOfflineManuscript(doc: OfflineDocument): void {
  MEMORY_CACHE.set(doc.id, { ...doc, updatedAt: doc.updatedAt || Date.now() });

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`shothik_offline_doc_${doc.id}`, JSON.stringify(doc));
    } catch {
      // Gracefully handle storage quota limits
    }
  }
}

export function getOfflineManuscript(id: string): OfflineDocument | undefined {
  if (MEMORY_CACHE.has(id)) {
    return MEMORY_CACHE.get(id);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(`shothik_offline_doc_${id}`);
      if (data) {
        const parsed = JSON.parse(data);
        MEMORY_CACHE.set(id, parsed);
        return parsed;
      }
    } catch {}
  }

  return undefined;
}

export function listOfflineManuscripts(): OfflineDocument[] {
  const docs: OfflineDocument[] = [];

  if (MEMORY_CACHE.size > 0) {
    docs.push(...Array.from(MEMORY_CACHE.values()));
  } else if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('shothik_offline_doc_')) {
          const item = window.localStorage.getItem(key);
          if (item) docs.push(JSON.parse(item));
        }
      }
    } catch {}
  }

  return docs.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteOfflineManuscript(id: string): void {
  MEMORY_CACHE.delete(id);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(`shothik_offline_doc_${id}`);
    } catch {}
  }
}

export function clearOfflineStorage(): void {
  MEMORY_CACHE.clear();

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.startsWith('shothik_offline_doc_') || key.startsWith('shothik_offline_task_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {}
  }
}

export interface OfflineTask {
  id: string;
  title: string;
  category: string;
  status: string;
  urgency?: string;
  cost?: string;
  dependencies?: string[];
  updatedAt: number;
}

const TASK_CACHE = new Map<string, OfflineTask>();

export function saveOfflineTask(task: OfflineTask): void {
  TASK_CACHE.set(task.id, { ...task, updatedAt: task.updatedAt || Date.now() });

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`shothik_offline_task_${task.id}`, JSON.stringify(task));
    } catch {}
  }
}

export function listOfflineTasks(): OfflineTask[] {
  const tasks: OfflineTask[] = [];

  if (TASK_CACHE.size > 0) {
    tasks.push(...Array.from(TASK_CACHE.values()));
  } else if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('shothik_offline_task_')) {
          const item = window.localStorage.getItem(key);
          if (item) tasks.push(JSON.parse(item));
        }
      }
    } catch {}
  }

  return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteOfflineTask(id: string): void {
  TASK_CACHE.delete(id);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(`shothik_offline_task_${id}`);
    } catch {}
  }
}

