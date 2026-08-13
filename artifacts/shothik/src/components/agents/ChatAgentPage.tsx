/**
 * Chat Agent Page — Replit-style layout.
 *
 * Artifact panel is HIDDEN by default. Full-width chat.
 * Panel slides in on-demand when user triggers slides/sheet/research/code.
 * Sidebar collapsed by default (hamburger toggle).
 */
import { useState, useCallback } from "react";
import { useSearchParams } from "@/lib/navigation";
import { useChatSession } from "./hooks/useChatSession";
import { useChatStreamEngine } from "./hooks/useChatStreamEngine";
import { useAttachmentUploader } from "./hooks/useAttachmentUploader";
import { useTwinHandoffDetector } from "./hooks/useTwinHandoffDetector";
import { ChatHeader } from "./components/ChatHeader";
import { ComponentErrorBoundary } from "./components/ChatErrorBoundaries";

import { Composer } from "@/components/chat/Composer";
import { Transcript } from "@/components/chat/Transcript";
import { ArtifactPanel, type ArtifactTab } from "@/components/chat/ArtifactPanel";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { VoiceOverlay } from "@/components/voice/VoiceOverlay";
import { TwinCtaCard } from "@/components/chat/TwinCtaCard";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

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

  // ── Artifact panel: Replit Agent On-Demand (hidden by default) ──
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ArtifactTab>("slides");

  // ── Artifact Context Handoff Data ──
  const [slidesTopic, setSlidesTopic] = useState<string | undefined>("AI-Powered E-Commerce & Retail in Bangladesh");
  const [researchQuery, setResearchQuery] = useState<string | undefined>("Dhaka Logistics & Courier Competitor Analysis");
  const [sheetData, setSheetData] = useState<string[][] | undefined>();
  const [codeSnippet, setCodeSnippet] = useState<string | undefined>();

  // ── Sidebar: collapsed by default (hamburger) ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [voiceActive, setVoiceActive] = useState(false);

  // Open artifact panel on-demand
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

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;

      const lower = text.toLowerCase();
      if (lower.includes("slide") || lower.includes("deck") || lower.includes("presentation")) {
        setActiveTab("slides");
        setSlidesTopic(text);
        setArtifactOpen(true);
      } else if (lower.includes("sheet") || lower.includes("model") || lower.includes("mrr") || lower.includes("excel")) {
        setActiveTab("sheet");
        setArtifactOpen(true);
      } else if (lower.includes("research") || lower.includes("competitor") || lower.includes("market")) {
        setActiveTab("research");
        setResearchQuery(text);
        setArtifactOpen(true);
      } else if (lower.includes("code") || lower.includes("script") || lower.includes("python") || lower.includes("react")) {
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

      await startStream(
        "/api/chat/stream",
        { conversationId, message: text.trim() },
        (chunk) => updateLastAssistantMessage(chunk),
        () => finalizeLastAssistantMessage(),
        (err) => {
          updateLastAssistantMessage(`\n\n*[Stream Error: ${err.message}]*`);
          finalizeLastAssistantMessage();
        }
      );
    },
    [addMessage, attachments, clearAttachments, conversationId, finalizeLastAssistantMessage, startStream, updateLastAssistantMessage]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar — collapsed by default, overlay on mobile */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onNewChat={() => createNewConversation()}
        onAbortStream={stopStream}
        onSelectConversation={(id) => {
          switchConversation(id);
          setSidebarOpen(false); // auto-close on mobile
        }}
      />

      {/* Main Workspace Column */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header — includes hamburger for sidebar */}
        <ChatHeader
          currentPersona="general"
          executionMode="realtime"
          activeTab={artifactOpen ? activeTab : null}
          onTabChange={(tab) => handleOpenArtifact(tab)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />

        {/* Content: Chat + Artifact (Draggable Splitter Handle when artifact is open) */}
        {artifactOpen ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full overflow-hidden">
            {/* ── Left Chat Panel ── */}
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
                />
              </ComponentErrorBoundary>
            </ResizablePanel>

            {/* ── Draggable Splitter Handle (Replit Pattern) ── */}
            <ResizableHandle className="w-1.5 bg-border/40 hover:bg-brand/50 transition cursor-col-resize z-30" />

            {/* ── Right Canvas Panel ── */}
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
        ) : (
          <div className="flex flex-1 min-h-0 w-full overflow-hidden">
            {/* Full-width Chat Column */}
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
                />
              </ComponentErrorBoundary>
            </div>
          </div>
        )}
      </div>

      {/* Voice Overlay */}
      {voiceActive && (
        <VoiceOverlay isOpen={voiceActive} onClose={() => setVoiceActive(false)} />
      )}
    </div>
  );
}

export default ChatAgentPage;
