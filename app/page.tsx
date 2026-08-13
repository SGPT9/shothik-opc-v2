import React from "react";
import { HermesExecutionPanel } from "../components/hermes/HermesExecutionPanel";
import Link from "next/link";

export default function RootHomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#f8fafc",
        padding: "2.5rem 1.5rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header Banner */}
        <header
          style={{
            borderBottom: "1px solid rgba(51, 65, 85, 0.8)",
            paddingBottom: "1.5rem",
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#38bdf8",
              backgroundColor: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: "0.4rem",
                height: "0.4rem",
                borderRadius: "50%",
                backgroundColor: "#38bdf8",
              }}
            />
            Shothik Operating Platform
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#ffffff",
              margin: "0.2rem 0",
            }}
          >
            Hermes Gateway Control Center
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: 0, leading: 1.5 }}>
            Phase 1 Backend API Gateway, Session Context & Realtime SSE Event Stream Surface.
          </p>
        </header>

        {/* Main Panel Section */}
        <section style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <HermesExecutionPanel workspaceId="ws_dashboard_primary" domain="general" />
        </section>

        {/* Quick Surface Navigation Cards */}
        <section style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(51, 65, 85, 0.8)" }}>
          <h4
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748b",
              marginBottom: "1rem",
            }}
          >
            Available Application Surfaces
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            <Link
              href="/agent-cockpit"
              style={{
                padding: "1.25rem",
                borderRadius: "1rem",
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(51, 65, 85, 0.8)",
                textDecoration: "none",
                color: "#f8fafc",
                transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                display: "block",
              }}
            >
              <h5
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifySpace: "space-between",
                }}
              >
                Agent Control Cockpit
                <span style={{ fontSize: "1.1rem", color: "#64748b" }}>→</span>
              </h5>
              <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8", leading: 1.4 }}>
                MCP integrations, security capability gates, and token cost metrics.
              </p>
            </Link>

            <Link
              href="/twin"
              style={{
                padding: "1.25rem",
                borderRadius: "1rem",
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(51, 65, 85, 0.8)",
                textDecoration: "none",
                color: "#f8fafc",
                transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                display: "block",
              }}
            >
              <h5
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifySpace: "space-between",
                }}
              >
                AI Cofounder Twin Surface
                <span style={{ fontSize: "1.1rem", color: "#64748b" }}>→</span>
              </h5>
              <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8", leading: 1.4 }}>
                Company brief onboarding, writing DNA, and ScenarioLab stress-test engine.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
