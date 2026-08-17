import { MuleMessageBus } from "../bus/MuleMessageBus.js";
import { LocalComputeAdapter } from "../compute/LocalComputeAdapter.js";
import { SwarmAgentRole, MuleMessage, DAGNode } from "../types/index.js";

export abstract class BaseAgent {
  public abstract readonly role: SwarmAgentRole;
  public abstract readonly name: string;
  protected bus: MuleMessageBus;
  protected compute: LocalComputeAdapter;

  constructor(bus: MuleMessageBus, compute = new LocalComputeAdapter()) {
    this.bus = bus;
    this.compute = compute;
  }

  /**
   * Initialize agent subscriptions
   */
  public abstract init(): void;

  /**
   * Execute assigned DAG node task
   */
  public abstract executeTask(node: DAGNode): Promise<{ success: boolean; output: Record<string, any> }>;

  /**
   * Helper to send messages to the bus
   */
  protected async sendMessage(
    recipient: SwarmAgentRole | "broadcast",
    topic: string,
    payload: Record<string, any>
  ): Promise<void> {
    const message: MuleMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: this.role,
      recipient,
      topic,
      payload,
      timestamp: new Date().toISOString(),
    };
    await this.bus.publish(message);
  }
}
