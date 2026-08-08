import { useState, useCallback } from "react";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { useDeerFlowStream } from "@/hooks/useDeerFlowStream";

export function useBookAgentConsole() {
  const [customPrompt, setCustomPrompt] = useState("");
  const { isListening, transcript, startListening, stopListening } = useVoiceDictation();

  const {
    events,
    status,
    progress,
    activeSubAgent,
    logs,
    startStream,
    stopStream,
  } = useDeerFlowStream();

  const handleRunAgent = useCallback(
    (prompt: string, type: string = "general") => {
      startStream({ prompt, type });
    },
    [startStream]
  );

  return {
    customPrompt,
    setCustomPrompt,
    isListening,
    transcript,
    events,
    status,
    progress,
    activeSubAgent,
    logs,
    startListening,
    stopListening,
    startStream: handleRunAgent,
    stopStream,
  };
}
