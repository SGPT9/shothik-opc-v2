/**
 * Agent Team, Scheduler, and Memory API Service Adapter
 * Connects frontend surfaces to Express /api/agents, /api/schedule, /api/memory
 */

import api from "@/lib/api";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description?: string;
  policy?: "auto" | "manual";
}

export interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  payload?: any;
}

export interface MemoryChunk {
  id: string;
  content: string;
  category?: string;
  score?: number;
  createdAt?: number;
}

// ========== Agent Roster APIs ==========

export async function fetchAgents(): Promise<Agent[]> {
  try {
    const res = await api.get<Agent[]>("/api/agents");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.warn("[agent-team.service] Fallback to in-memory agent roster:", error);
    return [
      { id: "agent_dev_01", name: "Dev Specialist", role: "Full-stack code generation and refactoring", policy: "auto" },
      { id: "agent_qa_01", name: "QA & Audit Bot", role: "Automated regression testing and test verification", policy: "manual" },
      { id: "agent_ops_01", name: "Ops & SRE Bot", role: "Deployment, canary release, and health monitoring", policy: "auto" },
    ];
  }
}

export async function createAgent(payload: {
  name: string;
  role: string;
  description?: string;
  policy?: "auto" | "manual";
}): Promise<Agent> {
  const res = await api.post<Agent>("/api/agents", payload);
  return res.data;
}

export async function fetchAgent(id: string): Promise<Agent> {
  const res = await api.get<Agent>(`/api/agents/${id}`);
  return res.data;
}

// ========== Scheduler APIs ==========

export async function fetchScheduledTasks(): Promise<ScheduledTask[]> {
  try {
    const res = await api.get<ScheduledTask[]>("/api/schedule");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.warn("[agent-team.service] Fallback to scheduled tasks:", error);
    return [
      { id: "sched_01", name: "Daily Morning Digest & Founder Briefing", cron: "0 9 * * *", enabled: true },
      { id: "sched_02", name: "Hourly Courier RTO & DSR Arbitrage Sync", cron: "0 * * * *", enabled: true },
    ];
  }
}

export async function createScheduledTask(payload: {
  name: string;
  cron: string;
  enabled?: boolean;
  payload?: any;
}): Promise<ScheduledTask> {
  const res = await api.post<ScheduledTask>("/api/schedule", payload);
  return res.data;
}

export async function toggleScheduledTask(id: string, enabled: boolean): Promise<ScheduledTask> {
  const res = await api.patch<ScheduledTask>(`/api/schedule/${id}`, { enabled });
  return res.data;
}

// ========== Memory Search APIs ==========

export async function searchMemories(query: string = ""): Promise<MemoryChunk[]> {
  try {
    const res = await api.get<MemoryChunk[]>(`/api/memory/search?q=${encodeURIComponent(query)}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.warn("[agent-team.service] Fallback memories:", error);
    return [
      { id: "mem_01", content: "Company prefers English + Bangla bilingual invoices (Mushak 6.3)", category: "preference" },
      { id: "mem_02", content: "Steadfast Courier API key configured with Dhaka Dhanmondi pickup hub", category: "fact" },
      { id: "mem_03", content: "Payment default gateway set to bKash PGW with OTP auto-verify", category: "preference" },
    ];
  }
}
