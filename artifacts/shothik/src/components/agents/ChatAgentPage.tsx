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

import { Composer } from "@/components/chat/Composer";
import { Transcript } from "@/components/chat/Transcript";
import { ArtifactPanel, type ArtifactTab } from "@/components/chat/ArtifactPanel";
import { EmptyChatGreeting } from "@/components/chat/EmptyChatGreeting";
import { TwinCtaCard } from "@/components/chat/TwinCtaCard";
import { VTuberVoiceAvatarOverlay } from "@/components/voice/VTuberVoiceAvatarOverlay";
import { ChatGPTVoiceOrbModal } from "@/components/voice/ChatGPTVoiceOrbModal";
import { SwarmAdversarialDebateModal } from "@/components/chat/SwarmAdversarialDebateModal";
import { MonetizationPaywallModal } from "@/components/pricing/MonetizationPaywallModal";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export function ChatAgentPage() {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversationId") || undefined;

  const {
    conversationId,
    messages,
    switchConversation,
    addMessage,
    updateLastAssistantMessage,
    finalizeLastAssistantMessage,
  } = useChatSession(initialConvId);

  const { streamState, startStream, stopStream } = useChatStreamEngine();
  const { attachments, addAttachment, removeAttachment, clearAttachments } = useAttachmentUploader();
  const { hasStartupIntent } = useTwinHandoffDetector(messages);

  // ── Contextual User Details / Artifact panel (hidden by default) ──
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ArtifactTab>("slides");

  // ── Artifact Context Handoff Data ──
  const [slidesTopic, setSlidesTopic] = useState<string | undefined>("AI-Powered E-Commerce & Retail in Bangladesh");
  const [researchQuery, setResearchQuery] = useState<string | undefined>("Dhaka Logistics & Courier Competitor Analysis");
  const [sheetData, setSheetData] = useState<string[][] | undefined>();
  const [codeSnippet, setCodeSnippet] = useState<string | undefined>();

  const [voiceActive, setVoiceActive] = useState(false);
  const [isVoiceOrbOpen, setIsVoiceOrbOpen] = useState(false);
  const [isSwarmDebateOpen, setIsSwarmDebateOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [persona, setPersona] = useState<ChatPersona>("cofounder");

  // Listen to global VTuber trigger event
  useEffect(() => {
    const handleToggle = () => setVoiceActive((prev) => !prev);
    window.addEventListener("shothik_toggle_vtuber", handleToggle);
    return () => window.removeEventListener("shothik_toggle_vtuber", handleToggle);
  }, []);

  const createNewConversation = useCallback(() => {
    const newId = `conv_${Date.now()}`;
    switchConversation(newId);
  }, [switchConversation]);

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
      if (typeof messageOrContent === "object" && messageOrContent.metadata?.sheetData) {
        setSheetData(messageOrContent.metadata.sheetData);
      }
    }
  }, []);

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

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Main Workspace Shell */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Content: Conversation + Optional Contextual User Details Panel */}
        {artifactOpen ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full overflow-hidden">
            {/* ── Left Conversation Column ── */}
            <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col min-w-0 h-full overflow-hidden">
              <ComponentErrorBoundary title="Transcript Panel Interrupted">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Transcript
                    messages={messages as any}
                    isStreaming={streamState.isStreaming}
                    statusText={streamState.statusText}
                    onOpenArtifact={(type) => handleOpenArtifact(type)}
                    onSelectPrompt={(prompt, mode, tab) => {
                      handleSendMessage(prompt);
                      if (tab) {
                        handleOpenArtifact(tab);
                      }
                    }}
                  />

                  {/* Twin Startup Handoff Card */}
                  {hasStartupIntent && (
                    <div className="px-4 pb-3 max-w-3xl mx-auto">
                      <TwinCtaCard
                        onSeedTwin={() => {
                          if (typeof window !== "undefined") {
                            window.location.href = `/twin?fromChat=${conversationId}`;
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </ComponentErrorBoundary>

              {/* Composer — pinned bottom */}
              <ComponentErrorBoundary title="Composer Input Interrupted">
                <Composer
                  onSend={handleSendMessage}
                  isStreaming={streamState.isStreaming}
                  onStop={stopStream}
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
            <ResizablePanel defaultSize={50} minSize={30} className="h-full overflow-hidden">
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
                />
              </ComponentErrorBoundary>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center min-h-0 w-full overflow-y-auto px-4 py-8 custom-scrollbar animate-fade-in">
            <div className="w-full max-w-3xl space-y-6 text-center">
              {/* ── Empty State Greeting & Intent Starter Prompts ── */}
              <EmptyChatGreeting
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
                    onSend={handleSendMessage}
                    isStreaming={streamState.isStreaming}
                    onStop={stopStream}
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
                    onSelectPrompt={(prompt, mode, tab) => {
                      handleSendMessage(prompt);
                      if (tab) {
                        handleOpenArtifact(tab);
                      }
                    }}
                  />

                  {/* Twin Startup Handoff Card */}
                  {hasStartupIntent && (
                    <div className="px-4 pb-3 max-w-3xl mx-auto">
                      <TwinCtaCard
                        onSeedTwin={() => {
                          if (typeof window !== "undefined") {
                            window.location.href = `/twin?fromChat=${conversationId}`;
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </ComponentErrorBoundary>

              {/* Composer — pinned bottom */}
              <ComponentErrorBoundary title="Composer Input Interrupted">
                <Composer
                  onSend={handleSendMessage}
                  isStreaming={streamState.isStreaming}
                  onStop={stopStream}
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
        />

        {/* 💳 Monetization & bKash/Nagad Paywall Portal Modal */}
        <MonetizationPaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
        />
      </div>
    </div>
  );
}

export default ChatAgentPage;
