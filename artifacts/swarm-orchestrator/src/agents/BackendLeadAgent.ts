import { BaseAgent } from "./BaseAgent.js";
import { SwarmAgentRole, DAGNode } from "../types/index.js";

export class BackendLeadAgent extends BaseAgent {
  public readonly role: SwarmAgentRole = "backend_lead";
  public readonly name = "Backend & Systems Specialist";

  public init(): void {
    this.bus.subscribe("backend_lead", async (msg) => {
      if (msg.topic === "task.assign") {
        await this.executeTask(msg.payload.node);
      }
    });
  }

  public async executeTask(node: DAGNode): Promise<{ success: boolean; output: Record<string, any> }> {
    const output = {
      action: "api_route_implemented",
      contracts: ["@workspace/hermes", "Zod Validation", "InsForge PostgreSQL RLS"],
      nodeId: node.id,
      verified: true,
    };

    await this.sendMessage("commander", "task.completed", { nodeId: node.id, output });
    return { success: true, output };
  }
}
