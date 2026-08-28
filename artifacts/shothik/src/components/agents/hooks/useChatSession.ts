import { useState, useEffect, useCallback } from "react";
import { saveChatSession } from "@/lib/chat-sessions-store";

export interface ChatMessage {
  id: string;
  _id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachments?: string[];
  isStreaming?: boolean;
  status?: "streaming" | "completed" | "stopped" | "error";
  metadata?: Record<string, any>;
  [key: string]: any;
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

  const addMessage = useCallback((msg: Partial<ChatMessage> & { role: "user" | "assistant" | "system"; content: string }) => {
    setMessages((prev) => {
      const msgId = msg.id || msg._id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const normalizedMsg: ChatMessage = {
        id: msgId,
        _id: msgId,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        attachments: msg.attachments || [],
        isStreaming: msg.isStreaming ?? (msg.status === "streaming"),
        status: (msg.status ?? (msg.isStreaming ? "streaming" : "completed")) as any,
        metadata: msg.metadata || {},
      };
      const next = [...prev, normalizedMsg];
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

      const updated: ChatMessage = {
        ...last,
        content: (last.content || "") + chunk,
        isStreaming: true,
        status: "streaming" as any,
      };
      return [...prev.slice(0, -1), updated];
    });
  }, []);

  const finalizeLastAssistantMessage = useCallback(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== "assistant") return prev;

      const finalized: ChatMessage = {
        ...last,
        isStreaming: false,
        status: "completed" as any,
      };
      const allFinalized = [...prev.slice(0, -1), finalized];
      // Sync preview to storage
      if (last.content) {
        saveChatSession({
          id: conversationId,
          title: allFinalized.find((m) => m.role === "user")?.content.slice(0, 50) || "Conversation",
          preview: last.content.slice(0, 80),
        });
      }
      return allFinalized;
    });
  }, [conversationId]);

  const updateMessageMetadata = useCallback((messageId: string, metadataPatch: Record<string, any>) => {
    setMessages((prev) =>
      prev.map((msg: any) => {
        if (msg.id === messageId || msg._id === messageId) {
          return {
            ...msg,
            metadata: {
              ...(msg.metadata || {}),
              ...metadataPatch,
            },
          };
        }
        return msg;
      })
    );
  }, []);

  return {
    conversationId,
    messages,
    isLoadingHistory,
    switchConversation,
    addMessage,
    updateLastAssistantMessage,
    finalizeLastAssistantMessage,
    updateMessageMetadata,
    setMessages,
  };
}
