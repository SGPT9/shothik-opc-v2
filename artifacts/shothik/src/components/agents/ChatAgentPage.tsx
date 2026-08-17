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
  { id: "core", name: "Shothik Core", badge: "General AI", icon: Sparkles, color: "text-emerald-400", bgLight: "bg-emerald-500/10", desc: "All-purpose intelligent assistant, reasoning & daily tasks" },
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
  const [artifactOpen, setArtifactOpen] = useState(Boolean(initialTab));
  const [activeTab, setActiveTab] = useState<ArtifactTab>(initialTab || "slides");

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
        setActiveTab("slides");
        setSlidesTopic(text);
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
        }
      );
    },
    [addMessage, attachments, clearAttachments, conversationId, finalizeLastAssistantMessage, startStream, updateLastAssistantMessage, persona]
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
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
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

        {/* Content: Conversation + Optional Contextual User Details Panel */}
        {artifactOpen ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full overflow-hidden">
            {/* ── Left Conversation Column ── */}
            <ResizablePanel defaultSize={55} minSize={35} className="flex flex-col min-w-0 h-full overflow-hidden">
              <ComponentErrorBoundary title="Transcript Panel Interrupted">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="p-6 flex flex-col justify-center min-h-full max-w-lg mx-auto space-y-4">
                      <div className="space-y-1 text-left">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-mono font-medium">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="capitalize">{activeTab} Studio Copilot</span>
                        </div>
                        <h2 className="text-lg font-bold text-foreground tracking-tight">
                          {activeTab === "slides" && "What presentation should we build?"}
                          {activeTab === "sheet" && "What model should we structure?"}
                          {activeTab === "research" && "What topic should we research?"}
                          {!["slides", "sheet", "research"].includes(activeTab) && "What should we create today?"}
                        </h2>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeTab === "slides" && "Describe your deck or select a starter prompt to generate slides on the right canvas."}
                          {activeTab === "sheet" && "Describe your scenario or formulas to populate the spreadsheet canvas on the right."}
                          {activeTab === "research" && "Enter a research query or market sizing question to start multi-source synthesis."}
                          {!["slides", "sheet", "research"].includes(activeTab) && "Type your instructions below to drive the active studio canvas."}
                        </p>
                      </div>

                      {/* Tailored Studio Quick Starter Prompts */}
                      <div className="space-y-2 pt-2">
                        {activeTab === "slides" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage("Generate a 10-slide investor pitch deck for a South Asian SaaS startup");
                                setSlidesTopic("10-Slide Investor Pitch Deck (South Asian SaaS)");
                              }}
                              className="w-full text-left p-3 rounded-xl bg-card hover:bg-muted/60 border border-border/70 hover:border-brand/40 text-xs text-foreground transition group cursor-pointer select-none"
                            >
                              <div className="font-semibold text-brand group-hover:text-brand-light flex items-center justify-between">
                                <span>📽️ 10-Slide Investor Pitch Deck</span>
                                <span className="text-[10px] text-muted-foreground font-mono">1-Click</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">Problem, solution, market size, business model & traction.</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage("Create an executive presentation on Bangladesh e-commerce market opportunity");
                                setSlidesTopic("Bangladesh E-Commerce Market Opportunity");
                              }}
                              className="w-full text-left p-3 rounded-xl bg-card hover:bg-muted/60 border border-border/70 hover:border-brand/40 text-xs text-foreground transition group cursor-pointer select-none"
                            >
                              <div className="font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center justify-between">
                                <span>📊 Market Opportunity Overview</span>
                                <span className="text-[10px] text-muted-foreground font-mono">1-Click</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">Macro landscape, mobile internet penetration & digital growth.</div>
                            </button>
                          </>
                        )}

                        {activeTab === "sheet" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage("Build a 3-scenario SaaS revenue & cash flow model (Base / Aggressive / Conservative)");
                              }}
                              className="w-full text-left p-3 rounded-xl bg-card hover:bg-muted/60 border border-border/70 hover:border-brand/40 text-xs text-foreground transition group cursor-pointer select-none"
                            >
                              <div className="font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center justify-between">
                                <span>📈 3-Scenario Financial Model</span>
                                <span className="text-[10px] text-muted-foreground font-mono">1-Click</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">Base, aggressive, and conservative projections with formula sync.</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage("Generate a unit economics and customer acquisition cost (CAC) sheet with bKash/Nagad fees");
                              }}
                              className="w-full text-left p-3 rounded-xl bg-card hover:bg-muted/60 border border-border/70 hover:border-brand/40 text-xs text-foreground transition group cursor-pointer select-none"
                            >
                              <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                                <span>💵 Unit Economics & MFS Payouts</span>
                                <span className="text-[10px] text-muted-foreground font-mono">1-Click</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">CAC, LTV, gross margin, and local merchant gateway fee splits.</div>
                            </button>
                          </>
                        )}

                        {activeTab === "research" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage("Deep research analysis on Bangladesh Logistics & Parcel Delivery TAM/SAM/SOM");
                                setResearchQuery("Bangladesh Logistics & Parcel Delivery TAM/SAM/SOM");
                              }}
                              className="w-full text-left p-3 rounded-xl bg-card hover:bg-muted/60 border border-border/70 hover:border-brand/40 text-xs text-foreground transition group cursor-pointer select-none"
                            >
                              <div className="font-semibold text-violet-400 group-hover:text-violet-300 flex items-center justify-between">
                                <span>🔬 Logistics Market TAM/SAM/SOM</span>
                                <span className="text-[10px] text-muted-foreground font-mono">1-Click</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">Audited competitor benchmarks across Pathao, Paperfly, and RedX.</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage("Compare PostgreSQL + PostgREST vs Supabase vs MongoDB for fintech");
                                setResearchQuery("PostgreSQL + PostgREST vs Supabase vs MongoDB");
                              }}
                              className="w-full text-left p-3 rounded-xl bg-card hover:bg-muted/60 border border-border/70 hover:border-brand/40 text-xs text-foreground transition group cursor-pointer select-none"
                            >
                              <div className="font-semibold text-sky-400 group-hover:text-sky-300 flex items-center justify-between">
                                <span>⚖️ Tech Stack Comparison</span>
                                <span className="text-[10px] text-muted-foreground font-mono">1-Click</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">Throughput, ACID guarantees, migration safety & RLS security.</div>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
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
                  )}
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
            <ResizablePanel defaultSize={45} minSize={25} maxSize={65} className="h-full overflow-hidden">
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

                  {/* Twin Startup Handoff Card */}
                  {hasStartupIntent && (
                    <div className="px-4 pb-3 max-w-3xl mx-auto">
                      <TwinCtaCard conversationId={conversationId || "conv_default"} />
                    </div>
                  )}
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
      </div>
    </div>
  );
}

export default ChatAgentPage;
