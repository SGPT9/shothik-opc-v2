/**
 * Chat Agent Page — DeepSeek-Close Minimalist Shell.
 *
 * Clean ask-first interface with intent-first routing:
 * - Empty state with calm heading, subtitle, and 3 starter prompts.
 * - Central composer with unified Tools dropdown menu.
 * - Optional user details panel (hidden by default, opens contextually on artifacts).
 * - Multi-agent workflows (Research, Slides, Sheets, Code, Swarm, Voice) discoverable without first-paint clutter.
 */
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "@/lib/navigation";
import { useChatSession } from "./hooks/useChatSession";
import { useChatStreamEngine } from "./hooks/useChatStreamEngine";
import { useAttachmentUploader } from "./hooks/useAttachmentUploader";
import { useTwinHandoffDetector } from "./hooks/useTwinHandoffDetector";
import { ComponentErrorBoundary } from "./components/ChatErrorBoundaries";

import { Composer, type ComposerAction } from "@/components/chat/Composer";
import { cn } from "@/lib/utils";
import { useSecondMeCognitiveState } from "@/lib/memory/useSecondMeCognitiveState";
import { Transcript } from "@/components/chat/Transcript";
import { ArtifactPanel, type ArtifactTab } from "@/components/chat/ArtifactPanel";
import { EmptyChatGreeting } from "@/components/chat/EmptyChatGreeting";
import { TwinCtaCard } from "@/components/chat/TwinCtaCard";
import { VTuberVoiceAvatarOverlay } from "@/components/voice/VTuberVoiceAvatarOverlay";
import { ChatGPTVoiceOrbModal } from "@/components/voice/ChatGPTVoiceOrbModal";
import { SwarmAdversarialDebateModal } from "@/components/chat/SwarmAdversarialDebateModal";
import { MonetizationPaywallModal } from "@/components/pricing/MonetizationPaywallModal";
import { KeyboardShortcutsModal } from "@/components/chat/KeyboardShortcutsModal";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { mcpGuardrail } from "@/lib/mcp/McpGuardrailService";
import { getStoredChatSessions } from "@/lib/chat-sessions-store";
import type { ChatPersona } from "@/lib/chat/types";
import { 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  Scale, 
  BookOpen, 
  ChevronDown, 
  Plus, 
  PanelRight, 
  MessageSquare, 
  LayoutTemplate, 
  Search, 
  Phone, 
  Download,
  Keyboard,
  FileJson,
  Printer,
  FileText as FileTextIcon,
  Smartphone,
  X,
  ChevronUp,
  Layers
} from "lucide-react";

export interface FleetAgent {
  id: string;
  name: string;
  badge: string;
  icon: any;
  color: string;
  bgLight: string;
  desc: string;
}

export const FLEET_AGENTS: FleetAgent[] = [
  { id: "core", name: "Shothik Core", badge: "General AI", icon: Sparkles, color: "text-blue-600 dark:text-blue-400", bgLight: "bg-blue-500/10", desc: "All-purpose intelligent assistant, reasoning & daily tasks" },
  { id: "analyst", name: "Deep Analyst", badge: "Research & Docs", icon: Search, color: "text-violet-400", bgLight: "bg-violet-500/10", desc: "Academic research, data synthesis & market intelligence" },
  { id: "writer", name: "Manuscript & Book Studio", badge: "Publishing", icon: BookOpen, color: "text-indigo-400", bgLight: "bg-indigo-500/10", desc: "Novels, Boi Mela 3D formatting & creative writing" },
  { id: "business", name: "Business & Pitch Partner", badge: "Ventures & Slides", icon: Scale, color: "text-amber-400", bgLight: "bg-amber-500/10", desc: "Investor decks, financial models, contracts & proposals" },
];

export interface ChatAgentPageProps {
  initialTab?: ArtifactTab;
}

export function ChatAgentPage({ initialTab }: ChatAgentPageProps = {}) {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversationId") || undefined;

  const {
    conversationId,
    messages,
    switchConversation,
    addMessage,
    updateLastAssistantMessage,
    finalizeLastAssistantMessage,
    updateMessageMetadata,
  } = useChatSession(initialConvId);

  const activeConversation = getStoredChatSessions().find((s) => s.id === conversationId);

  const { streamState, startStream, stopStream } = useChatStreamEngine();
  const { attachments, addAttachment, removeAttachment, clearAttachments } = useAttachmentUploader();
  const { hasStartupIntent } = useTwinHandoffDetector(messages);
  const { workingState, updateDraft, addChip, removeChip, recallContext, recordDecision } = useSecondMeCognitiveState({
    sessionId: conversationId,
  });

  // ── Contextual User Details / Artifact panel (hidden by default) ──
  const [artifactOpen, setArtifactOpen] = useState(Boolean(initialTab || searchParams.get("tab")));
  const [activeTab, setActiveTab] = useState<ArtifactTab>((searchParams.get("tab") as ArtifactTab) || initialTab || "slides");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["slides", "sheet", "research", "doc", "code"].includes(tabFromUrl)) {
      setArtifactOpen(true);
      setActiveTab(tabFromUrl as ArtifactTab);
    }
  }, [searchParams]);

  // ── Artifact Context Handoff Data ──
  const [slidesTopic, setSlidesTopic] = useState<string | undefined>("AI-Powered E-Commerce & Retail in Bangladesh");
  const [researchQuery, setResearchQuery] = useState<string | undefined>("Dhaka Logistics & Courier Competitor Analysis");
  const [sheetData, setSheetData] = useState<string[][] | undefined>();
  const [codeSnippet, setCodeSnippet] = useState<string | undefined>();
  const [docTitle, setDocTitle] = useState<string | undefined>("Executive Business Briefing");
  const [docContent, setDocContent] = useState<string | undefined>();
  const [docPage, setDocPage] = useState<number | undefined>(1);
  const [docBbox, setDocBbox] = useState<[number, number, number, number] | undefined>();
  const [docSourceRef, setDocSourceRef] = useState<string | undefined>();

  const [voiceActive, setVoiceActive] = useState(false);
  const [isVoiceOrbOpen, setIsVoiceOrbOpen] = useState(false);
  const [isSwarmDebateOpen, setIsSwarmDebateOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [persona, setPersona] = useState<ChatPersona>("cofounder");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("core");
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const activeAgent = FLEET_AGENTS.find(a => a.id === selectedAgentId) || FLEET_AGENTS[0];

  // Mobile Touch Gestures for 2GB RAM devices (Swipe Left = Canvas, Swipe Right = Chat)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isMobileTabDrawerOpen, setIsMobileTabDrawerOpen] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    // Only trigger if horizontal swipe is prominent
    if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0 && !artifactOpen) {
        // Swiped Left ➔ Open Work Canvas
        setArtifactOpen(true);
      } else if (deltaX > 0 && artifactOpen) {
        // Swiped Right ➔ Open Chat
        setArtifactOpen(false);
      }
    }
    setTouchStart(null);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen to global VTuber trigger event
  useEffect(() => {
    const handleToggle = () => setVoiceActive((prev) => !prev);
    window.addEventListener("shothik_toggle_vtuber", handleToggle);
    return () => window.removeEventListener("shothik_toggle_vtuber", handleToggle);
  }, []);

  // Synchronize URL query params (?tab=slides / ?tab=sheet / ?tab=research) with split-pane canvas
  useEffect(() => {
    const tabParam = searchParams.get("tab") as ArtifactTab | null;
    if (tabParam) {
      setActiveTab(tabParam);
      setArtifactOpen(true);
    }
  }, [searchParams]);

  const createNewConversation = useCallback(() => {
    const newId = `conv_${Date.now()}`;
    switchConversation(newId);
  }, [switchConversation]);

  // Multi-format session export handler (Markdown, JSON, Print/PDF)
  const handleExportSession = useCallback((format: "md" | "json" | "print") => {
    setIsExportMenuOpen(false);
    const title = activeConversation?.title || "shothik-session";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (format === "print") {
      window.print();
      return;
    }

    if (format === "json") {
      const exportData = {
        title,
        conversationId,
        exportedAt: new Date().toISOString(),
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          metadata: m.metadata,
          createdAt: m.createdAt,
        })),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Markdown default
    const md = messages
      .map((m) => `### ${m.role === "user" ? "User" : "Shothik"}\n\n${m.content || ""}\n`)
      .join("\n---\n\n");
    const blob = new Blob([`# ${title}\n\n${md}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeConversation, conversationId, messages]);

  const handlePersonaChange = useCallback((newPersona: ChatPersona) => {
    setPersona(newPersona);
    if (newPersona === "researcher") {
      setIsSwarmDebateOpen(true);
    }
  }, []);

  // Open contextual artifact / user details panel
  const handleOpenArtifact = useCallback((type: string, messageOrContent?: any) => {
    const tab = type as ArtifactTab;
    setActiveTab(tab);
    setArtifactOpen(true);

    if (messageOrContent) {
      const text = typeof messageOrContent === "string" ? messageOrContent : messageOrContent.content || "";
      if (tab === "slides" && text) setSlidesTopic(text);
      if (tab === "research" && text) setResearchQuery(text);
      if (tab === "code" && text) setCodeSnippet(text);
      if (tab === "doc" && text) setDocTitle(text);
      if (typeof messageOrContent === "object" && messageOrContent.metadata?.sheetData) {
        setSheetData(messageOrContent.metadata.sheetData);
      }
    }
  }, []);

  // Handle clicking citation pill badges in transcript
  const handleOpenSource = useCallback((sourceKey: string) => {
    const cleanKey = sourceKey.replace(/^#(source|doc):/, "");
    const parts = cleanKey.split(":");
    const docName = parts[0] || "Document";
    const secOrPage = parts[1] || "";
    const isDocCitation = cleanKey.includes("p") || cleanKey.includes(".pdf") || cleanKey.includes(".docx") || parts.length >= 2;

    if (isDocCitation) {
      setDocTitle(docName);
      setDocSourceRef(cleanKey);

      if (secOrPage.startsWith("p")) {
        const pageNum = parseInt(secOrPage.replace(/\D/g, ""), 10);
        if (!isNaN(pageNum)) {
          setDocPage(pageNum);
        }
      }

      if (parts[2]?.includes(",")) {
        const coords = parts[2].split(",").map((n) => parseFloat(n.trim()));
        if (coords.length === 4 && coords.every((n) => !isNaN(n))) {
          setDocBbox(coords as [number, number, number, number]);
        }
      }

      setActiveTab("doc");
      setArtifactOpen(true);
      return;
    }

    setResearchQuery(cleanKey);
    setActiveTab("research");
    setArtifactOpen(true);
  }, [handleOpenArtifact]);


  // Handle explicit Tool launcher invocations from the Tools menu
  const handleOpenTool = useCallback((tool: string) => {
    switch (tool) {
      case "research":
        handleOpenArtifact("research");
        break;
      case "swarm":
        setIsSwarmDebateOpen(true);
        break;
      case "slides":
        handleOpenArtifact("slides");
        break;
      case "sheet":
        handleOpenArtifact("sheet");
        break;
      case "code":
        handleOpenArtifact("code");
        break;
      case "synthesizer":
        handleOpenArtifact("synthesizer");
        break;
      case "voice":
        setIsVoiceOrbOpen(true);
        break;
      case "browser":
        handleSendMessage("Automate web workflow: navigate and gather intelligence");
        break;
      default:
        break;
    }
  }, [handleOpenArtifact]);

  // Run cancellation with persistent run ID cleanup
  const handleCancelActiveRun = useCallback(() => {
    stopStream();
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    const rawRunId = (lastAssistant as any)?.metadata?.runId;
    const activeRunId = typeof rawRunId === "string" ? rawRunId : rawRunId?.runId;
    if (activeRunId && typeof activeRunId === "string") {
      import("@/lib/chat/run-control").then(({ controlHermesRun }) => {
        controlHermesRun(activeRunId, "cancel").catch(() => {});
      });
    }
  }, [messages, stopStream]);

  // Handle all Composer dispatches via a single, typed action seam
  const handleComposerAction = useCallback((action: ComposerAction) => {
    switch (action.type) {
      case "SEND_MESSAGE":
        handleSendMessage(action.payload.text);
        break;
      case "STOP_STREAM":
        handleCancelActiveRun();
        break;
      case "OPEN_TOOL":
        handleOpenTool(action.tool);
        break;
      case "OPEN_ARTIFACT":
        handleOpenArtifact(action.tab);
        break;
      case "ATTACH_FILES":
        Array.from(action.files).forEach((file) => {
          addAttachment({
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
          });
        });
        break;
      case "REMOVE_ATTACHMENT":
        removeAttachment(action.attachmentId);
        break;
      case "REMOVE_CONTEXT_CHIP":
        removeChip(action.chipId);
        break;
      case "SET_FOCUS":
      case "SET_MODEL":
        break;
    }
  }, [addAttachment, handleCancelActiveRun, handleOpenArtifact, handleOpenTool, removeAttachment, removeChip]);

  // Global keyboard shortcuts (Ctrl+Shift+O for New Chat, ? for Shortcuts, Ctrl+Shift+E for Export)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        createNewConversation();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handleExportSession("md");
      } else if ((e.key === "?" || ((e.ctrlKey || e.metaKey) && e.key === "/")) && activeTag !== "input" && activeTag !== "textarea") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [createNewConversation, handleExportSession]);

  // Intent-First Natural Language Routing Engine
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;

      const lower = text.toLowerCase();

      // Step 1: Detect GitHub Repo / Codebase intent
      if (lower.includes("github.com/") || lower.includes("repo") || lower.includes("codebase") || lower.includes("pull request") || lower.includes("pr")) {
        setActiveTab("code");
        setCodeSnippet(text);
        setArtifactOpen(true);
      }
      // Step 2: Detect Presentation & Slide Studio intent
      else if (lower.includes("slide") || lower.includes("deck") || lower.includes("presentation") || lower.includes("pitch")) {
        const topicRaw = text.replace(/^(generate|create|build|make|show me|draft)\s+(a\s+)?(\d+[\s-]slide\s+)?(deck|presentation|slides|slide deck)?\s*(for|on|about)?\s*/i, "").trim();
        const cleanTopic = topicRaw.length > 3 ? topicRaw.charAt(0).toUpperCase() + topicRaw.slice(1) : text;
        setActiveTab("slides");
        setSlidesTopic(cleanTopic);
        setArtifactOpen(true);
      }
      // Step 3: Detect Financial Modeling & Spreadsheet intent
      else if (lower.includes("sheet") || lower.includes("financial model") || lower.includes("mrr") || lower.includes("pricing scenario") || lower.includes("excel")) {
        setActiveTab("sheet");
        setArtifactOpen(true);
      }
      // Step 4: Detect Deep Research intent
      else if (lower.includes("deep research") || lower.includes("market sizing") || lower.includes("tam sam som") || lower.includes("competitor analysis")) {
        setActiveTab("research");
        setResearchQuery(text);
        setArtifactOpen(true);
      }
      // Step 5: Detect Code Generation intent
      else if (lower.includes("generate code") || lower.includes("react component") || lower.includes("database schema") || lower.includes("api endpoint")) {
        setActiveTab("code");
        setCodeSnippet(text);
        setArtifactOpen(true);
      }
      // Step 6: Detect Web Automation intent
      else if (lower.includes("login") || lower.includes("fill form") || lower.includes("navigate to") || lower.includes("scrape") || lower.includes("browser") || lower.includes("automate") || lower.includes("collect api key") || lower.includes("open website")) {
        // Web automation — trigger browser workflow via message, no artifact panel
      }
      // Step 7: Detect Voice Mode intent
      else if (lower.includes("let's talk") || lower.includes("voice chat") || lower.includes("talk to me") || lower.includes("voice mode") || lower.includes("call me")) {
        setIsVoiceOrbOpen(true);
      }

      const userMsgId = `usr_${Date.now()}`;
      const assistantMsgId = `ast_${Date.now()}`;

      addMessage({
        id: userMsgId,
        role: "user",
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        attachments: attachments.map((a) => a.url),
      });

      clearAttachments();

      addMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isStreaming: true,
      });

      const chatMode = persona === "cofounder" ? "cofounder" : persona === "coworker" ? "scenario-testing" : "web-search";

      await startStream(
        "/api/chat",
        { conversationId, message: text.trim(), chatMode },
        (chunk) => updateLastAssistantMessage(chunk),
        () => finalizeLastAssistantMessage(),
        (err) => {
          updateLastAssistantMessage(`\n\n*[Stream Error: ${err.message}]*`);
          finalizeLastAssistantMessage();
        },
        {
          onThinking: (thought) => {
            updateMessageMetadata(assistantMsgId, { thinking: thought });
          },
          onStep: (step) => {
            updateMessageMetadata(assistantMsgId, { steps: [step] });
          },
          onArtifact: (artifact) => {
            if (artifact.type) {
              setActiveTab(artifact.type as any);
              setArtifactOpen(true);
              if (artifact.type === "slides" && artifact.title) setSlidesTopic(artifact.title);
              if (artifact.type === "research" && artifact.title) setResearchQuery(artifact.title);
            }
            updateMessageMetadata(assistantMsgId, {
              artifactType: artifact.type,
              artifactTitle: artifact.title,
              artifactSubtitle: artifact.subtitle,
            });
          },
        }
      );
    },
    [addMessage, attachments, clearAttachments, conversationId, finalizeLastAssistantMessage, startStream, updateLastAssistantMessage, persona, updateMessageMetadata]
  );

  // Control Layer: Checkpoint & Secret Resolution Handlers
  const handleApproveCheckpoint = useCallback(
    (checkpointId: string, message: any) => {
      mcpGuardrail.resolveCheckpoint(checkpointId, "approved");
      updateMessageMetadata(message.id || message._id, {
        checkpoint: {
          ...(message.metadata?.checkpoint || {}),
          status: "approved",
          outcome: "approved",
        },
      });
    },
    [updateMessageMetadata]
  );

  const handleDenyCheckpoint = useCallback(
    (checkpointId: string, message: any) => {
      mcpGuardrail.resolveCheckpoint(checkpointId, "denied");
      updateMessageMetadata(message.id || message._id, {
        checkpoint: {
          ...(message.metadata?.checkpoint || {}),
          status: "denied",
          outcome: "denied",
        },
      });
    },
    [updateMessageMetadata]
  );

  const handleSubmitSecret = useCallback(
    (checkpointId: string, secretValue: string, message: any) => {
      mcpGuardrail.resolveCheckpoint(checkpointId, "approved");
      updateMessageMetadata(message.id || message._id, {
        secretRequest: {
          ...(message.metadata?.secretRequest || {}),
          submitted: true,
        },
      });
    },
    [updateMessageMetadata]
  );

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background"
    >
      {/* Main Workspace Shell */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* ── Top Workspace Bar: ChatGPT-Style Agent Switcher & Work Mode Toggle ── */}
        <div className="h-12 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Agent Fleet Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-semibold text-foreground transition border border-border/40 hover:border-border cursor-pointer shadow-xs"
              >
                <div className={`w-5 h-5 rounded-md ${activeAgent.bgLight} ${activeAgent.color} flex items-center justify-center`}>
                  <activeAgent.icon className="w-3.5 h-3.5" />
                </div>
                <span>{activeAgent.name}</span>
                <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded-md bg-background/60 text-muted-foreground border border-border/30">
                  {activeAgent.badge}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
              </button>

              {isAgentMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-50 w-72 p-1.5 bg-popover/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                    AI Personas & Workflows
                  </div>
                  {FLEET_AGENTS.map((agent) => {
                    const isCurrent = agent.id === selectedAgentId;
                    const IconComponent = agent.icon;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setIsAgentMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                          isCurrent ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50 text-foreground"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg ${agent.bgLight} ${agent.color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{agent.name}</span>
                            <span className="text-[9px] font-mono text-muted-foreground">{agent.badge}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">
                            {agent.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Conversation Title */}
            {messages.length > 0 && activeConversation && (
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground/80 pl-2 border-l border-border/50 max-w-[280px] truncate font-medium">
                <span className="truncate">{activeConversation.title || "Active Research Session"}</span>
              </div>
            )}

            {/* Offline Status Badge */}
            {!isOnline && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-medium text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Offline · Local GPU Mode</span>
              </div>
            )}
          </div>

          {/* Right Mode Toggle & Actions */}
          <div className="flex items-center gap-2">
            {/* Multi-Format Export Menu */}
            {messages.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium transition border border-border/30 cursor-pointer"
                  title="Export session (Ctrl+Shift+E)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-52 p-1.5 bg-popover/95 backdrop-blur-xl border border-border/70 rounded-2xl shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => handleExportSession("md")}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer"
                    >
                      <FileTextIcon className="w-3.5 h-3.5 text-brand shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs">Markdown (.md)</div>
                        <div className="text-[10px] text-muted-foreground">Standard formatted report</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSession("json")}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer"
                    >
                      <FileJson className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs">JSON (.json)</div>
                        <div className="text-[10px] text-muted-foreground">Full schema & metadata</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSession("print")}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer border-t border-border/40 mt-1 pt-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs">Print / PDF</div>
                        <div className="text-[10px] text-muted-foreground">System print dialogue</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Keyboard Shortcuts Help Button */}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition border border-border/30 cursor-pointer hidden md:flex"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Dual Mode Switcher (Chat | Work Canvas) - Shown in header when transcript is active or canvas open */}
            {(messages.length > 0 || artifactOpen) && (
              <div className="flex items-center bg-secondary/60 p-0.5 rounded-xl border border-border/40 text-xs animate-fade-in">
                <button
                  type="button"
                  onClick={() => setArtifactOpen(false)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
                    !artifactOpen ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArtifactOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
                    artifactOpen ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>Work Canvas</span>
                </button>
              </div>
            )}

            {/* New Thread (+) */}
            <button
              type="button"
              onClick={createNewConversation}
              className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition border border-border/30 cursor-pointer"
              title="New Chat (Ctrl+Shift+O)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content: Conversation + Dedicated Work Canvas Studio + Split-Pane Workspace */}
        {artifactOpen && messages.length === 0 ? (
          /* ── Full-Width Interactive Work Canvas Studio ── */
          <div className="flex flex-1 flex-col min-h-0 w-full overflow-hidden animate-fade-in bg-background">
            <div className="flex-1 min-h-0 overflow-hidden relative">
              <ComponentErrorBoundary title="Artifact Canvas Error">
                <ArtifactPanel
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onClose={() => setArtifactOpen(false)}
                  isStreaming={streamState.isStreaming}
                  slidesTopic={slidesTopic}
                  researchQuery={researchQuery}
                  sheetData={sheetData}
                  codeSnippet={codeSnippet}
                  docTitle={docTitle}
                  docContent={docContent}
                  docPage={docPage}
                  docBbox={docBbox}
                  docSourceRef={docSourceRef}
                />
              </ComponentErrorBoundary>
            </div>

            {/* Pinned Bottom AI Copilot Composer for Live Canvas Mutation */}
            <div className="w-full max-w-4xl mx-auto px-4 py-3 shrink-0">
              <ComponentErrorBoundary title="Composer Input Interrupted">
                <Composer
                  onAction={handleComposerAction}
                  onSend={handleSendMessage}
                  isStreaming={streamState.isStreaming}
                  onStop={handleCancelActiveRun}
                  onVoiceClick={() => setVoiceActive((prev) => !prev)}
                  onVoiceOrbClick={() => setIsVoiceOrbOpen(true)}
                  persona={persona}
                  onPersonaChange={handlePersonaChange}
                  onOpenArtifact={(tab) => handleOpenArtifact(tab)}
                  onOpenTool={handleOpenTool}
                />
              </ComponentErrorBoundary>
            </div>
          </div>
        ) : artifactOpen && messages.length > 0 ? (
          /* ── Split Conversation + Right Artifact Panel ── */
          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full overflow-hidden">
            {/* ── Left Conversation Column ── */}
            <ResizablePanel defaultSize={50} minSize={35} className="flex flex-col min-w-0 h-full overflow-hidden">
              <ComponentErrorBoundary title="Transcript Panel Interrupted">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  <Transcript
                    messages={messages as any}
                    agentId={selectedAgentId}
                    isStreaming={streamState.isStreaming}
                    statusText={streamState.statusText}
                    onOpenArtifact={(type) => handleOpenArtifact(type)}
                    onOpenSource={handleOpenSource}
                    onSelectPrompt={(prompt, mode, tab) => {
                      handleSendMessage(prompt);
                      if (tab) {
                        handleOpenArtifact(tab);
                      }
                    }}
                    onApproveCheckpoint={handleApproveCheckpoint}
                    onDenyCheckpoint={handleDenyCheckpoint}
                    onSubmitSecret={handleSubmitSecret}
                    onStop={handleCancelActiveRun}
                  />
                </div>
              </ComponentErrorBoundary>

              {/* Composer — pinned bottom */}
              <ComponentErrorBoundary title="Composer Input Interrupted">
                <Composer
                  onAction={handleComposerAction}
                  onSend={handleSendMessage}
                  isStreaming={streamState.isStreaming}
                  onStop={handleCancelActiveRun}
                  onVoiceClick={() => setVoiceActive((prev) => !prev)}
                  onVoiceOrbClick={() => setIsVoiceOrbOpen(true)}
                  persona={persona}
                  onPersonaChange={handlePersonaChange}
                  onOpenArtifact={(tab) => handleOpenArtifact(tab)}
                  onOpenTool={handleOpenTool}
                />
              </ComponentErrorBoundary>
            </ResizablePanel>

            {/* ── Draggable Splitter Handle ── */}
            <ResizableHandle className="w-1.5 bg-border/40 hover:bg-brand/50 transition cursor-col-resize z-30" />

            {/* ── Right Contextual User Details / Artifact Panel ── */}
            <ResizablePanel defaultSize={50} minSize={25} maxSize={65} className="h-full overflow-hidden">
              <ComponentErrorBoundary title="Artifact Canvas Error">
                <ArtifactPanel
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onClose={() => setArtifactOpen(false)}
                  isStreaming={streamState.isStreaming}
                  slidesTopic={slidesTopic}
                  researchQuery={researchQuery}
                  sheetData={sheetData}
                  codeSnippet={codeSnippet}
                  docTitle={docTitle}
                  docContent={docContent}
                  docPage={docPage}
                  docBbox={docBbox}
                  docSourceRef={docSourceRef}
                />
              </ComponentErrorBoundary>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center min-h-0 w-full overflow-y-auto px-4 py-8 custom-scrollbar animate-fade-in">
            <div className="w-full max-w-3xl space-y-6 text-center">
              {/* ── Empty State Greeting & Intent Starter Prompts ── */}
              <EmptyChatGreeting
                isArtifactOpen={artifactOpen}
                onToggleArtifact={setArtifactOpen}
                onSelectPrompt={(prompt, mode, tab) => {
                  handleSendMessage(prompt);
                  if (tab) {
                    handleOpenArtifact(tab);
                  }
                }}
              />

              {/* ── Center Dominant Minimalist Composer ── */}
              <div className="w-full text-left">
                <ComponentErrorBoundary title="Composer Input Interrupted">
                  <Composer
                    onAction={handleComposerAction}
                    onSend={handleSendMessage}
                    isStreaming={streamState.isStreaming}
                    onStop={handleCancelActiveRun}
                    onVoiceClick={() => setVoiceActive((prev) => !prev)}
                    onVoiceOrbClick={() => setIsVoiceOrbOpen(true)}
                    persona={persona}
                    onPersonaChange={handlePersonaChange}
                    onOpenArtifact={(tab) => handleOpenArtifact(tab)}
                    onOpenTool={handleOpenTool}
                  />
                </ComponentErrorBoundary>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 w-full overflow-hidden">
            {/* Full-width Conversation Column */}
            <div className="relative flex flex-col min-w-0 h-full flex-1 overflow-hidden">
              <ComponentErrorBoundary title="Transcript Panel Interrupted">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Transcript
                    messages={messages as any}
                    isStreaming={streamState.isStreaming}
                    statusText={streamState.statusText}
                    onOpenArtifact={(type) => handleOpenArtifact(type)}
                    onOpenSource={handleOpenSource}
                    onSelectPrompt={(prompt, mode, tab) => {
                      handleSendMessage(prompt);
                      if (tab) {
                        handleOpenArtifact(tab);
                      }
                    }}
                    onApproveCheckpoint={handleApproveCheckpoint}
                    onDenyCheckpoint={handleDenyCheckpoint}
                    onSubmitSecret={handleSubmitSecret}
                    onStop={handleCancelActiveRun}
                  />
                </div>
              </ComponentErrorBoundary>

              {/* Composer — pinned bottom */}
              <ComponentErrorBoundary title="Composer Input Interrupted">
                <Composer
                  onAction={handleComposerAction}
                  onSend={handleSendMessage}
                  isStreaming={streamState.isStreaming}
                  onStop={handleCancelActiveRun}
                  onVoiceClick={() => setVoiceActive((prev) => !prev)}
                  onVoiceOrbClick={() => setIsVoiceOrbOpen(true)}
                  persona={persona}
                  onPersonaChange={handlePersonaChange}
                  onOpenArtifact={(tab) => handleOpenArtifact(tab)}
                  onOpenTool={handleOpenTool}
                />
              </ComponentErrorBoundary>
            </div>
          </div>
        )}

        {/* VTuber 3D Interactive Voice Avatar Overlay */}
        <VTuberVoiceAvatarOverlay
          avatarName="Shothik 3D Avatar Presenter"
          isActive={voiceActive}
          onClose={() => setVoiceActive(false)}
        />

        {/* 🔮 Conversational Voice Mode Orb Modal */}
        <ChatGPTVoiceOrbModal
          isOpen={isVoiceOrbOpen}
          onClose={() => setIsVoiceOrbOpen(false)}
        />

        {/* 🐝 Agent Swarm Adversarial Debate Modal */}
        <SwarmAdversarialDebateModal
          isOpen={isSwarmDebateOpen}
          onClose={() => setIsSwarmDebateOpen(false)}
          onOpenSource={(sourceKey) => handleOpenArtifact("research", sourceKey)}
        />

        {/* 💳 Monetization & bKash/Nagad Paywall Portal Modal */}
        <MonetizationPaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
        />

        {/* ⌨️ Keyboard Shortcuts Cheat Sheet Modal */}
        <KeyboardShortcutsModal
          open={isShortcutsOpen}
          onOpenChange={setIsShortcutsOpen}
        />

        {/* 📱 2GB RAM Mobile Floating Action Pill & Touch Quick-Switcher */}
        <div className="sm:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1 rounded-full bg-background/95 border border-border/80 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={() => setArtifactOpen(false)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer",
              !artifactOpen ? "bg-brand text-brand-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3 w-3" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!artifactOpen) setArtifactOpen(true);
              setIsMobileTabDrawerOpen((o) => !o);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer",
              artifactOpen ? "bg-brand text-brand-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutTemplate className="h-3 w-3" />
            <span className="capitalize">{activeTab}</span>
            <ChevronUp className={cn("h-3 w-3 transition-transform", isMobileTabDrawerOpen && "rotate-180")} />
          </button>
        </div>

        {/* 📱 Mobile Studio Tab Picker Drawer Sheet */}
        {isMobileTabDrawerOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="fixed bottom-0 inset-x-0 bg-popover border-t border-border p-4 rounded-t-3xl shadow-2xl space-y-3 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-brand" />
                  <span className="text-xs font-bold text-foreground">Select Studio Canvas Tab</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileTabDrawerOpen(false)}
                  className="p-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "slides", label: "Slides 16:9", icon: "🎴" },
                  { id: "sheet", label: "Financial Sheet", icon: "📊" },
                  { id: "research", label: "Deep Research", icon: "🔍" },
                  { id: "commerce", label: "F-Commerce & MFS", icon: "⚡" },
                  { id: "whatsapp", label: "WhatsApp Bot", icon: "💬" },
                  { id: "career", label: "Career & CV", icon: "💼" },
                  { id: "swarm", label: "Swarm Fleet", icon: "🐝" },
                  { id: "boimela", label: "বইমেলা 3D", icon: "📖" },
                  { id: "community", label: "Community Hub", icon: "👥" },
                  { id: "approvals", label: "Gatekeeper Approvals", icon: "🛡️" },
                  { id: "code", label: "Python REPL", icon: "🐍" },
                  { id: "diagram", label: "Architecture Diagram", icon: "📐" },
                  { id: "doc", label: "Document Editor", icon: "📄" },
                  { id: "synthesizer", label: "Venture Synthesizer", icon: "🪄" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(t.id as ArtifactTab);
                      setArtifactOpen(true);
                      setIsMobileTabDrawerOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-left font-semibold transition cursor-pointer",
                      activeTab === t.id && artifactOpen
                        ? "bg-brand text-brand-foreground border-brand shadow-sm"
                        : "bg-muted/30 border-border/40 text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="text-xs truncate">{t.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground text-center font-mono">
                Swipe Left ➔ Canvas · Swipe Right ➔ Chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatAgentPage;
