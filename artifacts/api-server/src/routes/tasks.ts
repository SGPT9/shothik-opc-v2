import { Router } from "express";
import { MemoryTaskStore, LeasedTaskWorker, type AgentTask } from "../../../../lib/hermes/leased-task-worker";
import { randomUUID } from "node:crypto";

export const tasksRouter = Router();
export const globalTaskStore = new MemoryTaskStore();

// Sample background task handler for Shothik OPC tasks
export const globalTaskWorker = new LeasedTaskWorker(
  globalTaskStore,
  async (owner, task, ctx) => {
    await ctx.event("plan", "Plan formulated", `Starting execution of ${task.title}`);
    
    // Checkpoint step 1
    const steps = [...task.plan];
    if (steps[0]) {
      steps[0].status = "running";
      await ctx.checkpoint({ plan: steps });
      await ctx.event("step", steps[0].title, "Processing step");
      steps[0].status = "succeeded";
    }

    if (steps[1]) {
      steps[1].status = "running";
      await ctx.checkpoint({ plan: steps });
      await ctx.event("step", steps[1].title, "Processing step");
      steps[1].status = "succeeded";
    }

    await ctx.event("result", "Execution complete", `Finished task ${task.id}`);
    return {
      status: "succeeded",
      plan: steps,
      result: `Successfully processed task: ${task.prompt}`,
    };
  },
  { pollMs: 500, leaseMs: 30000 },
);

// Start worker
globalTaskWorker.start();

tasksRouter.get("/tasks", async (req, res) => {
  const owner = (req.query.owner as string) || "default-owner";
  const records = await globalTaskStore.scan<AgentTask>("tasks");
  const userTasks = records.filter((r) => r.owner === owner).map((r) => r.value);
  res.json({ success: true, count: userTasks.length, tasks: userTasks, workerRunning: globalTaskWorker.isRunning });
});

tasksRouter.post("/tasks", async (req, res) => {
  const owner = (req.body.owner as string) || "default-owner";
  const { title, prompt, kind = "agent", plan = [] } = req.body;

  if (!prompt) {
    res.status(400).json({ success: false, error: "Prompt is required" });
    return;
  }

  const taskId = randomUUID();
  const task: AgentTask = {
    id: taskId,
    title: title || prompt.slice(0, 50),
    prompt,
    kind,
    status: "queued",
    plan: plan.length > 0 ? plan : [
      { id: "1", title: "Analyze Intent & Validate Context", status: "pending" },
      { id: "2", title: "Execute Core Domain Action", status: "pending" },
    ],
    input: req.body.input || {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    artifactIds: [],
  };

  await globalTaskStore.put(owner, "tasks", task);
  // Trigger tick immediately
  void globalTaskWorker.tick();

  res.status(201).json({ success: true, task });
});

tasksRouter.get("/tasks/:id", async (req, res) => {
  const owner = (req.query.owner as string) || "default-owner";
  const task = await globalTaskStore.get<AgentTask>(owner, "tasks", req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: "Task not found" });
    return;
  }
  res.json({ success: true, task });
});

tasksRouter.post("/tasks/:id/cancel", async (req, res) => {
  const owner = (req.body?.owner as string) || (req.query.owner as string) || "default-owner";
  globalTaskWorker.abort(req.params.id);
  const task = await globalTaskStore.get<AgentTask>(owner, "tasks", req.params.id);
  if (task) {
    task.status = "cancelled";
    task.updatedAt = new Date().toISOString();
    await globalTaskStore.put(owner, "tasks", task);
  }
  res.json({ success: true, message: "Task cancellation requested", task });
});
