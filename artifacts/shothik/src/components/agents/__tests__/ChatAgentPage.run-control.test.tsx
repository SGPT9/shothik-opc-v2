// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

afterEach(() => cleanup());

import ChatAgentPage from "../ChatAgentPage";
import { controlHermesRun } from "@/lib/chat/run-control";

const mockUseAuth = vi.fn();
const mockUseConversationMessages = vi.fn();
const mockUseChatHistory = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueryData: vi.fn(),
  }),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/chat/service", () => ({
  useConversationMessages: (...args: unknown[]) =>
    mockUseConversationMessages(...args),
  useChatService: () => ({
    deleteMessage: vi.fn(),
    deleteConversation: vi.fn(),
  }),
  chatQueryKeys: {
    all: ["chat"],
    messages: () => ["chat", "messages"],
  },
}));

vi.mock("@/components/agents/hooks/useChatSession", () => ({
  useChatSession: (initialId?: string) => {
    const [messages, setMessages] = React.useState([
      { id: "m-user", role: "user", content: "hello", timestamp: new Date().toISOString() },
      {
        id: "m-assistant",
        role: "assistant",
        content: "working on it",
        timestamp: new Date().toISOString(),
        metadata: { runId: "run_persisted_123", sessionId: "session_persisted" },
      },
    ]);
    return {
      conversationId: initialId || "conv_resumed_123",
      messages,
      switchConversation: vi.fn(),
      addMessage: vi.fn((msg: any) => {
        setMessages((prev) => [...prev, msg]);
      }),
      updateLastAssistantMessage: vi.fn(),
      finalizeLastAssistantMessage: vi.fn(),
      updateMessageMetadata: vi.fn(),
    };
  },
}));

vi.mock("@/hooks/useChatHistory", () => ({
  useChatHistory: (...args: unknown[]) => mockUseChatHistory(...args),
}));

vi.mock("@/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/chat/Composer", () => ({
  Composer: React.forwardRef((props: any, _ref: any) => (
    <div>
      <button onClick={() => props.onAction?.({ type: "STOP_STREAM" })}>composer-stop</button>
      <button onClick={() => props.onSend?.("hello voice")}>voice-send</button>
    </div>
  )),
}));

vi.mock("@/components/chat/Transcript", () => ({
  Transcript: (props: any) => (
    <button onClick={props.onStop}>transcript-stop</button>
  ),
}));

vi.mock("@/components/chat/ArtifactPane", () => ({ ArtifactPane: () => null }));
vi.mock("@/components/chat/VoicePopup", () => ({
  // Expose a direct way to start a new turn: VoicePopup's onSendTranscript
  // calls the page's send(text).
  VoicePopup: (props: any) => (
    <button onClick={() => props.onSendTranscript("second turn")}>
      voice-send
    </button>
  ),
}));
vi.mock("@/components/chat/TwinCtaCard", () => ({ TwinCtaCard: () => null }));

const CONVERSATION_ID = "conv-1";
const PERSISTED_RUN_ID = "run_persisted_123";

function makeMessages() {
  const now = Date.now();
  return [
    {
      _id: "m-user",
      conversationId: CONVERSATION_ID,
      userId: "u1",
      role: "user",
      content: "hello",
      contentFormat: "plain",
      status: "completed",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "m-assistant",
      conversationId: CONVERSATION_ID,
      userId: "u1",
      role: "assistant",
      content: "working on it",
      contentFormat: "markdown",
      status: "streaming",
      // Run id persisted from a previous session's stream events — the
      // resumed-conversation scenario where transient runId state is null.
      metadata: { runId: PERSISTED_RUN_ID, sessionId: "session_persisted" },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function hermesRunCalls() {
  return vi
    .mocked(global.fetch)
    .mock.calls.filter(([url]) => String(url).includes("/api/hermes/runs/"));
}

describe("ChatAgentPage run control (resumed conversation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { _id: "u1", name: "User" },
    });
    mockUseConversationMessages.mockReturnValue({
      data: makeMessages(),
      error: null,
    });
    mockUseChatHistory.mockReturnValue({
      conversations: [
        {
          _id: CONVERSATION_ID,
          userId: "u1",
          surface: "flagship",
          title: "Resumed conversation",
          status: "active",
          pinned: false,
          temporary: false,
          lastMessageAt: Date.now(),
          messageCount: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      error: null,
    });
  });

  it("kill switch POSTs a real cancel for the run id persisted in message metadata", async () => {
    render(<ChatAgentPage />);

    fireEvent.click(screen.getByText("transcript-stop"));

    await waitFor(() => {
      expect(hermesRunCalls()).toHaveLength(1);
    });
    const [url, init] = hermesRunCalls()[0]!;
    expect(String(url)).toBe(`/api/hermes/runs/${PERSISTED_RUN_ID}`);
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ action: "cancel" });
    expect(
      (init?.headers as Record<string, string>)["x-chat-device-id"],
    ).toMatch(/^guest-/);
  });

  it("does not cancel the previous run when Stop is clicked on a new turn before run_started", async () => {
    // Second-turn scenario: a prior run id exists (persisted metadata /
    // previous turn), the user sends a new message, and clicks Stop before
    // the new turn's run_started event arrives. The kill switch must NOT
    // POST a cancel for the stale run id — only abort the local stream.
    vi.mocked(global.fetch).mockImplementation(async (url: any) => {
      if (String(url) === "/api/chat") {
        return {
          ok: true,
          // A stream that never yields: the turn stays in flight with no
          // run_started event, so no run id belongs to this turn yet.
          body: { getReader: () => ({ read: () => new Promise(() => {}) }) },
        } as unknown as Response;
      }
      return { ok: true, json: vi.fn().mockResolvedValue({}) } as unknown as Response;
    });

    render(<ChatAgentPage />);

    fireEvent.click(screen.getByText("voice-send"));
    await waitFor(() => {
      expect(
        vi.mocked(global.fetch).mock.calls.some(([u]) => String(u) === "/api/chat"),
      ).toBe(true);
    });

    fireEvent.click(screen.getByText("composer-stop"));

    // Give any (incorrect) cancel POST a chance to fire.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(hermesRunCalls()).toHaveLength(0);
    // The pause control must not be visible without this turn's run id.
    expect(screen.queryByText("Pause run")).toBeNull();
  });

  it("composer stop also cancels the persisted run", async () => {
    render(<ChatAgentPage />);

    fireEvent.click(screen.getByText("composer-stop"));

    await waitFor(() => {
      expect(hermesRunCalls()).toHaveLength(1);
    });
    expect(String(hermesRunCalls()[0]![0])).toBe(
      `/api/hermes/runs/${PERSISTED_RUN_ID}`,
    );
  });
});

describe("controlHermesRun pause/resume request contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response);
  });

  it.each(["pause", "resume", "cancel"] as const)(
    "POSTs %s to /api/hermes/runs/[runId] with guest headers",
    async (action) => {
      const result = await controlHermesRun(PERSISTED_RUN_ID, action);
      expect(result.ok).toBe(true);
      const [url, init] = vi.mocked(global.fetch).mock.calls[0]!;
      expect(String(url)).toBe(`/api/hermes/runs/${PERSISTED_RUN_ID}`);
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ action });
      expect(
        (init?.headers as Record<string, string>)["x-chat-device-id"],
      ).toMatch(/^guest-/);
    },
  );

  it("surfaces upstream failures instead of silently succeeding", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: vi.fn().mockResolvedValue({ error: "Run already completed" }),
    } as unknown as Response);
    const result = await controlHermesRun(PERSISTED_RUN_ID, "pause");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Run already completed");
  });
});
