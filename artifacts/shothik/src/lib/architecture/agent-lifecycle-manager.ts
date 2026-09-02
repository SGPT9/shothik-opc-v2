/**
 * ShothikGPT 12-Pillar Reference Architecture — Pillar 6: Agent Lifecycle Manager
 * 
 * Manages agent lifecycles end-to-end:
 *   Discover ➔ Instantiate ➔ Configure ➔ Authorize ➔ Execute ➔ Monitor ➔ Evaluate ➔ Terminate
 */

export type AgentState =
  | 'idle'
  | 'instantiated'
  | 'authorized'
  | 'executing'
  | 'paused'
  | 'terminated'
  | 'failed';

export interface AgentInstance {
  id: string;
  handle: string;
  name: string;
  version: string;
  state: AgentState;
  authorizedPermissions: string[];
  maxCostUsdBudget: number;
  currentCostUsd: number;
  tokensConsumed: number;
  healthScore: number; // 0.0 to 1.0
  reputationScore: number; // 0 to 100
  startTimeIso: string;
  endTimeIso?: string;
}

export class AgentLifecycleManager {
  private activeAgents: Map<string, AgentInstance> = new Map();

  /**
   * DISCOVER & INSTANTIATE
   */
  public instantiate(handle: string, name: string, version = '2.2.0'): AgentInstance {
    const id = `agent_inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const instance: AgentInstance = {
      id,
      handle,
      name,
      version,
      state: 'instantiated',
      authorizedPermissions: [],
      maxCostUsdBudget: 1.0,
      currentCostUsd: 0,
      tokensConsumed: 0,
      healthScore: 1.0,
      reputationScore: 100,
      startTimeIso: new Date().toISOString(),
    };

    this.activeAgents.set(id, instance);
    return instance;
  }

  /**
   * CONFIGURE & AUTHORIZE
   */
  public authorize(id: string, permissions: string[], maxCostUsd = 2.5): AgentInstance | null {
    const agent = this.activeAgents.get(id);
    if (!agent) return null;

    agent.authorizedPermissions = permissions;
    agent.maxCostUsdBudget = maxCostUsd;
    agent.state = 'authorized';

    return agent;
  }

  /**
   * EXECUTE & MONITOR
   */
  public recordExecutionStep(id: string, tokens: number, costUsd: number): AgentInstance | null {
    const agent = this.activeAgents.get(id);
    if (!agent) return null;

    agent.state = 'executing';
    agent.tokensConsumed += tokens;
    agent.currentCostUsd += costUsd;

    // Check budget threshold
    if (agent.currentCostUsd >= agent.maxCostUsdBudget) {
      agent.healthScore = Math.max(0, agent.healthScore - 0.3);
      agent.state = 'paused';
    }

    return agent;
  }

  /**
   * EVALUATE & TERMINATE
   */
  public terminate(id: string, success = true): AgentInstance | null {
    const agent = this.activeAgents.get(id);
    if (!agent) return null;

    agent.state = success ? 'terminated' : 'failed';
    agent.endTimeIso = new Date().toISOString();

    if (!success) {
      agent.reputationScore = Math.max(0, agent.reputationScore - 15);
    }

    return agent;
  }

  public getAgent(id: string): AgentInstance | undefined {
    return this.activeAgents.get(id);
  }

  public getActiveAgents(): AgentInstance[] {
    return Array.from(this.activeAgents.values()).filter(
      (a) => a.state !== 'terminated' && a.state !== 'failed'
    );
  }
}
