"use client";

import { AlertCircle, Bot, CheckCircle2, Command, Link2, Loader2, Paperclip, Sparkles, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageActions } from "./MessageActions";
import { MarkdownMessage } from "./MarkdownMessage";
import { OvernightJobCard } from "./OvernightJobCard";
import { StandardizedChatErrorCard } from "./StandardizedChatErrorCard";
import { DeerFlowVisualizer } from "@/components/hermes/deerflow-visualizer";
import { SwarmVisualizer } from "@/components/hermes/swarm-visualizer";
import { getSlashCommandDisplayText } from "@/lib/chat/commands";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat/types";

interface TranscriptProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onCopy?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onRegenerate?: (message: ChatMessage) => void;
  onStop?: (message: ChatMessage) => void;
  className?: string;
}

export function Transcript({
  messages,
  isStreaming,
  onCopy,
  onDelete,
  onRegenerate,
  onStop,
  className,
}: TranscriptProps) {
  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="space-y-4 p-4" aria-live={isStreaming ? "polite" : "off"}>
        {messages.map((message) => {
          const isUser = message.role === "user";
          const canRegenerate = message.role === "assistant" && message.status !== "streaming";
          const canStop = message.role === "assistant" && message.status === "streaming";
          const slashCommand = isUser ? getSlashCommandDisplayText(message.content) : null;
          const displayContent = slashCommand ? slashCommand.body : message.content;
          const progress = message.metadata?.progress ?? [];
          const inlineError = message.metadata?.inlineError;
          const statusLabel = message.metadata?.statusLabel;

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
                  {!isUser && message.status === "streaming" && !displayContent ? (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs text-brand font-medium animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Thinking…</span>
                    </div>
                  ) : null}
                  {!isUser ? (
                    <div className="relative">
                      <MarkdownMessage
                        content={
                          displayContent ||
                          (message.status === "streaming"
                            ? "Thinking…"
                            : slashCommand
                              ? "Spec request"
                              : "")
                        }
                      />
                      {message.status === "streaming" && displayContent ? (
                        <span className="inline-block w-2 h-4 ml-1 bg-brand animate-pulse align-middle font-mono font-bold">
                          ▋
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
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
                    />
                  ) : null}
                  {Array.isArray(message.metadata?.citations) && message.metadata.citations.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-muted-foreground text-xs font-medium">Sources</span>
                      {message.metadata.citations.slice(0, 3).map((citation, index) => (
                        <span
                          key={`${message._id}-citation-${index}`}
                          className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[11px]"
                        >
                          {typeof citation === "string" ? citation : `Source ${index + 1}`}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className={cn("flex items-center gap-2", isUser ? "justify-end" : "justify-start")}>
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
