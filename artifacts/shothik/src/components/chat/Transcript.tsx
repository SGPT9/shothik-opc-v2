

import { Bot, Command, Link2, Paperclip, User, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageActions } from "./MessageActions";
import { MarkdownMessage } from "./MarkdownMessage";
import { OvernightJobCard } from "./OvernightJobCard";
import { ChatErrorCard } from "./ChatErrorCard";
import { getSlashCommandDisplayText } from "@/lib/chat/commands";
import { friendlyStatusLabel } from "@/lib/chat/streaming";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat/types";

import { SourcesBadge } from "./SourcesBadge";

interface TranscriptProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onCopy?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onRegenerate?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
  onStop?: (message: ChatMessage) => void;
  onActionClick?: (action: string, message: ChatMessage) => void;
  onOpenArtifact?: (type: string, message: ChatMessage) => void;
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
  onActionClick,
  onOpenArtifact,
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
                      ) : null}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {displayContent || (slashCommand ? "Spec request" : "")}
                    </p>
                  )}
                  {inlineError && message.status !== "streaming" ? (
                    <ChatErrorCard
                      message={inlineError.message}
                      recoverable={inlineError.recoverable !== false}
                      onRetry={onRetry ? () => onRetry(message) : undefined}
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
