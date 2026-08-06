import { NextResponse } from "next/server";

export interface AgentActivityEvent {
  id: string;
  timestamp: string;
  role: "Strategy" | "Engineering" | "Comms" | "Ops";
  message: string;
  level: "info" | "success" | "warning";
}

const mockActivity: AgentActivityEvent[] = [
  {
    id: "act-101",
    timestamp: "2026-08-06T13:30:12Z",
    role: "Engineering",
    message: "TypeScript strict verification completed with 0 errors across 450+ files.",
    level: "success",
  },
  {
    id: "act-102",
    timestamp: "2026-08-06T13:25:04Z",
    role: "Strategy",
    message: "OpenSearch-VL deep research stream parsed 18 academic papers for slide generation.",
    level: "info",
  },
  {
    id: "act-103",
    timestamp: "2026-08-06T13:10:45Z",
    role: "Ops",
    message: "InsForge Postgres database backup and replica synchronization verified clean.",
    level: "success",
  },
  {
    id: "act-104",
    timestamp: "2026-08-06T12:45:00Z",
    role: "Comms",
    message: "LiveKit WebRTC orb state synchronized with header composer UI.",
    level: "info",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    activity: mockActivity,
  });
}
