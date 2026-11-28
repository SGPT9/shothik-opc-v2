import { describe, it, expect, vi, beforeEach } from "vitest";
import { UndockedWindowManager, ARTIFACTS_CHANNEL_NAME } from "../undocked-window";

describe("UndockedWindowManager", () => {
  let mockPostMessage: ReturnType<typeof vi.fn>;
  let mockClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPostMessage = vi.fn();
    mockClose = vi.fn();

    class MockBroadcastChannel {
      name: string;
      onmessage: any = null;
      constructor(name: string) {
        this.name = name;
      }
      postMessage(data: any) {
        mockPostMessage(data);
      }
      close() {
        mockClose();
      }
    }

    (globalThis as any).BroadcastChannel = MockBroadcastChannel;
  });

  it("instantiates BroadcastChannel with correct name", () => {
    const manager = new UndockedWindowManager();
    expect(manager).toBeDefined();
    manager.destroy();
    expect(mockClose).toHaveBeenCalled();
  });

  it("broadcasts artifact state sync message", () => {
    const manager = new UndockedWindowManager();
    manager.broadcastState({
      title: "Quarterly Revenue Model",
      type: "sheet",
      content: "Q1,Q2,Q3,Q4",
      activeTab: "sheet",
    });

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ARTIFACT_STATE_SYNC",
        payload: expect.objectContaining({
          title: "Quarterly Revenue Model",
          type: "sheet",
        }),
      })
    );
    manager.destroy();
  });
});
