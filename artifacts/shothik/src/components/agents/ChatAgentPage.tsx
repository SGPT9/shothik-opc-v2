/**
 * FAANG-Grade Refactored Chat Agent Page Orchestrator.
 *
 * Responsibilities deconstructed into clean modular hooks & discrete error boundaries:
 *  - `useChatSession`: Conversation history & message state management.
 *  - `useChatStreamEngine`: SSE token-level streaming & background buffer resilience.
 *  - `useAttachmentUploader`: File & document attachment handling.
 *  - `useTwinHandoffDetector`: Auto-detects startup intent -> renders TwinCtaCard.
 *  - `ComponentErrorBoundary`: Discrete React Error Boundaries for Transcript, Composer, and Canvas.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "@/lib/navigation";
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
import { TwinAutopilotBanner } from "@/components/tonight-engine/TwinAutopilotBanner";
import { TwinCtaCard } from "@/components/chat/TwinCtaCard";

export function ChatAgentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const [activeTab, setActiveTab] = useState<ArtifactTab>("preview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;

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
      {/* Sidebar Navigation */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onSelectConversation={(id) => switchConversation(id)}
      />

      {/* Main Workspace Column */}
      <div className="flex flex-1 flex-col min-w-0 h-full">
        {/* Top Header */}
        <ChatHeader currentPersona="general" executionMode="realtime" />

        {/* Overnight Banner */}
        <ComponentErrorBoundary title="Autopilot Banner Error">
          <TwinAutopilotBanner />
        </ComponentErrorBoundary>

        {/* Content Grid: Transcript + Artifact Canvas */}
        <div className="flex flex-1 min-h-0 w-full">
          {/* Transcript Panel */}
          <div className="flex flex-1 flex-col min-w-0 h-full border-r border-border/60">
            <ComponentErrorBoundary title="Transcript Panel Interrupted">
              <Transcript
                messages={messages as any}
                isStreaming={streamState.isStreaming}
                statusText={streamState.statusText}
              />

              {/* Automatic Twin Startup Handoff Card */}
              {hasStartupIntent && (
                <div className="p-3">
                  <TwinCtaCard
                    onSeedTwin={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = `/twin?fromChat=${conversationId}`;
                      }
                    }}
                  />
                </div>
              )}
            </ComponentErrorBoundary>

            {/* Composer Input */}
            <ComponentErrorBoundary title="Composer Input Interrupted">
              <Composer
                onSend={handleSendMessage}
                isStreaming={streamState.isStreaming}
                onStop={stopStream}
                onVoiceClick={() => setVoiceActive((prev) => !prev)}
              />
            </ComponentErrorBoundary>
          </div>

          {/* Artifact & Live Canvas Panel */}
          <div className="hidden lg:flex w-[480px] xl:w-[560px] flex-col h-full bg-muted/20">
            <ComponentErrorBoundary title="Artifact Canvas Error">
              <ArtifactPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </ComponentErrorBoundary>
          </div>
        </div>
      </div>

      {/* Voice Overlay */}
      {voiceActive && (
        <VoiceOverlay onClose={() => setVoiceActive(false)} />
      )}
    </div>
  );
}

export default ChatAgentPage;
