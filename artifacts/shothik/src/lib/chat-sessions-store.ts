/**
 * Shothik AI Unified Chat Session Store
 * Manages local session persistence, real-time cross-tab & sidebar synchronization,
 * and Perplexity-style chronological categorizations.
 */

export interface StoredChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  preview?: string;
}

const STORAGE_KEY = "shothik_chat_sessions_v2";
const EVENT_NAME = "shothik_chat_sessions_updated";

const DEFAULT_SESSIONS: StoredChatSession[] = [
  {
    id: "conv_pitch_deck",
    title: "10-Slide Investor Pitch Deck (BD E-Commerce)",
    createdAt: Date.now() - 1000 * 60 * 15, // 15 mins ago
    updatedAt: Date.now() - 1000 * 60 * 15,
    pinned: true,
    preview: "Generated 10-slide investor presentation deck...",
  },
  {
    id: "conv_tax_sro",
    title: "NBR Income Tax Act 2023 & Section 78 Rebate",
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    preview: "Fetched 15% Section 78 income tax rebate clauses...",
  },
  {
    id: "conv_mfs_settlement",
    title: "bKash & Nagad MFS Merchant Settlement API",
    createdAt: Date.now() - 1000 * 60 * 60 * 26, // Yesterday
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
    preview: "Automated TrxID webhook verification pipeline...",
  },
  {
    id: "conv_tam_logistics",
    title: "Dhaka Logistics Competitor TAM Analysis",
    createdAt: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    preview: "Pathao, eCourier and Paperfly market share breakdown...",
  },
];

export function getStoredChatSessions(): StoredChatSession[] {
  if (typeof window === "undefined") return DEFAULT_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SESSIONS));
      return DEFAULT_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SESSIONS;
  } catch (err) {
    console.error("Error reading stored chat sessions:", err);
    return DEFAULT_SESSIONS;
  }
}

export const getChatSessions = getStoredChatSessions;

export function saveChatSession(session: {
  id: string;
  title: string;
  preview?: string;
  pinned?: boolean;
}): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = getStoredChatSessions();
    const existingIdx = sessions.findIndex((s) => s.id === session.id);
    const now = Date.now();

    let updated: StoredChatSession[];
    if (existingIdx >= 0) {
      updated = [...sessions];
      updated[existingIdx] = {
        ...updated[existingIdx],
        title: session.title || updated[existingIdx].title,
        preview: session.preview !== undefined ? session.preview : updated[existingIdx].preview,
        pinned: session.pinned !== undefined ? session.pinned : updated[existingIdx].pinned,
        updatedAt: now,
      };
    } else {
      const newSession: StoredChatSession = {
        id: session.id,
        title: session.title || "Untitled Session",
        createdAt: now,
        updatedAt: now,
        pinned: !!session.pinned,
        preview: session.preview,
      };
      updated = [newSession, ...sessions];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  } catch (err) {
    console.error("Error saving chat session:", err);
  }
}

export function deleteChatSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = getStoredChatSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: filtered }));
  } catch (err) {
    console.error("Error deleting chat session:", err);
  }
}

export function pinChatSession(id: string, pinned: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = getStoredChatSessions();
    const updated = sessions.map((s) => (s.id === id ? { ...s, pinned } : s));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  } catch (err) {
    console.error("Error pinning chat session:", err);
  }
}

export function renameChatSession(id: string, newTitle: string): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = getStoredChatSessions();
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  } catch (err) {
    console.error("Error renaming chat session:", err);
  }
}

export function subscribeToChatSessions(callback: (sessions: StoredChatSession[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleEvent = (event: Event) => {
    const custom = event as CustomEvent<StoredChatSession[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredChatSessions());
    }
  };

  window.addEventListener(EVENT_NAME, handleEvent);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredChatSessions());
    }
  });

  return () => {
    window.removeEventListener(EVENT_NAME, handleEvent);
  };
}

export const subscribeChatSessions = subscribeToChatSessions;
