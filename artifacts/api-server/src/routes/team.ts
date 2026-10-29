// src/routes/team.ts
import { Router, Request, Response } from "express";
import { logger } from "../lib/logger";

// Simple in‑memory storage for demonstration – replace with DB in production
interface AgentSpec {
  id: string;
  name: string;
  role: string;
}
interface Team {
  id: string;
  name: string;
  agents: AgentSpec[];
  tasks: Record<string, any>; // taskId -> result or status
}

const teams = new Map<string, Team>();

const router = Router();

/** Create a new team */
router.post("/team/create", (req: Request, res: Response) => {
  const { name } = req.body ?? {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ success: false, error: "Team name required" });
  }
  const id = `team_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const team: Team = { id, name, agents: [], tasks: {} };
  teams.set(id, team);
  logger.info({ teamId: id }, "[Team] Created new team");
  return res.status(201).json({ success: true, team });
});

/** Add an agent to a team */
router.post("/team/:teamId/agent", (req: Request, res: Response) => {
  const teamId = Array.isArray(req.params.teamId) ? req.params.teamId[0] : req.params.teamId;
  const { name, role } = req.body ?? {};
  const team = teams.get(teamId);
  if (!team) {
    return res.status(404).json({ success: false, error: "Team not found" });
  }
  if (!name || !role) {
    return res
      .status(400)
      .json({ success: false, error: "Agent name and role required" });
  }
  const agent: AgentSpec = {
    id: `agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    role,
  };
  team.agents.push(agent);
  logger.info({ teamId, agentId: agent.id }, "[Team] Added agent");
  return res.status(200).json({ success: true, agent, team });
});

/** Delegate a task to the lead agent */
router.post("/team/:teamId/delegate", (req: Request, res: Response) => {
  const teamId = Array.isArray(req.params.teamId) ? req.params.teamId[0] : req.params.teamId;
  const { taskId, payload } = req.body ?? {};
  const team = teams.get(teamId);
  if (!team) {
    return res.status(404).json({ success: false, error: "Team not found" });
  }
  if (!taskId) {
    return res
      .status(400)
      .json({ success: false, error: "taskId is required for delegation" });
  }
  // In a real system this would trigger asynchronous execution. Here we store payload.
  team.tasks[taskId] = { status: "queued", payload };
  logger.info({ teamId, taskId }, "[Team] Task delegated");
  return res.status(202).json({ success: true, taskId, status: "queued" });
});

/** Retrieve task status/result */
router.get("/team/:teamId/task/:taskId", (req: Request, res: Response) => {
  const teamId = Array.isArray(req.params.teamId) ? req.params.teamId[0] : req.params.teamId;
const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
  const team = teams.get(teamId);
  if (!team) {
    return res.status(404).json({ success: false, error: "Team not found" });
  }
  const task = team.tasks[taskId];
  if (!task) {
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  return res.status(200).json({ success: true, taskId, task });
});

export default router;
