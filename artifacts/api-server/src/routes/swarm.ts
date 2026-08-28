import { Router, Request, Response } from "express";
import { swarmEngine } from "../lib/swarm-runner.js";
import { dshRuntime } from "../lib/dsh-runtime.js";
import { semanticMemory } from "../lib/semantic-memory.js";
import { logger } from "../lib/logger.js";

export const swarmRouter = Router();

/**
 * GET /api/v1/swarm/agents
 * List active subagents participating in the Swarm Deliberation Engine.
 */
swarmRouter.get("/v1/swarm/agents", (_req: Request, res: Response) => {
  res.json({
    success: true,
    agents: [
      { id: "commander", name: "Commander Agent", role: "Goal Decomposition & DAG Scheduling", icon: "👑" },
      { id: "architect", name: "Architect Agent", role: "System Design & Scaling Invariants", icon: "🏛️" },
      { id: "researcher", name: "Researcher Agent", role: "Primary Source & Context Analysis", icon: "🔬" },
      { id: "frontend_lead", name: "Frontend Lead", role: "DeepSeek-Close UI/UX & Client State", icon: "🎨" },
      { id: "backend_lead", name: "Backend Lead", role: "API Gateway, Memory & Database", icon: "⚙️" },
      { id: "analytics_lead", name: "Analytics & MFS Lead", role: "Cash Flow, Settlement & Unit Economics", icon: "📊" },
      { id: "qa_red_team", name: "QA Red Team", role: "Adversarial Stress Testing & Security", icon: "🛡️" },
      { id: "security_sentinel", name: "Security Sentinel", role: "Zero-Trust Cryptography & Token Guardrails", icon: "🔐" },
      { id: "tax_auditor", name: "Legal & Tax Auditor", role: "NBR VAT/Tax Compliance & Contract Verification", icon: "⚖️" },
      { id: "devops_deployer", name: "DevOps & Cloud Deployer", role: "Docker, Cloudflare Edge & CI/CD Infrastructure", icon: "🚀" },
    ],
  });
});


/**
 * POST /api/v1/swarm/deliberate
 * Execute multi-agent swarm deliberation on a complex user goal.
 */
swarmRouter.post("/v1/swarm/deliberate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, topic, userId = "usr_default", sessionId } = req.body;

    if (!goal || typeof goal !== "string") {
      res.status(400).json({ success: false, error: "Missing required field: 'goal' (string)" });
      return;
    }

    const taskTitle = topic || goal.slice(0, 50);
    logger.info(`[swarm-route] Starting multi-agent deliberation on: "${taskTitle}"`);

    // 1. Initialize or link DSH trace session
    let trackedSessionId = sessionId;
    if (!trackedSessionId) {
      const dshSession = await dshRuntime.initSession(userId, `Swarm: ${taskTitle}`, { goal });
      trackedSessionId = dshSession.id;
    }

    // 2. Recall user semantic context
    const recalledContext = await semanticMemory.recall(userId, goal, 3);
    if (recalledContext.memories.length > 0) {
      await dshRuntime.recordEvent(trackedSessionId, "thought_block", {
        thought: `Recalled ${recalledContext.memories.length} semantic user memories to guide swarm consensus.`,
      });
    }

    // 3. Record subagent spawn event in DSH journal
    await dshRuntime.recordEvent(trackedSessionId, "subagent_spawn", {
      agent: "commander",
      goal,
    });

    // 4. Run Swarm Deliberation
    const summary = await swarmEngine.deliberate(goal, { userId, sessionId: trackedSessionId });

    // 5. Record completion event in DSH journal
    await dshRuntime.recordEvent(trackedSessionId, "session_done", {
      status: summary.allPassed ? "success" : "partial",
      completedNodes: summary.completedNodes,
      durationMs: summary.durationMs,
    });

    res.json({
      success: true,
      sessionId: trackedSessionId,
      summary,
      perspectives: summary.perspectives,
      durationMs: summary.durationMs,
    });
  } catch (err: any) {
    logger.error(`[swarm-route] Deliberation error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});
