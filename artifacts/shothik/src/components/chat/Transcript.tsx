import { Command, Copy, Link2, Loader2, Paperclip, RefreshCw, Search, Sparkles, Square, User, FlaskConical, Globe, Lightbulb, ListChecks, Receipt, ChevronDown, Volume2, VolumeX, ThumbsUp, ThumbsDown, Pencil, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownMessage } from "./MarkdownMessage";
import { OvernightJobCard } from "./OvernightJobCard";
import { StandardizedChatErrorCard } from "./StandardizedChatErrorCard";
import { EmptyChatGreeting } from "./EmptyChatGreeting";
import { DeerFlowVisualizer } from "@/components/hermes/deerflow-visualizer";
import { SwarmVisualizer } from "@/components/hermes/swarm-visualizer";
import { getSlashCommandDisplayText } from "@/lib/chat/commands";
import { SourcesBadge } from "./SourcesBadge";
import { ThinkBox } from "./ThinkBox";
import { AgentActivityTimeline } from "./AgentActivityTimeline";
import { AssistantSteps } from "./AssistantSteps";
import { InlineArtifactCard } from "./InlineArtifactCard";
import { ReplitAgentActivityBar } from "./ReplitAgentActivityBar";
import { ProactiveNextActions } from "./ProactiveNextActions";
import { PerplexitySourcesGrid } from "@/components/perplexity/PerplexitySourcesGrid";
import { PerplexityRelatedQueries } from "@/components/perplexity/PerplexityRelatedQueries";
import { TrajectoryReceiptModal } from "./TrajectoryReceiptModal";
import { ApprovalCard } from "./ApprovalCard";
import { SecretShareCard } from "./SecretShareCard";
import { WayfinderBoard } from "./WayfinderBoard";
import { TwinCtaCard } from "./TwinCtaCard";
import { useTwinHandoffDetector } from "../agents/hooks/useTwinHandoffDetector";
import { EpistemicProvenanceBadge } from "./EpistemicProvenanceBadge";
import { GitHubRepoCard } from "./GitHubRepoCard";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatPersona } from "@/lib/chat/types";
import { useRef, useEffect, useState, useMemo } from "react";
import { LowRamStylexOptimizerService } from "@/lib/infrastructure/low-ram-stylex-optimizer";

// Pre-compiled static class map matching compile-time StyleX layout rules
const STYLEX_MAP = {
  container: "mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8",
  userRow: "flex justify-end gap-2 sm:gap-3 group",
  userCol: "flex flex-col items-end gap-1.5 max-w-[92%] sm:max-w-[80%]",
  userBubble: "rounded-2xl rounded-tr-sm bg-muted/60 dark:bg-zinc-800/80 backdrop-blur-xl border border-border/80 px-3.5 sm:px-4.5 py-2.5 sm:py-3.5 text-sm text-foreground shadow-2xs break-words",
  userAttachmentPill: "inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2 py-1 text-[10px]",
  userTimestamp: "text-[10px] text-muted-foreground/50 pr-1 opacity-0 group-hover:opacity-100 transition-opacity",
  userAvatar: "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/80 text-foreground backdrop-blur-md shadow-2xs mt-0.5",
  
  assistantRow: "flex gap-2.5 sm:gap-3.5 group",
  assistantAvatar: "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border border-border/80 font-bold backdrop-blur-md shadow-2xs mt-0.5",
  assistantCol: "flex-1 min-w-0 space-y-4 sm:space-y-5 rounded-2xl bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-border/80 p-3.5 sm:p-5 shadow-xs relative overflow-hidden",
  planContainer: "rounded-xl border border-border bg-muted/20 px-3 py-2 sm:px-3.5 sm:py-2.5",
  planTitle: "flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-1.5",
  planList: "space-y-1 text-xs text-foreground",
  contentContainer: "relative text-sm leading-relaxed overflow-x-auto",
  
  actionBtn: "flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition",
  overflowMenu: "absolute bottom-full left-0 mb-1 z-50 hidden group-hover/overflow:block w-40 rounded-xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100",
  overflowBtn: "flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition",
  stopBtn: "mt-1 flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition",
};

// ── Streaming cursor ────────────────────────────────────────────────────────
function StreamingCursor() {
  return (
    <span
      className="inline-block w-[3px] h-4 ml-[3px] rounded-sm bg-brand align-middle"
      style={{ animation: "cursorBlink 0.9s step-start infinite" }}
      aria-hidden="true"
    />
  );
}

// ── Thinking indicator ──────────────────────────────────────────────────────
function ThinkingDots({ label = "Thinking…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-brand/60"
            style={{ animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite` }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ── Status guard ─────────────────────────────────────────────────────────────
const ALLOWED_STATUS_LABELS = new Set([
  "Thinking…", "Searching…", "Writing…", "Running…", "Processing…",
]);
function safeStatusLabel(raw: string | undefined): string {
  if (!raw) return "Thinking…";
  return ALLOWED_STATUS_LABELS.has(raw) ? raw : "Thinking…";
}

const CHAT_MODE_BADGES: Record<string, { label: string; Icon: typeof Globe }> = {
  cofounder: { label: "Cofounder", Icon: Lightbulb },
  "web-search": { label: "Web Search", Icon: Globe },
  "scenario-testing": { label: "ScenarioLab", Icon: FlaskConical },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface TranscriptProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  statusText?: string;
  onCopy?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onRegenerate?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
  onStop?: (message: ChatMessage) => void;
  onActionClick?: (action: string, message: ChatMessage) => void;
  onOpenArtifact?: (type: string, message: ChatMessage) => void;
  onOpenSource?: (sourceKey: string) => void;
  onSelectPrompt?: (prompt: string, mode?: ChatPersona, tab?: "slides" | "sheet" | "research" | "code") => void;
  onApproveCheckpoint?: (checkpointId: string, message: ChatMessage) => void;
  onDenyCheckpoint?: (checkpointId: string, message: ChatMessage) => void;
  onSubmitSecret?: (checkpointId: string, secretValue: string, message: ChatMessage) => void;
  onAnalyzeIssues?: (message: ChatMessage) => void;
  className?: string;
  agentId?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Transcript({
  messages,
  isStreaming,
  statusText,
  onCopy,
  onDelete,
  onRegenerate,
  onRetry,
  onStop,
  onActionClick,
  onOpenArtifact,
  onOpenSource,
  onSelectPrompt,
  onApproveCheckpoint,
  onDenyCheckpoint,
  onSubmitSecret,
  onAnalyzeIssues,
  className,
  agentId = "core",
}: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lowRamConfig = LowRamStylexOptimizerService.detectDeviceCapabilities();
  const [visibleLimit, setVisibleLimit] = useState(lowRamConfig.virtualizationBatchSize);
  const [trajectoryOpen, setTrajectoryOpen] = useState(false);
  const [trajectoryModel, setTrajectoryModel] = useState("DeepSeek V4 Flash");
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>({});
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [copiedUserMsgId, setCopiedUserMsgId] = useState<string | null>(null);
  const [copiedAssistantMsgId, setCopiedAssistantMsgId] = useState<string | null>(null);

  const dispatchTelemetry = (event: string, properties: Record<string, unknown> = {}) => {
    try {
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {
      // noop
    }
  };

  const handleCopyUserPrompt = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUserMsgId(msgId);
    dispatchTelemetry("user_copied_prompt", { msgId, length: text.length });
    setTimeout(() => setCopiedUserMsgId(null), 2000);
  };

  const handleCopyAssistantMessage = (message: ChatMessage) => {
    navigator.clipboard.writeText(message.content);
    setCopiedAssistantMsgId(message._id);
    dispatchTelemetry("user_copied_assistant_response", {
      msgId: message._id,
      length: message.content.length,
      hasReasoning: Boolean(message.reasoning_content),
    });
    onCopy?.(message);
    setTimeout(() => setCopiedAssistantMsgId(null), 2000);
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg._id);
    setEditingText(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditingText("");
  };

  const handleSaveEdit = () => {
    if (editingText.trim() && onSelectPrompt) {
      dispatchTelemetry("user_edited_prompt_turn", {
        msgId: editingMsgId,
        newLength: editingText.length,
      });
      onSelectPrompt(editingText.trim());
      setEditingMsgId(null);
      setEditingText("");
    }
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isBengali = /[\u0980-\u09FF]/.test(text);
    utterance.lang = isBengali ? "bn-BD" : "en-US";
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    const isTogglingOff = feedbackMap[msgId] === type;
    const newRating = isTogglingOff ? undefined : type;
    setFeedbackMap((prev) => ({
      ...prev,
      [msgId]: newRating!,
    }));
    if (newRating) {
      dispatchTelemetry("user_feedback_rating", {
        msgId,
        rating: newRating,
      });
    }
  };

  // Dynamic DOM node virtualization for budget devices (Ticket #1)
  const slicedMessages = lowRamConfig.isLowEndDevice ? messages.slice(-visibleLimit) : messages;
  const hasMoreMessages = lowRamConfig.isLowEndDevice && messages.length > visibleLimit;

  // Multi-signal contextual trigger for Twin, Academic publishing, and Logistics
  const twinTrigger = useTwinHandoffDetector(messages, messages[0]?._id);

  // Auto-scroll to bottom on new messages / streaming only if near bottom
  useEffect(() => {
    if (!userScrolledUp && bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
    }
  }, [messages.length, isStreaming, userScrolledUp]);

  const scrollToBottom = () => {
    setUserScrolledUp(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!messages || messages.length === 0) {
    return <EmptyChatGreeting onSelectPrompt={onSelectPrompt} agentId={agentId} />;
  }

  return (
    <>
      <style>{`
        @keyframes cursorBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>

      <div className="relative flex-1 h-full overflow-hidden">
        <ScrollArea
          className={cn("h-full", className)}
          onScrollCapture={(e) => {
            const target = e.currentTarget;
            const dist = target.scrollHeight - target.scrollTop - target.clientHeight;
            setUserScrolledUp(dist > 160);
          }}
        >
        <div
          className={STYLEX_MAP.container}
          aria-live={isStreaming ? "polite" : "off"}
        >
          {/* ── Load Older Messages Button (Ticket #1) ── */}
          {hasMoreMessages && (
            <div className="flex justify-center pb-2">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + lowRamConfig.virtualizationBatchSize)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition"
              >
                <span>💬</span>
                <span>Load older messages ({messages.length - visibleLimit} hidden)</span>
              </button>
            </div>
          )}

          {/* ── Replit Agent Activity Bar ("What Agent is Doing") ── */}
          {isStreaming && (
            <ReplitAgentActivityBar
              isStreaming={isStreaming}
              statusText={statusText}
            />
          )}
          {slicedMessages.map((message, idx) => {
            const msgKey = message._id || (message as any).id || `msg_${idx}`;
            const isUser = message.role === "user";
            const isMsgStreaming = message.status === "streaming" || Boolean((message as any).isStreaming);
            const isLast = idx === messages.length - 1;
            const canRegenerate = message.role === "assistant" && !isMsgStreaming;
            const canStop = message.role === "assistant" && isMsgStreaming;
            const slashCommand = isUser ? getSlashCommandDisplayText(message.content) : null;
            const rawContent = slashCommand ? slashCommand.body : message.content;

            // Decouple embedded <think>...</think> if present in raw string
            let extractedThinking: string | null = null;
            let displayContent = rawContent || "";

            if (!isUser && rawContent && rawContent.includes("<think>")) {
              const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);
              if (thinkMatch) {
                extractedThinking = thinkMatch[1].trim();
                displayContent = rawContent.replace(/<think>[\s\S]*?<\/think>/i, "").trim();
              } else if (rawContent.startsWith("<think>")) {
                extractedThinking = rawContent.replace(/<think>/i, "").trim();
                displayContent = "";
              }
            }

            const inlineError = message.metadata?.inlineError;
            const modeBadge = !isUser && message.metadata?.chatMode
              ? CHAT_MODE_BADGES[message.metadata.chatMode]
              : undefined;
            const statusLabel = message.metadata?.statusLabel;
            const plan = !isUser ? message.metadata?.plan : undefined;
            const sources = message.metadata?.sources || [];

            // ── USER message: right-aligned bubble ─────────────────────────
            if (isUser) {
              return (
                <div key={msgKey} className="flex justify-end gap-3 group">
                  <div className="flex flex-col items-end gap-1.5 max-w-[80%]">
                    {/* Slash command badge */}
                    {slashCommand && (
                      <div className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400">
                        <Command className="h-3 w-3" />
                        <span>/{slashCommand.command.name}</span>
                      </div>
                    )}

                    {/* Bubble or Inline Editor */}
                    {editingMsgId === msgKey ? (
                      <div className="w-full min-w-[320px] rounded-2xl bg-card border border-brand/40 p-3 shadow-xl space-y-2.5">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          className="w-full bg-transparent resize-none outline-none text-xs text-foreground placeholder:text-muted-foreground/60 leading-relaxed font-sans"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition shadow-xs cursor-pointer"
                          >
                            <span>Send & Update</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl rounded-tr-sm bg-zinc-100/90 dark:bg-white/[0.06] backdrop-blur-xl border border-zinc-200 dark:border-white/[0.12] px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        {message.metadata?.attachments?.length ? (
                          <div className="mb-2.5 flex flex-wrap gap-1.5">
                            {message.metadata.attachments.map((att: any) => (
                              <div key={att.id} className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[10px]">
                                {att.kind === "url" ? <Link2 className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                                <span className="truncate max-w-[120px]">{att.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <p className="whitespace-pre-wrap leading-relaxed">{displayContent}</p>
                      </div>
                    )}

                    {/* Action Bar (Copy + Edit + Timestamp) */}
                    <div className="flex items-center gap-1 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyUserPrompt(msgKey, message.content)}
                        className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
                        title={copiedUserMsgId === msgKey ? "Copied!" : "Copy prompt"}
                      >
                        {copiedUserMsgId === msgKey ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(message)}
                        className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
                        title="Edit prompt"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] text-muted-foreground/50 ml-1">
                        {message.createdAt && !isNaN(new Date(message.createdAt).getTime())
                          ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : (message as any).timestamp || ""}
                      </span>
                    </div>
                  </div>

                  {/* User avatar (Human layer) */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-white/[0.08] border border-zinc-300 dark:border-white/[0.15] text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-sm mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              );
            }

            // ── ASSISTANT message: full-width thread style (Agent layer) ─────────────────
            return (
              <div key={msgKey} className="flex gap-3.5 group">
                {/* AI avatar (Cosmic Jade aura) */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)] mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>

                {/* Content column — Agent Glass layer */}
                <div className="flex-1 min-w-0 space-y-5 rounded-2xl bg-zinc-50/80 dark:bg-black/50 backdrop-blur-2xl border border-zinc-200/80 dark:border-white/[0.08] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />
                  {/* Badges row: Mode badge + Epistemic Provenance */}
                  {(modeBadge || message.metadata?.epistemicStatus || sources.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {modeBadge && (
                        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <modeBadge.Icon className="h-3 w-3" />
                          {modeBadge.label}
                        </div>
                      )}
                      {(message.metadata?.epistemicStatus || sources.length > 0) && (
                        <EpistemicProvenanceBadge
                          status={message.metadata?.epistemicStatus || (sources.length >= 2 ? "consensus" : "supported")}
                          provenance={message.metadata?.provenance}
                        />
                      )}
                    </div>
                  )}

                  {/* Plan steps */}
                  {plan && (plan.steps?.length > 0 || plan.intent) && (
                    <div className="rounded-xl border border-border bg-muted/20 px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        Plan{plan.intent ? ` · ${plan.intent}` : ""}
                      </div>
                      {plan.steps?.length > 0 && (
                        <ol className="space-y-1 text-xs text-foreground">
                          {plan.steps.map((step: string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {/* Overnight job card */}
                  {(message.metadata?.isOvernight || message.metadata?.executionMode === "airllm_frontier") && (
                    <OvernightJobCard
                      taskTitle={displayContent}
                      status={message.status === "completed" || !isMsgStreaming ? "completed" : "processing"}
                    />
                  )}

                  {/* ── Multi-Stage Agent Activity Timeline (Perplexity & Genspark telemetry) ── */}
                  {(isMsgStreaming || message.metadata?.thinking || extractedThinking) && (
                    <AgentActivityTimeline
                      query={displayContent.slice(0, 100)}
                      isCompleted={!isMsgStreaming}
                    />
                  )}

                  {/* ── ThinkBox: chain-of-thought (DeepSeek R1 live stream) ── */}
                  {(message.metadata?.thinking || extractedThinking) && (
                    <ThinkBox
                      content={message.metadata?.thinking || extractedThinking || ""}
                      thinkingEnded={!isMsgStreaming}
                    />
                  )}

                  {/* ── AssistantSteps: agentic tool calls (Tier 2) ── */}
                  {Array.isArray(message.metadata?.steps) && message.metadata.steps.length > 0 && (
                    <AssistantSteps
                      steps={message.metadata.steps}
                      collapsed={!isMsgStreaming}
                    />
                  )}

                  {/* ── Sources Grid ABOVE answer (Perplexity Pattern) ── */}
                  {/* Only render for research-type answers with actual sources */}
                  {(message.metadata?.sources?.length > 0 || message.metadata?.chatMode === 'web-search') && (
                    <PerplexitySourcesGrid sources={message.metadata?.sources} />
                  )}

                  {/* ── GitHub Repo Analysis Card ── */}
                  {message.metadata?.githubAnalysis && (
                    <GitHubRepoCard
                      owner={message.metadata.githubAnalysis.owner}
                      repo={message.metadata.githubAnalysis.repo}
                      prompt={message.metadata.githubAnalysis.prompt || message.content}
                      status={message.metadata.githubAnalysis.status}
                      errorMessage={message.metadata.githubAnalysis.errorMessage}
                      issuesAnalysis={message.metadata.githubAnalysis.issuesAnalysis}
                      issuesStatus={message.metadata.githubAnalysis.issuesStatus}
                      onAnalyzeIssues={() => onAnalyzeIssues?.(message)}
                    />
                  )}

                  {/* Main content */}
                  {!message.metadata?.githubAnalysis && !displayContent.includes("[Stream Error:") && (
                    <div className="relative text-sm leading-relaxed">
                      <MarkdownMessage
                        content={displayContent || (isMsgStreaming ? "" : slashCommand ? "Spec request" : "")}
                        onOpenSource={onOpenSource}
                      />
                      {isMsgStreaming && displayContent && <StreamingCursor />}
                    </div>
                  )}

                  {/* ── Control Layer: Human-in-the-Loop Approval Checkpoint ── */}
                  {(message.metadata?.checkpoint || message.metadata?.approval) && (() => {
                    const chk = message.metadata?.checkpoint || message.metadata?.approval;
                    return (
                      <div className="mt-2">
                        <ApprovalCard
                          checkpointId={chk?.checkpointId}
                          actionSummary={chk?.actionSummary || "Approval Required"}
                          reason={chk?.reason || ""}
                          details={chk?.details}
                          resolved={chk?.resolved ?? (chk?.status !== "pending" && chk?.status !== undefined)}
                          outcome={
                            chk?.outcome ||
                            (chk?.status === "approved"
                              ? "approved"
                              : chk?.status === "denied"
                              ? "denied"
                              : undefined)
                          }
                          onApprove={() => {
                            const id = chk?.checkpointId || message._id;
                            if (onApproveCheckpoint) {
                              onApproveCheckpoint(id, message);
                            } else {
                              onSelectPrompt?.("Proceed with approved action.", "cofounder");
                            }
                          }}
                          onDeny={() => {
                            const id = chk?.checkpointId || message._id;
                            if (onDenyCheckpoint) {
                              onDenyCheckpoint(id, message);
                            } else {
                              onSelectPrompt?.("Cancel and abort this action.", "cofounder");
                            }
                          }}
                        />
                      </div>
                    );
                  })()}

                  {/* ── Control Layer: Secure Credential Share Card ── */}
                  {(message.metadata?.secretRequest || message.metadata?.secretShare) && (() => {
                    const sec = message.metadata?.secretRequest || message.metadata?.secretShare;
                    return (
                      <div className="mt-2">
                        <SecretShareCard
                          checkpointId={sec?.checkpointId}
                          purpose={sec?.purpose}
                          label={sec?.label}
                          placeholder={sec?.placeholder}
                          submitted={sec?.submitted}
                          onSubmit={(val) => {
                            const id = sec?.checkpointId || message._id;
                            if (onSubmitSecret) {
                              onSubmitSecret(id, val, message);
                            } else {
                              onSelectPrompt?.(`[SECURE CREDENTIAL RECEIVED]: ${val.slice(0, 4)}••••`, "cofounder");
                            }
                          }}
                          onCancel={() => {
                            const id = sec?.checkpointId || message._id;
                            if (onDenyCheckpoint) {
                              onDenyCheckpoint(id, message);
                            } else {
                              onSelectPrompt?.("Secret sharing cancelled.", "cofounder");
                            }
                          }}
                        />
                      </div>
                    );
                  })()}

                  {/* ── 1-Tap bKash / Nagad Mobile App Deep-Link Card (Ticket #2) ── */}
                  {(message.metadata as any)?.paymentInfo && (() => {
                    const paymentInfo = (message.metadata as any).paymentInfo;
                    return (
                      <div className="mt-3 p-4 rounded-2xl border border-brand/20 bg-brand/5 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {paymentInfo.provider === "bkash" ? "bKash 1-Tap Payment" : "Nagad 1-Tap Payment"}
                            </span>
                            <span className="rounded-full bg-brand/10 border border-brand/20 px-2 py-0.5 text-[9px] font-semibold text-brand">
                              App Scheme
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Payable amount: <span className="font-bold text-foreground">৳{paymentInfo.amount} BDT</span><br/>
                            Order ID: <span className="font-mono text-foreground font-semibold">#{paymentInfo.orderId}</span>
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <a
                              href={`${paymentInfo.provider}://pay?merchant=${paymentInfo.merchantPhone}&amount=${paymentInfo.amount}&ref=${paymentInfo.orderId}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark transition"
                            >
                              <span>📲</span>
                              <span>Open in {paymentInfo.provider === "bkash" ? "bKash App" : "Nagad App"}</span>
                            </a>
                            <a
                              href={`https://pay.${paymentInfo.provider}.com.bd/checkout?ref=${paymentInfo.orderId}&amount=${paymentInfo.amount}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 transition"
                            >
                              <span>🌐</span>
                              <span>Web Checkout</span>
                            </a>
                          </div>
                        </div>
                        
                        {/* Fallback QR Code for Desktop */}
                        <div className="flex flex-col items-center gap-1 shrink-0 p-1.5 bg-white rounded-xl border border-border shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
                              `https://pay.${paymentInfo.provider}.com.bd/checkout?ref=${paymentInfo.orderId}&amount=${paymentInfo.amount}`
                            )}`}
                            alt="Payment QR Code"
                            className="w-20 h-20"
                          />
                          <span className="text-[9px] text-slate-500 font-medium">Scan to Pay</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Inline Artifact Card Trigger (Only when artifact generated) ── */}
                  {Boolean((message.metadata as any)?.artifactType || (message.metadata as any)?.tab) && (
                    <>
                      <InlineArtifactCard
                        type={((message.metadata as any)?.artifactType || (message.metadata as any)?.tab) as any}
                        title={(message.metadata as any)?.artifactTitle}
                        subtitle={(message.metadata as any)?.artifactSubtitle}
                        onOpen={() => {
                          const targetTab = ((message.metadata as any)?.artifactType || (message.metadata as any)?.tab);
                          onOpenArtifact?.(targetTab, message);
                        }}
                      />

                      {/* ── Proactive Agentic Next Action Chips ── */}
                      <ProactiveNextActions
                        type={((message.metadata as any)?.artifactType || (message.metadata as any)?.tab || "general") as any}
                        onSelectAction={(query) => {
                          const targetTab = ((message.metadata as any)?.artifactType || (message.metadata as any)?.tab);
                          onSelectPrompt?.(query, "cofounder", targetTab as any);
                        }}
                      />
                    </>
                  )}



                  {/* DeerFlow / Swarm visualizers */}
                  {message.metadata?.deerflowPlan && (
                    <div className="mt-2">
                      <DeerFlowVisualizer
                        workspaceId={message.metadata.deerflowPlan.workspaceId || "ws_df_default"}
                        plan={message.metadata.deerflowPlan as any}
                      />
                    </div>
                  )}
                  {message.metadata?.swarmTopology && (
                    <div className="mt-2">
                      <SwarmVisualizer
                        workspaceId={message.metadata.swarmTopology.workspaceId || "ws_swarm_default"}
                        swarmId={message.metadata.swarmTopology.swarmId || "swarm_001"}
                        runId={message.metadata.swarmTopology.runId || "run_001"}
                      />
                    </div>
                  )}

                  {/* Overnight Deep Think Ticket */}
                  {message.metadata?.overnightJob && (
                    <div className="mt-2">
                      <OvernightJobCard
                        {...(message.metadata.overnightJob as any)}
                        onOpenArtifact={(tab) => onOpenArtifact?.(tab, message)}
                      />
                    </div>
                  )}

                  {/* 🧭 Visual Goal Frontier & Decision DAG Board */}
                  {message.metadata?.wayfinderBoard && (
                    <div className="mt-2">
                      <WayfinderBoard
                        {...(message.metadata.wayfinderBoard as any)}
                        onLaunchGrill={(title) => onSelectPrompt?.(`/grill-me ${title}`, "cofounder")}
                      />
                    </div>
                  )}

                  {/* Citations footer removed — now rendered ABOVE answer (Perplexity pattern) */}

                  {/* Inline error */}
                  {(inlineError || message.status === "error" || displayContent.includes("[Stream Error:")) && (
                    <StandardizedChatErrorCard
                      message={inlineError?.message || (displayContent.includes("[Stream Error:") ? "Could not reach the AI gateway. You can retry or switch to local GPU (Ollama)." : "Generation halted mid-stream. You can retry the turn.")}
                      recoverable={inlineError?.recoverable ?? true}
                      onRetry={() => onRegenerate && onRegenerate(message)}
                    />
                  )}

                  {/* ── Dynamic Perplexity Related / Follow-Up Questions ── */}
                  {!isMsgStreaming && displayContent && (
                    <PerplexityRelatedQueries
                      messageContent={displayContent}
                      onSelectQuery={(query) => onSelectPrompt?.(query, "cofounder")}
                    />
                  )}

                  {/* Follow-up action bar — minimal: Copy + Regenerate + ⋯ */}
                  {!canStop && displayContent && (
                    <div className="flex items-center gap-1 pt-1.5 flex-wrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-150">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopyAssistantMessage(message)}
                        className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
                        title={copiedAssistantMsgId === message._id ? "Copied to clipboard!" : "Copy"}
                      >
                        {copiedAssistantMsgId === message._id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Read Aloud (TTS) */}
                      <button
                        onClick={() => handleSpeak(message._id, displayContent)}
                        className={cn(
                          "flex items-center justify-center h-7 w-7 rounded-md transition cursor-pointer",
                          speakingMsgId === message._id
                            ? "text-brand bg-brand/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        title={speakingMsgId === message._id ? "Stop readout" : "Read aloud (বাংলা / English)"}
                      >
                        {speakingMsgId === message._id ? (
                          <VolumeX className="h-3.5 w-3.5 text-brand animate-pulse" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Quality Feedback (Thumbs Up) */}
                      <button
                        onClick={() => handleFeedback(message._id, "up")}
                        className={cn(
                          "flex items-center justify-center h-7 w-7 rounded-md transition cursor-pointer",
                          feedbackMap[message._id] === "up"
                            ? "text-emerald-400 bg-emerald-500/10 font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        title="Good response"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>

                      {/* Quality Feedback (Thumbs Down) */}
                      <button
                        onClick={() => handleFeedback(message._id, "down")}
                        className={cn(
                          "flex items-center justify-center h-7 w-7 rounded-md transition cursor-pointer",
                          feedbackMap[message._id] === "down"
                            ? "text-rose-400 bg-rose-500/10 font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        title="Poor response"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Regenerate */}
                      {canRegenerate && (
                        <button
                          onClick={() => onRegenerate?.(message)}
                          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
                          title="Regenerate"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* ⋯ Overflow — Deep Research, Slides */}
                      <div className="relative group/overflow">
                        <button
                          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
                          title="More actions"
                        >
                          <span className="text-sm font-bold leading-none">⋯</span>
                        </button>
                        <div className="absolute bottom-full left-0 mb-1 z-50 hidden group-hover/overflow:block w-44 rounded-xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => onActionClick?.("deep-research", message)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition"
                          >
                            <Search className="h-3 w-3 text-brand" />
                            Research this further
                          </button>
                          <button
                            onClick={() => onOpenArtifact?.("slides", message)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            Turn into slides
                          </button>
                          <button
                            onClick={() => onOpenArtifact?.("sheet", message)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition"
                          >
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            Turn into spreadsheet
                          </button>
                          {/* Receipt — admin audit surface, inside overflow per DeepSeek-close spec */}
                          <button
                            onClick={() => {
                              setTrajectoryModel(((message.metadata as any)?.model as string) || "DeepSeek V4 Flash");
                              setTrajectoryOpen(true);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition border-t border-border/40 mt-0.5 pt-2"
                            title="View execution trajectory & audit receipt"
                          >
                            <Receipt className="h-3 w-3" />
                            View receipt
                          </button>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-muted-foreground/40 ml-1">
                        {message.createdAt && !isNaN(new Date(message.createdAt).getTime())
                          ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : (message as any).timestamp || ""}
                      </span>
                    </div>
                  )}

                  {/* Stop button (streaming) */}
                  {canStop && (
                    <button
                      type="button"
                      onClick={() => onStop?.(message)}
                      className="mt-1 flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 cursor-pointer select-none transition"
                    >
                      <Square className="h-3 w-3 fill-current" />
                      Stop generating
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* 🚀 Next-Step Bridge: Contextual Twin Trigger (Signal-driven) */}
          {twinTrigger.eligible && !isStreaming && (
            <TwinCtaCard
              conversationId={messages[0]?._id || "conv_active"}
              triggerContext={twinTrigger}
            />
          )}

          {/* Bottom anchor */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Floating Scroll to Bottom Button */}
      {userScrolledUp && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-popover/95 backdrop-blur-md border border-border/80 shadow-xl text-xs font-medium text-foreground hover:bg-popover hover:border-brand/50 transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 cursor-pointer"
          aria-label="Scroll to bottom"
        >
          <span>Scroll to bottom</span>
          <ChevronDown className="w-3.5 h-3.5 text-brand animate-bounce" />
        </button>
      )}
    </div>

      {/* 🧾 Replayable Trajectory & Audit Receipt Trail Modal */}
      {trajectoryOpen && (
        <TrajectoryReceiptModal
          open={trajectoryOpen}
          onOpenChange={setTrajectoryOpen}
          modelUsed={trajectoryModel}
        />
      )}
    </>
  );
}
