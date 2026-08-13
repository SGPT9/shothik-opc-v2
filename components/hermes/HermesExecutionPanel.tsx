"use client";

import React, { useState, useRef, useEffect } from "react";
import { useHermesSession, useHermesRun } from "../../lib/hermes/client/useHermes";

export interface HermesExecutionPanelProps {
  workspaceId: string;
  domain?: string;
}

export function HermesExecutionPanel({
  workspaceId,
  domain = "general",
}: HermesExecutionPanelProps) {
  const { session, loading: sessionLoading, error: sessionError } = useHermesSession({
    workspaceId,
    autoCreate: true,
  });

  const { run, events, isStreaming, error: runError, startRun, controlRun } = useHermesRun();

  const [customDomain, setCustomDomain] = useState<string>(domain);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log feed to bottom on new event
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  const handleStartRun = async () => {
    if (!session) return;
    try {
      await startRun(session.id, workspaceId, customDomain);
    } catch (err) {
      console.error("Failed to start run:", err);
    }
  };

  const handleControlAction = async (action: "pause" | "resume" | "cancel") => {
    try {
      await controlRun(action, `User requested ${action} from UI shell`);
    } catch (err) {
      console.error(`Failed to apply control action ${action}:`, err);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "680px",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(51, 65, 85, 0.8)",
        borderRadius: "1rem",
        padding: "1.5rem",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(16px)",
        transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "1rem",
          marginBottom: "1rem",
          borderBottom: "1px solid rgba(51, 65, 85, 0.7)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                padding: "0.15rem 0.5rem",
                borderRadius: "0.25rem",
              }}
            >
              Phase 1 Realtime Gateway
            </span>
          </div>
          <h3 style={{ margin: "0.3rem 0 0 0", fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>
            Hermes Session & Run Gateway
          </h3>
        </div>

        {/* Session Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            border: session ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)",
            backgroundColor: session ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
            color: session ? "#34d399" : "#fb7185",
          }}
        >
          <span
            style={{
              width: "0.4rem",
              height: "0.4rem",
              borderRadius: "50%",
              backgroundColor: session ? "#34d399" : "#fb7185",
            }}
          />
          {sessionLoading ? "Initializing..." : session ? `Active (${session.id.slice(0, 14)}...)` : "Disconnected"}
        </div>
      </div>

      {sessionError && (
        <div
          style={{
            padding: "0.75rem",
            borderRadius: "0.5rem",
            backgroundColor: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            color: "#fb7185",
            fontSize: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          Session Error: {sessionError}
        </div>
      )}

      {/* Session Metadata */}
      {session && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "1rem",
            fontSize: "0.8rem",
            color: "#94a3b8",
            marginBottom: "1rem",
            backgroundColor: "rgba(2, 6, 23, 0.6)",
            border: "1px solid rgba(51, 65, 85, 0.5)",
            borderRadius: "0.5rem",
            padding: "0.5rem 0.85rem",
          }}
        >
          <div>
            <span style={{ color: "#64748b" }}>Workspace:</span>{" "}
            <span style={{ color: "#f1f5f9", fontFamily: "monospace", fontWeight: 600 }}>{session.workspaceId}</span>
          </div>
          <div style={{ width: "1px", height: "0.85rem", backgroundColor: "rgba(51, 65, 85, 0.8)" }} />
          <div>
            <span style={{ color: "#64748b" }}>Session Title:</span>{" "}
            <span style={{ color: "#f1f5f9", fontStyle: "italic" }}>{session.title}</span>
          </div>
        </div>
      )}

      {/* Run Config Input & Action Button */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          placeholder="Domain (general, chat, slides...)"
          style={{
            flex: 1,
            backgroundColor: "rgba(2, 6, 23, 0.8)",
            border: "1px solid rgba(51, 65, 85, 0.8)",
            borderRadius: "0.5rem",
            padding: "0.5rem 0.85rem",
            fontSize: "0.85rem",
            color: "#f8fafc",
            outline: "none",
          }}
        />
        <button
          onClick={handleStartRun}
          disabled={!session || isStreaming}
          style={{
            padding: "0.5rem 1.1rem",
            borderRadius: "0.5rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            border: isStreaming ? "1px solid rgba(51, 65, 85, 0.6)" : "1px solid rgba(56, 189, 248, 0.4)",
            backgroundColor: isStreaming ? "#1e293b" : "#38bdf8",
            color: isStreaming ? "#64748b" : "#020617",
            cursor: isStreaming ? "not-allowed" : "pointer",
            transition: "all 150ms cubic-bezier(0.23, 1, 0.32, 1)",
            boxShadow: isStreaming ? "none" : "0 4px 14px 0 rgba(56, 189, 248, 0.25)",
          }}
        >
          {isStreaming ? "Streaming Run..." : "Start Hermes Run"}
        </button>
      </div>

      {runError && (
        <div
          style={{
            padding: "0.75rem",
            borderRadius: "0.5rem",
            backgroundColor: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            color: "#fb7185",
            fontSize: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          Run Error: {runError}
        </div>
      )}

      {/* Active Run Status & SSE Stream Viewer */}
      {run && (
        <div style={{ paddingTop: "1rem", borderTop: "1px solid rgba(51, 65, 85, 0.7)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>Active Run:</span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.78rem",
                  color: "#38bdf8",
                  backgroundColor: "rgba(56, 189, 248, 0.12)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "0.25rem",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                }}
              >
                {run.id}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  backgroundColor: "#1e293b",
                  color: "#cbd5e1",
                }}
              >
                {run.status}
              </span>
            </div>

            {/* Control Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <button
                onClick={() => handleControlAction("pause")}
                disabled={!isStreaming || run.status === "paused"}
                style={{
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "0.375rem",
                  backgroundColor: "#1e293b",
                  color: "#cbd5e1",
                  border: "1px solid rgba(51, 65, 85, 0.8)",
                  cursor: !isStreaming || run.status === "paused" ? "not-allowed" : "pointer",
                  opacity: !isStreaming || run.status === "paused" ? 0.4 : 1,
                }}
              >
                Pause
              </button>
              <button
                onClick={() => handleControlAction("resume")}
                disabled={run.status !== "paused"}
                style={{
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "0.375rem",
                  backgroundColor: "#1e293b",
                  color: "#cbd5e1",
                  border: "1px solid rgba(51, 65, 85, 0.8)",
                  cursor: run.status !== "paused" ? "not-allowed" : "pointer",
                  opacity: run.status !== "paused" ? 0.4 : 1,
                }}
              >
                Resume
              </button>
              <button
                onClick={() => handleControlAction("cancel")}
                disabled={!isStreaming && run.status !== "paused"}
                style={{
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "0.375rem",
                  backgroundColor: "rgba(244, 63, 94, 0.15)",
                  color: "#fb7185",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  cursor: !isStreaming && run.status !== "paused" ? "not-allowed" : "pointer",
                  opacity: !isStreaming && run.status !== "paused" ? 0.4 : 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600, color: "#cbd5e1" }}>Realtime SSE Event Stream Log</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.12)",
                padding: "0.1rem 0.4rem",
                borderRadius: "0.25rem",
              }}
            >
              {events.length} events received
            </span>
          </div>

          {/* Event Stream Terminal Feed */}
          <div
            ref={logContainerRef}
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              backgroundColor: "rgba(2, 6, 23, 0.95)",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.75rem",
              fontFamily: "monospace",
              lineHeight: 1.6,
            }}
          >
            {events.length === 0 ? (
              <div style={{ color: "#475569", fontStyle: "italic", textAlign: "center", padding: "0.5rem 0" }}>
                Waiting for SSE events...
              </div>
            ) : (
              events.map((evt, idx) => (
                <div
                  key={evt.eventId || idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "0.25rem 0",
                    borderBottom: "1px solid rgba(30, 41, 59, 0.6)",
                  }}
                >
                  <span
                    style={{
                      padding: "0.1rem 0.4rem",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      borderRadius: "0.2rem",
                      textTransform: "uppercase",
                      backgroundColor:
                        evt.eventType === "run_started"
                          ? "rgba(99, 102, 241, 0.2)"
                          : evt.eventType === "run_completed"
                          ? "rgba(16, 185, 129, 0.2)"
                          : evt.eventType === "progress_update"
                          ? "rgba(56, 189, 248, 0.2)"
                          : "rgba(51, 65, 85, 0.5)",
                      color:
                        evt.eventType === "run_started"
                          ? "#818cf8"
                          : evt.eventType === "run_completed"
                          ? "#34d399"
                          : evt.eventType === "progress_update"
                          ? "#38bdf8"
                          : "#cbd5e1",
                      border:
                        evt.eventType === "run_started"
                          ? "1px solid rgba(99, 102, 241, 0.3)"
                          : evt.eventType === "run_completed"
                          ? "1px solid rgba(16, 185, 129, 0.3)"
                          : evt.eventType === "progress_update"
                          ? "1px solid rgba(56, 189, 248, 0.3)"
                          : "1px solid rgba(51, 65, 85, 0.5)",
                    }}
                  >
                    {evt.eventType}
                  </span>
                  <span style={{ color: "#64748b" }}>seq:{evt.sequence}</span>
                  <span style={{ color: "#e2e8f0", wordBreak: "break-all" }}>{JSON.stringify(evt.payload)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
