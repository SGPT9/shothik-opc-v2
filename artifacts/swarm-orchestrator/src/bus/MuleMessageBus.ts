import { MuleMessage, SwarmAgentRole } from "../types/index.js";

export type MessageHandler = (message: MuleMessage) => Promise<void> | void;

export class MuleMessageBus {
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private history: MuleMessage[] = [];

  /**
   * Subscribe a handler to a specific topic or agent role
   */
  public subscribe(topicOrRole: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(topicOrRole)) {
      this.handlers.set(topicOrRole, new Set());
    }
    this.handlers.get(topicOrRole)!.add(handler);

    return () => {
      this.handlers.get(topicOrRole)?.delete(handler);
    };
  }

  /**
   * Publish a message to the bus
   */
  public async publish(message: MuleMessage): Promise<void> {
    this.history.push(message);

    const promises: Array<Promise<void> | void> = [];

    // Notify topic subscribers
    const topicHandlers = this.handlers.get(message.topic);
    if (topicHandlers) {
      for (const handler of topicHandlers) {
        promises.push(handler(message));
      }
    }

    // Notify recipient subscribers (or broadcast)
    if (message.recipient === "broadcast") {
      const broadcastHandlers = this.handlers.get("broadcast");
      if (broadcastHandlers) {
        for (const handler of broadcastHandlers) {
          promises.push(handler(message));
        }
      }
    } else {
      const recipientHandlers = this.handlers.get(message.recipient);
      if (recipientHandlers) {
        for (const handler of recipientHandlers) {
          promises.push(handler(message));
        }
      }
    }

    await Promise.all(promises);
  }

  /**
   * Get filtered message history
   */
  public getHistory(filter?: { topic?: string; sender?: SwarmAgentRole; recipient?: string }): MuleMessage[] {
    return this.history.filter((msg) => {
      if (filter?.topic && msg.topic !== filter.topic) return false;
      if (filter?.sender && msg.sender !== filter.sender) return false;
      if (filter?.recipient && msg.recipient !== filter.recipient) return false;
      return true;
    });
  }

  /**
   * Clear all history (useful in tests)
   */
  public clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}
