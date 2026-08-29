"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  SecondMeCognitiveMemory,
  WorkingMemoryState,
  EpisodicMemoryEntry,
  PersonaCalibration,
} from "./second-me-cognitive-memory";
import {
  memoryExtractionService,
  ExtractedMemory,
  MemorySource,
} from "./MemoryExtractionService";

export interface UseSecondMeCognitiveStateOptions {
  sessionId?: string;
  initialPersona?: Partial<PersonaCalibration>;
}

export function useSecondMeCognitiveState(options?: UseSecondMeCognitiveStateOptions) {
  const memory = useMemo(
    () => new SecondMeCognitiveMemory(options?.sessionId),
    [options?.sessionId]
  );

  const [workingState, setWorkingState] = useState<WorkingMemoryState>(() =>
    memory.getWorkingMemory()
  );
  const [persona, setPersona] = useState<PersonaCalibration>(() => {
    if (options?.initialPersona) {
      memory.calibratePersona(options.initialPersona);
    }
    return memory.getPersona();
  });

  // Synchronize stored memories into cognitive memory instance on mount & event
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const stored = localStorage.getItem("shothik_twin_memories");
        if (stored) {
          const items = JSON.parse(stored);
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              memory.recordEpisodicDecision({
                userId: "current-user",
                category: item.category || "user_preference",
                summary: item.title || "",
                details: item.detail || "",
                confidence: item.confidence || 0.9,
                tags: item.tags || [],
              });
            });
          }
        }
      } catch {}
    };

    syncFromStorage();

    const handleMemoryExtracted = () => {
      syncFromStorage();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("shothik_memory_extracted", handleMemoryExtracted);
      return () => {
        window.removeEventListener("shothik_memory_extracted", handleMemoryExtracted);
      };
    }
  }, [memory]);

  const updateDraft = useCallback(
    (text: string, tab?: WorkingMemoryState["activeArtifactTab"]) => {
      memory.updateWorkingDraft(text, tab);
      setWorkingState(memory.getWorkingMemory());
    },
    [memory]
  );

  const addChip = useCallback(
    (id: string, label: string) => {
      memory.addContextChip(id, label);
      setWorkingState(memory.getWorkingMemory());
    },
    [memory]
  );

  const removeChip = useCallback(
    (id: string) => {
      memory.removeContextChip(id);
      setWorkingState(memory.getWorkingMemory());
    },
    [memory]
  );

  const recordDecision = useCallback(
    (entry: {
      userId: string;
      category: EpisodicMemoryEntry["category"];
      summary: string;
      details: string;
      tags?: string[];
    }) => {
      return memory.recordEpisodicDecision({
        ...entry,
        confidence: 0.95,
        tags: entry.tags || [],
      });
    },
    [memory]
  );

  const autoExtractAndCommit = useCallback(
    (params: {
      prompt?: string;
      response: string;
      source: MemorySource;
      context?: Record<string, any>;
    }): ExtractedMemory[] => {
      return memoryExtractionService.extractAndCommit(params);
    },
    []
  );

  const recallContext = useCallback(
    (query: string) => {
      return memory.generateCognitiveContextPrompt(query);
    },
    [memory]
  );

  const updatePersona = useCallback(
    (calibration: Partial<PersonaCalibration>) => {
      memory.calibratePersona(calibration);
      setPersona(memory.getPersona());
    },
    [memory]
  );

  return {
    workingState,
    persona,
    updateDraft,
    addChip,
    removeChip,
    recordDecision,
    autoExtractAndCommit,
    recallContext,
    updatePersona,
    memoryInstance: memory,
  };
}

