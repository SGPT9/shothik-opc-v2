import React, { useState } from "react";
import {
  Radio,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Globe,
  Terminal,
  Filter,
  RefreshCw,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StreamEvent {
  id: string;
  timestamp: string;
  company: string;
  agent: string;
  taskTitle: string;
  category: "CODE" | "TEST" | "DEPLOY" | "MARKETING" | "SECURITY";
  telemetry: string;
  status: "completed" | "in_progress" | "failed";
}

const MOCK_EVENTS: StreamEvent[] = [
  {
    id: "evt-1",
    timestamp: "Just now",
    company: "VerifiQ AI",
    agent: "github-fixer",
    taskTitle: "Refactored bKash MFS webhook signature verification & added nonce cache",
    category: "CODE",
    telemetry: "AST PARSED 12ms · 3 CHUNKS MODIFIED",
    status: "completed",
  },
  {
    id: "evt-2",
    timestamp: "1m ago",
    company: "VerifiQ AI",
    agent: "test-automator",
    taskTitle: "Executed vitest regression suite on auth and checkout routes (40 test files)",
    category: "TEST",
    telemetry: "110 TESTS PASSED · 1.4s EXECUTION",
    status: "completed",
  },
  {
    id: "evt-3",
    timestamp: "3m ago",
    company: "Acme SaaS",
    agent: "cloud-deployer",
    taskTitle: "Compiling standalone Docker container & provisioning SSL certs",
    category: "DEPLOY",
    telemetry: "DOKPLOY ROLLOUT ➔ acme.shothikgpt.com",
    status: "completed",
  },
  {
    id: "evt-4",
    timestamp: "6m ago",
    company: "BookStudio",
    agent: "seo-specialist",
    taskTitle: "Dispatched automated daily cold outreach sequence to 50 target publishers",
    category: "MARKETING",
    telemetry: "1 CREDIT CONSUMED · 50 EMAILS SENT",
    status: "completed",
  },
  {
    id: "evt-5",
    timestamp: "10m ago",
    company: "VerifiQ AI",
    agent: "security-auditor",
    taskTitle: "Verified PostgreSQL Row-Level Security (RLS) policies for tenant workspaces",
    category: "SECURITY",
    telemetry: "100% RLS ENFORCEMENT VERIFIED",
    status: "completed",
  },
];

const CATEGORY_COLORS: Record<StreamEvent["category"], { border: string; text: string; bg: string }> = {
  CODE: { border: "border-indigo-500/30", text: "text-indigo-400", bg: "bg-indigo-500/10" },
  TEST: { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  DEPLOY: { border: "border-sky-500/30", text: "text-sky-400", bg: "bg-sky-500/10" },
  MARKETING: { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10" },
  SECURITY: { border: "border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500/10" },
};

export default function LiveStreamPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [events, setEvents] = useState<StreamEvent[]>(MOCK_EVENTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredEvents = events.filter((e) => {
    if (selectedCompany !== "All" && e.company !== selectedCompany) return false;
    if (selectedCategory !== "All" && e.category !== selectedCategory) return false;
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Polsia Live Execution Stream
            </h1>
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-[10px] font-mono">
              v2.5.0 OPC Global Swarm
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Watch autonomous AI Technical Co-Founders plan, code, test, deploy, and market startups 24/7 in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="h-8 rounded-xl text-xs gap-1.5"
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            <span>Refresh</span>
          </Button>
          <a
            href="/twin"
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5" /> Launch Your Twin
          </a>
        </div>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Active Companies</span>
            <Globe className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 tabular-nums font-mono">14 Startups</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">+3 added today</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Autonomous Tasks</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 tabular-nums font-mono">1,842 Shipped</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">100% test pass rate</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Active Swarm Agents</span>
            <Cpu className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 tabular-nums font-mono">140 Agents</p>
          <p className="text-[10px] text-sky-400 font-mono mt-0.5">10 personas per company</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Global Monthly MRR</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 tabular-nums font-mono">৳630,000</p>
          <p className="text-[10px] text-purple-400 font-mono mt-0.5">65.2% Avg Net Margin</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl border border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Filter by Company:</span>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground outline-none"
          >
            <option value="All">All Companies (14)</option>
            <option value="VerifiQ AI">VerifiQ AI</option>
            <option value="Acme SaaS">Acme SaaS</option>
            <option value="BookStudio">BookStudio</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", "CODE", "TEST", "DEPLOY", "MARKETING", "SECURITY"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-[11px] font-mono transition",
                selectedCategory === cat
                  ? "bg-indigo-600 text-white font-bold"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Realtime Stream List */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => {
          const color = CATEGORY_COLORS[evt.category];
          return (
            <div
              key={evt.id}
              className="rounded-2xl border border-border/80 bg-card p-4 transition hover:border-border hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold", color.border, color.text, color.bg)}>
                    {evt.category}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    🏢 {evt.company}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs font-mono text-indigo-400">
                    @{evt.agent}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{evt.timestamp}</span>
                </div>
              </div>

              <p className="mt-2 text-sm text-foreground font-medium leading-snug">
                {evt.taskTitle}
              </p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                  ⚡ {evt.telemetry}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Shipped to Production
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
