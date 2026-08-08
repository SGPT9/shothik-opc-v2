

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "@/lib/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Globe } from "lucide-react";
import { Composer } from "@/components/chat/Composer";
import { Transcript } from "@/components/chat/Transcript";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArtifactPane } from "@/components/chat/ArtifactPane";
import { VoicePopup } from "@/components/chat/VoicePopup";
import { parseFlagshipSlashCommand } from "@/lib/chat/commands";
import {
  getLocalDraftConversationId,
  isLocalDraftConversationId,
  loadLocalChatHistory,
  saveLocalChatHistory,
  upsertLocalConversationSnapshot,
} from "@/lib/chat/local-history";
import { chatQueryKeys, useChatService, useConversationMessages } from "@/lib/chat/service";
import type { ChatAttachment, ChatMessage, ChatTurnProgressItem } from "@/lib/chat/types";
import { useTranslation } from "@/i18n";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useAuth } from "@/providers/AuthProvider";
import { TwinCtaCard } from "@/components/chat/TwinCtaCard";
import { extractPlanFromPayload, friendlyStatusLabel, isStreamingEnabled } from "@/lib/chat/streaming";
import { controlHermesRun } from "@/lib/chat/run-control";
import { guestChatHeaders } from "@/lib/chat/guest-device-id";

type PendingAttachment = ChatAttachment & {
  text: string;
  status: "ready" | "uploading" | "error";
  error?: string;
};

type ChatMessageMetadata = NonNullable<ChatMessage["metadata"]>;

/**
 * Quick client-side check for document-like attachments (PDFs and
 * common office document MIME types). Mirrors the backend
 * isDocumentAttachment heuristic so the frontend can set a
 * documentIntent without waiting for the server round-trip.
 */
function isDocumentLike(attachment: PendingAttachment): boolean {
  if (attachment.kind === "url") return false;
  const mime = (attachment.mimeType ?? "").toLowerCase();
  const name = (attachment.name ?? "").toLowerCase();
  return (
    mime === "application/pdf" ||
    mime.includes("pdf") ||
    name.endsWith(".pdf") ||
    mime.startsWith("application/vnd.") ||
    mime === "application/msword" ||
    mime.includes("officedocument") ||
    mime === "text/plain"
  );
}

function getOrCreateChatDeviceId(userId?: string | null) {
  if (typeof window === "undefined") return "server";

  const storageKey = `shothik:chat-device:${userId ?? "anonymous"}`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `device-${Date.now()}`;
  window.localStorage.setItem(storageKey, next);
  return next;
}

type ComposerChatMode = "cofounder" | "web-search" | "scenario-testing";

const CHAT_MODE_STORAGE_KEY = "shothik:chat-mode-by-conversation";
const CHAT_MODES: ComposerChatMode[] = ["cofounder", "web-search", "scenario-testing"];

function loadStoredChatMode(conversationId: string | null): ComposerChatMode | null {
  if (typeof window === "undefined" || !conversationId) return null;
  try {
    const raw = window.localStorage.getItem(CHAT_MODE_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    const stored = map[conversationId];
    return CHAT_MODES.includes(stored as ComposerChatMode)
      ? (stored as ComposerChatMode)
      : null;
  } catch {
    return null;
  }
}

function saveStoredChatMode(conversationId: string | null, mode: ComposerChatMode) {
  if (typeof window === "undefined" || !conversationId) return;
  try {
    const raw = window.localStorage.getItem(CHAT_MODE_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[conversationId] = mode;
    window.localStorage.setItem(CHAT_MODE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Best-effort persistence only.
  }
}

const TURN_PROGRESS_ORDER = ["mode", "queue", "session", "run", "plan", "document", "response"] as const;

function upsertProgressItem(
  progress: ChatTurnProgressItem[] | undefined,
  nextItem: ChatTurnProgressItem,
) {
  const nextProgress = [...(progress ?? [])];
  const index = nextProgress.findIndex((item) => item.id === nextItem.id);

  if (index >= 0) {
    nextProgress[index] = {
      ...nextProgress[index],
      ...nextItem,
    };
  } else {
    nextProgress.push(nextItem);
  }

  return nextProgress.sort((left, right) => {
    const leftIndex = TURN_PROGRESS_ORDER.indexOf(left.id as (typeof TURN_PROGRESS_ORDER)[number]);
    const rightIndex = TURN_PROGRESS_ORDER.indexOf(right.id as (typeof TURN_PROGRESS_ORDER)[number]);
    return (leftIndex === -1 ? TURN_PROGRESS_ORDER.length : leftIndex) - (rightIndex === -1 ? TURN_PROGRESS_ORDER.length : rightIndex);
  });
}

function buildInitialProgress(options: {
  slashCommand: ReturnType<typeof parseFlagshipSlashCommand>;
  documentTurn: boolean;
}) {
  const now = Date.now();
  const progress: ChatTurnProgressItem[] = [
    {
      id: "queue",
      label: "Queued",
      state: "active",
      detail: "Waiting for Hermes to accept this turn",
      updatedAt: now,
    },
    {
      id: "session",
      label: "Session",
      state: "pending",
      updatedAt: now,
    },
    {
      id: "run",
      label: "Run",
      state: "pending",
      updatedAt: now,
    },
    {
      id: "response",
      label: "Response",
      state: "pending",
      updatedAt: now,
    },
  ];

  if (options.documentTurn) {
    progress.splice(3, 0, {
      id: "document",
      label: "Document",
      state: "pending",
      updatedAt: now,
    });
  }

  if (options.slashCommand?.name === "spec") {
    progress.unshift({
      id: "mode",
      label: "Spec mode",
      state: "completed",
      detail: options.slashCommand.argument
        ? "Hermes will treat this as a spec turn"
        : "Hermes will build from the attached context",
      updatedAt: now,
    });
  }

  return progress;
}

export default function ChatAgentPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [composerError, setComposerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ComposerChatMode>("cofounder");
  const [modelHandle, setModelHandle] = useState("gemini-2.5-flash");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [statusText, setStatusText] = useState<string | null>(null);
  // Hermes run/session state — captured from canonical __hermes events in
  // the SSE stream. This is the seam toward Hermes-backed runtime: the
  // frontend knows the runId, sessionId, and workspaceId, enabling
  // run-resume, session-resume, and status polling.
  const [runId, setRunId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  // Document intelligence artifact state — captured from the
  // artifact_ready canonical event emitted by the document ingestion
  // orchestrator. Used to render an artifact card and link the
  // assistant message to the durable document artifact.
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [localHistory, setLocalHistory] = useState(() => loadLocalChatHistory(null, "flagship"));
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Conversation id assigned by the in-flight stream's "conversation" event.
  // Used to avoid wiping live streaming state when the id changes mid-turn.
  const streamAssignedConversationRef = useRef<string | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const chatEnabled = isAuthenticated && !authIsLoading;
  const messagesQuery = useConversationMessages(conversationId, 200, false, {
    enabled: chatEnabled,
  });
  const messages = messagesQuery.data;
  const { deleteMessage, deleteConversation } = useChatService();
  const { conversations, error: conversationHistoryError } = useChatHistory({
    surface: "flagship",
    limit: 20,
    enabled: chatEnabled,
  });
  const activeComposerCommand = parseFlagshipSlashCommand(input);
  const localConversationSummaries = useMemo(
    () => localHistory.conversations.map((entry) => entry.summary),
    [localHistory.conversations],
  );
  const fallbackConversations = useMemo(
    () => (conversations.length > 0 ? conversations : localConversationSummaries),
    [conversations, localConversationSummaries],
  );
  const activeConversationBackup = localHistory.conversations.find(
    (entry) => entry.summary._id === conversationId,
  );
  const recoveredMessages = activeConversationBackup?.messages ?? [];
  const usingRecoveredHistory =
    fallbackConversations.length > 0 &&
    conversations.length === 0 &&
    recoveredMessages.length > 0 &&
    (Boolean(conversationHistoryError) || Boolean(messagesQuery.error) || Boolean(localConversationSummaries.length));

  const SUGGESTIONS = [
    "I want to build a SaaS for clinics",
    "Can this idea become a company?",
    "Find competitors for my product",
    "Test different pricing scenarios",
  ];

  const FOLLOW_UPS = {
    cofounder: ["Challenge this plan", "Start this in Twin"],
    "web-search": ["Search competitors", "Find market benchmarks"],
    "scenario-testing": ["Test worst-case outcome", "Compare pricing options"]
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveMessages, statusText]);

  useEffect(() => {
    // Abort any in-flight stream when the page unmounts so the connection
    // doesn't linger after navigation.
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setLocalHistory(loadLocalChatHistory(user?._id ?? null, "flagship"));
  }, [user?._id]);

  useEffect(() => {
    // ChatGPT / Perplexity Playground mode: unauthenticated users are welcomed into guest chat playground
    if (authIsLoading) return;
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    // #region debug-point C:chat-page-auth-state
    fetch("http://127.0.0.1:7777/event", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "chat-auth-session",
        runId: "pre-fix",
        hypothesisId: "C",
        location: "components/agents/ChatAgentPage.tsx:auth-state",
        msg: "[DEBUG] Chat page auth state changed",
        data: {
          authIsLoading,
          isAuthenticated,
          hasUser: Boolean(user?._id),
          conversationId,
          conversationCount: fallbackConversations.length,
          hasMessages: Boolean((messages?.length ?? 0) || recoveredMessages.length),
        },
        ts: Date.now(),
      }),
    }).catch(() => undefined);
    // #endregion
  }, [
    authIsLoading,
    conversationId,
    fallbackConversations.length,
    isAuthenticated,
    messages?.length,
    recoveredMessages.length,
    user?._id,
  ]);

  // Sync conversation selection with the URL (?conversationId=...).
  // Sidebar Recents, Deep Research, and Saved Reports all deep-link here.
  // A "new_*" id means the user explicitly asked for a fresh chat.
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");
  const requestedNewChat = Boolean(urlConversationId?.startsWith("new_"));
  useEffect(() => {
    if (!urlConversationId) return;
    if (requestedNewChat) {
      setConversationId(null);
      setInput("");
      setComposerError(null);
      return;
    }
    setConversationId((current) =>
      current === urlConversationId ? current : urlConversationId,
    );
  }, [urlConversationId, requestedNewChat]);

  useEffect(() => {
    // Don't auto-select a recent conversation when the user explicitly
    // requested a new chat or deep-linked to a specific conversation.
    if (conversationId || requestedNewChat || urlConversationId || !fallbackConversations.length) return;
    setConversationId(String(fallbackConversations[0]._id));
  }, [conversationId, fallbackConversations, requestedNewChat, urlConversationId]);

  // Reset Hermes session/run state when the user switches conversations.
  // Each conversation maps to its own Hermes session; switching conversations
  // means the old sessionId/runId are no longer valid.
  useEffect(() => {
    // When the conversation id was just assigned by the in-flight stream
    // (the backend created the conversation for this turn), keep the live
    // streaming messages — resetting here would wipe the streaming bubble
    // mid-turn.
    if (
      conversationId &&
      streamAssignedConversationRef.current === conversationId
    ) {
      return;
    }
    // A genuine conversation switch: abort any in-flight stream so its late
    // events can't mutate state that now belongs to the new conversation.
    abortRef.current?.abort();
    setSessionId(null);
    setRunId(null);
    setWorkspaceId(null);
    setArtifactId(null);
    setLiveMessages([]);
    setStatusText(null);
  }, [conversationId]);

  // Restore the composer mode saved for this conversation (mode is
  // preserved per conversation when switching between recents).
  useEffect(() => {
    if (!conversationId) {
      setChatMode("cofounder");
      return;
    }
    const stored = loadStoredChatMode(conversationId);
    if (stored) {
      setChatMode(stored);
    } else {
      // First time seeing this conversation (e.g. the backend just created
      // it for the in-flight turn): remember the mode currently in use.
      setChatMode((current) => {
        saveStoredChatMode(conversationId, current);
        return current;
      });
    }
  }, [conversationId]);


  const visibleMessages = useMemo(() => {
    const baseMessages =
      messages && messages.length > 0
        ? messages
        : recoveredMessages;
    const persisted = baseMessages.filter((message) => message.role !== "system");
    if (!liveMessages.length) return persisted;
    const persistedIds = new Set(persisted.map((message) => String(message._id)));
    return [
      ...persisted,
      ...liveMessages.filter((message) => !persistedIds.has(String(message._id))),
    ];
  }, [liveMessages, messages, recoveredMessages]);

  const isCompanyIntent = useMemo(() => {
    const lastUserMessages = visibleMessages.filter(m => m.role === 'user').slice(-3);
    const keywords = ['build an app', 'saas', 'tool', 'marketplace', 'agency', 'service', 'business plan', 'pricing', 'launch', 'validation', 'go-to-market', 'roadmap', 'startup', 'customers', 'company'];
    return lastUserMessages.some(m =>
      keywords.some(k => String(m.content).toLowerCase().includes(k))
    );
  }, [visibleMessages]);

  useEffect(() => {
    if (!user?._id) return;

    if (!visibleMessages.length) return;

    const backupConversationId =
      conversationId ?? getLocalDraftConversationId("flagship");
    const activeSummary = fallbackConversations.find(
      (entry) => entry._id === backupConversationId,
    );

    setLocalHistory((current) => {
      const next = upsertLocalConversationSnapshot(current, {
        conversationId: backupConversationId,
        userId: user._id,
        surface: "flagship",
        messages: visibleMessages,
        summary: activeSummary,
      });

      if (JSON.stringify(next) === JSON.stringify(current)) {
        return current;
      }

      saveLocalChatHistory(user._id, "flagship", next);
      return next;
    });
  }, [conversationId, fallbackConversations, user?._id, visibleMessages]);

  const handleRemoveAttachment = (attachmentId: string) => {
    setPendingAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentId),
    );
  };

  const handleModeChange = (mode: ComposerChatMode) => {
    setChatMode(mode);
    saveStoredChatMode(conversationId, mode);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (composerError) setComposerError(null);
  };

  const handleAttachFiles = async (files: FileList | File[]) => {
    const entries = Array.from(files);
    for (const file of entries) {
      const attachmentId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setPendingAttachments((current) => [
        ...current,
        {
          id: attachmentId,
          kind: "file",
          name: file.name,
          mimeType: file.type || undefined,
          preview: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          text: "",
          status: "uploading",
        },
      ]);

      try {
        const formData = new FormData();
        formData.set("file", file);

        const response = await fetch("/api/extract-pdf-v2", {
          method: "POST",
          body: formData,
        });
        const json = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            (json as { error?: string } | null)?.error || "Failed to prepare attachment",
          );
        }

        const extractedText =
          typeof (json as { text?: unknown } | null)?.text === "string"
            ? (json as { text: string }).text
            : "";

        setPendingAttachments((current) =>
          current.map((attachment) =>
            attachment.id === attachmentId
              ? {
                  ...attachment,
                  text: extractedText,
                  preview:
                    (json as { preview?: string } | null)?.preview ||
                    attachment.preview ||
                    "Ready for this turn",
                  status: "ready",
                }
              : attachment,
          ),
        );
      } catch (error) {
        setPendingAttachments((current) =>
          current.map((attachment) =>
            attachment.id === attachmentId
              ? {
                  ...attachment,
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to prepare attachment",
                }
              : attachment,
          ),
        );
      }
    }
  };

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const readyAttachments = pendingAttachments.filter(
      (attachment) => attachment.status === "ready",
    );
    const slashCommand = parseFlagshipSlashCommand(userText);
    const documentTurn = readyAttachments.some((attachment) => isDocumentLike(attachment)) || Boolean(artifactId);
    const privacy =
      slashCommand?.name === "spec" || documentTurn
        ? {
            mode: "sensitive" as const,
            retention: "minimized" as const,
            containsSensitiveData: true,
            redactionReason: documentTurn
              ? "document-context"
              : "spec-workflow",
          }
        : {
            mode: "standard" as const,
            retention: "default" as const,
            containsSensitiveData: false,
          };
    const sync = {
      deviceId: getOrCreateChatDeviceId(user?._id),
      platform: "web",
      sequence: Date.now(),
      clientTimestamp: Date.now(),
    };

    if (slashCommand?.name === "spec" && !slashCommand.argument && readyAttachments.length === 0) {
      setComposerError("`/spec` needs a prompt or an attached document.");
      inputRef.current?.focus();
      return;
    }

    setComposerError(null);

    const attachmentContext = readyAttachments
      .map(
        (attachment) =>
          `Attachment: ${attachment.name}\n${attachment.text.slice(0, 6000)}`,
      )
      .join("\n\n---\n\n");
    const turnContext = attachmentContext || undefined;
    const attachmentMeta: ChatAttachment[] = readyAttachments.map(
      ({ id, kind, name, mimeType, preview, sourceUrl }) => ({
        id,
        kind,
        name,
        mimeType,
        preview,
        sourceUrl,
      }),
    );
    const optimisticUserId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `user-${Date.now()}`;
    const optimisticAssistantId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `assistant-${Date.now()}`;
    const initialStatus =
      slashCommand?.name === "spec"
        ? "Spec request queued"
        : readyAttachments.length
          ? "Preparing chat with attachments"
          : "Starting run";
    const initialProgress = buildInitialProgress({
      slashCommand,
      documentTurn,
    });
    const activeAssistantIds = new Set<string>([optimisticAssistantId]);
    let requestSucceeded = false;
    // Feature flag: when streaming is disabled, buffer tokens and render the
    // completed response as a single block on `done`.
    const streamingEnabled = isStreamingEnabled();
    let bufferedContent = "";

    const updateCurrentAssistant = (
      updater: (message: ChatMessage, metadata: ChatMessageMetadata) => ChatMessage,
    ) => {
      setLiveMessages((current) =>
        current.map((message) => {
          if (!activeAssistantIds.has(String(message._id))) return message;
          const metadata = (message.metadata ?? {}) as ChatMessageMetadata;
          return updater(message, metadata);
        }),
      );
    };

    const patchCurrentAssistant = (options: {
      status?: ChatMessage["status"];
      content?: string;
      appendContent?: string;
      statusLabel?: string | null;
      progressItem?: ChatTurnProgressItem;
      metadata?: Partial<ChatMessageMetadata>;
    }) => {
      updateCurrentAssistant((message, metadata) => ({
        ...message,
        content:
          options.content !== undefined
            ? options.content
            : options.appendContent
              ? `${message.content}${options.appendContent}`
              : message.content,
        status: options.status ?? message.status,
        metadata: {
          ...metadata,
          ...(options.metadata ?? {}),
          statusLabel:
            options.statusLabel === null ? undefined : options.statusLabel ?? metadata.statusLabel,
          progress: options.progressItem
            ? upsertProgressItem(metadata.progress, options.progressItem)
            : metadata.progress,
        },
        updatedAt: Date.now(),
      }));
    };

    setInput("");
    setLoading(true);
    // Per-turn run state: each turn gets its own Hermes run, so the previous
    // turn's runId must not leak into this one. Run controls (cancel/pause/
    // resume) stay disabled until this turn's run_started event arrives —
    // otherwise Stop clicked early would cancel the prior, already-completed
    // run. The sessionId is kept: it grounds the turn on prior session
    // context (resume_session).
    setRunId(null);
    setStatusText(initialStatus);
    activeAssistantIdRef.current = optimisticAssistantId;
    setLiveMessages((current) => [
      ...current,
      {
        _id: optimisticUserId,
        conversationId: conversationId ?? "pending",
        userId: "local",
        role: "user",
        content: userText,
        contentFormat: "plain",
        status: "completed",
        metadata: {
          ...(attachmentMeta.length ? { attachments: attachmentMeta } : {}),
          ...(slashCommand ? { slashCommand } : {}),
          privacy,
          sync,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        _id: optimisticAssistantId,
        conversationId: conversationId ?? "pending",
        userId: "local",
        role: "assistant",
        content: "",
        contentFormat: "markdown",
        status: "streaming",
        metadata: {
          sessionId: sessionId ?? undefined,
          workspaceId: workspaceId ?? undefined,
          artifactId: artifactId ?? undefined,
          slashCommand: slashCommand ?? undefined,
          chatMode,
          privacy,
          sync,
          statusLabel: initialStatus,
          progress: initialProgress,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    setPendingAttachments([]);

    try {
      abortRef.current = new AbortController();

      const history = (messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: "user", content: userText });

      const res = await fetch("/api/chat", {
        method: "POST",
        // Guest access contract: chat routes authorize unauthenticated
        // users via the `x-chat-device-id` header (value prefixed `guest-`).
        headers: { "Content-Type": "application/json", ...guestChatHeaders() },
        body: JSON.stringify({
          conversationId:
            conversationId && !isLocalDraftConversationId(conversationId)
              ? conversationId
              : undefined,
          surface: "flagship",
          messages: history,
          modelHandle,
          chatMode,
          activeSkill: chatMode === "web-search" ? "research" : undefined,
          context: turnContext,
          attachments: attachmentMeta,
          // Resume mode: pass the current Hermes sessionId so the
          // orchestrator grounds this turn on prior session context
          // (resume_session). The previous turn's runId is intentionally NOT
          // sent — each turn gets a fresh run; resuming a completed run
          // would target stale run state.
          sessionId: sessionId ?? undefined,
          // Document intelligence: signal an ingest intent when the turn
          // carries a document attachment, and pass the current artifactId
          // so follow-up turns can reference the durable document artifact.
          privacy,
          sync,
          documentIntent:
            documentTurn
              ? "ingest"
              : undefined,
          sourceUrl: undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(
          (json as { error?: string } | null)?.error ||
            `Request failed with status ${res.status}`,
        );
      }

      if (!res.body) {
        throw new Error("Streaming response was unavailable");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let data: any;
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          // Capture canonical Hermes events. These are proper
          // HermesEventEnvelope objects (with __hermes: true marker)
          // emitted through the HermesStreamingEngine (Redis-backed:
          // replay, hot state, sequence). They carry sessionId, runId,
          // workspaceId, eventType, sequence, and payload.
          if (data.__hermes) {
            if (
              (data.eventType === "session_created" ||
                data.eventType === "session_resumed") &&
              data.sessionId
            ) {
              const resumed = data.eventType === "session_resumed";
              setSessionId(data.sessionId);
              if (data.workspaceId) setWorkspaceId(data.workspaceId);
              setStatusText(resumed ? "Session resumed" : "Session connected");
              patchCurrentAssistant({
                statusLabel: resumed ? "Session resumed" : "Session connected",
                progressItem: {
                  id: "session",
                  label: "Session",
                  state: "completed",
                  detail: resumed
                    ? "Resumed the previous session context"
                    : "Connected to the Hermes session",
                  updatedAt: Date.now(),
                },
                metadata: {
                  sessionId: data.sessionId,
                  workspaceId: data.workspaceId ?? workspaceId ?? undefined,
                },
              });
              patchCurrentAssistant({
                progressItem: {
                  id: "queue",
                  label: "Queued",
                  state: "completed",
                  updatedAt: Date.now(),
                },
              });
            }
            if (data.eventType === "run_started" && data.runId) {
              setRunId(data.runId);
              if (data.workspaceId) setWorkspaceId(data.workspaceId);
              setStatusText("Run started");
              patchCurrentAssistant({
                statusLabel: "Run started",
                progressItem: {
                  id: "run",
                  label: "Run",
                  state: "active",
                  detail: "Hermes accepted the turn",
                  updatedAt: Date.now(),
                },
                metadata: {
                  runId: data.runId,
                  workspaceId: data.workspaceId ?? workspaceId ?? undefined,
                },
              });
            }
            if (data.eventType === "plan_generated") {
              const plan = extractPlanFromPayload(data.payload);
              if (plan) {
                setStatusText("Plan ready");
                patchCurrentAssistant({
                  statusLabel: "Plan ready",
                  progressItem: {
                    id: "plan",
                    label: "Plan",
                    state: "completed",
                    detail: plan.steps[0] ?? plan.intent ?? "Plan generated",
                    updatedAt: Date.now(),
                  },
                  metadata: { plan },
                });
              }
            }
            if (data.eventType === "progress_update") {
              const progressMessage =
                typeof data.payload?.message === "string" ? data.payload.message : "Streaming response";
              setStatusText(progressMessage);
              patchCurrentAssistant({
                statusLabel: progressMessage,
                progressItem: {
                  id: "run",
                  label: "Run",
                  state: "active",
                  detail: progressMessage,
                  updatedAt: Date.now(),
                },
              });
            }
            if (
              data.eventType === "run_completed" ||
              data.eventType === "run_failed" ||
              data.eventType === "run_cancelled"
            ) {
              setStatusText(
                data.eventType === "run_completed"
                  ? "Run completed"
                  : data.eventType === "run_cancelled"
                    ? "Run cancelled"
                    : "Run failed",
              );
              patchCurrentAssistant({
                status:
                  data.eventType === "run_cancelled"
                    ? "stopped"
                    : data.eventType === "run_failed"
                      ? "error"
                      : undefined,
                statusLabel:
                  data.eventType === "run_completed"
                    ? "Run completed"
                    : data.eventType === "run_cancelled"
                      ? "Run cancelled"
                      : "Run failed",
                progressItem: {
                  id: "run",
                  label: "Run",
                  state:
                    data.eventType === "run_completed"
                      ? "completed"
                      : data.eventType === "run_cancelled"
                        ? "error"
                        : "error",
                  updatedAt: Date.now(),
                },
              });
            }
            // Document intelligence events — emitted by the document
            // ingestion orchestrator through the same canonical stream.
            // Surface ingestion progress in the status bar and capture
            // the artifactId when the artifact becomes ready.
            if (data.eventType === "document_ingestion_started") {
              const fileName =
                typeof data.payload?.fileName === "string"
                  ? data.payload.fileName
                  : "document";
              setStatusText(`Ingesting ${fileName}`);
              patchCurrentAssistant({
                statusLabel: `Ingesting ${fileName}`,
                progressItem: {
                  id: "document",
                  label: "Document",
                  state: "active",
                  detail: `Ingesting ${fileName}`,
                  updatedAt: Date.now(),
                },
              });
            }
            if (data.eventType === "document_ingestion_progress") {
              const message =
                typeof data.payload?.message === "string"
                  ? data.payload.message
                  : "Processing document";
              setStatusText(message);
              patchCurrentAssistant({
                statusLabel: message,
                progressItem: {
                  id: "document",
                  label: "Document",
                  state: "active",
                  detail: message,
                  updatedAt: Date.now(),
                },
              });
            }
            if (data.eventType === "document_ingestion_completed") {
              const ok = data.payload?.status === "completed";
              setStatusText(
                ok ? "Document ingested" : "Document ingestion failed",
              );
              patchCurrentAssistant({
                statusLabel: ok ? "Document ingested" : "Document ingestion failed",
                progressItem: {
                  id: "document",
                  label: "Document",
                  state: ok ? "completed" : "error",
                  detail: ok ? "Document artifact is ready" : "Document ingestion failed",
                  updatedAt: Date.now(),
                },
              });
            }
            if (
              data.eventType === "artifact_ready" &&
              data.payload?.artifactId
            ) {
              const id = String(data.payload.artifactId);
              setArtifactId(id);
              setStatusText("Document artifact ready");
              patchCurrentAssistant({
                statusLabel: "Document artifact ready",
                progressItem: {
                  id: "document",
                  label: "Document",
                  state: "completed",
                  detail: "Document artifact is ready",
                  updatedAt: Date.now(),
                },
                metadata: {
                  artifactId: id,
                },
              });
            }
            // progress_update events carry content deltas in
            // payload.delta, but we still rely on the legacy
            // type: "chunk" events for actual content rendering
            // to avoid double-rendering.
            // Don't return — let the event fall through so any future
            // Hermes-aware UI can also process it.
          }

          if (data.type === "conversation" && data.conversationId) {
            streamAssignedConversationRef.current = String(data.conversationId);
            setConversationId(data.conversationId);
            setLiveMessages((current) =>
              current.map((message) => ({
                ...message,
                conversationId: data.conversationId,
              })),
            );
            await queryClient.invalidateQueries({
              queryKey: chatQueryKeys.messages(data.conversationId, 200),
            });
          }
          if (data.type === "message_start" && data.messageId) {
            activeAssistantIdRef.current = data.messageId;
            activeAssistantIds.add(data.messageId);
            setLiveMessages((current) =>
              current.map((message) =>
                String(message._id) === optimisticAssistantId
                  ? {
                      ...message,
                      _id: data.messageId,
                    }
                  : message,
              ),
            );
          }
          if (data.type === "chunk" && data.content) {
            if (streamingEnabled) {
              patchCurrentAssistant({
                appendContent: data.content,
                status: "streaming",
                statusLabel: "Drafting response",
                progressItem: {
                  id: "response",
                  label: "Response",
                  state: "active",
                  detail: "Streaming tokens",
                  updatedAt: Date.now(),
                },
              });
            } else {
              bufferedContent += data.content;
              patchCurrentAssistant({
                status: "streaming",
                statusLabel: "Drafting response",
              });
            }
          }
          if (data.type === "error") {
            throw new Error(data.error);
          }
          if (data.type === "done") {
            requestSucceeded = true;
            patchCurrentAssistant({
              ...(streamingEnabled ? {} : { content: bufferedContent }),
              status: "completed",
              statusLabel: "Run completed",
              progressItem: {
                id: "response",
                label: "Response",
                state: "completed",
                detail: "Assistant response finished",
                updatedAt: Date.now(),
              },
            });
            await queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
            break;
          }
        }
      }
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";

      if (isAbort) {
        setStatusText("Run cancelled");
        patchCurrentAssistant({
          status: "stopped",
          statusLabel: "Run cancelled",
          progressItem: {
            id: "response",
            label: "Response",
            state: "error",
            detail: "Generation stopped",
            updatedAt: Date.now(),
          },
          metadata: {
            inlineError: {
              message: "Generation stopped before the turn completed.",
              recoverable: true,
              updatedAt: Date.now(),
            },
          },
        });
      } else {
        setStatusText(errorMessage || "Run failed");
        patchCurrentAssistant({
          status: "error",
          statusLabel: "Request failed",
          progressItem: {
            id: "response",
            label: "Response",
            state: "error",
            detail: errorMessage,
            updatedAt: Date.now(),
          },
          metadata: {
            errorCode: "CHAT_REQUEST_FAILED",
            inlineError: {
              message: errorMessage || "Something went wrong.",
              recoverable: true,
              updatedAt: Date.now(),
            },
          },
        });
      }
    } finally {
      await queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
      setLoading(false);
      if (requestSucceeded) {
        // Only strip the optimistic messages when the persisted copy of the
        // turn is actually available; otherwise the transcript would go
        // blank (e.g. when the backend doesn't persist conversations).
        const finalConversationId =
          streamAssignedConversationRef.current ?? conversationId;
        const persisted = finalConversationId
          ? queryClient.getQueryData<ChatMessage[]>(
              chatQueryKeys.messages(finalConversationId, 200),
            )
          : undefined;
        const hasPersistedTurn =
          Array.isArray(persisted) &&
          persisted.some(
            (message) => message.role === "assistant" && message.content,
          );
        if (hasPersistedTurn) {
          setLiveMessages((current) =>
            current.filter((message) => {
              const messageId = String(message._id);
              return messageId !== optimisticUserId && !activeAssistantIds.has(messageId);
            }),
          );
        }
      }
      // Turn is settled: future conversation switches (including back to this
      // one) should reset session/run state normally.
      streamAssignedConversationRef.current = null;
      abortRef.current = null;
      activeAssistantIdRef.current = null;
      inputRef.current?.focus();
    }
  };
  const isEmpty = visibleMessages.length === 0;

  const [isArtifactPaneOpen, setIsArtifactPaneOpen] = useState(false);
  const [artifactType, setArtifactType] = useState<"markdown" | "slides" | "sheet" | "pdf">("markdown");
  const [artifactContent, setArtifactContent] = useState<string>("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const resolvedWorkspaceType = useMemo<"browser" | "sheet" | "slides" | "staging" | "editor">(() => {
    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      const msg = visibleMessages[i];
      const metadata = msg.metadata as any;
      if (metadata?.workspaceType) {
        const type = metadata.workspaceType;
        if (type === "browser" || type === "sheet" || type === "slides" || type === "staging" || type === "editor") {
          return type;
        }
      }
    }
    return "browser";
  }, [visibleMessages]);

  const resolvedStagingUrl = useMemo(() => {
    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      const msg = visibleMessages[i];
      if (msg.role === "assistant" && msg.metadata?.stagingUrl) {
        return msg.metadata.stagingUrl;
      }
    }
    return null;
  }, [visibleMessages]);

  const resolvedRunId = useMemo(() => {
    if (runId) return runId;
    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      const msg = visibleMessages[i];
      if (msg.role === "assistant" && msg.metadata?.runId) {
        return msg.metadata.runId;
      }
    }
    return null;
  }, [visibleMessages, runId]);

  const resolvedSessionId = useMemo(() => {
    if (sessionId) return sessionId;
    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      const msg = visibleMessages[i];
      if (msg.role === "assistant" && msg.metadata?.sessionId) {
        return msg.metadata.sessionId;
      }
    }
    return null;
  }, [visibleMessages, sessionId]);

  // --- Hermes run control -------------------------------------------------
  // The kill switch sends a real server-side cancel (POST
  // /api/hermes/runs/[runId] { action: "cancel" }) in addition to aborting
  // the local fetch, so the engine stops the run instead of streaming into
  // a closed connection. Pause/resume use the same endpoint.
  //
  // Which run id is targeted:
  // - While a turn is in flight (`loading`), only THIS turn's run id (the
  //   `runId` state, cleared at send start and set by its run_started event)
  //   may be targeted. Before that event arrives there is nothing to cancel
  //   server-side — using a fallback here would cancel the previous,
  //   already-completed run.
  // - When no turn is in flight (e.g. a resumed conversation showing a
  //   still-streaming persisted message), fall back to the run id persisted
  //   in message metadata (`resolvedRunId`).
  const [runPaused, setRunPaused] = useState(false);
  const activeControlRunId = loading ? runId : resolvedRunId;

  const handleStop = () => {
    const targetRunId = activeControlRunId;
    // Abort first so the UI settles immediately; the cancel POST is
    // fire-and-forget best-effort against the engine.
    abortRef.current?.abort();
    setRunPaused(false);
    if (targetRunId) {
      void controlHermesRun(targetRunId, "cancel");
    }
  };

  const handlePauseResume = async () => {
    if (!activeControlRunId) return;
    const action = runPaused ? "resume" : "pause";
    const result = await controlHermesRun(activeControlRunId, action);
    if (result.ok) {
      setRunPaused(!runPaused);
      setStatusText(action === "pause" ? "Run paused" : "Run resumed");
    } else {
      setStatusText(result.error ?? `Could not ${action} the run`);
    }
  };

  // A new turn always starts unpaused.
  useEffect(() => {
    if (loading) setRunPaused(false);
  }, [loading]);

  if (authIsLoading) {
    return (
      <div className="flex h-[calc(100dvh-64px)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your session
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Primary Chat Column */}
        <ResizablePanel defaultSize={isArtifactPaneOpen ? 60 : 100} minSize={30} className="flex flex-col h-full min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                  <Sparkles className="h-8 w-8 text-brand" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">Build with Shothik</h2>
                <p className="mb-8 max-w-sm text-sm text-muted-foreground">
                  Explore an idea, validate it, and turn it into a company.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full max-w-md">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {usingRecoveredHistory ? (
                  <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                    Restored your recent chat from local recovery because server history is unavailable right now.
                  </div>
                ) : null}
                {(loading || runId || sessionId || statusText || true) ? (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-muted/30 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* While a turn is in flight the transcript bubble is the
                          single friendly status surface; the bar stays neutral. */}
                      <span className="font-medium text-foreground">
                        {loading
                          ? "Chat"
                          : statusText
                            ? friendlyStatusLabel(statusText)
                            : "Ready"}
                      </span>
                    </div>

                    {loading && runId ? (
                      <button
                        onClick={() => void handlePauseResume()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-medium text-xs transition"
                      >
                        {runPaused ? "Resume run" : "Pause run"}
                      </button>
                    ) : null}

                    <button
                      onClick={() => setIsArtifactPaneOpen(!isArtifactPaneOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-sm transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{isArtifactPaneOpen ? "Close Pane" : "Open Artifact Pane"}</span>
                    </button>
                  </div>
                ) : null}
                <Transcript
                  messages={visibleMessages as ChatMessage[]}
                  isStreaming={loading}
                  onCopy={(message) => navigator.clipboard.writeText(message.content)}
                  onDelete={(message) => deleteMessage(String(message._id))}
                  onRegenerate={(message) => {
                    const parentPrompt = visibleMessages.find(
                      (candidate) => String(candidate._id) === String(message.parentMessageId)
                    );
                    if (parentPrompt?.role === "user") {
                      send(parentPrompt.content);
                    }
                  }}
                  onStop={handleStop}
                  onRetry={(message) => {
                    const parentPrompt = visibleMessages.find(
                      (candidate) => String(candidate._id) === String(message.parentMessageId)
                    );
                    const lastUserPrompt = [...visibleMessages]
                      .reverse()
                      .find((candidate) => candidate.role === "user");
                    const prompt =
                      parentPrompt?.role === "user" ? parentPrompt : lastUserPrompt;
                    if (prompt) send(prompt.content);
                  }}
                  onActionClick={(action, message) => {
                    if (action === 'deep-research') {
                      router.push('/deep-research');
                    }
                  }}
                  onOpenArtifact={(type, message) => {
                    setArtifactType(type as any);
                    setArtifactContent(message?.content ?? "");
                    setIsArtifactPaneOpen(true);
                  }}
                />
                
                {isCompanyIntent && conversationId && !loading && (
                  <TwinCtaCard conversationId={conversationId} />
                )}

                {!loading && visibleMessages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pb-4">
                    {FOLLOW_UPS[chatMode].map(f => (
                      <button 
                        key={f} 
                        onClick={() => {
                          if (f === "Start this in Twin" && conversationId) {
                            router.push(`/twin?fromChat=${conversationId}`);
                          } else {
                            send(f);
                          }
                        }}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
        <Composer
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onSubmit={() => send()}
          onStop={handleStop}
          disabled={loading}
          isStreaming={loading}
          placeholder="What are you building?"
          mode={chatMode}
          onModeChange={handleModeChange}
          modelHandle={modelHandle}
          onModelChange={setModelHandle}
          onVoiceClick={() => setIsVoiceOpen(true)}
          attachments={pendingAttachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            preview: attachment.preview,
            status: attachment.status,
            error: attachment.error,
          }))}
          onAttachFiles={handleAttachFiles}
          onRemoveAttachment={handleRemoveAttachment}
          commandHint={
            activeComposerCommand?.name === "spec"
              ? {
                  name: "spec",
                  description: activeComposerCommand.argument || pendingAttachments.length
                    ? "Hermes will handle this turn in spec mode."
                    : "Add a prompt or attach a document before sending.",
                }
              : null
          }
          errorMessage={composerError}
          footer={`Describe your product, service, or business idea.${pendingAttachments.length ? ` · ${pendingAttachments.length} attachment${pendingAttachments.length > 1 ? "s" : ""}` : ""}`}
        />
        </ResizablePanel>

        {isArtifactPaneOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={25} className="h-full">
              <ArtifactPane
                isOpen={isArtifactPaneOpen}
                onClose={() => setIsArtifactPaneOpen(false)}
                artifactType={artifactType}
                content={artifactContent || undefined}
                pdfPages={
                  artifactType === "pdf" && artifactContent
                    ? artifactContent
                        .split(/\n---+\n/)
                        .map((page) => ({ content: page.trim() }))
                        .filter((page) => page.content.length > 0)
                    : undefined
                }
                title="Generated Output"
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      <VoicePopup 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        onSendTranscript={(text) => send(text)}
      />
    </div>
  );
}
