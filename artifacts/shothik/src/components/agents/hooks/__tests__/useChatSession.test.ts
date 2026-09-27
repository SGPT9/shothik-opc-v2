import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatSession } from "../useChatSession";

describe("useChatSession Hook & Conversation Branching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with provided conversationId or generated id", () => {
    const { result } = renderHook(() => useChatSession("conv_test_123"));
    expect(result.current.conversationId).toBe("conv_test_123");
    expect(result.current.messages).toEqual([]);
  });

  it("adds user and assistant messages and updates content dynamically", () => {
    const { result } = renderHook(() => useChatSession("conv_chat_abc"));

    act(() => {
      result.current.addMessage({
        role: "user",
        content: "How to integrate Steadfast courier?",
      });
    });

    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].content).toBe("How to integrate Steadfast courier?");

    act(() => {
      result.current.addMessage({
        role: "assistant",
        content: "To integrate Steadfast, use ",
        isStreaming: true,
      });
    });

    expect(result.current.messages.length).toBe(2);

    act(() => {
      result.current.updateLastAssistantMessage("POST /api/logistics/steadfast.");
    });

    expect(result.current.messages[1].content).toBe("To integrate Steadfast, use POST /api/logistics/steadfast.");

    act(() => {
      result.current.finalizeLastAssistantMessage();
    });

    expect(result.current.messages[1].isStreaming).toBe(false);
    expect(result.current.messages[1].status).toBe("completed");
  });

  it("forks conversation session from a specific message branching point", () => {
    const { result } = renderHook(() => useChatSession("conv_parent_root"));

    act(() => {
      result.current.addMessage({
        id: "msg_1",
        role: "user",
        content: "What is the NBR Mushak-6.3 requirement?",
      });
      result.current.addMessage({
        id: "msg_2",
        role: "assistant",
        content: "Mushak 6.3 is the statutory tax invoice in Bangladesh.",
      });
      result.current.addMessage({
        id: "msg_3",
        role: "user",
        content: "What about Section 50 withholding?",
      });
    });

    expect(result.current.messages.length).toBe(3);

    let forkedId = "";
    act(() => {
      forkedId = result.current.forkSession("msg_2");
    });

    expect(forkedId).toContain("conv_fork_");
    expect(result.current.conversationId).toBe(forkedId);
    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[1].id).toBe("msg_2");
  });
});
