import { useState, useEffect, useCallback } from "react";
import { saveChatSession } from "@/lib/chat-sessions-store";

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
    setMessages((prev) => {
      const next = [...prev, msg];
      // Save session title from first user message if present
      const firstUserMsg = next.find((m) => m.role === "user");
      if (firstUserMsg && firstUserMsg.content.trim()) {
        const titleSnippet = firstUserMsg.content.trim().slice(0, 50);
        saveChatSession({
          id: conversationId,
          title: titleSnippet,
          preview: msg.content.slice(0, 80),
        });
      }
      return next;
    });
  }, [conversationId]);

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

      const finalized = [...prev.slice(0, -1), { ...last, isStreaming: false }];
      // Sync preview to storage
      if (last.content) {
        saveChatSession({
          id: conversationId,
          title: finalized.find((m) => m.role === "user")?.content.slice(0, 50) || "Conversation",
          preview: last.content.slice(0, 80),
        });
      }
      return finalized;
    });
  }, [conversationId]);

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
