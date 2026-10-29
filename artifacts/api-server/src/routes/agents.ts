import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { runSkill } from '../services/skillRunner';

// Simple in‑memory store for agents – replace with DB later
export interface Agent {
  id: string;
  name: string;
  role: string;
  description?: string;
  policy?: "auto" | "manual";
}

const agents: Agent[] = [
  { id: "agent_dev_01", name: "Dev Specialist", role: "Full-stack code generation and refactoring", policy: "auto" },
  { id: "agent_qa_01", name: "QA & Audit Bot", role: "Automated regression testing and test verification", policy: "manual" },
  { id: "agent_ops_01", name: "Ops & SRE Bot", role: "Deployment, canary release, and health monitoring", policy: "auto" },
];

const router = Router();

// Create a new agent
router.post('/', (req: Request, res: Response) => {
  const { name, role, description, policy = "auto" } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: 'name and role are required' });
    return;
  }
  const newAgent: Agent = { id: crypto.randomUUID(), name, role, description, policy };
  agents.push(newAgent);
  res.status(201).json(newAgent);
});

// List all agents
router.get('/', (_req: Request, res: Response) => {
  res.json(agents);
});

// Get a single agent by id
router.get('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const agent = agents.find(a => a.id === id);
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  res.json(agent);
});

/**
 * Execute a YouTube skill.
 * Example: POST /youtube/yt-script { "title": "My Video", "description": "..." }
 */
router.post('/youtube/:skill', async (req: Request, res: Response) => {
  const skill = String(req.params.skill || "");
  const args = req.body;
  try {
    const output = await runSkill(skill, args);
    res.json({ result: output });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * Execute an Instagram skill.
 */
router.post('/instagram/:skill', async (req: Request, res: Response) => {
  const skill = String(req.params.skill || "");
  const args = req.body;
  try {
    const output = await runSkill(skill, args);
    res.json({ result: output });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/company/:slug/start-activities', async (req: Request, res: Response) => {
  const { youtubeSkill, instagramSkill, youtubeArgs = {}, instagramArgs = {} } = req.body;
  try {
    const ytResult = await runSkill(String(youtubeSkill || ""), youtubeArgs);
    const igResult = await runSkill(String(instagramSkill || ""), instagramArgs);
    res.json({ youtube: ytResult, instagram: igResult });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
