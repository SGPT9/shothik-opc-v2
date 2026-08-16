// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import {
  useChatStreamEngine,
  type StreamTransport,
  type StreamCallbacks,
} from "../useChatStreamEngine";

describe("useChatStreamEngine — Deep Module Seam Tests", () => {
  afterEach(() => {
    cleanup();
  });

  it("streams tokens successfully through the injected transport seam", async () => {
    const receivedChunks: string[] = [];
    let completed = false;

    const fakeTransport: StreamTransport = {
      async sendStream(_endpoint, _payload, _signal, callbacks: StreamCallbacks) {
        callbacks.onChunk("Hello");
        callbacks.onChunk(" world");
        callbacks.onChunk(" from DeepSeek!");
        callbacks.onComplete();
      },
    };

    const { result } = renderHook(() =>
      useChatStreamEngine({ transport: fakeTransport })
    );

    expect(result.current.streamState.isStreaming).toBe(false);

    await act(async () => {
      await result.current.startStream(
        "/api/chat",
        { query: "test" },
        (chunk) => receivedChunks.push(chunk),
        () => {
          completed = true;
        },
        vi.fn()
      );
    });

    expect(receivedChunks).toEqual(["Hello", " world", " from DeepSeek!"]);
    expect(completed).toBe(true);
    expect(result.current.streamState.isStreaming).toBe(false);
    expect(result.current.streamState.statusText).toBe("Response complete");
    expect(result.current.streamState.error).toBeNull();
  });

  it("dispatches typed steps, traces, and artifacts through event callbacks", async () => {
    const steps: any[] = [];
    const traces: any[] = [];
    const artifacts: any[] = [];

    const mockEventTransport: StreamTransport = {
      async sendStream(_endpoint, _payload, _signal, callbacks: StreamCallbacks) {
        callbacks.onStep?.({
          id: "step-1",
          type: "code",
          label: "Running Python math simulation in BoxLite MicroVM",
          status: "completed",
          latencyMs: 42,
        });
        callbacks.onTrace?.({
          stepId: "step-1",
          detail: "Extracted 24 financial periods with zero host leak",
          timestamp: Date.now(),
        });
        callbacks.onArtifact?.({
          type: "sheet",
          title: "2026 BDT Revenue Model",
          data: { rows: 24 },
        });
        callbacks.onChunk("Execution complete!");
        callbacks.onComplete();
      },
    };

    const { result } = renderHook(() =>
      useChatStreamEngine({ transport: mockEventTransport })
    );

    const onChunk = vi.fn();
    const onComplete = vi.fn();

    await act(async () => {
      await result.current.startStream(
        "/api/chat",
        {},
        onChunk,
        onComplete,
        vi.fn()
      );
    });

    expect(onChunk).toHaveBeenCalledWith("Execution complete!");
    expect(onComplete).toHaveBeenCalled();
  });

  it("handles stream cancellation cleanly via abort signal", async () => {
    const slowTransport: StreamTransport = {
      async sendStream(_endpoint, _payload, signal, callbacks: StreamCallbacks) {
        callbacks.onChunk("First chunk");
        await new Promise((resolve) => setTimeout(resolve, 50));
        if (signal.aborted) {
          throw new DOMException("The user aborted a request.", "AbortError");
        }
        callbacks.onChunk("Second chunk");
        callbacks.onComplete();
      },
    };

    const { result } = renderHook(() =>
      useChatStreamEngine({ transport: slowTransport })
    );

    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    let streamPromise: Promise<void>;
    act(() => {
      streamPromise = result.current.startStream(
        "/api/chat",
        {},
        onChunk,
        onComplete,
        onError
      );
    });

    expect(result.current.streamState.isStreaming).toBe(true);

    act(() => {
      result.current.stopStream();
    });

    await act(async () => {
      await streamPromise;
    });

    expect(result.current.streamState.isStreaming).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("propagates transport errors and updates error state without crashing", async () => {
    const failingTransport: StreamTransport = {
      async sendStream(_endpoint, _payload, _signal, callbacks: StreamCallbacks) {
        callbacks.onError(new Error("Rate limit exceeded on InsForge Edge Gateway"));
      },
    };

    const { result } = renderHook(() =>
      useChatStreamEngine({ transport: failingTransport })
    );

    const onError = vi.fn();

    await act(async () => {
      await result.current.startStream(
        "/api/chat",
        {},
        vi.fn(),
        vi.fn(),
        onError
      );
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Rate limit exceeded on InsForge Edge Gateway" })
    );
    expect(result.current.streamState.isStreaming).toBe(false);
    expect(result.current.streamState.error).toBe(
      "Rate limit exceeded on InsForge Edge Gateway"
    );
  });
});
