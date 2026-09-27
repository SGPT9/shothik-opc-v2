import { randomUUID } from "node:crypto";

export interface QueuedMessage {
  id: string;
  text: string;
  timestamp: string;
  attachments?: string[];
}

export interface QueueState {
  pending: readonly QueuedMessage[];
  running: boolean;
  paused: boolean;
  activeMessageId?: string;
}

/**
 * Continuous Follow-up Conversation Queue for Shothik Chat
 * Inspired by CopilotKit OpenMuse AG-UI pattern.
 * Allows users to keep composing and queue follow-up instructions
 * while the agent is executing long-running turns.
 */
export class ShothikConversationQueue {
  private state: QueueState = {
    pending: [],
    running: false,
    paused: false,
  };

  private listeners = new Set<(state: QueueState) => void>();

  getSnapshot = (): QueueState => this.state;

  subscribe = (listener: (state: QueueState) => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private update(patch: Partial<QueueState>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  enqueue(text: string, attachments?: string[]): QueuedMessage {
    const id = `queue_${randomUUID().slice(0, 8)}`;
    const msg: QueuedMessage = {
      id,
      text,
      timestamp: new Date().toISOString(),
      attachments,
    };
    this.update({ pending: [...this.state.pending, msg] });
    return msg;
  }

  remove(id: string) {
    this.update({
      pending: this.state.pending.filter((m) => m.id !== id),
    });
  }

  pause() {
    this.update({ paused: true });
  }

  resume() {
    this.update({ paused: false });
  }

  clear() {
    this.update({ pending: [] });
  }

  async flush(sendFn: (msg: QueuedMessage) => Promise<void>): Promise<void> {
    if (this.state.running || this.state.paused || this.state.pending.length === 0) {
      return;
    }

    this.update({ running: true });

    try {
      while (this.state.pending.length > 0 && !this.state.paused) {
        const [nextMsg, ...remaining] = this.state.pending;
        this.update({ pending: remaining, activeMessageId: nextMsg.id });

        await sendFn(nextMsg);
      }
    } catch (err) {
      this.update({ paused: true });
      throw err;
    } finally {
      this.update({ running: false, activeMessageId: undefined });
    }
  }
}

export const globalConversationQueue = new ShothikConversationQueue();
