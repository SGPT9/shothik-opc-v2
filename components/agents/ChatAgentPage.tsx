"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Globe } from "lucide-react";
import { Composer } from "@/components/chat/Composer";
import { Transcript } from "@/components/chat/Transcript";
import { ArtifactPanel, type ArtifactTab } from "@/components/chat/ArtifactPanel";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { VoiceOverlay } from "@/components/voice/VoiceOverlay";
import { TwinAutopilotBanner } from "@/components/tonight-engine/TwinAutopilotBanner";
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
import type { ChatPersona } from "@/lib/chat/types";

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

const TURN_PROGRESS_ORDER = ["mode", "queue", "session", "run", "document", "response"] as const;

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
  const [modelHandle, setModelHandle] = useState("gemini-2.5-flash");
  const [activeSkill, setActiveSkill] = useState("general");
  const [persona, setPersona] = useState<ChatPersona>("cofounder");
  const [isOvernight, setIsOvernight] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
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
  const safeConversations = conversations ?? [];
  const fallbackConversations = useMemo(
    () => (safeConversations.length > 0 ? safeConversations : localConversationSummaries),
    [safeConversations, localConversationSummaries],
  );
  const activeConversationBackup = localHistory.conversations.find(
    (entry) => entry.summary._id === conversationId,
  );
  const recoveredMessages = activeConversationBackup?.messages ?? [];
  const usingRecoveredHistory =
    fallbackConversations.length > 0 &&
    safeConversations.length === 0 &&
    recoveredMessages.length > 0 &&
    (Boolean(conversationHistoryError) || Boolean(messagesQuery.error) || Boolean(localConversationSummaries.length));

  const SUGGESTIONS = [
    t("chat.suggestion1"),
    t("chat.suggestion2"),
    t("chat.suggestion3"),
    t("chat.suggestion4"),
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveMessages, statusText]);

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

  useEffect(() => {
    if (conversationId || !fallbackConversations.length) return;
    setConversationId(String(fallbackConversations[0]._id));
  }, [conversationId, fallbackConversations]);

  // Reset Hermes session/run state when the user switches conversations.
  // Each conversation maps to its own Hermes session; switching conversations
  // means the old sessionId/runId are no longer valid.
  useEffect(() => {
    setSessionId(null);
    setRunId(null);
    setWorkspaceId(null);
    setArtifactId(null);
    setLiveMessages([]);
    setStatusText(null);
  }, [conversationId]);

  const shortId = (value: string | null) => (value ? value.slice(0, 8) : null);

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
          runId: runId ?? undefined,
          sessionId: sessionId ?? undefined,
          workspaceId: workspaceId ?? undefined,
          artifactId: artifactId ?? undefined,
          slashCommand: slashCommand ?? undefined,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId:
            conversationId && !isLocalDraftConversationId(conversationId)
              ? conversationId
              : undefined,
          surface: "flagship",
          messages: history,
          modelHandle,
          activeSkill: activeSkill !== "general" ? activeSkill : undefined,
          context: turnContext,
          attachments: attachmentMeta,
          // Pass the current Hermes sessionId so the orchestrator can resume
          // the same session across multiple chat turns.
          sessionId: sessionId ?? undefined,
          // Pass the current Hermes runId so the orchestrator can resume
          // the same run context across multiple chat turns.
          runId: runId ?? undefined,
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
            if (data.eventType === "session_created" && data.sessionId) {
              setSessionId(data.sessionId);
              if (data.workspaceId) setWorkspaceId(data.workspaceId);
              setStatusText("Session connected");
              patchCurrentAssistant({
                statusLabel: "Session connected",
                progressItem: {
                  id: "session",
                  label: "Session",
                  state: "completed",
                  detail: "Connected to the Hermes session",
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
          }
          if (data.type === "error") {
            throw new Error(data.error);
          }
          if (data.type === "done") {
            requestSucceeded = true;
            patchCurrentAssistant({
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
        setLiveMessages((current) =>
          current.filter((message) => {
            const messageId = String(message._id);
            return messageId !== optimisticUserId && !activeAssistantIds.has(messageId);
          }),
        );
      }
      abortRef.current = null;
      activeAssistantIdRef.current = null;
      inputRef.current?.focus();
    }
  };
  const isEmpty = visibleMessages.length === 0;

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



  const [activePanel, setActivePanel] = useState<ArtifactTab | null>(null);

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

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full overflow-hidden bg-background">
      {/* Open WebUI Left Session Sidebar */}
      <div className="hidden md:block shrink-0 h-full">
        <ChatSidebar
          conversations={fallbackConversations.map(c => ({
            _id: String(c._id),
            title: c.title,
            updatedAt: c.updatedAt,
            _creationTime: c.updatedAt,
            pinned: c.pinned,
            modelHandle: c.modelHandle,
            messageCount: c.messageCount,
          }))}
          activeConversationId={conversationId}
          onSelectConversation={(id) => router.push(`/agents/chat?conversationId=${id}`)}
          onNewChat={() => {
            const nextId = user?._id ? `conv_${Date.now()}` : getLocalDraftConversationId("flagship");
            router.push(`/agents/chat?conversationId=${nextId}`);
          }}
          onDeleteConversation={(id) => deleteConversation(id)}
          onOpenParallelSpace={() => setActivePanel("space")}
          onOpenDataSheet={() => setActivePanel("sheet")}
          onOpenSlideDeck={() => setActivePanel("slides")}
          onOpenWritingStudio={() => router.push("/writing-studio")}
          onAbortStream={() => abortRef.current?.abort()}
        />
      </div>

      {/* Primary Chat Column */}
      <div className="flex flex-col flex-1 h-full min-w-0 transition-all duration-300">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                  <Sparkles className="h-8 w-8 text-brand" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">{t("chat.heading")}</h2>
                <p className="mb-8 max-w-sm text-sm text-muted-foreground">
                  {t("chat.subheading")}
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
                      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" /> : null}
                      <span className="font-medium text-foreground">{statusText || "Ready"}</span>
                      {sessionId ? (
                        <span className="rounded-full bg-background px-2 py-1 text-muted-foreground">
                          Session {shortId(sessionId)}
                        </span>
                      ) : null}
                      {runId ? (
                        <span className="rounded-full bg-background px-2 py-1 text-muted-foreground">
                          Run {shortId(runId)}
                        </span>
                      ) : null}
                    </div>
                    
                    <button
                      onClick={() => setActivePanel(activePanel === "space" ? null : "space")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-sm transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{activePanel === "space" ? "Close Space" : "Open Live Agent Space"}</span>
                    </button>
                  </div>
                ) : null}

                {/* Polsia-style Twin Autopilot Banner */}
                {isOvernight && (
                  <TwinAutopilotBanner
                    prompt={input.trim() || "Build pitch deck, financial sheet, & deploy custom domain site"}
                    onOpenArtifact={(tab) => setActivePanel(tab)}
                    onClose={() => setIsOvernight(false)}
                  />
                )}

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
                  onStop={() => abortRef.current?.abort()}
                  onSelectPrompt={(prompt, mode, tab) => {
                    setInput(prompt);
                    if (mode) setPersona(mode);
                    if (tab) setActivePanel(tab);
                    inputRef.current?.focus();
                  }}
                />
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
          onStop={() => abortRef.current?.abort()}
          disabled={loading}
          isStreaming={loading}
          placeholder={t("chat.placeholder")}
          modelHandle={modelHandle}
          onModelChange={setModelHandle}
          persona={persona}
          onPersonaChange={(next) => {
            setPersona(next);
            if (next === "coresearcher") setActivePanel("research");
          }}
          activeSkill={activeSkill}
          onSkillChange={setActiveSkill}
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
          isOvernight={isOvernight}
          onToggleOvernight={setIsOvernight}
          errorMessage={composerError}
          footer={`${t("chat.footer")} · ${modelHandle}${pendingAttachments.length ? ` · ${pendingAttachments.length} attachment${pendingAttachments.length > 1 ? "s" : ""}` : ""}`}
          onOpenResearchPanel={() => setActivePanel("research")}
          onOpenVoice={() => setIsVoiceOverlayOpen(true)}
        />
      </div>

      {/* ArtifactPanel — ChatGPT Canvas-style tabbed right panel */}
      <ArtifactPanel
        activeTab={activePanel}
        onTabChange={setActivePanel}
        onClose={() => setActivePanel(null)}
        runId={resolvedRunId}
        sessionId={resolvedSessionId}
        stagingUrl={resolvedStagingUrl}
        workspaceType={resolvedWorkspaceType}
        onCommentSelection={(text) => {
          setInput((prev) => `${prev}\n> ${text}\n`);
          inputRef.current?.focus();
        }}
      />

      {/* ChatGPT-style voice overlay */}
      <VoiceOverlay
        isOpen={isVoiceOverlayOpen}
        userName={user?.name ?? user?.email ?? "User"}
        onClose={() => setIsVoiceOverlayOpen(false)}
      />
    </div>
  );
}
