import { NextResponse } from "next/server";

export interface ScheduledAgentTask {
  id: string;
  title: string;
  role: "Strategy" | "Engineering" | "Comms" | "Ops";
  scheduleTime: string;
  status: "scheduled" | "running" | "completed" | "failed";
  targetOutput: string;
  createdAt: string;
}

const mockTasks: ScheduledAgentTask[] = [
  {
    id: "task-opt-01",
    title: "Overnight Code & Performance Optimization",
    role: "Engineering",
    scheduleTime: "Daily at 02:00 AM",
    status: "completed",
    targetOutput: "Audit bundle sizes and auto-optimize database query indexes.",
    createdAt: "2026-08-06T02:00:00Z",
  },
  {
    id: "task-res-02",
    title: "Competitor Intelligence & Deep Research",
    role: "Strategy",
    scheduleTime: "Daily at 04:00 AM",
    status: "completed",
    targetOutput: "Synthesize research and generate Hermes 10-slide strategy deck.",
    createdAt: "2026-08-06T04:00:00Z",
  },
  {
    id: "task-comm-03",
    title: "Inbox & Customer Support Digest Synthesis",
    role: "Comms",
    scheduleTime: "Every 4 Hours",
    status: "running",
    targetOutput: "Draft responses for priority incoming investor & user emails.",
    createdAt: "2026-08-06T12:00:00Z",
  },
];

let tasksState = [...mockTasks];

export async function GET() {
  return NextResponse.json({
    success: true,
    tasks: tasksState,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, role, scheduleTime, targetOutput } = body;

    if (!title || !role || !scheduleTime) {
      return NextResponse.json({ success: false, error: "Missing required task parameters" }, { status: 400 });
    }

    const newTask: ScheduledAgentTask = {
      id: `task-${Date.now()}`,
      title,
      role: role as ScheduledAgentTask["role"],
      scheduleTime,
      status: "scheduled",
      targetOutput: targetOutput || "Automated background summary",
      createdAt: new Date().toISOString(),
    };

    tasksState.unshift(newTask);

    return NextResponse.json({
      success: true,
      task: newTask,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
