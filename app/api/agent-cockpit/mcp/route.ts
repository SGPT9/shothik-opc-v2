import { NextResponse } from "next/server";

export interface MCPServerConfig {
  id: string;
  name: string;
  category: "Hosting" | "Science" | "Database" | "DevTools" | "Integrations";
  description: string;
  status: "active" | "inactive" | "error";
  toolsCount: number;
  lastPingMs: number;
}

const mockMCPServers: MCPServerConfig[] = [
  {
    id: "hostinger-hosting",
    name: "Hostinger Hosting",
    category: "Hosting",
    description: "Manage deployments, WordPress, domains, databases, and SSL certificates.",
    status: "active",
    toolsCount: 48,
    lastPingMs: 42,
  },
  {
    id: "hostinger-vps",
    name: "Hostinger VPS & Containers",
    category: "Hosting",
    description: "Orchestrate VPS instances, Docker project containers, and firewalls.",
    status: "active",
    toolsCount: 52,
    lastPingMs: 68,
  },
  {
    id: "chrome-devtools",
    name: "Chrome DevTools MCP",
    category: "DevTools",
    description: "Automate browser interactions, inspect DOM, network, and performance.",
    status: "active",
    toolsCount: 18,
    lastPingMs: 15,
  },
  {
    id: "science-genomics",
    name: "Science & Genomics DBs",
    category: "Science",
    description: "Query PubMed, UniProt, ChEMBL, AlphaFold, and ClinVar biomedical databases.",
    status: "active",
    toolsCount: 34,
    lastPingMs: 110,
  },
  {
    id: "insforge-baas",
    name: "InsForge BaaS Platform",
    category: "Database",
    description: "Postgres database CRUD, auth, realtime channels, storage, and payment hooks.",
    status: "active",
    toolsCount: 26,
    lastPingMs: 25,
  },
];

let serverState = [...mockMCPServers];

export async function GET() {
  return NextResponse.json({
    success: true,
    servers: serverState,
    totalServers: serverState.length,
    activeServers: serverState.filter((s) => s.status === "active").length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !["enable", "disable", "ping"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    serverState = serverState.map((server) => {
      if (server.id === id) {
        if (action === "enable") return { ...server, status: "active" as const };
        if (action === "disable") return { ...server, status: "inactive" as const };
        if (action === "ping") return { ...server, lastPingMs: Math.floor(Math.random() * 80) + 15 };
      }
      return server;
    });

    const updated = serverState.find((s) => s.id === id);

    return NextResponse.json({
      success: true,
      server: updated,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
