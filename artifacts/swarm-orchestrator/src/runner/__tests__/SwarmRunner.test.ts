import { describe, it, expect, vi } from "vitest";
import { SwarmRunner } from "../SwarmRunner.js";
import { SwarmExecutionPlan } from "../../types/index.js";

describe("SwarmRunner", () => {
  it("executes an autonomous goal across all 4 specialized sub-agents", async () => {
    const runner = new SwarmRunner();

    const goal = "Audit F-Commerce checkout flow and verify bKash 1-click booking card";
    const summary = await runner.runGoal(goal, 50);

    expect(summary.goal).toBe(goal);
    expect(summary.totalNodes).toBe(4);
    expect(summary.completedNodes).toBe(4);
    expect(summary.allPassed).toBe(true);
    expect(summary.state).toBe("completed");

    // Verify sub-agent outputs
    expect(summary.results["node-1-research"]).toBeDefined();
    expect(summary.results["node-1-research"].epistemicStamp.status).toBe("consensus");

    expect(summary.results["node-2-backend"]).toBeDefined();
    expect(summary.results["node-2-backend"].action).toBe("api_route_implemented");

    expect(summary.results["node-3-frontend"]).toBeDefined();
    expect(summary.results["node-3-frontend"].principles).toContain("Ask-First");

    expect(summary.results["node-4-qa"]).toBeDefined();
    expect(summary.results["node-4-qa"].action).toBe("adversarial_security_audit_passed");
  });

  it("pauses execution for human approval checkpoint and resumes when approved", async () => {
    const runner = new SwarmRunner();

    const checkpointEvents: any[] = [];
    runner.bus.subscribe("node.checkpoint_created", async (msg) => {
      checkpointEvents.push(msg.payload);
    });

    const plan: SwarmExecutionPlan = {
      planId: "plan-approval-test",
      goal: "Execute sensitive migration and deploy UI",
      budgetCredits: 50,
      createdAt: new Date().toISOString(),
      nodes: [
        {
          id: "node-research",
          title: "Research target dependencies",
          assignedRole: "researcher",
          dependencies: [],
          status: "pending",
        },
        {
          id: "node-migration",
          title: "Run destructive Postgres table migration",
          assignedRole: "backend_lead",
          dependencies: ["node-research"],
          status: "pending",
          requiresApproval: true,
          checkpointId: "chk-migration-101",
          approvalSummary: "Execute SQL Migration on production database",
          approvalReason: "Modifies schema column 'organizations.billing_tier'",
          approvalDetails: "ALTER TABLE organizations ADD COLUMN billing_tier text DEFAULT 'free';",
        },
        {
          id: "node-frontend",
          title: "Deploy frontend surface",
          assignedRole: "frontend_lead",
          dependencies: ["node-migration"],
          status: "pending",
        },
      ],
    };

    // Run goal in background
    const runPromise = runner.runGoal(plan.goal, 50, plan);

    // Wait for checkpoint to be created
    await vi.waitFor(() => {
      expect(runner.state).toBe("waiting_approval");
      expect(runner.activeCheckpoint).not.toBeNull();
      expect(runner.activeCheckpoint?.checkpointId).toBe("chk-migration-101");
      expect(checkpointEvents.length).toBe(1);
    });

    // Human supervisor approves the checkpoint
    const resolved = runner.resolveCheckpoint("chk-migration-101", "approved");
    expect(resolved).toBe(true);

    const summary = await runPromise;
    expect(summary.allPassed).toBe(true);
    expect(summary.completedNodes).toBe(3);
    expect(summary.state).toBe("completed");
    expect(plan.nodes[1].approvalOutcome).toBe("approved");
    expect(plan.nodes[1].status).toBe("completed");
  });

  it("halts execution when a human supervisor denies a checkpoint", async () => {
    const runner = new SwarmRunner();

    const plan: SwarmExecutionPlan = {
      planId: "plan-denial-test",
      goal: "Purge user cache and reset schema",
      budgetCredits: 30,
      createdAt: new Date().toISOString(),
      nodes: [
        {
          id: "node-purge",
          title: "Purge global cache",
          assignedRole: "backend_lead",
          dependencies: [],
          status: "pending",
          requiresApproval: true,
          checkpointId: "chk-purge-202",
          approvalSummary: "Purge global edge cache",
          approvalReason: "High load potential",
        },
        {
          id: "node-followup",
          title: "Verify frontend responsiveness",
          assignedRole: "frontend_lead",
          dependencies: ["node-purge"],
          status: "pending",
        },
      ],
    };

    const runPromise = runner.runGoal(plan.goal, 30, plan);

    await vi.waitFor(() => {
      expect(runner.state).toBe("waiting_approval");
    });

    const resolved = runner.resolveCheckpoint("chk-purge-202", "denied");
    expect(resolved).toBe(true);

    const summary = await runPromise;
    expect(summary.allPassed).toBe(false);
    expect(summary.completedNodes).toBe(0);
    expect(summary.state).toBe("failed");
    expect(plan.nodes[0].approvalOutcome).toBe("denied");
    expect(plan.nodes[0].status).toBe("failed");
    expect(plan.nodes[1].status).toBe("pending"); // Not executed
  });

  it("supports pausing and resuming execution", async () => {
    const runner = new SwarmRunner();

    const pauseEvents: any[] = [];
    const resumeEvents: any[] = [];
    runner.bus.subscribe("run.paused", async (msg) => pauseEvents.push(msg.payload));
    runner.bus.subscribe("run.resumed", async (msg) => resumeEvents.push(msg.payload));

    const runPromise = runner.runGoal("Standard goal", 20);

    runner.pause();
    expect(runner.state).toBe("paused");
    expect(pauseEvents.length).toBe(1);

    runner.resume();
    expect(runner.state).toBe("running");
    expect(resumeEvents.length).toBe(1);

    const summary = await runPromise;
    expect(summary.allPassed).toBe(true);
    expect(summary.state).toBe("completed");
  });

  it("supports cancelling an active run", async () => {
    const runner = new SwarmRunner();

    const cancelEvents: any[] = [];
    runner.bus.subscribe("run.cancelled", async (msg) => cancelEvents.push(msg.payload));

    const plan: SwarmExecutionPlan = {
      planId: "plan-cancel-test",
      goal: "Long running pipeline",
      budgetCredits: 20,
      createdAt: new Date().toISOString(),
      nodes: [
        {
          id: "node-1",
          title: "Step 1",
          assignedRole: "researcher",
          dependencies: [],
          status: "pending",
          requiresApproval: true,
          checkpointId: "chk-cancel-303",
        },
        {
          id: "node-2",
          title: "Step 2",
          assignedRole: "frontend_lead",
          dependencies: ["node-1"],
          status: "pending",
        },
      ],
    };

    const runPromise = runner.runGoal(plan.goal, 20, plan);

    await vi.waitFor(() => {
      expect(runner.state).toBe("waiting_approval");
    });

    runner.cancel();
    expect(runner.state).toBe("cancelled");
    expect(cancelEvents.length).toBe(1);

    const summary = await runPromise;
    expect(summary.allPassed).toBe(false);
    expect(summary.state).toBe("cancelled");
  });
});

