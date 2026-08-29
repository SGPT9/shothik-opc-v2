import fs from "fs";

const backendAudit = JSON.parse(fs.readFileSync("c:/Users/USER/hermes/shothik-web-mirror-v2/.data/route_audit.json", "utf8"));
const clientAudit = JSON.parse(fs.readFileSync("c:/Users/USER/hermes/shothik-web-mirror-v2/.data/client_route_audit.json", "utf8"));

// Domain Categorization for Backend
const domainMap: Record<string, string[]> = {
  "AI Inference & LLM Mesh": ["inference.ts", "ollama.ts", "mesh.ts", "chat-local.ts", "vision.ts", "voice.ts"],
  "Autonomous Multi-Agent & DSH": ["dsh.ts", "swarm.ts", "agent-traces.ts", "loop-engineering.ts", "nightshift.ts", "approvals.ts"],
  "Financial, MFS & Subscriptions": ["mfs.ts", "subscriptions.ts"],
  "Logistics & Couriers": ["logistics.ts"],
  "Workspace, Projects & Documents": ["projects.ts", "files.ts", "crdt.ts", "publishing.ts", "rag.ts"],
  "Connectors & Integrations": ["connectors.ts", "whatsapp.ts", "mcp.ts", "scraper.ts"],
  "Writing Suite & NLP Engines": ["writing-tools.ts", "ai-tools-extended.ts"],
  "Platform, Auth & Infrastructure": ["auth.ts", "health.ts", "healthz.ts", "telemetry.ts", "jobs.ts", "sandbox.ts", "proxy.ts", "memory.ts", "twin-seed.ts"]
};

const domainStats: Record<string, { totalRoutes: number; files: Set<string>; methods: Record<string, number>; hasAuth: number; hasIdempotency: number; hasStreaming: number }> = {};

for (const [domain, files] of Object.entries(domainMap)) {
  domainStats[domain] = {
    totalRoutes: 0,
    files: new Set(files),
    methods: { GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0 },
    hasAuth: 0,
    hasIdempotency: 0,
    hasStreaming: 0
  };
}

for (const r of backendAudit) {
  let matchedDomain = "Platform, Auth & Infrastructure";
  for (const [domain, files] of Object.entries(domainMap)) {
    if (files.includes(r.file)) {
      matchedDomain = domain;
      break;
    }
  }

  const stat = domainStats[matchedDomain];
  stat.totalRoutes++;
  stat.methods[r.method] = (stat.methods[r.method] || 0) + 1;
  if (r.hasAuth) stat.hasAuth++;
  if (r.hasIdempotency) stat.hasIdempotency++;
  if (r.hasStreaming) stat.hasStreaming++;
}

console.log("Domain Stats:", JSON.stringify(domainStats, null, 2));

// Summary statistics
const summary = {
  backendTotalDefinitions: backendAudit.length,
  clientTotalRoutes: clientAudit.length,
  domainBreakdown: domainStats,
};

fs.writeFileSync("c:/Users/USER/hermes/shothik-web-mirror-v2/.data/audit_summary.json", JSON.stringify(summary, null, 2));
