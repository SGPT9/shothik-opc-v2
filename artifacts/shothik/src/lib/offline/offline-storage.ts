import type { ChatMessage } from "../chat/types";

export type SyncStatus = "synced" | "pending_upload" | "conflict";

export interface OfflineDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  syncedWithCloud?: boolean;
  versionVector?: Record<string, number>;
}

export interface OfflineTranscript {
  conversationId: string;
  messages: ChatMessage[];
  updatedAt: number;
  syncStatus: SyncStatus;
  versionVector?: Record<string, number>;
}

export type OutboxItemType =
  | "courier_dispatch"
  | "mfs_verify"
  | "webhook_event"
  | "chat_turn"
  | "document_save";

export type OutboxItemStatus = "queued" | "in_flight" | "completed" | "failed";

export interface OutboxItem {
  id: string;
  type: OutboxItemType;
  payload: Record<string, any>;
  retryCount: number;
  status: OutboxItemStatus;
  createdAt: number;
  lastAttemptAt?: number;
  error?: string;
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

// ── In-Memory Caches ────────────────────────────────────────────────────────
const DOC_CACHE = new Map<string, OfflineDocument>();
const TRANSCRIPT_CACHE = new Map<string, OfflineTranscript>();
const OUTBOX_CACHE = new Map<string, OutboxItem>();
const TASK_CACHE = new Map<string, OfflineTask>();

// ── Manuscripts / Documents ────────────────────────────────────────────────
export function saveOfflineManuscript(doc: OfflineDocument): void {
  DOC_CACHE.set(doc.id, { ...doc, updatedAt: doc.updatedAt || Date.now() });

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(`shothik_offline_doc_${doc.id}`, JSON.stringify(doc));
    } catch {}
  }
}

export function getOfflineManuscript(id: string): OfflineDocument | undefined {
  if (DOC_CACHE.has(id)) {
    return DOC_CACHE.get(id);
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data = window.localStorage.getItem(`shothik_offline_doc_${id}`);
      if (data) {
        const parsed = JSON.parse(data);
        DOC_CACHE.set(id, parsed);
        return parsed;
      }
    } catch {}
  }

  return undefined;
}

export function listOfflineManuscripts(): OfflineDocument[] {
  const docs: OfflineDocument[] = [];

  if (DOC_CACHE.size > 0) {
    docs.push(...Array.from(DOC_CACHE.values()));
  } else if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("shothik_offline_doc_")) {
          const item = window.localStorage.getItem(key);
          if (item) docs.push(JSON.parse(item));
        }
      }
    } catch {}
  }

  return docs.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteOfflineManuscript(id: string): void {
  DOC_CACHE.delete(id);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(`shothik_offline_doc_${id}`);
    } catch {}
  }
}

// ── Chat Transcripts ────────────────────────────────────────────────────────
export function saveOfflineTranscript(transcript: OfflineTranscript): void {
  TRANSCRIPT_CACHE.set(transcript.conversationId, {
    ...transcript,
    updatedAt: transcript.updatedAt || Date.now(),
  });

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(
        `shothik_offline_transcript_${transcript.conversationId}`,
        JSON.stringify(transcript)
      );
    } catch {}
  }
}

export function getOfflineTranscript(conversationId: string): OfflineTranscript | undefined {
  if (TRANSCRIPT_CACHE.has(conversationId)) {
    return TRANSCRIPT_CACHE.get(conversationId);
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data = window.localStorage.getItem(`shothik_offline_transcript_${conversationId}`);
      if (data) {
        const parsed = JSON.parse(data);
        TRANSCRIPT_CACHE.set(conversationId, parsed);
        return parsed;
      }
    } catch {}
  }

  return undefined;
}

export function listOfflineTranscripts(): OfflineTranscript[] {
  const transcripts: OfflineTranscript[] = [];

  if (TRANSCRIPT_CACHE.size > 0) {
    transcripts.push(...Array.from(TRANSCRIPT_CACHE.values()));
  } else if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("shothik_offline_transcript_")) {
          const item = window.localStorage.getItem(key);
          if (item) transcripts.push(JSON.parse(item));
        }
      }
    } catch {}
  }

  return transcripts.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteOfflineTranscript(conversationId: string): void {
  TRANSCRIPT_CACHE.delete(conversationId);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(`shothik_offline_transcript_${conversationId}`);
    } catch {}
  }
}

export function markTranscriptSynced(conversationId: string): void {
  const t = getOfflineTranscript(conversationId);
  if (t) {
    saveOfflineTranscript({ ...t, syncStatus: "synced", updatedAt: Date.now() });
  }
}

// ── Outbox Synchronization Queue ───────────────────────────────────────────
export function enqueueOutbox(item: OutboxItem): void {
  OUTBOX_CACHE.set(item.id, item);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(`shothik_outbox_${item.id}`, JSON.stringify(item));
    } catch {}
  }
}

export function getOutboxItem(id: string): OutboxItem | undefined {
  if (OUTBOX_CACHE.has(id)) {
    return OUTBOX_CACHE.get(id);
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data = window.localStorage.getItem(`shothik_outbox_${id}`);
      if (data) {
        const parsed = JSON.parse(data);
        OUTBOX_CACHE.set(id, parsed);
        return parsed;
      }
    } catch {}
  }

  return undefined;
}

export function listOutbox(statusFilter?: OutboxItemStatus): OutboxItem[] {
  const items: OutboxItem[] = [];

  if (OUTBOX_CACHE.size > 0) {
    items.push(...Array.from(OUTBOX_CACHE.values()));
  } else if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("shothik_outbox_")) {
          const item = window.localStorage.getItem(key);
          if (item) items.push(JSON.parse(item));
        }
      }
    } catch {}
  }

  const sorted = items.sort((a, b) => a.createdAt - b.createdAt);
  if (statusFilter) {
    return sorted.filter((item) => item.status === statusFilter);
  }
  return sorted;
}

export function updateOutboxItem(id: string, updates: Partial<OutboxItem>): void {
  const current = getOutboxItem(id);
  if (current) {
    const updated = { ...current, ...updates };
    OUTBOX_CACHE.set(id, updated);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(`shothik_outbox_${id}`, JSON.stringify(updated));
      } catch {}
    }
  }
}

export function deleteOutboxItem(id: string): void {
  OUTBOX_CACHE.delete(id);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(`shothik_outbox_${id}`);
    } catch {}
  }
}

export function clearOutbox(): void {
  OUTBOX_CACHE.clear();

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("shothik_outbox_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {}
  }
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export function saveOfflineTask(task: OfflineTask): void {
  TASK_CACHE.set(task.id, { ...task, updatedAt: task.updatedAt || Date.now() });

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(`shothik_offline_task_${task.id}`, JSON.stringify(task));
    } catch {}
  }
}

export function listOfflineTasks(): OfflineTask[] {
  const tasks: OfflineTask[] = [];

  if (TASK_CACHE.size > 0) {
    tasks.push(...Array.from(TASK_CACHE.values()));
  } else if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("shothik_offline_task_")) {
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

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(`shothik_offline_task_${id}`);
    } catch {}
  }
}

// ── Global Reset ───────────────────────────────────────────────────────────
export function clearOfflineStorage(): void {
  DOC_CACHE.clear();
  TRANSCRIPT_CACHE.clear();
  OUTBOX_CACHE.clear();
  TASK_CACHE.clear();

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (
          key &&
          (key.startsWith("shothik_offline_") || key.startsWith("shothik_outbox_"))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {}
  }
}


