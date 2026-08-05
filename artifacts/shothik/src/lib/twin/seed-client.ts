/**
 * Client for the server-persisted Twin workspace seed (/api/twin/seed).
 *
 * Identity: signed-in users send their Bearer token (verified server-side so
 * the workspace follows the account across devices); guests are identified
 * by the stable chat device id.
 */
import { getGuestDeviceId } from '@/lib/chat/guest-device-id';

export interface SeedTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface SeedData {
  companyName: string;
  summary: string;
  businessPlan: string;
  tasks: SeedTask[];
}

export interface SavedSeed extends SeedData {
  conversationId: string;
  revision: number;
  updatedAt: string;
}

export function seedHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const deviceId = getGuestDeviceId();
  if (deviceId) headers['x-chat-device-id'] = deviceId;
  try {
    const token = localStorage.getItem('accessToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // localStorage unavailable — proceed as guest.
  }
  return headers;
}

function parseSaved(json: unknown): SavedSeed | null {
  const data = (json as { data?: SavedSeed } | null)?.data;
  if (!data || typeof data.companyName !== 'string' || !Array.isArray(data.tasks)) return null;
  return {
    conversationId: data.conversationId,
    companyName: data.companyName,
    summary: typeof data.summary === 'string' ? data.summary : '',
    businessPlan: typeof data.businessPlan === 'string' ? data.businessPlan : '',
    tasks: data.tasks
      .filter((t) => t && typeof t.title === 'string')
      .map((t, i) => ({
        id: typeof t.id === 'number' ? t.id : i + 1,
        title: t.title,
        completed: t.completed === true,
      })),
    revision: typeof data.revision === 'number' ? data.revision : 0,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date(0).toISOString(),
  };
}

/** Load the seed persisted on the server for a conversation (or latest). */
export async function loadServerSeed(conversationId?: string): Promise<SavedSeed | null> {
  try {
    const query = conversationId
      ? `?conversationId=${encodeURIComponent(conversationId)}`
      : '';
    const res = await fetch(`/api/twin/seed${query}`, {
      credentials: 'same-origin',
      headers: seedHeaders(),
    });
    if (!res.ok) return null;
    return parseSaved(await res.json().catch(() => null));
  } catch {
    return null;
  }
}

// Saves are serialized so an older request cannot finish after — and clobber
// — a newer one; the server additionally rejects lower-revision writes.
let saveChain: Promise<unknown> = Promise.resolve();

/**
 * Persist edits server-side so they survive this browser. Returns whether
 * the save reached the server; callers surface failures and retry.
 */
export function saveServerSeed(
  conversationId: string,
  seed: SeedData,
  revision: number,
): Promise<boolean> {
  const attempt = saveChain.then(async () => {
    try {
      const res = await fetch('/api/twin/seed', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: seedHeaders(),
        body: JSON.stringify({ conversationId, revision, ...seed }),
      });
      return res.ok;
    } catch {
      return false;
    }
  });
  saveChain = attempt;
  return attempt;
}
