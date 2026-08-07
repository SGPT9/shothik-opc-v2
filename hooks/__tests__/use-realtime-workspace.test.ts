import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockUnsubscribe = vi.fn();
let capturedOnEvent: ((event: any) => void) | null = null;

vi.mock("@/lib/insforge/realtime-adapter", () => ({
  InsForgeRealtimeAdapter: {
    subscribeToWorkspace: vi.fn(({ onEvent }) => {
      capturedOnEvent = onEvent;
      return { unsubscribe: mockUnsubscribe };
    }),
  },
}));

import { useRealtimeWorkspace } from "../use-realtime-workspace";

describe("useRealtimeWorkspace React Hook", () => {
  it("subscribes to workspace real-time channels on mount", () => {
    const onEvent = vi.fn();

    const { result, unmount } = renderHook(() =>
      useRealtimeWorkspace({
        workspaceId: "ws_hook_test_100",
        onEvent,
      })
    );

    expect(result.current.connectionState).toBe("connected");

    act(() => {
      capturedOnEvent?.({
        eventType: "artifact_updated",
        payload: { cell: "A1", value: 500 },
        timestamp: "2026-08-07T20:00:00Z",
      });
    });

    expect(onEvent).toHaveBeenCalledWith({
      eventType: "artifact_updated",
      payload: { cell: "A1", value: 500 },
      timestamp: "2026-08-07T20:00:00Z",
    });
    expect(result.current.lastEvent?.eventType).toBe("artifact_updated");

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("remains disconnected when workspaceId is omitted or enabled is false", () => {
    const { result } = renderHook(() =>
      useRealtimeWorkspace({
        workspaceId: null,
      })
    );

    expect(result.current.connectionState).toBe("disconnected");
  });
});
