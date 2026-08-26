import { describe, it, expect, vi, beforeEach } from "vitest";
import { MuleMessageBus } from "../../bus/MuleMessageBus.js";
import { LocalComputeAdapter } from "../../compute/LocalComputeAdapter.js";
import { CommanderAgent } from "../CommanderAgent.js";
import { ResearcherAgent } from "../ResearcherAgent.js";
import { BackendLeadAgent } from "../BackendLeadAgent.js";
import { FrontendLeadAgent } from "../FrontendLeadAgent.js";
import { QARedTeamAgent } from "../QARedTeamAgent.js";
import { DAGNode } from "../../types/index.js";

describe("Swarm Multi-Agent Topology (agents/)", () => {
  let bus: MuleMessageBus;
  let compute: LocalComputeAdapter;

  beforeEach(() => {
    bus = new MuleMessageBus();
    compute = new LocalComputeAdapter();
  });

  describe("CommanderAgent", () => {
    it("decomposes goal into structured 4-stage DAG execution plan", async () => {
      const commander = new CommanderAgent(bus, compute);
      commander.init();

      const plan = await commander.planGoal("Build 1-Click bKash Checkout", 100);

      expect(plan.goal).toBe("Build 1-Click bKash Checkout");
      expect(plan.budgetCredits).toBe(100);
      expect(plan.nodes).toHaveLength(4);
      expect(plan.nodes[0].assignedRole).toBe("researcher");
      expect(plan.nodes[1].assignedRole).toBe("backend_lead");
      expect(plan.nodes[2].assignedRole).toBe("frontend_lead");
      expect(plan.nodes[3].assignedRole).toBe("qa_red_team");

      // Verify dependencies sequence
      expect(plan.nodes[0].dependencies).toEqual([]);
      expect(plan.nodes[1].dependencies).toEqual(["node-1-research"]);
      expect(plan.nodes[2].dependencies).toEqual(["node-2-backend"]);
      expect(plan.nodes[3].dependencies).toEqual(["node-3-frontend"]);

      // Verify broadcast event
      const history = bus.getHistory({ topic: "goal.planned" });
      expect(history).toHaveLength(1);
    });

    it("emits telemetry when task.completed event is received", async () => {
      const commander = new CommanderAgent(bus, compute);
      commander.init();

      const telemetryHandler = vi.fn();
      bus.subscribe("broadcast", telemetryHandler);

      await bus.publish({
        id: "msg-comp-1",
        sender: "qa_red_team",
        recipient: "commander",
        topic: "task.completed",
        payload: { nodeId: "node-4-qa" },
        timestamp: new Date().toISOString(),
      });

      expect(telemetryHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: "swarm.telemetry",
          payload: { event: "node_resolved", nodeId: "node-4-qa" },
        })
      );
    });
  });

  describe("ResearcherAgent", () => {
    it("executes research node and attaches epistemic consensus stamp", async () => {
      const researcher = new ResearcherAgent(bus, compute);
      researcher.init();

      const node: DAGNode = {
        id: "node-1-research",
        title: "Research bKash Merchant API",
        assignedRole: "researcher",
        dependencies: [],
        status: "in_progress",
      };

      const result = await researcher.executeTask(node);

      expect(result.success).toBe(true);
      expect(result.output.action).toBe("deep_research_compiled");
      expect(result.output.epistemicStamp.status).toBe("consensus");
      expect(result.output.epistemicStamp.confidence).toBeGreaterThan(0.9);

      // Verify task.completed published to commander
      const history = bus.getHistory({ recipient: "commander" });
      expect(history.some((m) => m.topic === "task.completed")).toBe(true);
    });
  });

  describe("BackendLeadAgent", () => {
    it("executes backend task and reports contract verification", async () => {
      const backend = new BackendLeadAgent(bus, compute);
      backend.init();

      const node: DAGNode = {
        id: "node-2-backend",
        title: "Implement /api/mfs/verify route",
        assignedRole: "backend_lead",
        dependencies: ["node-1-research"],
        status: "in_progress",
      };

      const result = await backend.executeTask(node);

      expect(result.success).toBe(true);
      expect(result.output.action).toBe("api_route_implemented");
      expect(result.output.contracts).toContain("@workspace/hermes");
      expect(result.output.verified).toBe(true);
    });
  });

  describe("FrontendLeadAgent", () => {
    it("executes UI generation task adhering to Ask-First principles", async () => {
      const frontend = new FrontendLeadAgent(bus, compute);
      frontend.init();

      const node: DAGNode = {
        id: "node-3-frontend",
        title: "Build CommerceActionCard surface",
        assignedRole: "frontend_lead",
        dependencies: ["node-2-backend"],
        status: "in_progress",
      };

      const result = await frontend.executeTask(node);

      expect(result.success).toBe(true);
      expect(result.output.action).toBe("ui_component_generated");
      expect(result.output.principles).toContain("Ask-First");
      expect(result.output.principles).toContain("DeepSeek-Close");
    });
  });

  describe("QARedTeamAgent", () => {
    it("executes adversarial security and accessibility audit", async () => {
      const qa = new QARedTeamAgent(bus, compute);
      qa.init();

      const node: DAGNode = {
        id: "node-4-qa",
        title: "Audit CommerceActionCard security",
        assignedRole: "qa_red_team",
        dependencies: ["node-3-frontend"],
        status: "in_progress",
      };

      const result = await qa.executeTask(node);

      expect(result.success).toBe(true);
      expect(result.output.action).toBe("adversarial_security_audit_passed");
      expect(result.output.checks).toContain("Vitest Monorepo Tests: 100% Pass");
      expect(result.output.checks).toContain("OWASP LLM Top 10: Verified");
      expect(result.output.verified).toBe(true);
    });
  });
});
