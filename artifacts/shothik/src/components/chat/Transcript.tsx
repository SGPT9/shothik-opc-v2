import { Command, Copy, Link2, Loader2, Paperclip, RefreshCw, Search, Sparkles, Square, User, FlaskConical, Globe, Lightbulb, ListChecks, Receipt } from "lucide-react";
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
import { AssistantSteps } from "./AssistantSteps";
import { InlineArtifactCard } from "./InlineArtifactCard";
import { ReplitAgentActivityBar } from "./ReplitAgentActivityBar";
import { ProactiveNextActions } from "./ProactiveNextActions";
import { PerplexitySourcesGrid } from "@/components/perplexity/PerplexitySourcesGrid";
import { PerplexityRelatedQueries } from "@/components/perplexity/PerplexityRelatedQueries";
import { TrajectoryReceiptModal } from "./TrajectoryReceiptModal";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatPersona } from "@/lib/chat/types";
import { useRef, useEffect, useState } from "react";
import { LowRamStylexOptimizerService } from "@/lib/infrastructure/low-ram-stylex-optimizer";

// Pre-compiled static class map matching compile-time StyleX layout rules
const STYLEX_MAP = {
  container: "mx-auto max-w-3xl px-4 py-6 space-y-8",
  userRow: "flex justify-end gap-3 group",
  userCol: "flex flex-col items-end gap-1.5 max-w-[80%]",
  userBubble: "rounded-[20px] rounded-br-md bg-gradient-to-br from-brand to-brand-dark px-4 py-3 text-sm text-white shadow-md shadow-brand/20",
  userAttachmentPill: "inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[10px]",
  userTimestamp: "text-[10px] text-muted-foreground/50 pr-1 opacity-0 group-hover:opacity-100 transition-opacity",
  userAvatar: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 text-white shadow-sm mt-0.5",
  
  assistantRow: "flex gap-3.5 group",
  assistantAvatar: "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand via-brand-dark to-teal-600 text-white shadow-md shadow-brand/25 mt-0.5",
  assistantCol: "flex-1 min-w-0 space-y-5",
  planContainer: "rounded-xl border border-border bg-muted/20 px-3.5 py-2.5",
  planTitle: "flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-1.5",
  planList: "space-y-1 text-xs text-foreground",
  contentContainer: "relative text-sm leading-relaxed",
  
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
  onSelectPrompt?: (prompt: string, mode?: ChatPersona, tab?: "slides" | "sheet" | "research" | "code") => void;
  className?: string;
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
  onSelectPrompt,
  className,
}: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lowRamConfig = LowRamStylexOptimizerService.detectDeviceCapabilities();
  const [visibleLimit, setVisibleLimit] = useState(lowRamConfig.virtualizationBatchSize);
  const [trajectoryOpen, setTrajectoryOpen] = useState(false);
  const [trajectoryModel, setTrajectoryModel] = useState("DeepSeek V4 Flash");

  // Dynamic DOM node virtualization for budget devices (Ticket #1)
  const slicedMessages = lowRamConfig.isLowEndDevice ? messages.slice(-visibleLimit) : messages;
  const hasMoreMessages = lowRamConfig.isLowEndDevice && messages.length > visibleLimit;

  // Auto-scroll to bottom on new messages / streaming
  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isStreaming]);

  if (!messages || messages.length === 0) {
    return <EmptyChatGreeting onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <>
      <style>{`
        @keyframes cursorBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>

      <ScrollArea className={cn("flex-1 h-full", className)}>
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
            const isUser = message.role === "user";
            const isLast = idx === messages.length - 1;
            const canRegenerate = message.role === "assistant" && message.status !== "streaming";
            const canStop = message.role === "assistant" && message.status === "streaming";
            const slashCommand = isUser ? getSlashCommandDisplayText(message.content) : null;
            const displayContent = slashCommand ? slashCommand.body : message.content;
            const inlineError = message.metadata?.inlineError;
            const modeBadge = !isUser && message.metadata?.chatMode
              ? CHAT_MODE_BADGES[message.metadata.chatMode]
              : undefined;
            const statusLabel = message.metadata?.statusLabel;
            const plan = !isUser ? message.metadata?.plan : undefined;

            // ── USER message: right-aligned bubble ─────────────────────────
            if (isUser) {
              return (
                <div key={message._id} className="flex justify-end gap-3 group">
                  <div className="flex flex-col items-end gap-1.5 max-w-[80%]">
                    {/* Slash command badge */}
                    {slashCommand && (
                      <div className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400">
                        <Command className="h-3 w-3" />
                        <span>/{slashCommand.command.name}</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div className="rounded-[20px] rounded-br-md bg-gradient-to-br from-brand to-emerald-600 px-4 py-3 text-sm text-white shadow-md shadow-brand/20">
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

                    {/* Timestamp */}
                    <span className="text-[10px] text-muted-foreground/50 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {message.createdAt && !isNaN(new Date(message.createdAt).getTime())
                        ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : (message as any).timestamp || ""}
                    </span>
                  </div>

                  {/* User avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 text-white shadow-sm mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              );
            }

            // ── ASSISTANT message: full-width thread style ─────────────────
            return (
              <div key={message._id} className="flex gap-3.5 group">
                {/* AI avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand via-emerald-500 to-teal-600 text-white shadow-md shadow-brand/25 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>

                {/* Content column — Perplexity vertical rhythm (space-y-5) */}
                <div className="flex-1 min-w-0 space-y-5">
                  {/* Mode badge */}
                  {modeBadge && (
                    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <modeBadge.Icon className="h-3 w-3" />
                      {modeBadge.label}
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
                      status={message.status === "completed" ? "completed" : message.status === "streaming" ? "processing" : "queued"}
                    />
                  )}

                  {/* Thinking state */}
                  {message.status === "streaming" && !displayContent && (
                    <ThinkingDots label={safeStatusLabel(statusLabel)} />
                  )}

                  {/* ── ThinkBox: chain-of-thought (Tier 2) ── */}
                  {message.metadata?.thinking && (
                    <ThinkBox
                      content={message.metadata.thinking}
                      thinkingEnded={message.status !== "streaming"}
                    />
                  )}

                  {/* ── AssistantSteps: agentic tool calls (Tier 2) ── */}
                  {Array.isArray(message.metadata?.steps) && message.metadata.steps.length > 0 && (
                    <AssistantSteps
                      steps={message.metadata.steps}
                      collapsed={message.status !== "streaming"}
                    />
                  )}

                  {/* ── Sources Grid ABOVE answer (Perplexity Pattern) ── */}
                  <PerplexitySourcesGrid />

                  {/* Main content */}
                  <div className="relative text-sm leading-relaxed">
                    <MarkdownMessage
                      content={displayContent || (message.status === "streaming" ? "" : slashCommand ? "Spec request" : "")}
                    />
                    {message.status === "streaming" && displayContent && <StreamingCursor />}
                  </div>

                  {/* ── 1-Tap bKash / Nagad Mobile App Deep-Link Card (Ticket #2) ── */}
                  {message.metadata?.paymentInfo && (
                    <div className="mt-3 p-4 rounded-2xl border border-brand/20 bg-brand/5 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {message.metadata.paymentInfo.provider === "bkash" ? "bKash 1-Tap Payment" : "Nagad 1-Tap Payment"}
                          </span>
                          <span className="rounded-full bg-brand/10 border border-brand/20 px-2 py-0.5 text-[9px] font-semibold text-brand">
                            App Scheme
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Payable amount: <span className="font-bold text-foreground">৳{message.metadata.paymentInfo.amount} BDT</span><br/>
                          Order ID: <span className="font-mono text-foreground font-semibold">#{message.metadata.paymentInfo.orderId}</span>
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href={`${message.metadata.paymentInfo.provider}://pay?merchant=${message.metadata.paymentInfo.merchantPhone}&amount=${message.metadata.paymentInfo.amount}&ref=${message.metadata.paymentInfo.orderId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark transition"
                          >
                            <span>📲</span>
                            <span>Open in {message.metadata.paymentInfo.provider === "bkash" ? "bKash App" : "Nagad App"}</span>
                          </a>
                          <a
                            href={`https://pay.${message.metadata.paymentInfo.provider}.com.bd/checkout?ref=${message.metadata.paymentInfo.orderId}&amount=${message.metadata.paymentInfo.amount}`}
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
                            `https://pay.${message.metadata.paymentInfo.provider}.com.bd/checkout?ref=${message.metadata.paymentInfo.orderId}&amount=${message.metadata.paymentInfo.amount}`
                          )}`}
                          alt="Payment QR Code"
                          className="w-20 h-20"
                        />
                        <span className="text-[9px] text-slate-500 font-medium">Scan to Pay</span>
                      </div>
                    </div>
                  )}

                  {/* ── Inline Artifact Card Trigger (Replit Agent On-Demand Pattern) ── */}
                  {(message.metadata?.artifactType || message.metadata?.tab || (message.role === "assistant" && (displayContent?.includes("```") || displayContent?.toLowerCase().includes("slide") || displayContent?.toLowerCase().includes("sheet") || displayContent?.toLowerCase().includes("research")))) && (
                    <>
                      <InlineArtifactCard
                        type={
                          (message.metadata?.artifactType || message.metadata?.tab || (
                            displayContent?.toLowerCase().includes("slide") ? "slides" :
                            displayContent?.toLowerCase().includes("sheet") || displayContent?.toLowerCase().includes("mrr") ? "sheet" :
                            displayContent?.toLowerCase().includes("research") ? "research" : "code"
                          )) as any
                        }
                        title={message.metadata?.artifactTitle}
                        subtitle={message.metadata?.artifactSubtitle}
                        onOpen={() => {
                          const targetTab = (
                            message.metadata?.artifactType || message.metadata?.tab || (
                              displayContent?.toLowerCase().includes("slide") ? "slides" :
                              displayContent?.toLowerCase().includes("sheet") || displayContent?.toLowerCase().includes("mrr") ? "sheet" :
                              displayContent?.toLowerCase().includes("research") ? "research" : "code"
                            )
                          );
                          onOpenArtifact?.(targetTab, message);
                        }}
                      />

                      {/* ── Proactive Agentic Next Action Chips ── */}
                      <ProactiveNextActions
                        type={
                          (message.metadata?.artifactType || message.metadata?.tab || (
                            displayContent?.toLowerCase().includes("slide") ? "slides" :
                            displayContent?.toLowerCase().includes("sheet") || displayContent?.toLowerCase().includes("mrr") ? "sheet" :
                            displayContent?.toLowerCase().includes("research") ? "research" : "code"
                          )) as any
                        }
                        onSelectAction={(query) => {
                          const targetTab = (
                            displayContent?.toLowerCase().includes("slide") ? "slides" :
                            displayContent?.toLowerCase().includes("sheet") || displayContent?.toLowerCase().includes("mrr") ? "sheet" :
                            displayContent?.toLowerCase().includes("research") ? "research" : "code"
                          );
                          onSelectPrompt?.(query, "general", targetTab as any);
                        }}
                      />

                      {/* ── Perplexity-Style Related Questions Pills ── */}
                      <PerplexityRelatedQueries
                        onSelectQuery={(q) => onSelectPrompt?.(q, "general")}
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

                  {/* Citations footer removed — now rendered ABOVE answer (Perplexity pattern) */}

                  {/* Inline error */}
                  {(inlineError || message.status === "error") && (
                    <StandardizedChatErrorCard
                      message={inlineError?.message || "Generation halted mid-stream. You can retry the turn."}
                      recoverable={inlineError?.recoverable ?? true}
                      onRetry={() => onRegenerate && onRegenerate(message)}
                    />
                  )}

                  {/* Follow-up action bar — minimal: Copy + Regenerate + ⋯ */}
                  {!canStop && displayContent && (
                    <div className="flex items-center gap-1 pt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150">
                      {/* Copy */}
                      <button
                        onClick={() => onCopy?.(message)}
                        className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                        title="Copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      {/* 🧾 View Trajectory & Audit Receipt Trail */}
                      <button
                        onClick={() => {
                          setTrajectoryModel((message.metadata?.model as string) || "DeepSeek V4 Flash");
                          setTrajectoryOpen(true);
                        }}
                        className="flex items-center gap-1 h-7 px-2 rounded-md text-[10px] font-mono text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition cursor-pointer"
                        title="View Replayable Execution Trajectory & Audit Receipt Trail"
                      >
                        <Receipt className="h-3 w-3" />
                        <span>1.8¢ Receipt</span>
                      </button>

                      {/* Regenerate */}
                      {canRegenerate && (
                        <button
                          onClick={() => onRegenerate?.(message)}
                          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                          title="Regenerate"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* ⋯ Overflow — Deep Research, Slides */}
                      <div className="relative group/overflow">
                        <button
                          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                          title="More actions"
                        >
                          <span className="text-sm font-bold leading-none">⋯</span>
                        </button>
                        <div className="absolute bottom-full left-0 mb-1 z-50 hidden group-hover/overflow:block w-40 rounded-xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => onActionClick?.("deep-research", message)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition"
                          >
                            <Search className="h-3 w-3 text-brand" />
                            Deep Research
                          </button>
                          <button
                            onClick={() => onOpenArtifact?.("slides", message)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            → Slides
                          </button>
                          <button
                            onClick={() => onOpenArtifact?.("sheet", message)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition"
                          >
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            → Sheet
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
                      onClick={() => onStop?.(message)}
                      className="mt-1 flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition"
                    >
                      <Square className="h-3 w-3 fill-current" />
                      Stop generating
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom anchor */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

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
