import { describe, it, expect, vi, beforeEach } from "vitest";
import { MuleMessageBus } from "../MuleMessageBus.js";
import { MuleMessage } from "../../types/index.js";

describe("MuleMessageBus", () => {
  let bus: MuleMessageBus;

  beforeEach(() => {
    bus = new MuleMessageBus();
  });

  it("publishes and delivers messages to topic subscribers", async () => {
    const handler = vi.fn();
    bus.subscribe("code.review", handler);

    const message: MuleMessage = {
      id: "msg-1",
      sender: "backend_lead",
      recipient: "qa_red_team",
      topic: "code.review",
      payload: { prId: "PR-101", diff: "..." },
      timestamp: new Date().toISOString(),
    };

    await bus.publish(message);

    expect(handler).toHaveBeenCalledWith(message);
    expect(bus.getHistory({ topic: "code.review" })).toHaveLength(1);
  });

  it("handles broadcast messages to all broadcast subscribers", async () => {
    const broadcastHandler = vi.fn();
    bus.subscribe("broadcast", broadcastHandler);

    const message: MuleMessage = {
      id: "msg-2",
      sender: "commander",
      recipient: "broadcast",
      topic: "goal.planned",
      payload: { goal: "Build Checkout", nodesCount: 4 },
      timestamp: new Date().toISOString(),
    };

    await bus.publish(message);

    expect(broadcastHandler).toHaveBeenCalledWith(message);
  });

  it("allows unsubscribing from topics", async () => {
    const handler = vi.fn();
    const unsubscribe = bus.subscribe("temp.topic", handler);

    unsubscribe();

    await bus.publish({
      id: "msg-3",
      sender: "researcher",
      recipient: "commander",
      topic: "temp.topic",
      payload: {},
      timestamp: new Date().toISOString(),
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
