import React, { useState } from "react";
import {
  PlugZap,
  Server,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  serverName: string;
}

export interface McpServerInfo {
  name: string;
  displayName: string;
  type: "sse" | "stdio" | "http";
  status: "connected" | "connecting" | "error" | "disconnected";
  endpoint?: string;
  latencyMs?: number;
  toolCount: number;
  tools: McpToolDefinition[];
}

export const DEFAULT_MCP_SERVERS: McpServerInfo[] = [
  {
    name: "deerflow-gateway",
    displayName: "DeerFlow Agent Orchestrator",
    type: "sse",
    status: "connected",
    endpoint: "http://127.0.0.1:8000/sse",
    latencyMs: 18,
    toolCount: 4,
    tools: [
      {
        name: "web_search",
        description: "Searches DuckDuckGo and Tavily for real-time Dhaka news, regulations, and prices.",
        parameters: { query: { type: "string", required: true } },
        serverName: "deerflow-gateway",
      },
      {
        name: "python_interpreter",
        description: "Executes authenticated Python code in an isolated Docker/Wasm container.",
        parameters: { code: { type: "string", required: true } },
        serverName: "deerflow-gateway",
      },
      {
        name: "sql_knowledge_vault",
        description: "Executes read-only pgvector embedding queries against company domain knowledge.",
        parameters: { sql: { type: "string", required: true } },
        serverName: "deerflow-gateway",
      },
      {
        name: "rag_repo_indexer",
        description: "Extracts AST structures, signatures, and imports across repositories.",
        parameters: { repo_path: { type: "string", required: true } },
        serverName: "deerflow-gateway",
      },
    ],
  },
  {
    name: "bangla-voice-ai",
    displayName: "Bangla Voice AI Subsystem",
    type: "http",
    status: "connected",
    endpoint: "http://127.0.0.1:8001/v1",
    latencyMs: 14,
    toolCount: 3,
    tools: [
      {
        name: "bangla_tts_synthesize",
        description: "Generates high-fidelity natural Bengali speech with prosody control.",
        parameters: { text: { type: "string" }, voice: { type: "string" } },
        serverName: "bangla-voice-ai",
      },
      {
        name: "whisper_asr_transcribe",
        description: "Zero-shot acoustic transcription with regional dialect normalization.",
        parameters: { audio_url: { type: "string" } },
        serverName: "bangla-voice-ai",
      },
      {
        name: "prosody_contour_extract",
        description: "Analyzes pitch inflection and emotion contours in audio waveforms.",
        parameters: { audio_bytes: { type: "string" } },
        serverName: "bangla-voice-ai",
      },
    ],
  },
  {
    name: "shothik-nlp-toolkit",
    displayName: "Shothik Bengali NLP & Grammar",
    type: "stdio",
    status: "connected",
    latencyMs: 6,
    toolCount: 3,
    tools: [
      {
        name: "diacritic_normalizer",
        description: "Sanitizes zero-width non-joiners (ZWNJ) and Unicode Bengali graphemes.",
        parameters: { text: { type: "string" } },
        serverName: "shothik-nlp-toolkit",
      },
      {
        name: "grammar_proofreader",
        description: "Verifies Bangla Academy grammatical rules, sadhu vs cholito diction.",
        parameters: { sentence: { type: "string" } },
        serverName: "shothik-nlp-toolkit",
      },
      {
        name: "dialect_transliterate",
        description: "Maps Chatgaya, Sylheti, or Noakhailla dialect speech into standard Bangla.",
        parameters: { dialect_text: { type: "string" } },
        serverName: "shothik-nlp-toolkit",
      },
    ],
  },
  {
    name: "mfs-logistics-bridge",
    displayName: "MFS & Courier Logistics Gateway",
    type: "http",
    status: "connected",
    endpoint: "http://127.0.0.1:8080/api/v1/logistics",
    latencyMs: 24,
    toolCount: 3,
    tools: [
      {
        name: "bkash_escrow_hold",
        description: "Creates temporary escrow holds with cryptographic signature verification.",
        parameters: { amount: { type: "number" }, invoice_id: { type: "string" } },
        serverName: "mfs-logistics-bridge",
      },
      {
        name: "redx_shipment_book",
        description: "Dispatches automated courier pickup requests to RedX Dhaka hubs.",
        parameters: { recipient_phone: { type: "string" }, address: { type: "string" } },
        serverName: "mfs-logistics-bridge",
      },
      {
        name: "pathao_rider_dispatch",
        description: "Books instant on-demand parcel riders in Dhaka, Chittagong, and Sylhet.",
        parameters: { pickup: { type: "string" }, dropoff: { type: "string" } },
        serverName: "mfs-logistics-bridge",
      },
    ],
  },
];

export interface McpInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  servers?: McpServerInfo[];
}

export function McpInspectorDrawer({
  isOpen,
  onClose,
  servers = DEFAULT_MCP_SERVERS,
}: McpInspectorDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({
    "deerflow-gateway": true,
    "bangla-voice-ai": true,
  });
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition | null>(null);

  if (!isOpen) return null;

  const toggleServer = (serverName: string) => {
    setExpandedServers((prev) => ({
      ...prev,
      [serverName]: !prev[serverName],
    }));
  };

  const filteredServers = servers.map((server) => {
    if (!searchQuery.trim()) return server;
    const query = searchQuery.toLowerCase();
    const matchesServer =
      server.displayName.toLowerCase().includes(query) ||
      server.name.toLowerCase().includes(query);
    const matchingTools = server.tools.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
    return {
      ...server,
      tools: matchesServer ? server.tools : matchingTools,
      toolCount: matchesServer ? server.toolCount : matchingTools.length,
    };
  }).filter((s) => s.tools.length > 0 || s.displayName.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalTools = servers.reduce((acc, s) => acc + s.tools.length, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcp-drawer-title"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-950/95 dark:bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col transition-all duration-300 select-none animate-in slide-in-from-right-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <PlugZap className="w-4 h-4" />
          </div>
          <div>
            <h3 id="mcp-drawer-title" className="text-sm font-semibold text-white">
              MCP Servers & Tool Inspector
            </h3>
            <p className="text-[11px] text-zinc-400">
              {servers.length} active servers • {totalTools} executable MCP tools
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close MCP Inspector"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3.5 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus-within:border-cyan-500/50 transition">
          <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MCP servers, tools, and actions..."
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-zinc-500 hover:text-zinc-300 text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar text-xs">
        {filteredServers.map((server) => {
          const isExpanded = expandedServers[server.name] ?? false;
          return (
            <div
              key={server.name}
              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition"
            >
              {/* Server Header Row */}
              <button
                type="button"
                onClick={() => toggleServer(server.name)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-zinc-100 text-xs">
                      <span>{server.displayName}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 border border-white/5">
                        {server.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                      <span>{server.name}</span>
                      {server.latencyMs && (
                        <span>• {server.latencyMs}ms ping</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">
                    {server.tools.length} tools
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Tools List */}
              {isExpanded && (
                <div className="p-3 border-t border-white/5 bg-black/30 space-y-2">
                  {server.tools.map((tool) => (
                    <div
                      key={tool.name}
                      onClick={() => setSelectedTool(selectedTool?.name === tool.name ? null : tool)}
                      className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                        selectedTool?.name === tool.name
                          ? "bg-cyan-500/10 border-cyan-500/40"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-cyan-300 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{tool.name}</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 font-sans font-normal">
                          {selectedTool?.name === tool.name ? "Hide Schema" : "View Schema"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                        {tool.description}
                      </p>
                      {selectedTool?.name === tool.name && (
                        <div className="mt-2.5 p-2 rounded bg-black/60 border border-white/10 font-mono text-[10px] text-zinc-300 overflow-x-auto">
                          <pre>{JSON.stringify(tool.parameters, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MCP Guardrails Enforced</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-sans font-medium text-xs cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
