

import React from "react";
import { cn } from "@/lib/utils";
import { DeepSeekCheckpointNode } from "@/components/chat/DeepSeekCheckpointNode";
import { DeepSeekTraceNode } from "@/components/chat/DeepSeekTraceNode";

export interface MessageBubbleProps {
  message: string;
  variant?: "sent" | "received";
  grouped?: "first" | "middle" | "last" | "none";
  className?: string;
  imageUrl?: string;
  children?: React.ReactNode;
}

export function MessageBubble({
  message,
  variant = "received",
  grouped = "none",
  className,
  imageUrl,
  children,
}: MessageBubbleProps) {
  const isSent = variant === "sent";

  // Check for DeepSeek <compacted-summary> tags
  if (message && message.includes("<compacted-summary>")) {
    return <DeepSeekCheckpointNode content={message} className={className} />;
  }

  // Check for DeepSeek <context-injection> tags
  if (message && message.includes("<context-injection>")) {
    const sourceMatch = message.match(/source="([^"]+)"/i);
    return (
      <DeepSeekTraceNode
        type="context_injection"
        source={sourceMatch ? sourceMatch[1] : "@deepseek-ai/dsh-system-prompt"}
        className={className}
      />
    );
  }

  // Check for DeepSeek <skill-catalog> tags
  if (message && message.includes("<skill-catalog>")) {
    return <DeepSeekTraceNode type="skill_catalog" className={className} />;
  }

  // Check for DeepSeek <think> tags
  if (message && message.includes("<think>")) {
    const cleanThink = message.replace(/<think>/gi, "").replace(/<\/think>/gi, "").trim();
    return <DeepSeekTraceNode type="think" content={cleanThink} durationSeconds={23} className={className} />;
  }

  const groupedRadius = {
    first: isSent
      ? "rounded-[20px_20px_5px_20px]"
      : "rounded-[20px_20px_20px_5px]",
    middle: isSent
      ? "rounded-[20px_5px_5px_20px]"
      : "rounded-[5px_20px_20px_5px]",
    last: isSent
      ? "rounded-[20px_5px_20px_20px]"
      : "rounded-[5px_20px_20px_20px]",
    none: "rounded-[20px]",
  };

  return (
    <div
      className={cn(
        "relative max-w-[70%] px-5 py-2 leading-6 break-words",
        groupedRadius[grouped],
        grouped === "first" || grouped === "middle" ? "mb-1.5" : "",
        isSent
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted text-foreground",
        className,
      )}
    >
      {imageUrl && (
        <div className="mb-2 overflow-hidden rounded-xl border border-white/10 max-w-[240px]">
          <img src={imageUrl} alt="Attached screenshot" className="w-full h-auto object-cover max-h-[160px]" />
        </div>
      )}
      {children || <p className="whitespace-pre-wrap">{message}</p>}
    </div>
  );
}

export interface ChatMessageProps {
  timestamp?: string;
  messages: string[];
  variant?: "sent" | "received";
  className?: string;
  showTimestamp?: boolean;
}

export function ChatMessage({
  timestamp,
  messages,
  variant = "received",
  className,
  showTimestamp = true,
}: ChatMessageProps) {
  const hasMultipleMessages = messages.length > 1;

  const getGroupedType = (
    index: number,
    total: number,
  ): "first" | "middle" | "last" | "none" => {
    if (total === 1) return "none";
    if (index === 0) return "first";
    if (index === total - 1) return "last";
    return "middle";
  };

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div className="flex flex-col">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            variant={variant}
            grouped={
              hasMultipleMessages
                ? getGroupedType(index, messages.length)
                : "none"
            }
          />
        ))}
      </div>

      {showTimestamp && timestamp && (
        <span
          className={cn(
            "text-muted-foreground mt-1 px-2 text-xs",
            variant === "sent" && "text-right",
          )}
        >
          {timestamp}
        </span>
      )}
    </div>
  );
}
