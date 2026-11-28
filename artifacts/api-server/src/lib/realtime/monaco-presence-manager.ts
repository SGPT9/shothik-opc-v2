import crypto from "crypto";

export interface MonacoCursorPosition {
  lineNumber: number;
  column: number;
}

export interface MonacoSelectionBounds {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface CollaboratorColor {
  colorHex: string;
  label: string;
}

export interface RemoteCursorPayload {
  userId: string;
  userName: string;
  projectId: string;
  position: MonacoCursorPosition;
  selection?: MonacoSelectionBounds;
  color: CollaboratorColor;
  timestamp: number;
}

export interface DualLanguageScrollSyncPayload {
  userId: string;
  sourceParagraphId: string;
  targetParagraphId: string;
  scrollRatio: number;
  timestamp: number;
}

export interface WordCountTelepathyPayload {
  userId: string;
  projectId: string;
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
  timestamp: number;
}

const COLLABORATOR_PALETTE: CollaboratorColor[] = [
  { colorHex: "#2563EB", label: "Blue" },
  { colorHex: "#7C3AED", label: "Violet" },
  { colorHex: "#059669", label: "Emerald" },
  { colorHex: "#D97706", label: "Amber" },
  { colorHex: "#DC2626", label: "Crimson" },
  { colorHex: "#DB2777", label: "Pink" },
  { colorHex: "#0891B2", label: "Cyan" },
  { colorHex: "#4F46E5", label: "Indigo" },
];

export class MonacoPresenceManager {
  private lastBroadcastByUser: Map<string, number> = new Map();
  private throttleIntervalMs: number;

  constructor(throttleIntervalMs: number = 30) {
    this.throttleIntervalMs = throttleIntervalMs;
  }

  /**
   * Deterministically maps any userId to a color in the palette
   */
  static getUserColor(userId: string): CollaboratorColor {
    const hash = crypto.createHash("md5").update(userId).digest();
    const index = hash.readUInt16BE(0) % COLLABORATOR_PALETTE.length;
    return COLLABORATOR_PALETTE[index];
  }

  /**
   * Formats a remote cursor broadcast payload with selection and collaborator styling
   */
  static formatCursorPayload(params: {
    userId: string;
    userName: string;
    projectId: string;
    lineNumber: number;
    column: number;
    selection?: MonacoSelectionBounds;
    timestamp?: number;
  }): RemoteCursorPayload {
    return {
      userId: params.userId,
      userName: params.userName,
      projectId: params.projectId,
      position: {
        lineNumber: params.lineNumber,
        column: params.column,
      },
      selection: params.selection,
      color: MonacoPresenceManager.getUserColor(params.userId),
      timestamp: params.timestamp ?? Date.now(),
    };
  }

  /**
   * Formats a dual-language paragraph scroll alignment payload for split-screen sync
   */
  static formatScrollSyncPayload(params: {
    userId: string;
    sourceParagraphId: string;
    targetParagraphId: string;
    scrollRatio: number;
    timestamp?: number;
  }): DualLanguageScrollSyncPayload {
    return {
      userId: params.userId,
      sourceParagraphId: params.sourceParagraphId,
      targetParagraphId: params.targetParagraphId,
      scrollRatio: params.scrollRatio,
      timestamp: params.timestamp ?? Date.now(),
    };
  }

  /**
   * Formats live telepathy metrics (word count, reading time)
   */
  static formatTelepathyPayload(params: {
    userId: string;
    projectId: string;
    text: string;
  }): WordCountTelepathyPayload {
    const words = params.text.trim() ? params.text.trim().split(/\s+/).length : 0;
    const chars = params.text.length;
    // Average reading speed ~200 words per minute for Bengali/English
    const readingTime = Math.ceil(words / 200);

    return {
      userId: params.userId,
      projectId: params.projectId,
      wordCount: words,
      charCount: chars,
      readingTimeMinutes: readingTime,
      timestamp: Date.now(),
    };
  }

  /**
   * Rate limits broadcast events per user to avoid flooding WebSocket / Realtime channels
   */
  shouldBroadcastCursor(userId: string, now: number = Date.now()): boolean {
    const last = this.lastBroadcastByUser.get(userId) || 0;
    if (now - last >= this.throttleIntervalMs) {
      this.lastBroadcastByUser.set(userId, now);
      return true;
    }
    return false;
  }
}
