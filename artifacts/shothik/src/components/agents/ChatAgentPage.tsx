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
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatSession } from "./hooks/useChatSession";
import { useChatStreamEngine } from "./hooks/useChatStreamEngine";
import { useAttachmentUploader } from "./hooks/useAttachmentUploader";
import { useTwinHandoffDetector } from "./hooks/useTwinHandoffDetector";
import { ComponentErrorBoundary } from "./components/ChatErrorBoundaries";

import { Composer, type ComposerAction } from "@/components/chat/Composer";
import { cn } from "@/lib/utils";
import { needle2 } from "@/lib/ai/needle-dispatcher";
import { useSecondMeCognitiveState } from "@/lib/memory/useSecondMeCognitiveState";
import { Transcript } from "@/components/chat/Transcript";
import { ArtifactPanel, type ArtifactTab } from "@/components/chat/ArtifactPanel";
import { EmptyChatGreeting } from "@/components/chat/EmptyChatGreeting";
import { TwinCtaCard } from "@/components/chat/TwinCtaCard";
import { UnifiedVoiceStudioModal } from "@/components/voice/UnifiedVoiceStudioModal";
import { MonetizationPaywallModal } from "@/components/pricing/MonetizationPaywallModal";
import { KeyboardShortcutsModal } from "@/components/chat/KeyboardShortcutsModal";
import { ShareArtifactModal } from "@/components/chat/ShareArtifactModal";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { OfflineSyncBadge } from "@/components/common/OfflineSyncBadge";
import { DshExecutionDrawer } from "@/components/chat/DshExecutionDrawer";
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
  Layers,
  Paperclip,
  Share2,
  Cpu,
  Brain,
  Zap,
  Compass,
  ShieldCheck,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { WebGpuInferenceService, type WebGpuCapability } from "@/lib/ai/WebGpuInferenceService";

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
  { id: "core", name: "Shothik Smart AI", badge: "Assistant", icon: Sparkles, color: "text-blue-600 dark:text-blue-400", bgLight: "bg-blue-500/10", desc: "All-purpose intelligent writing, reasoning & problem solving" },
  { id: "planner", name: "Project & Task Planner", badge: "Planner", icon: Compass, color: "text-amber-400", bgLight: "bg-amber-500/10", desc: "Step-by-step roadmap, goal tracking & execution strategy" },
  { id: "architect", name: "System & Logic Designer", badge: "Architecture", icon: Layers, color: "text-purple-400", bgLight: "bg-purple-500/10", desc: "Structured design, database modeling & technical blueprints" },
  { id: "security", name: "Security & Privacy Checker", badge: "Safety", icon: ShieldCheck, color: "text-red-400", bgLight: "bg-red-500/10", desc: "Data protection, leak prevention & safe practices" },
  { id: "tdd", name: "Accuracy & Verification Guide", badge: "Verified", icon: CheckCircle2, color: "text-emerald-400", bgLight: "bg-emerald-500/10", desc: "Fact-checking, code testing & accuracy audits" },
  { id: "analyst", name: "Deep Web & Market Research", badge: "Research", icon: Search, color: "text-cyan-400", bgLight: "bg-cyan-500/10", desc: "Live web citations, market intelligence & academic synthesis" },
  { id: "business", name: "Pitch Decks & Financials", badge: "Business", icon: Scale, color: "text-amber-400", bgLight: "bg-amber-500/10", desc: "Investor slides, cash flow calculations & financial spreadsheets" },
  { id: "writer", name: "Book & Manuscript Studio", badge: "Publishing", icon: BookOpen, color: "text-indigo-400", bgLight: "bg-indigo-500/10", desc: "Chapter drafting, character arcs & Boi Mela book publishing" },
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

  const isMobile = useIsMobile();

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

  // Synchronize URL conversationId updates (e.g. from sidebar clicks)
  useEffect(() => {
    const urlConvId = searchParams.get("conversationId");
    if (urlConvId && urlConvId !== conversationId) {
      switchConversation(urlConvId);
    }
  }, [searchParams, switchConversation, conversationId]);

  // ── Artifact Context Handoff Data ──
  const [slidesTopic, setSlidesTopic] = useState<string | undefined>("AI-Powered E-Commerce & Retail in Bangladesh");
  const [researchQuery, setResearchQuery] = useState<string | undefined>("Dhaka Logistics & Courier Competitor Analysis");
  const [sheetData, setSheetData] = useState<string[][] | undefined>();
  const [sheetTitle, setSheetTitle] = useState<string | undefined>("3-Scenario Financial Model (BDT)");
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDshDrawerOpen, setIsDshDrawerOpen] = useState(false);
  const [webGpuInfo, setWebGpuInfo] = useState<WebGpuCapability | null>(null);

  useEffect(() => {
    WebGpuInferenceService.probeHardware().then(setWebGpuInfo).catch(() => {});
  }, []);
  const [persona, setPersona] = useState<ChatPersona>("cofounder");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("core");
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const activeAgent = FLEET_AGENTS.find(a => a.id === selectedAgentId) || FLEET_AGENTS[0];

  // Mobile Touch Gestures for 2GB RAM devices (Swipe Left = Canvas, Swipe Right = Chat)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isMobileTabDrawerOpen, setIsMobileTabDrawerOpen] = useState(false);

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingFile(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        addAttachment({
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          type: file.type || "application/octet-stream",
        });
      });
    }
  }, [addAttachment]);

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

  // GitHub Repo Reverse-Engineering Handler
  const handleAnalyzeRepo = useCallback(
    async (rawRepo: string) => {
      const match = rawRepo.trim().match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)|([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/);
      const slug = (match?.[1] || match?.[2] || rawRepo.trim()).replace(/\/$/, "");
      const [owner, repo] = slug.split("/");

      if (!owner || !repo) return;

      const userMsgId = `usr_${Date.now()}`;
      const assistantMsgId = `ast_${Date.now()}`;

      addMessage({
        id: userMsgId,
        role: "user",
        content: `https://github.com/${owner}/${repo}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        attachments: [],
      });

      addMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isStreaming: true,
        metadata: {
          githubAnalysis: {
            owner,
            repo,
            prompt: "",
            status: "loading",
          },
        },
      });

      const insforgeUrl = (import.meta as any).env?.VITE_INSFORGE_URL || "https://ers8j28a.ap-southeast.insforge.app";
      const anonKey = (import.meta as any).env?.VITE_INSFORGE_ANON_KEY || "anon_09a9f554a6d1ef3abb1eb3691c0224e22c30b4bfe25809c6222a8301bfa80f7b";

      try {
        const res = await fetch(`${insforgeUrl}/functions/v1/analyze-repo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ url: `${owner}/${repo}` }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to analyze repository (${res.status})`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          updateMessageMetadata(assistantMsgId, {
            githubAnalysis: {
              owner,
              repo,
              prompt: data.prompt || "",
              status: "done",
            },
          });
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          let accumulated = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            updateMessageMetadata(assistantMsgId, {
              githubAnalysis: {
                owner,
                repo,
                prompt: accumulated,
                status: "streaming",
              },
            });
          }
          updateMessageMetadata(assistantMsgId, {
            githubAnalysis: {
              owner,
              repo,
              prompt: accumulated,
              status: "done",
            },
          });
        }
      } catch (err: any) {
        updateMessageMetadata(assistantMsgId, {
          githubAnalysis: {
            owner,
            repo,
            prompt: "",
            status: "error",
            errorMessage: err.message || "An unexpected error occurred during repo analysis",
          },
        });
      }
    },
    [addMessage, updateMessageMetadata]
  );

  // GitHub Issues & PRs Analysis Handler
  const handleAnalyzeIssues = useCallback(
    async (message: any) => {
      const msgId = message.id || message._id;
      const gh = message.metadata?.githubAnalysis;
      if (!gh || !gh.owner || !gh.repo) return;
      const { owner, repo } = gh;

      updateMessageMetadata(msgId, {
        githubAnalysis: {
          ...gh,
          issuesStatus: "loading",
          issuesAnalysis: "",
        },
      });

      const insforgeUrl = (import.meta as any).env?.VITE_INSFORGE_URL || "https://ers8j28a.ap-southeast.insforge.app";
      const anonKey = (import.meta as any).env?.VITE_INSFORGE_ANON_KEY || "anon_09a9f554a6d1ef3abb1eb3691c0224e22c30b4bfe25809c6222a8301bfa80f7b";

      try {
        const res = await fetch(`${insforgeUrl}/functions/v1/analyze-issues`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ url: `${owner}/${repo}` }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to analyze issues (${res.status})`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          updateMessageMetadata(msgId, {
            githubAnalysis: {
              ...gh,
              issuesAnalysis: data.analysis || "",
              issuesStatus: "done",
            },
          });
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          let accumulated = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            updateMessageMetadata(msgId, {
              githubAnalysis: {
                ...gh,
                issuesAnalysis: accumulated,
                issuesStatus: "streaming",
              },
            });
          }
          updateMessageMetadata(msgId, {
            githubAnalysis: {
              ...gh,
              issuesAnalysis: accumulated,
              issuesStatus: "done",
            },
          });
        }
      } catch (err: any) {
        updateMessageMetadata(msgId, {
          githubAnalysis: {
            ...gh,
            issuesStatus: "error",
            errorMessage: err.message || "Failed to analyze repository issues",
          },
        });
      }
    },
    [updateMessageMetadata]
  );

  // Intent-First Natural Language Routing Engine
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;

      const trimmedText = text.trim();
      const githubUrlRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)\/?$/i;
      const bareRepoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

      // Intercept direct GitHub repo URLs for dedicated reverse-engineering
      if (githubUrlRegex.test(trimmedText) || (!trimmedText.includes(" ") && bareRepoRegex.test(trimmedText))) {
        handleAnalyzeRepo(trimmedText);
        return;
      }

      const lower = text.toLowerCase();
      let autoAgentId = selectedAgentId;
      let autoChatMode = persona === "cofounder" ? "cofounder" : persona === "coworker" ? "scenario-testing" : "web-search";

      // ── Autonomous Intent & Agent Router (Zero user clicks needed) ──
      // 1. Planner & Roadmap Intent
      if (/(plan|roadmap|milestones|breakdown|phases|implementation plan|task list)/i.test(lower)) {
        autoAgentId = "planner";
        setSelectedAgentId("planner");
      }
      // 2. System Architecture & API Design Intent
      else if (/(architect|system design|scalability|api design|microservice|database schema|topology)/i.test(lower)) {
        autoAgentId = "architect";
        setSelectedAgentId("architect");
      }
      // 3. Security & Vulnerability Review Intent
      else if (/(security|vulnerability|owasp|xss|sql injection|auth|leak|credential|pentest)/i.test(lower)) {
        autoAgentId = "security";
        setSelectedAgentId("security");
      }
      // 4. Test-Driven Development (TDD) Intent
      else if (/(test|tdd|unit test|coverage|vitest|jest|refactor|assertion)/i.test(lower)) {
        autoAgentId = "tdd";
        setSelectedAgentId("tdd");
      }
      // 5. Deep Research & Live Market Search Intent
      else if (/(deep research|market sizing|tam|competitor|news|latest|update|vs|compare|price|tariff)/i.test(lower)) {
        autoAgentId = "analyst";
        setSelectedAgentId("analyst");
        autoChatMode = "web-search";
        setActiveTab("research");
        setResearchQuery(text);
      }
      // 6. Presentation & Slide Studio Intent
      else if (/(slide|deck|presentation|pitch deck|pitch)/i.test(lower)) {
        autoAgentId = "business";
        setSelectedAgentId("business");
        const topicRaw = text.replace(/^(generate|create|build|make|show me|draft)\s+(a\s+)?(\d+[\s-]slide\s+)?(deck|presentation|slides|slide deck)?\s*(for|on|about)?\s*/i, "").trim();
        const cleanTopic = topicRaw.length > 3 ? topicRaw.charAt(0).toUpperCase() + topicRaw.slice(1) : text;
        setActiveTab("slides");
        setSlidesTopic(cleanTopic);
      }
      // 7. Financial Modeling & Spreadsheet Intent
      else if (/(sheet|financial model|mrr|pricing scenario|excel|cash flow|cac|gross margin)/i.test(lower)) {
        autoAgentId = "business";
        setSelectedAgentId("business");
        setActiveTab("sheet");
      }
      // 8. Manuscript & Creative Publishing Intent
      else if (/(novel|book|chapter|story bible|boi mela|character|manuscript|scene)/i.test(lower)) {
        autoAgentId = "writer";
        setSelectedAgentId("writer");
        setActiveTab("doc");
        setDocTitle(text.slice(0, 40));
      }
      // 9. Code Generation Intent
      else if (/(github\.com\/|repo|codebase|generate code|react component|api endpoint|fix bug)/i.test(lower)) {
        setActiveTab("code");
        setCodeSnippet(text);
      }
      // 10. Voice Mode Intent
      else if (/(let's talk|voice chat|talk to me|voice mode|call me)/i.test(lower)) {
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

      const chatMode = autoChatMode;
      const needleRoute = needle2.routeIntent("chat", text.trim());
      const chatHistory = messages.slice(-8).map((m) => ({ role: m.role, content: m.content })).concat([{ role: "user", content: text.trim() }]);

      await startStream(
        "/api/chat",
        {
          conversationId,
          message: text.trim(),
          messages: chatHistory,
          chatMode,
          context: {
            persona,
            selectedAgentId: autoAgentId,
            activeTab,
            activeArtifact: {
              tab: activeTab,
              topic: activeTab === "slides" ? slidesTopic : undefined,
              query: activeTab === "research" ? researchQuery : undefined,
              docTitle: activeTab === "doc" ? docTitle : undefined,
            },
            locale: "Asia/Dhaka",
            currency: "BDT",
            timestamp: new Date().toISOString(),
            needleRoute,
            attachments: attachments.map((a) => ({ name: a.name, type: a.type, url: a.url })),
          },
        },
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
          onSources: (sources) => {
            updateMessageMetadata(assistantMsgId, { sources, chatMode });
          },
          onArtifact: (artifact) => {
            if (artifact.type) {
              setActiveTab(artifact.type as any);
              setArtifactOpen(true);
              if (artifact.type === "slides" && artifact.title) setSlidesTopic(artifact.title);
              if (artifact.type === "research" && artifact.title) setResearchQuery(artifact.title);
              if (artifact.type === "sheet") setSheetTitle(artifact.title || "3-Scenario Financial Model");
              if (artifact.type === "doc") {
                setDocTitle(artifact.title || "Executive Document");
                if ((artifact as any).content) setDocContent((artifact as any).content);
              }
              if (artifact.type === "code" && (artifact as any).content) setCodeSnippet((artifact as any).content);
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background"
    >
      {/* ── Global Multimodal Drag & Drop Overlay ── */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md border-2 border-dashed border-emerald-500/60 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col items-center gap-3 shadow-2xl">
            <Paperclip className="w-8 h-8 animate-bounce" />
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">Drop files to attach to Shothik AI</div>
              <div className="text-xs text-muted-foreground">Images, PDFs, spreadsheets, or code files</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Shell */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* ── Top Workspace Bar: ChatGPT-Style Agent Switcher & Work Mode Toggle ── */}
        <div className="h-12 border-b border-border/60 bg-background/80 backdrop-blur-md px-2 sm:px-4 flex items-center justify-between shrink-0 z-20 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Agent Fleet Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-secondary/50 hover:bg-secondary text-xs sm:text-sm font-semibold text-foreground transition border border-border/40 hover:border-border cursor-pointer shadow-xs"
              >
                <div className={`w-5 h-5 rounded-md ${activeAgent.bgLight} ${activeAgent.color} flex items-center justify-center shrink-0`}>
                  <activeAgent.icon className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[85px] xs:max-w-[120px] sm:max-w-none truncate">{activeAgent.name}</span>
                <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded-md bg-background/60 text-muted-foreground border border-border/30 hidden md:inline-block">
                  {activeAgent.badge}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
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
              <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground/80 pl-2 border-l border-border/50 max-w-[200px] xl:max-w-[280px] truncate font-medium">
                <span className="truncate">{activeConversation.title || "Active Research Session"}</span>
              </div>
            )}

            {/* Offline-First Sync & Outbox Badge */}
            <OfflineSyncBadge />
          </div>

          {/* Right Zen Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 🔗 Public 1-Click Viral Share Button */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition cursor-pointer shadow-xs"
                title="Share public link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            {/* Live Edge Engine Indicator */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs cursor-default select-none animate-in fade-in duration-300"
              title="Shothik Neural Speculative Engine Active (Sub-15ms Edge Latency · Local Acceleration)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Shothik ⚡ Edge</span>
            </div>

            {/* Work Canvas Toggle Pill (only if messages > 0 or artifact is open) */}
            {(messages.length > 0 || artifactOpen) && (
              <button
                type="button"
                onClick={() => setArtifactOpen(!artifactOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border",
                  artifactOpen
                    ? "bg-brand/15 text-brand border-brand/40 shadow-xs"
                    : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/30"
                )}
                title="Toggle Work Canvas"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Canvas</span>
              </button>
            )}

            {/* New Thread (+) */}
            <button
              type="button"
              onClick={createNewConversation}
              className="p-1.5 sm:p-2 rounded-xl bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition border border-border/30 cursor-pointer"
              title="New Chat (Ctrl+Shift+O)"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* ⋯ Zen Overflow Menu (Export, Telemetry, Shortcuts) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={cn(
                  "p-1.5 sm:p-2 rounded-xl transition border cursor-pointer",
                  isMoreMenuOpen
                    ? "bg-secondary text-foreground border-border/60"
                    : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/30"
                )}
                title="More options & diagnostics"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 z-50 w-56 p-1.5 bg-popover/95 backdrop-blur-xl border border-border/70 rounded-2xl shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  {/* Export Options */}
                  {messages.length > 0 && (
                    <>
                      <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Export Session
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExportSession("md")}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer"
                      >
                        <FileTextIcon className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span className="font-medium">Markdown (.md)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSession("json")}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer"
                      >
                        <FileJson className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-medium">JSON (.json)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSession("print")}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer border-b border-border/40 pb-1.5 mb-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-medium">Print / Save PDF</span>
                      </button>
                    </>
                  )}

                  {/* Tools & Shortcuts */}
                  <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Tools & Shortcuts
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDshDrawerOpen(true)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="font-medium">Workflow Step Audit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsShortcutsOpen(true)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/70 text-xs text-foreground transition cursor-pointer"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">Keyboard Shortcuts (?)</span>
                  </button>
                  {webGpuInfo?.isSupported && (
                    <div className="px-2.5 py-1.5 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 border-t border-border/30 mt-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>Turbo Engine Active</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content: Conversation + Dedicated Work Canvas Studio + Split-Pane Workspace */}
        {artifactOpen && (messages.length === 0 || isMobile) ? (
          /* ── Full-Width Interactive Work Canvas Studio (Empty state or Mobile Canvas View) ── */
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
                  sheetTitle={sheetTitle}
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
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-3 shrink-0">
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
        ) : artifactOpen && messages.length > 0 && !isMobile ? (
          /* ── Split Conversation + Right Artifact Panel (Desktop Only) ── */
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
                    onAnalyzeIssues={handleAnalyzeIssues}
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
                  sheetTitle={sheetTitle}
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
          <div className="flex flex-1 flex-col items-center justify-center min-h-0 w-full overflow-y-auto px-3 sm:px-4 py-4 sm:py-8 custom-scrollbar animate-fade-in">
            <div className="w-full max-w-3xl space-y-4 sm:space-y-6 text-center">
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
                    onAnalyzeIssues={handleAnalyzeIssues}
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

        {/* 🎙️ Unified Voice Studio Modal (Neural Orb + 3D Avatar Presenter in One UI) */}
        <UnifiedVoiceStudioModal
          isOpen={isVoiceOrbOpen || voiceActive}
          onClose={() => {
            setIsVoiceOrbOpen(false);
            setVoiceActive(false);
          }}
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

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {[
                  { id: "doc", label: "Document Canvas", icon: "📄", desc: "Writing & Formats" },
                  { id: "slides", label: "Slides 16:9", icon: "🎴", desc: "Presentations" },
                  { id: "sheet", label: "Smart Spreadsheet", icon: "📊", desc: "Tables & Formulas" },
                  { id: "research", label: "Deep Research", icon: "🔍", desc: "Citations & Web" },
                  { id: "code", label: "Code Assistant", icon: "💻", desc: "Scripts & Python" },
                  { id: "boimela", label: "বই ও প্রকাশনা", icon: "📖", desc: "Publishing & Print" },
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

        {/* ── Modals & Overlays ── */}
        <ShareArtifactModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          title={activeConversation?.title || "Shothik Workspace"}
          artifactType={activeTab}
        />

        <DshExecutionDrawer
          open={isDshDrawerOpen}
          onClose={() => setIsDshDrawerOpen(false)}
          sessionId={conversationId}
          onForkCreated={(newId) => switchConversation(newId)}
        />

        <KeyboardShortcutsModal
          open={isShortcutsOpen}
          onOpenChange={setIsShortcutsOpen}
        />

        <PwaInstallBanner />
      </div>
    </div>
  );
}

export default ChatAgentPage;
