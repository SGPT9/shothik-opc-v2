import { MuleMessageBus } from "../bus/MuleMessageBus.js";
import { LocalComputeAdapter } from "../compute/LocalComputeAdapter.js";
import { CommanderAgent } from "../agents/CommanderAgent.js";
import { FrontendLeadAgent } from "../agents/FrontendLeadAgent.js";
import { BackendLeadAgent } from "../agents/BackendLeadAgent.js";
import { ResearcherAgent } from "../agents/ResearcherAgent.js";
import { QARedTeamAgent } from "../agents/QARedTeamAgent.js";
import { SwarmExecutionPlan, DAGNode } from "../types/index.js";

export interface SwarmExecutionSummary {
  planId: string;
  goal: string;
  totalNodes: number;
  completedNodes: number;
  allPassed: boolean;
  durationMs: number;
  results: Record<string, any>;
}

export class SwarmRunner {
  public readonly bus: MuleMessageBus;
  public readonly compute: LocalComputeAdapter;
  public readonly commander: CommanderAgent;
  public readonly frontendLead: FrontendLeadAgent;
  public readonly backendLead: BackendLeadAgent;
  public readonly researcher: ResearcherAgent;
  public readonly qaRedTeam: QARedTeamAgent;

  constructor(
    bus = new MuleMessageBus(),
    compute = new LocalComputeAdapter()
  ) {
    this.bus = bus;
    this.compute = compute;

    this.commander = new CommanderAgent(this.bus, this.compute);
    this.frontendLead = new FrontendLeadAgent(this.bus, this.compute);
    this.backendLead = new BackendLeadAgent(this.bus, this.compute);
    this.researcher = new ResearcherAgent(this.bus, this.compute);
    this.qaRedTeam = new QARedTeamAgent(this.bus, this.compute);

    this.initAgents();
  }

  private initAgents(): void {
    this.commander.init();
    this.frontendLead.init();
    this.backendLead.init();
    this.researcher.init();
    this.qaRedTeam.init();
  }

  /**
   * Execute an autonomous goal end-to-end
   */
  public async runGoal(goal: string, budgetCredits = 50): Promise<SwarmExecutionSummary> {
    const startTime = Date.now();

    // 1. Plan goal via Commander
    const plan: SwarmExecutionPlan = await this.commander.planGoal(goal, budgetCredits);
    const results: Record<string, any> = {};

    // 2. Execute nodes in DAG sequence
    for (const node of plan.nodes) {
      node.status = "in_progress";
      const agent = this.getAgentForRole(node.assignedRole);
      
      const executionResult = await agent.executeTask(node);
      if (executionResult.success) {
        node.status = "completed";
        node.result = executionResult.output;
        results[node.id] = executionResult.output;
      } else {
        node.status = "failed";
        break;
      }
    }

    const completedNodes = plan.nodes.filter((n) => n.status === "completed").length;
    const allPassed = completedNodes === plan.nodes.length;

    return {
      planId: plan.planId,
      goal: plan.goal,
      totalNodes: plan.nodes.length,
      completedNodes,
      allPassed,
      durationMs: Date.now() - startTime,
      results,
    };
  }

  private getAgentForRole(role: string) {
    switch (role) {
      case "frontend_lead":
        return this.frontendLead;
      case "backend_lead":
        return this.backendLead;
      case "researcher":
        return this.researcher;
      case "qa_red_team":
        return this.qaRedTeam;
      default:
        return this.commander;
    }
  }
}
