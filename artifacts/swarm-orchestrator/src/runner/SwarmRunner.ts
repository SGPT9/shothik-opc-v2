import { MuleMessageBus } from "../bus/MuleMessageBus.js";
import { LocalComputeAdapter } from "../compute/LocalComputeAdapter.js";
import { CommanderAgent } from "../agents/CommanderAgent.js";
import { FrontendLeadAgent } from "../agents/FrontendLeadAgent.js";
import { BackendLeadAgent } from "../agents/BackendLeadAgent.js";
import { ResearcherAgent } from "../agents/ResearcherAgent.js";
import { QARedTeamAgent } from "../agents/QARedTeamAgent.js";
import {
  SwarmExecutionPlan,
  DAGNode,
  SwarmRunnerState,
  CheckpointEvent,
  ApprovalOutcome,
} from "../types/index.js";

export interface SwarmExecutionSummary {
  planId: string;
  goal: string;
  totalNodes: number;
  completedNodes: number;
  allPassed: boolean;
  durationMs: number;
  state: SwarmRunnerState;
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

  private _state: SwarmRunnerState = "idle";
  private _activePlan: SwarmExecutionPlan | null = null;
  private _activeCheckpoint: CheckpointEvent | null = null;
  private _checkpointResolver: ((outcome: ApprovalOutcome) => void) | null = null;
  private _pausePromise: Promise<void> | null = null;
  private _pauseResolver: (() => void) | null = null;
  private _isCancelled = false;

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

  public get state(): SwarmRunnerState {
    return this._state;
  }

  public get activePlan(): SwarmExecutionPlan | null {
    return this._activePlan;
  }

  public get activeCheckpoint(): CheckpointEvent | null {
    return this._activeCheckpoint;
  }

  private initAgents(): void {
    this.commander.init();
    this.frontendLead.init();
    this.backendLead.init();
    this.researcher.init();
    this.qaRedTeam.init();
  }

  /**
   * Pause the active execution loop
   */
  public pause(): void {
    if (this._state === "running" && !this._pausePromise) {
      this._state = "paused";
      this._pausePromise = new Promise<void>((resolve) => {
        this._pauseResolver = resolve;
      });
      this.bus.publish({
        id: `msg-${Date.now()}`,
        sender: "commander",
        recipient: "broadcast",
        topic: "run.paused",
        payload: { planId: this._activePlan?.planId },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Resume paused execution loop
   */
  public resume(): void {
    if (this._state === "paused" && this._pauseResolver) {
      this._state = "running";
      this._pauseResolver();
      this._pausePromise = null;
      this._pauseResolver = null;
      this.bus.publish({
        id: `msg-${Date.now()}`,
        sender: "commander",
        recipient: "broadcast",
        topic: "run.resumed",
        payload: { planId: this._activePlan?.planId },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Cancel active execution
   */
  public cancel(): void {
    this._isCancelled = true;
    this._state = "cancelled";

    // Unblock any paused promises
    if (this._pauseResolver) {
      this._pauseResolver();
      this._pausePromise = null;
      this._pauseResolver = null;
    }

    // Unblock any pending checkpoints as denied
    if (this._checkpointResolver) {
      this._checkpointResolver("denied");
      this._checkpointResolver = null;
      this._activeCheckpoint = null;
    }

    this.bus.publish({
      id: `msg-${Date.now()}`,
      sender: "commander",
      recipient: "broadcast",
      topic: "run.cancelled",
      payload: { planId: this._activePlan?.planId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Resolve an active checkpoint awaiting human approval
   */
  public resolveCheckpoint(checkpointId: string, outcome: ApprovalOutcome): boolean {
    if (!this._activeCheckpoint || this._activeCheckpoint.checkpointId !== checkpointId) {
      return false;
    }

    if (this._checkpointResolver) {
      const resolver = this._checkpointResolver;
      this._checkpointResolver = null;
      this._activeCheckpoint = null;

      this.bus.publish({
        id: `msg-${Date.now()}`,
        sender: "commander",
        recipient: "broadcast",
        topic: "node.checkpoint_resolved",
        payload: {
          checkpointId,
          outcome,
          planId: this._activePlan?.planId,
        },
        timestamp: new Date().toISOString(),
      });

      resolver(outcome);
      return true;
    }

    return false;
  }

  /**
   * Execute an autonomous goal end-to-end (or execute an existing plan)
   */
  public async runGoal(
    goal: string,
    budgetCredits = 50,
    providedPlan?: SwarmExecutionPlan
  ): Promise<SwarmExecutionSummary> {
    const startTime = Date.now();
    this._isCancelled = false;
    this._state = "running";

    // 1. Plan goal via Commander if not provided
    const plan: SwarmExecutionPlan = providedPlan || await this.commander.planGoal(goal, budgetCredits);
    this._activePlan = plan;
    const results: Record<string, any> = {};

    // 2. Execute nodes in DAG sequence
    for (const node of plan.nodes) {
      if (this._isCancelled) {
        node.status = "cancelled";
        break;
      }

      // Check if paused
      if (this._pausePromise) {
        await this._pausePromise;
        if (this._isCancelled) {
          node.status = "cancelled";
          break;
        }
      }

      // Handle interactive approval requirement
      if (node.requiresApproval && !node.approvalOutcome) {
        const checkpointId = node.checkpointId || `chk-${node.id}-${Date.now()}`;
        node.checkpointId = checkpointId;

        const checkpointEvent: CheckpointEvent = {
          checkpointId,
          planId: plan.planId,
          nodeId: node.id,
          actionSummary: node.approvalSummary || node.title,
          reason: node.approvalReason || `Requires human sign-off before executing ${node.assignedRole} tasks.`,
          details: node.approvalDetails,
          createdAt: new Date().toISOString(),
        };

        this._activeCheckpoint = checkpointEvent;

        const approvalPromise = new Promise<ApprovalOutcome>((resolve) => {
          this._checkpointResolver = resolve;
        });

        node.status = "awaiting_approval";
        this._state = "waiting_approval";

        await this.bus.publish({
          id: `msg-${Date.now()}`,
          sender: "commander",
          recipient: "broadcast",
          topic: "node.checkpoint_created",
          payload: checkpointEvent,
          timestamp: new Date().toISOString(),
        });

        // Wait for human decision
        const outcome = await approvalPromise;

        if (this._isCancelled) {
          node.status = "cancelled";
          this._state = "cancelled";
          break;
        }

        node.approvalOutcome = outcome;

        if (outcome === "denied") {
          node.status = "failed";
          this._state = "failed";
          results[node.id] = { error: "Operation denied by human supervisor", outcome: "denied" };
          break;
        }

        this._state = "running";
      }

      if (this._isCancelled) {
        node.status = "cancelled";
        break;
      }

      node.status = "in_progress";
      const agent = this.getAgentForRole(node.assignedRole);
      
      const executionResult = await agent.executeTask(node);
      if (executionResult.success) {
        node.status = "completed";
        node.result = executionResult.output;
        results[node.id] = executionResult.output;
      } else {
        node.status = "failed";
        this._state = "failed";
        break;
      }
    }

    const completedNodes = plan.nodes.filter((n) => n.status === "completed").length;
    const allPassed = completedNodes === plan.nodes.length && !this._isCancelled;

    if (this._isCancelled) {
      this._state = "cancelled";
    } else if (allPassed) {
      this._state = "completed";
    } else if (this._state !== "failed") {
      this._state = "failed";
    }

    return {
      planId: plan.planId,
      goal: plan.goal,
      totalNodes: plan.nodes.length,
      completedNodes,
      allPassed,
      state: this._state,
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
