/**
 * Twin Dashboard Unified Type Definitions.
 * Supports both Book Writing/Publishing AND OPC Startup Business Growth.
 * Retains 100% of existing functionality while enabling startup features.
 */

export type TaskStatus = "todo" | "in_progress" | "completed" | "rejected" | "failed";

export type TaskCategory =
  | "Research"
  | "Draft"
  | "Edit"
  | "Publish"
  | "Market"
  | "Strategy"
  | "Product"
  | "Growth"
  | "Finance"
  | "Legal";

export interface TwinTaskMock {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  schedule?: string;
  cost: string;
  status: TaskStatus;
  failureReason?: string;
}

export type DocKind =
  | "Research Report"
  | "Chapter Draft"
  | "Outline"
  | "Progress Report"
  | "Market Analysis"
  | "Strategy Doc"
  | "Pitch Deck"
  | "Financial Model"
  | "Business Plan"
  | "Legal Doc"
  | "Growth Report";

export interface TwinDocMock {
  id: string;
  title: string;
  kind: DocKind;
  updated: string;
  versions: { id: string; message: string; time: string; current?: boolean }[];
  /** Markdown body for real (server-persisted) documents. */
  content?: string;
}

export interface FeedEntry {
  id: string;
  time: string;
  text: string;
  fromUser?: boolean;
  thoughtDuration?: number;
  dayGroup?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
}

export interface ProgressStats {
  wordsWritten?: string;
  sourcesVerified?: string;
  chaptersDrafted?: string;
  visitors?: number;
  revenue?: string;
  setupPayments?: string;
  tasksDone?: number;
  reports?: number;
  docs?: number;
}

export interface GrowthChannel {
  id: string;
  title: string;
  description: string;
  action: string;
  actionType: "connect" | "toggle" | "run" | "link";
  autoEnabled?: boolean;
  creditCost?: number;
  href?: string;
  status?: string;
  ready?: boolean;
}
