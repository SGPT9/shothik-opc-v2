// src/routes/schedule.ts
import { Router, Request, Response } from 'express';

// Simple in‑memory scheduler – placeholder for cron‑style jobs
export interface ScheduledTask {
  id: string;
  name: string;
  cron: string; // e.g., "0 9 * * *"
  enabled: boolean;
  payload?: any;
}

const tasks: ScheduledTask[] = [
  { id: "sched_01", name: "Daily Morning Digest & Founder Briefing", cron: "0 9 * * *", enabled: true },
  { id: "sched_02", name: "Hourly Courier RTO & DSR Arbitrage Sync", cron: "0 * * * *", enabled: true },
];

const router = Router();

// Create a new scheduled task
router.post('/', (req: Request, res: Response) => {
  const { name, cron, enabled = true, payload } = req.body;
  if (!name || !cron) {
    res.status(400).json({ error: 'name and cron are required' });
    return;
  }
  const newTask: ScheduledTask = { id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, name, cron, enabled, payload };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// List all tasks
router.get('/', (_req: Request, res: Response) => {
  res.json(tasks);
});

// Toggle task enable/disable
router.patch('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const task = tasks.find(t => t.id === id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  if (typeof req.body.enabled === 'boolean') {
    task.enabled = req.body.enabled;
  }
  res.json(task);
});

export default router;
