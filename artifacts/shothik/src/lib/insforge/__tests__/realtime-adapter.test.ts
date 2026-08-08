import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
const mockOn = vi.fn();

vi.mock("@/lib/insforge/client", () => ({
  getInsforgeClient: vi.fn(() => ({
    realtime: {
      channel: vi.fn(() => ({
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe,
        on: mockOn,
      })),
    },
  })),
}));

import { InsForgeRealtimeAdapter } from "../realtime-adapter";

describe("InsForge Realtime Pub/Sub WebSocket Adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    InsForgeRealtimeAdapter.clearRegistry();
  });

  it("subscribes to workspace real-time channels and registers event callbacks", () => {
    const onEvent = vi.fn();

    const sub = InsForgeRealtimeAdapter.subscribeToWorkspace({
      workspaceId: "ws_realtime_test",
      onEvent,
    });

    expect(mockOn).toHaveBeenCalledWith("broadcast", { event: "*" }, expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalled();
    expect(InsForgeRealtimeAdapter.getActiveChannelCount()).toBe(1);

    sub.unsubscribe();
    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(InsForgeRealtimeAdapter.getActiveChannelCount()).toBe(0);
  });

  it("handles unsubscription safely when channel is already closed", () => {
    InsForgeRealtimeAdapter.unsubscribeFromWorkspace("nonexistent_ws");
    expect(InsForgeRealtimeAdapter.getActiveChannelCount()).toBe(0);
  });
});
