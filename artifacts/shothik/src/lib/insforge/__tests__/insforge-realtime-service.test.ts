import { describe, it, expect, vi } from "vitest";
import { InsForgeRealtimeService } from "../insforge-realtime-service";

describe("InsForgeRealtimeService WebSocket Pub/Sub", () => {
  it("should connect to InsForge WebSocket gateway and handle channel subscriptions", () => {
    InsForgeRealtimeService.connect("ws_polsia_101");

    const handler = vi.fn();
    const unsubscribe = InsForgeRealtimeService.subscribe("twin_jobs", handler);

    InsForgeRealtimeService.broadcast({
      channel: "twin_jobs",
      event: "job_completed",
      workspaceId: "ws_polsia_101",
      data: { taskId: "task_9918", result: "Analysis complete" },
      timestamp: new Date().toISOString(),
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "twin_jobs",
        event: "job_completed",
      })
    );

    unsubscribe();
    InsForgeRealtimeService.disconnect();
  });
});
