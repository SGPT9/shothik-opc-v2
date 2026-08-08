import { useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachments?: string[];
  isStreaming?: boolean;
}

export function useChatSession(initialConversationId?: string) {
  const [conversationId, setConversationId] = useState<string>(
    initialConversationId || `conv_${Date.now()}`
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Sync or reset conversation ID
  const switchConversation = useCallback((newId: string) => {
    setConversationId(newId);
    setMessages([]);
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastAssistantMessage = useCallback((chunk: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== "assistant") return prev;

      const updated = {
        ...last,
        content: last.content + chunk,
        isStreaming: true,
      };
      return [...prev.slice(0, -1), updated];
    });
  }, []);

  const finalizeLastAssistantMessage = useCallback(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== "assistant") return prev;

      return [...prev.slice(0, -1), { ...last, isStreaming: false }];
    });
  }, []);

  return {
    conversationId,
    messages,
    isLoadingHistory,
    switchConversation,
    addMessage,
    updateLastAssistantMessage,
    finalizeLastAssistantMessage,
    setMessages,
  };
}
