
<<<<<<< HEAD:artifacts/shothik/src/components/chat/Transcript.tsx
<<<<<<< HEAD:components/chat/Transcript.tsx
import { AlertCircle, Bot, CheckCircle2, Command, Link2, Loader2, Paperclip, Sparkles, User } from "lucide-react";
=======

import { Bot, Command, FlaskConical, Globe, Link2, Lightbulb, ListChecks, Paperclip, User, Search } from "lucide-react";
>>>>>>> origin/main:artifacts/shothik/src/components/chat/Transcript.tsx
=======
import { Bot, Command, Link2, Loader2, Paperclip, User } from "lucide-react";
>>>>>>> feat/chat-artifacts-voice:components/chat/Transcript.tsx
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageActions } from "./MessageActions";
import { MarkdownMessage } from "./MarkdownMessage";
import { OvernightJobCard } from "./OvernightJobCard";
<<<<<<< HEAD:components/chat/Transcript.tsx
import { StandardizedChatErrorCard } from "./StandardizedChatErrorCard";
import { EmptyChatGreeting } from "./EmptyChatGreeting";
import { DeerFlowVisualizer } from "@/components/hermes/deerflow-visualizer";
import { SwarmVisualizer } from "@/components/hermes/swarm-visualizer";
=======
import { ChatErrorCard } from "./ChatErrorCard";
>>>>>>> origin/main:artifacts/shothik/src/components/chat/Transcript.tsx
import { getSlashCommandDisplayText } from "@/lib/chat/commands";
import { friendlyStatusLabel } from "@/lib/chat/streaming";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatPersona } from "@/lib/chat/types";

/**
 * StreamingCursor — 1 Hz blinking block cursor matching Claude/ChatGPT convention.
 * Uses a CSS keyframe injected inline so no global stylesheet is required.
 */
function StreamingCursor() {
  return (
    <>
      <style>{`
        @keyframes _chat-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        ._chat-cursor {
          display: inline-block;
          width: 0.5rem;
          height: 1em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: currentColor;
          border-radius: 1px;
          animation: _chat-cursor-blink 1s step-start infinite;
          opacity: 1;
        }
      `}</style>
      <span className="_chat-cursor" aria-hidden="true" />
    </>
  );
}

/**
 * Guard: only allow known friendly labels through — never raw backend state names.
 * Falls back to "Thinking…" for any unrecognised value.
 */
const ALLOWED_STATUS_LABELS = new Set([
  'Thinking…', 'Searching…', 'Writing…', 'Running…', 'Processing…',
]);
function safeStatusLabel(raw: string | undefined): string {
  if (!raw) return 'Thinking…';
  return ALLOWED_STATUS_LABELS.has(raw) ? raw : 'Thinking…';
}

import { SourcesBadge } from "./SourcesBadge";

const CHAT_MODE_BADGES: Record<
  string,
  { label: string; Icon: typeof Globe }
> = {
  cofounder: { label: "Cofounder", Icon: Lightbulb },
  "web-search": { label: "Web Search", Icon: Globe },
  "scenario-testing": { label: "Scenario Testing", Icon: FlaskConical },
};

interface TranscriptProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onCopy?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onRegenerate?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
  onStop?: (message: ChatMessage) => void;
<<<<<<< HEAD:artifacts/shothik/src/components/chat/Transcript.tsx
  onActionClick?: (action: string, message: ChatMessage) => void;
  onOpenArtifact?: (type: string, message: ChatMessage) => void;
=======
  onSelectPrompt?: (prompt: string, mode?: ChatPersona, tab?: "slides" | "sheet" | "research" | "code") => void;
>>>>>>> feat/chat-artifacts-voice:components/chat/Transcript.tsx
  className?: string;
}

export function Transcript({
  messages,
  isStreaming,
  onCopy,
  onDelete,
  onRegenerate,
  onRetry,
  onStop,
<<<<<<< HEAD:artifacts/shothik/src/components/chat/Transcript.tsx
  onActionClick,
  onOpenArtifact,
=======
  onSelectPrompt,
>>>>>>> feat/chat-artifacts-voice:components/chat/Transcript.tsx
  className,
}: TranscriptProps) {
  if (!messages || messages.length === 0) {
    return <EmptyChatGreeting onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="space-y-4 p-4" aria-live={isStreaming ? "polite" : "off"}>
        {messages.map((message) => {
          const isUser = message.role === "user";
          const canRegenerate = message.role === "assistant" && message.status !== "streaming";
          const canStop = message.role === "assistant" && message.status === "streaming";
          const slashCommand = isUser ? getSlashCommandDisplayText(message.content) : null;
          const displayContent = slashCommand ? slashCommand.body : message.content;
          const inlineError = message.metadata?.inlineError;
          const modeBadge =
            !isUser && message.metadata?.chatMode
              ? CHAT_MODE_BADGES[message.metadata.chatMode]
              : undefined;
          const statusLabel = message.metadata?.statusLabel;
          const plan = !isUser ? message.metadata?.plan : undefined;

          return (
            <div key={message._id} className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                isUser ? "bg-primary text-primary-foreground" : "bg-brand/10 text-brand"
              )}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[85%] space-y-2", isUser ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl border px-4 py-3 text-sm shadow-sm",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-sm border-primary"
                    : "bg-background rounded-tl-sm border-border"
                )}>
                  {slashCommand ? (
                    <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-current/15 bg-background/10 px-2.5 py-1 text-[11px] font-medium">
                      <Command className="h-3.5 w-3.5" />
                      <span>/{slashCommand.command.name}</span>
                    </div>
                  ) : null}
                  {message.metadata?.attachments?.length ? (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {message.metadata.attachments.map((attachment) => {
                        const isUrl = attachment.kind === "url";
                        return (
                          <div
                            key={attachment.id}
                            className={cn(
                              "inline-flex max-w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                              isUser
                                ? "border-primary-foreground/20 bg-primary-foreground/10"
                                : "border-border bg-muted/40",
                            )}
                          >
                            {isUrl ? <Link2 className="h-3.5 w-3.5 shrink-0" /> : <Paperclip className="h-3.5 w-3.5 shrink-0" />}
                            <span className="truncate">{attachment.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                  {(message.metadata?.isOvernight || message.metadata?.executionMode === 'airllm_frontier') && (
                    <OvernightJobCard
                      taskTitle={displayContent}
                      status={message.status === 'completed' ? 'completed' : message.status === 'streaming' ? 'processing' : 'queued'}
                    />
                  )}
<<<<<<< HEAD:components/chat/Transcript.tsx
                  {!isUser && message.status === "streaming" && !displayContent ? (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs text-brand font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{safeStatusLabel(statusLabel)}</span>
                    </div>
                  ) : null}
                  {!isUser ? (
                    <div className="relative">
                      <MarkdownMessage
                        content={
                          displayContent ||
                          (message.status === "streaming"
                            ? ""
                            : slashCommand
                              ? "Spec request"
                              : "")
                        }
                      />
                      {message.status === "streaming" && displayContent ? (
<<<<<<< HEAD:artifacts/shothik/src/components/chat/Transcript.tsx
                        <span className="inline-block w-2 h-4 ml-1 bg-brand animate-pulse align-middle font-mono font-bold">
                          ▋
                        </span>
=======
                  {plan && (plan.steps.length > 0 || plan.intent) ? (
                    <div className="mb-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" />
                        <span>Plan{plan.intent ? ` · ${plan.intent}` : ""}</span>
                      </div>
                      {plan.steps.length > 0 ? (
                        <ol className="mt-1.5 space-y-1 text-xs text-foreground">
                          {plan.steps.map((step, index) => (
                            <li key={`${index}-${step}`} className="flex gap-2">
                              <span className="text-muted-foreground">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  ) : null}
                  {!isUser && message.status === "streaming" && !displayContent ? (
                    <div className="flex items-center gap-2 py-0.5" aria-live="polite">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {friendlyStatusLabel(statusLabel)}
                      </span>
                    </div>
                  ) : !isUser ? (
                    <div>
                      <MarkdownMessage
                        content={displayContent || (slashCommand ? "Spec request" : "")}
                      />
                      {message.status === "streaming" && displayContent ? (
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse rounded-full bg-foreground/70"
                        />
>>>>>>> origin/main:artifacts/shothik/src/components/chat/Transcript.tsx
=======
                        <StreamingCursor />
>>>>>>> feat/chat-artifacts-voice:components/chat/Transcript.tsx
                      ) : null}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
<<<<<<< HEAD:components/chat/Transcript.tsx
                      {displayContent ||
                        (message.status === "streaming"
                          ? "Thinking…"
                          : slashCommand
                            ? "Spec request"
                            : "")}
                    </p>
                  )}
                  {/* Contextual Twin Handoff Card Trigger */}
                  {!isUser && (
                    (displayContent ?? "").toLowerCase().includes("app") ||
                    (displayContent ?? "").toLowerCase().includes("business") ||
                    (displayContent ?? "").toLowerCase().includes("startup") ||
                    (displayContent ?? "").toLowerCase().includes("plan") ||
                    (displayContent ?? "").toLowerCase().includes("launch") ||
                    (displayContent ?? "").toLowerCase().includes("saas")
                  ) && (
                    <div className="mt-3 rounded-2xl border border-brand/30 bg-brand/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                          🏢
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">This looks like a company idea.</p>
                          <p className="text-[11px] text-muted-foreground">Start your company with an AI Cofounder in Twin workspace.</p>
                        </div>
                      </div>
                      <a
                        href="/twin"
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-brand text-brand-foreground text-xs font-medium hover:bg-brand/90 transition shadow-sm no-underline shrink-0"
                      >
                        Start it in Twin ➔
                      </a>
                    </div>
                  )}
                  {message.metadata?.deerflowPlan ? (
                    <div className="mt-3">
                      <DeerFlowVisualizer
                        workspaceId={message.metadata.deerflowPlan.workspaceId || "ws_df_default"}
                        plan={message.metadata.deerflowPlan as any}
                      />
                    </div>
                  ) : null}
                  {message.metadata?.swarmTopology ? (
                    <div className="mt-3">
                      <SwarmVisualizer
                        workspaceId={message.metadata.swarmTopology.workspaceId || "ws_swarm_default"}
                        swarmId={message.metadata.swarmTopology.swarmId || "swarm_001"}
                        runId={message.metadata.swarmTopology.runId || "run_001"}
                      />
                    </div>
                  ) : null}
                  {inlineError || message.status === "error" ? (
                    <StandardizedChatErrorCard
                      message={inlineError?.message || "Generation halted mid-stream. You can retry the turn."}
                      recoverable={inlineError?.recoverable ?? true}
                      onRetry={() => onRegenerate && onRegenerate(message)}
=======
                      {displayContent || (slashCommand ? "Spec request" : "")}
                    </p>
                  )}
                  {inlineError && message.status !== "streaming" ? (
                    <ChatErrorCard
                      message={inlineError.message}
                      recoverable={inlineError.recoverable !== false}
                      onRetry={onRetry ? () => onRetry(message) : undefined}
>>>>>>> origin/main:artifacts/shothik/src/components/chat/Transcript.tsx
                    />
                  ) : null}
                  {Array.isArray(message.metadata?.citations) && message.metadata.citations.length > 0 ? (
                    <SourcesBadge sources={message.metadata.citations.map((c: any) => ({
                      id: typeof c === 'string' ? c : c.id || String(Math.random()),
                      title: typeof c === 'string' ? c : c.title || 'Source',
                      url: typeof c === 'object' ? c.url : undefined
                    }))} />
                  ) : null}

                  {/* Artifact Card / Follow-up Actions */}
                  {!isUser && !canStop && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button 
                        onClick={() => onActionClick?.('deep-research', message)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand/30 bg-brand/5 hover:bg-brand/10 text-brand text-xs font-medium transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Upgrade to Deep Research
                      </button>
                      <button 
                        onClick={() => onOpenArtifact?.('slides', message)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
                      >
                        Turn into slides
                      </button>
                      <button 
                        onClick={() => onOpenArtifact?.('pdf', message)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
                      >
                        Export PDF
                      </button>
                    </div>
                  )}
                </div>
                <div className={cn("flex items-center gap-2", isUser ? "justify-end" : "justify-start")}>
                  {modeBadge ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <modeBadge.Icon className="h-3 w-3" />
                      {modeBadge.label}
                    </span>
                  ) : null}
                  <span className="text-muted-foreground text-xs">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <MessageActions
                    canRegenerate={canRegenerate}
                    canStop={canStop}
                    onCopy={onCopy ? () => onCopy(message) : undefined}
                    onDelete={onDelete ? () => onDelete(message) : undefined}
                    onRegenerate={onRegenerate ? () => onRegenerate(message) : undefined}
                    onStop={onStop ? () => onStop(message) : undefined}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
