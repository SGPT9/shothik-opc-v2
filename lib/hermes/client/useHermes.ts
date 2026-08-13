"use client";

import { useState, useCallback, useEffect } from "react";
import { HermesSession, HermesRun, HermesEventEnvelope } from "../contracts/core";
import { HermesClientAdapter, defaultHermesAdapter } from "./adapter";

export interface UseHermesSessionOptions {
  workspaceId: string;
  autoCreate?: boolean;
  adapter?: HermesClientAdapter;
}

export function useHermesSession(options: UseHermesSessionOptions) {
  const { workspaceId, autoCreate = false, adapter = defaultHermesAdapter } = options;

  const [session, setSession] = useState<HermesSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(
    async (title?: string, description?: string) => {
      setLoading(true);
      setError(null);
      try {
        const newSession = await adapter.createSession({ workspaceId, title, description });
        setSession(newSession);
        return newSession;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        setError(errMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, adapter]
  );

  const fetchSession = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      setError(null);
      try {
        const s = await adapter.getSession(sessionId);
        setSession(s);
        return s;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        setError(errMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [adapter]
  );

  useEffect(() => {
    if (autoCreate && !session && !loading) {
      createSession().catch(() => null);
    }
  }, [autoCreate, session, loading, createSession]);

  return {
    session,
    loading,
    error,
    createSession,
    fetchSession,
  };
}

export interface UseHermesRunOptions {
  adapter?: HermesClientAdapter;
}

export function useHermesRun(options: UseHermesRunOptions = {}) {
  const { adapter = defaultHermesAdapter } = options;

  const [run, setRun] = useState<HermesRun | null>(null);
  const [events, setEvents] = useState<HermesEventEnvelope[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startRun = useCallback(
    async (
      sessionId: string,
      workspaceId: string,
      domain?: string,
      config?: Record<string, unknown>
    ) => {
      setError(null);
      setEvents([]);
      try {
        const { run: createdRun } = await adapter.createRun({
          sessionId,
          workspaceId,
          domain,
          config,
        });

        setRun(createdRun);
        setIsStreaming(true);

        const unsubscribe = adapter.subscribeToRunStream(
          createdRun.id,
          (envelope) => {
            setEvents((prev) => [...prev, envelope]);
            if (
              envelope.eventType === "run_completed" ||
              envelope.eventType === "run_failed" ||
              envelope.eventType === "run_cancelled"
            ) {
              setIsStreaming(false);
            }
          },
          () => {
            setIsStreaming(false);
          }
        );

        return { run: createdRun, unsubscribe };
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        setError(errMsg);
        setIsStreaming(false);
        throw err;
      }
    },
    [adapter]
  );

  const controlRun = useCallback(
    async (action: "pause" | "resume" | "cancel", reason?: string) => {
      if (!run) return;
      try {
        const { run: updatedRun } = await adapter.controlRun(run.id, action, reason);
        setRun(updatedRun);
        if (action === "cancel") {
          setIsStreaming(false);
        }
      } catch (err: any) {
        setError(err?.message || String(err));
      }
    },
    [run, adapter]
  );

  return {
    run,
    events,
    isStreaming,
    error,
    startRun,
    controlRun,
  };
}
