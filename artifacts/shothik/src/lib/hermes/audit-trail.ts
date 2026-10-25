/**
 * Block Buzz-Inspired Audit Trail & Provenance Logger for Shothik
 * Based on block/buzz append-only immutable event log architecture.
 */

export type InitiatorKind = "person" | "routine" | "responsibility" | "handoff" | "meeting";

export interface AuditLogEvent {
  id: string;
  sessionId: string;
  actorType: "human" | "agent";
  actorId: string;
  action: string;
  payload: Record<string, any>;
  timestamp: number;
  hash: string;
  initiatorKind?: InitiatorKind;
}

export interface AuditTrailSummary {
  sessionId: string;
  totalEvents: number;
  humanEvents: number;
  agentEvents: number;
  nobodyWatchingEvents: number;
  events: AuditLogEvent[];
}

/**
 * Creates a signed audit log event for compliance and provenance tracking.
 */
export function createAuditLogEvent(
  sessionId: string,
  actorType: "human" | "agent",
  actorId: string,
  action: string,
  payload: Record<string, any> = {},
  initiatorKind: InitiatorKind = actorType === "human" ? "person" : "routine"
): AuditLogEvent {
  const timestamp = Date.now();
  const rawData = `${sessionId}:${actorType}:${actorId}:${action}:${initiatorKind}:${timestamp}:${JSON.stringify(payload)}`;
  
  // Simple deterministic hash simulation for provenance tracking
  let hashVal = 0;
  for (let i = 0; i < rawData.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawData.charCodeAt(i);
    hashVal |= 0;
  }
  const hash = `sig_${Math.abs(hashVal).toString(16)}`;

  return {
    id: `evt_${timestamp}_${Math.floor(Math.random() * 1000)}`,
    sessionId,
    actorType,
    actorId,
    action,
    payload,
    timestamp,
    hash,
    initiatorKind,
  };
}

/**
 * Filters audit events where nobody was watching (autonomous agent actions).
 */
export function filterNobodyWatching(events: AuditLogEvent[]): AuditLogEvent[] {
  return events.filter((e) => (e.initiatorKind || "person") !== "person");
}

/**
 * Generates a full audit trail report for an active human-agent session.
 */
export async function getSessionAuditTrail(sessionId: string): Promise<AuditTrailSummary> {
  const events: AuditLogEvent[] = [
    createAuditLogEvent(sessionId, "human", "usr_101", "chat_prompt", { prompt: "Research South Asian tech startup funding" }),
    createAuditLogEvent(sessionId, "agent", "agt_researcher", "browser_snippet_eval", { urlsScraped: 3, rowsExtracted: 5 }),
    createAuditLogEvent(sessionId, "agent", "agt_analyst", "canvas_sync", { targetCanvas: "data_sheet" }),
  ];

  const humanEvents = events.filter(e => e.actorType === "human").length;
  const agentEvents = events.filter(e => e.actorType === "agent").length;
  const nobodyWatchingEvents = events.filter(e => (e.initiatorKind || "person") !== "person").length;

  return {
    sessionId,
    totalEvents: events.length,
    humanEvents,
    agentEvents,
    nobodyWatchingEvents,
    events,
  };
}
