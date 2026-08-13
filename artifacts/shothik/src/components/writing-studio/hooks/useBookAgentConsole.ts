import { useState, useCallback } from "react";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { useDeerFlowStream } from "@/hooks/useDeerFlowStream";

export function useBookAgentConsole() {
  const [customPrompt, setCustomPrompt] = useState("");
  const { isListening, transcript, startListening, stopListening } = useVoiceDictation();

  const stream = useDeerFlowStream();

  const handleRunAgent = useCallback(
    (prompt: string, type: string = "general") => {
      stream.startStream(prompt, type as any);
    },
    [stream]
  );

  return {
    customPrompt,
    setCustomPrompt,
    isListening,
    transcript,
    startListening,
    stopListening,
    events: (stream as any).events || [],
    status: (stream as any).status || "idle",
    progress: (stream as any).progress || 0,
    activeSubAgent: (stream as any).activeSubAgent || null,
    logs: stream.logs || [],
    handleRunAgent,
    stopStream: stream.stopStream,
  };
}
