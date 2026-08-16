"use client";

import { useState, useCallback, useMemo } from "react";
import {
  SecondMeCognitiveMemory,
  WorkingMemoryState,
  EpisodicMemoryEntry,
  PersonaCalibration,
} from "./second-me-cognitive-memory";

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
    recallContext,
    updatePersona,
    memoryInstance: memory,
  };
}
