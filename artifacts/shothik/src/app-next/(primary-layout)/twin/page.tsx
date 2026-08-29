import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { AutoModeModal } from "@/components/twin/AutoModeModal";
import { NightshiftModal } from "@/components/twin/NightshiftModal";
import { AddCreditsModal } from "@/components/twin/AddCreditsModal";
import { DocumentsListModal, DocumentItem } from "@/components/twin/DocumentsListModal";
import { CompanyLimitModal } from "@/components/twin/CompanyLimitModal";
import { CompanySettingsModal } from "@/components/twin/CompanySettingsModal";
import { ManageDomainsModal } from "@/components/twin/ManageDomainsModal";
import { VersionsModal, VersionCommit } from "@/components/twin/VersionsModal";
import { WebsiteHubModal } from "@/components/twin/WebsiteHubModal";
import { AppSecretsModal } from "@/components/twin/AppSecretsModal";
import { RedeployModal } from "@/components/twin/RedeployModal";
import { AutoColdOutreachModal } from "@/components/twin/AutoColdOutreachModal";
import { LiveTerminalTicker } from "@/components/twin/LiveTerminalTicker";
import { DailyDigestModal } from "@/components/twin/DailyDigestModal";
import { ConnectExistingCompanyModal } from "@/components/twin/ConnectExistingCompanyModal";
import { MfsGatewayModal } from "@/components/twin/MfsGatewayModal";
import { VoiceCommanderModal } from "@/components/twin/VoiceCommanderModal";
import { DokployMicroContainersModal } from "@/components/twin/DokployMicroContainersModal";
import { SecondMeMemoryModal } from "@/components/twin/SecondMeMemoryModal";
import { memoryExtractionService } from "@/lib/memory/MemoryExtractionService";
import SendToWritingStudioButton from "@/components/tools/common/SendToWritingStudioButton";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Brain,
  Paperclip,
  Send,
  Plus,
  Zap,
  Globe,
  Mail,
  FileText,
  Clock,
  History,
  CreditCard,
  CheckCircle2,
  X,
  PlusSquare,
  LayoutGrid,
  SendHorizontal,
  Clock3,
  Rocket,
  Users,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ------------------------------------------------------------------ */
/* Types & Mock Data                                                  */
/* ------------------------------------------------------------------ */

interface CockpitTask {
  id: string;
  title: string;
  description: string;
  tags: string[]; // e.g. ["FEATURE", "TONIGHT", "1 CREDIT"]
  status: "todo" | "in_progress" | "completed";
}

interface CockpitDoc {
  id: string;
  title: string;
  timeAgo: string;
  kind: string;
  content?: string;
}

interface StandupMessage {
  id: string;
  time: string;
  dayHeader?: string;
  isNewDivider?: boolean;
  text: string;
  fromUser?: boolean;
}

const INITIAL_TASKS: CockpitTask[] = [
  {
    id: "task-1",
    title: "Add /docs/identity-verification page covering NI...",
    description:
      "Add a static /docs/identity-verification documentation page explaining how banks integrate with POST /v1/verify/identity. Cover: required request fiel...",
    tags: ["FEATURE", "TONIGHT", "1 CREDIT"],
    status: "todo",
  },
  {
    id: "task-2",
    title: "Add /docs/aml-verification page covering OpenS...",
    description:
      "Add a static /docs/aml-verification documentation page explaining how banks integrate with POST /v1/verify/aml. Cover: required request fields (name, ...",
    tags: ["FEATURE", "1 CREDIT"],
    status: "todo",
  },
  {
    id: "task-3",
    title: "Add /docs/otp-verification page summarising Ba...",
    description:
      "Add a static /docs/otp-verification documentation page that presents the Bangladesh OTP vendor shortlist findings (from the completed research task) i...",
    tags: ["FEATURE", "1 CREDIT"],
    status: "todo",
  },
  {
    id: "task-4",
    title: "Add POST /v1/verify/phone endpoint wiring Ba...",
    description:
      "Implement POST /v1/verify/phone that accepts a Bangladeshi mobile number, calls the top-recommended SMS OTP provider from the research shortlist (read...",
    tags: ["FEATURE", "1 CREDIT"],
    status: "todo",
  },
];

const INITIAL_DOCS: CockpitDoc[] = [
  {
    id: "doc-roadmap",
    title: "Product Roadmap",
    timeAgo: "22M AGO",
    kind: "Roadmap",
    content: `# Product Roadmap

### Now
- **Add /docs/identity-verification page** covering NID adapter usage and error codes
- **Add /docs/aml-verification page** covering OpenSanctions screening, match fields, and error handling
- **Add POST /v1/webhooks/:id/ping** test-ping endpoint for pre-production validation

### Next
- **Add /docs/otp-verification page** summarising the Bangladesh OTP vendor shortlist findings and recommended integration path
- **Add POST /v1/verify/phone endpoint** wiring a Bangladesh SMS OTP provider into the standard verification result shape
- **Add /docs/webhooks page** with curl examples for subscribe, list, ping, redeliver, and unsubscribe

### Later
- **Live selfie/liveness check** to replace manual ID-vs-face comparison at account opening
- **Cross-bank fraud signal sharing layer** across VerifiQ customers
- **Native BB e-KYC adapter** so banks can hand off entire onboarding flows to a single call`,
  },
  {
    id: "doc-day-43",
    title: "Day 43 — CEO Report",
    timeAgo: "21M AGO",
    kind: "CEO Report",
    content: `# Day 43 — CEO Report\n\n### Audit Export & Compliance Release\n- Successfully deployed CSV export endpoint for Bangladesh financial compliance.\n- Zero mock verification entries remaining in production table.`,
  },
  {
    id: "doc-day-42",
    title: "Day 42 — CEO Report",
    timeAgo: "1D AGO",
    kind: "CEO Report",
    content: `# Day 42 — CEO Report

### Compliance Export
- \`GET /v1/audit/export?format=csv\` — Streams a well-formed CSV with columns \`verification_id\`, \`type\`, \`status\`, \`reason\`, \`tenant_id\`, \`created_at\`. Accepts the same \`since\` / \`until\` params as \`/v1/audit/verifications\`. Response carries \`Content-Type: text/csv\` and \`Content-Disposition: attachment\` — curl-able with an API key and ready to hand to a regulator or open in Excel.

### Live Data Providers (confirmed carried forward from Day 41, no regressions)
- \`POST /v1/verify/identity\` — Surepass NID adapter live; all stubs retired. \`SUREPASS_API_KEY\` from env.
- \`POST /v1/verify/aml\` — OpenSanctions screening live; key stored as server-side secret, not in code. Graceful degradation on rate-limit or timeout.

### Self-Serve Key Rotation
- \`POST /v1/admin/customers/:id/keys/:key_id/rotate\` — Mints replacement key preserving \`vq_pr_\` / \`vq_sb_\` prefix, stamps \`rotated_at\` on old key, writes rotation event to audit log.

### Webhook Surface (complete)
- \`POST /v1/webhooks/deliveries/:id/redeliver\` — Re-POSTs logged delivery with same HMAC path, writes new row with parent linkage, original row unchanged.
- \`GET /v1/webhooks/deliveries\` — Tenant-scoped delivery log with \`since\` / \`until\` filtering.`,
  },
];

const INITIAL_FEED: StandupMessage[] = [
  {
    id: "f-0",
    time: "11:34 PM",
    text: "...pick to unlock the next integration. Any closer to a decision on that?",
  },
  {
    id: "f-1",
    dayHeader: "TODAY",
    time: "12:16 AM",
    text: "Three things shipped today: new tenants now get a pre-seeded mix of verification rows the moment they're provisioned, so a bank's first look is a populated dashboard instead of a blank screen. The webhook delivery log is live at `/v1/webhooks/deliveries`, and the test ping endpoint lets banks confirm their subscriber URL is wired correctly before they go live. You'll get the full breakdown — including where things stand on the OTP vendor decision — by email this morning.",
  },
  {
    id: "f-2",
    isNewDivider: true,
    time: "JUST NOW",
    text: `OTP vendor pick still yours in the meantime — closing docs gaps so banks have the reference surface they need to integrate against the live pipeline.

Next up:
1. **Add /docs/audit-export page** covering CSV export endpoint and column reference
2. **Add /docs/webhook-events catalog** documenting event types and payloads`,
  },
];

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function TwinPage() {
  const [companyName, setCompanyName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shothik_active_company") || "VerifiQ";
    }
    return "VerifiQ";
  });
  const [tasks, setTasks] = useState<CockpitTask[]>(INITIAL_TASKS);
  const [docs, setDocs] = useState<CockpitDoc[]>(INITIAL_DOCS);
  const [feed, setFeed] = useState<StandupMessage[]>(INITIAL_FEED);
  const [chatInput, setChatInput] = useState("");
  const [credits, setCredits] = useState<number>(15);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true);

  // Business metrics
  const [visitorCount, setVisitorCount] = useState<number>(128);
  const [revenueBdt, setRevenueBdt] = useState<number>(45200);

  // Planning loop state
  const [isPlanning, setIsPlanning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "> Planning next steps",
    "> Committing and pushing the changes...",
    "> Deploying the update...",
    "> Verifying the deployment is healthy...",
  ]);

  // Modals state
  const [autoModeOpen, setAutoModeOpen] = useState(false);
  const [autoModeActive, setAutoModeActive] = useState(false);
  const [autoModeRemaining, setAutoModeRemaining] = useState<number | null>(null);

  const [nightshiftOpen, setNightshiftOpen] = useState(false);
  const [nightshiftMode, setNightshiftMode] = useState<"reporting_only" | "work_one_task">("work_one_task");

  const [addCreditsOpen, setAddCreditsOpen] = useState(false);
  const [docsListOpen, setDocsListOpen] = useState(false);
  const [companyLimitOpen, setCompanyLimitOpen] = useState(false);
  const [companySettingsOpen, setCompanySettingsOpen] = useState(false);
  const [manageDomainsOpen, setManageDomainsOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [websiteHubOpen, setWebsiteHubOpen] = useState(false);
  const [secretsOpen, setSecretsOpen] = useState(false);
  const [redeployOpen, setRedeployOpen] = useState(false);
  const [autoColdOutreachOpen, setAutoColdOutreachOpen] = useState(false);

  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [manageTasksOpen, setManageTasksOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const [activeDoc, setActiveDoc] = useState<CockpitDoc | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mfsGatewayOpen, setMfsGatewayOpen] = useState(false);
  const [connectCompanyOpen, setConnectCompanyOpen] = useState(false);
  const [voiceCommanderOpen, setVoiceCommanderOpen] = useState(false);
  const [dailyDigestOpen, setDailyDigestOpen] = useState(false);
  const [dokployOpen, setDokployOpen] = useState(false);
  const [secondMeMemoryOpen, setSecondMeMemoryOpen] = useState(false);
  const [memoryCount, setMemoryCount] = useState(4);

  // Load persistent tasks, docs, feed & memory count from localStorage
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem("shothik_twin_tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      const storedDocs = localStorage.getItem("shothik_twin_docs");
      if (storedDocs) {
        setDocs(JSON.parse(storedDocs));
      }
      const storedFeed = localStorage.getItem("shothik_twin_feed");
      if (storedFeed) {
        setFeed(JSON.parse(storedFeed));
      }
      const storedRev = localStorage.getItem("shothik_twin_revenue");
      if (storedRev) {
        setRevenueBdt(Number(storedRev) || 45200);
      }
      const storedVis = localStorage.getItem("shothik_twin_visitors");
      if (storedVis) {
        setVisitorCount(Number(storedVis) || 128);
      }
      const storedMems = localStorage.getItem("shothik_twin_memories");
      if (storedMems) {
        const parsed = JSON.parse(storedMems);
        if (Array.isArray(parsed)) {
          setMemoryCount(parsed.length);
        }
      }
    } catch {
      // fallback to initial
    }
  }, []);

  // Save company name when changed
  useEffect(() => {
    try {
      localStorage.setItem("shothik_active_company", companyName);
    } catch {}
  }, [companyName]);

  // Save docs when changed
  useEffect(() => {
    try {
      localStorage.setItem("shothik_twin_docs", JSON.stringify(docs));
    } catch {}
  }, [docs]);

  // Memory extraction event listener
  useEffect(() => {
    const handleMemExtract = (e: any) => {
      if (e.detail?.total) {
        setMemoryCount(e.detail.total);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("shothik_memory_extracted", handleMemExtract);
      return () => window.removeEventListener("shothik_memory_extracted", handleMemExtract);
    }
  }, []);

  const feedScrollRef = useRef<HTMLDivElement>(null);

  // Auto Mode timer countdown
  useEffect(() => {
    if (!autoModeActive || autoModeRemaining === null) return;
    const timer = setInterval(() => {
      setAutoModeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setAutoModeActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoModeActive, autoModeRemaining]);

  const handleStartAutoMode = (hours: number) => {
    setAutoModeActive(true);
    setAutoModeRemaining(hours * 3600);
    setFeed((prev) => [
      ...prev,
      {
        id: `auto-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        text: `⚡ Auto Mode activated for ${hours} hours. Polsia will execute queued tasks and formulate next-step roadmaps autonomously.`,
      },
    ]);
  };

  const handleTriggerPlanning = () => {
    if (isPlanning) return;
    setIsPlanning(true);

    setTerminalLogs([
      "> Planning next steps...",
      "> Analyzing market competitors & Bangladesh compliance benchmarks...",
      "> Deciding the 3 highest-impact next steps...",
    ]);

    setTimeout(() => {
      setTerminalLogs([
        "> Drafting your next 3 tasks...",
        "> Added: Add /docs/audit-export page covering CSV export endpoint and column reference",
        "> Added: Add /docs/webhook-events catalog documenting event types and payloads",
        "> Added: Add /docs/errors reference page consolidating HTTP status codes and error response shapes",
        "> Your 3 new tasks are ready — run any of them from your dashboard.",
      ]);

      const plannedTasks: CockpitTask[] = [
        {
          id: `task-p1-${Date.now()}`,
          title: "Add /docs/audit-export page covering CSV export...",
          description:
            "Add a static /docs/audit-export documentation page covering GET /v1/audit/export?format=csv with parameter definitions, header requirements, and curl snippet.",
          tags: ["FEATURE", "1 CREDIT"],
          status: "todo",
        },
        {
          id: `task-p2-${Date.now()}`,
          title: "Add /docs/webhook-events catalog documenting...",
          description:
            "Create full JSON schema catalog for verification.completed, verification.flagged, and identity.mismatch webhook delivery payloads.",
          tags: ["FEATURE", "1 CREDIT"],
          status: "todo",
        },
        {
          id: `task-p3-${Date.now()}`,
          title: "Add /docs/errors reference page consolidating HTTP...",
          description:
            "Consolidate error response shapes for Surepass NID downtime, OpenSanctions rate limits, and invalid tenant keys into unified documentation.",
          tags: ["FEATURE", "1 CREDIT"],
          status: "todo",
        },
      ];

      setTasks((prev) => {
        const updated = [...plannedTasks, ...prev];
        try {
          localStorage.setItem("shothik_twin_tasks", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setIsPlanning(false);

      // Autonomous extraction of roadmap decisions into SecondMe Memory
      memoryExtractionService.extractAndCommit({
        prompt: "Analyze product roadmap and draft strategic tasks",
        response: plannedTasks.map((t) => `${t.title}: ${t.description}`).join("\n"),
        source: "task",
      });

      setFeed((prev) => [
        ...prev,
        {
          id: `plan-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          text: "📋 I have analyzed your product roadmap and queued 3 strategic next-step tasks ready for execution.",
        },
      ]);
    }, 2800);
  };

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    // Auto extract founder preferences or directives from standup messages
    memoryExtractionService.extractAndCommit({
      prompt: "Founder directive to Polsia",
      response: text,
      source: "chat",
    });

    setFeed((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        time: now,
        text,
        fromUser: true,
      },
      {
        id: `a-${Date.now()}`,
        time: now,
        text: `Understood: "${text}". I have logged this directive, verified dependencies, and scheduled execution into the next autonomous cycle.`,
      },
    ]);

    setChatInput("");
    setTimeout(() => {
      feedScrollRef.current?.scrollTo({ top: feedScrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleRevertCommit = (commit: VersionCommit) => {
    setFeed((prev) => [
      ...prev,
      {
        id: `revert-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        text: `🔄 Reverting live deployment to commit ${commit.hash} ("${commit.message}"). Rolling container redeployed to Dokploy VPS in 380ms.`,
      },
    ]);
  };

  const formatCountdown = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const beveledBtnClass =
    "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-950 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 font-mono font-semibold text-[11px] uppercase tracking-wider shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-md select-none";

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 dark:bg-[#0c0d0e] dark:text-zinc-50 flex flex-col font-sans select-text">
      {/* ── Top Micro-Step Terminal Ticker ── */}
      <LiveTerminalTicker autoModeActive={autoModeActive} activeLogs={terminalLogs} />

      {/* ── Header Bar ── */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-serif text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {companyName}
          </span>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-md">
            AUTONOMOUS FOUNDER COCKPIT
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setAddCreditsOpen(true)}
            className={beveledBtnClass}
          >
            + ADD CREDITS
          </button>
          <button
            type="button"
            onClick={() => setCompanyLimitOpen(true)}
            className={beveledBtnClass}
          >
            + NEW
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={beveledBtnClass}
          >
            <span>MENU</span>
            <span>-</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className={`flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 min-h-[calc(100vh-85px)]`}>
        {/* ── Left Column: Agent Profile, Status, Business & Teams ── */}
        <section className={`p-6 space-y-7 bg-white dark:bg-[#0f1011] ${chatSidebarOpen ? "md:col-span-3 lg:col-span-2.5" : "md:col-span-4 lg:col-span-3"}`}>
          {/* Autonomous Agent Status Widget */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              Polsia
            </h2>

            <div className="flex items-start gap-4">
              {isPlanning ? (
                <div className="w-16 h-20 border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black flex flex-col items-center justify-between py-1 px-1 font-mono text-[9px] leading-tight select-none shadow-sm animate-pulse text-zinc-950 dark:text-zinc-100">
                  <span className="text-[7px]">▲</span>
                  <span className="tracking-widest text-[8px]">▲ ▲ ▲</span>
                  <div className="flex items-center justify-between w-full px-1">
                    <span>◉</span>
                    <span>◉</span>
                  </div>
                  <span>▽</span>
                  <span className="text-[8px]">~~~~~</span>
                  <div className="flex items-center justify-between w-full px-1 text-[8px]">
                    <span>/ | \</span>
                    <span className="text-emerald-500 font-bold">♫</span>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black flex flex-col items-center justify-between py-1.5 px-2 shadow-sm font-mono text-[10px] leading-tight select-none text-zinc-950 dark:text-zinc-100">
                  <span className="tracking-widest text-[8px]">▲ ▲ ▲</span>
                  <div className="flex items-center justify-between w-full px-1">
                    <span>◉</span>
                    <span>◉</span>
                  </div>
                  <span>▽</span>
                  <span className="text-[8px] text-zinc-500 dark:text-zinc-400">~~~~~</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base font-bold text-zinc-950 dark:text-white">
                    {isPlanning ? "Planning" : "Shipped"}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isPlanning ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
                </div>
                <p className="font-serif text-xs text-zinc-700 dark:text-zinc-300 leading-tight">
                  {isPlanning ? "Formulating next moves..." : "Done — your changes are live"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setAutoModeOpen(true)}
                className={`${beveledBtnClass} ${
                  autoModeActive
                    ? "!bg-emerald-600 !text-white !border-emerald-700 font-bold"
                    : ""
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{autoModeActive ? "AUTO ACTIVE" : "AUTO MODE"}</span>
              </button>

              <button
                type="button"
                onClick={() => setNightshiftOpen(true)}
                className={beveledBtnClass}
              >
                NIGHTSHIFT
              </button>
            </div>

            {isPlanning && (
              <div className="p-3.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#141517] font-serif text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-xs rounded-md">
                Deciding the 3 highest-impact next steps to move the company forward...
              </div>
            )}

            {autoModeActive && autoModeRemaining !== null && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono text-xs flex items-center justify-between rounded-md">
                <span className="font-semibold">REMAINING:</span>
                <span className="font-bold">{formatCountdown(autoModeRemaining)}</span>
              </div>
            )}
          </div>

          {/* Business & Telemetry Widget */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
                Business
              </h3>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                LIVE TELEMETRY
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">VISITORS:</span>
                <span className="font-extrabold text-zinc-950 dark:text-white text-sm">{visitorCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">REVENUE:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">৳{revenueBdt.toLocaleString()} BDT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">TASKS:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-200">
                  {tasks.filter((t) => t.status === "completed").length} / {tasks.length} Done
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 font-medium pt-1">
                <span>UPDATED JUST NOW</span>
                <span className="text-[10px] text-zinc-400">⚡ AUTO-SYNC</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMfsGatewayOpen(true)}
              className={`w-full mt-2 ${beveledBtnClass}`}
            >
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>SETUP PAYMENTS</span>
            </button>
          </div>

          {/* Teams Widget */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
              Teams
            </h3>

            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className={`w-full ${beveledBtnClass}`}
            >
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>ADD MEMBER</span>
            </button>
          </div>

          {/* SecondMe Memory & Cognitive Persona Widget */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
                SecondMe Memory
              </h3>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-mono">
                {memoryCount} Traits
              </Badge>
            </div>

            <button
              type="button"
              onClick={() => setSecondMeMemoryOpen(true)}
              className={`w-full ${beveledBtnClass}`}
            >
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>TWIN BRAIN & MEMORY</span>
            </button>
          </div>
        </section>

        {/* ── Center-Left Column: Tasks, Documents & Website ── */}
        <section className={`p-6 space-y-8 bg-zinc-50/50 dark:bg-[#0c0d0e] ${chatSidebarOpen ? "md:col-span-5 lg:col-span-4.5" : "md:col-span-5 lg:col-span-5.5"}`}>
          {/* Tasks Section */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              Tasks
            </h2>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121315] hover:border-zinc-400 dark:hover:border-zinc-700 transition-all space-y-2.5 shadow-xs rounded-lg"
                >
                  <h4 className="font-serif text-sm font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
                    {task.title}
                  </h4>
                  <p className="font-serif text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 border font-bold tracking-wider rounded ${
                          tag === "TONIGHT"
                            ? "border-amber-500/50 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200"
                            : tag === "1 CREDIT"
                            ? "border-blue-500/40 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200"
                            : "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={handleTriggerPlanning}
                disabled={isPlanning}
                className={`${beveledBtnClass} ${isPlanning ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <PlusSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isPlanning ? "PLANNING..." : "NEW TASKS"}</span>
              </button>
              <button
                type="button"
                onClick={() => setManageTasksOpen(true)}
                className={beveledBtnClass}
              >
                <LayoutGrid className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                <span>MANAGE TASKS</span>
              </button>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
              Documents
            </h3>

            <div className="space-y-2 font-serif text-xs">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors border-b border-zinc-200/60 dark:border-zinc-900 group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {doc.title}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                    {doc.timeAgo}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDocsListOpen(true)}
              className="font-mono text-xs font-bold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white uppercase tracking-wider transition-colors pt-2 block cursor-pointer"
            >
              VIEW ALL (52)
            </button>
          </div>

          {/* Website Domain Section */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
              Website
            </h3>

            <div className="flex items-center gap-2 font-mono text-xs">
              <a
                href="https://shothikaddress.com"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>🔗</span>
                <span>https://shothikaddress.com</span>
              </a>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setManageDomainsOpen(true)}
                className={beveledBtnClass}
              >
                MANAGE DOMAIN
              </button>
              <button
                type="button"
                onClick={() => setVersionsOpen(true)}
                className={beveledBtnClass}
              >
                VERSIONS
              </button>
              <button
                type="button"
                onClick={() => setWebsiteHubOpen(true)}
                className={beveledBtnClass}
              >
                ...
              </button>
            </div>
          </div>
        </section>

        {/* ── Center-Right Column: Twitter, Email, Ads ── */}
        <section className={`p-6 space-y-8 bg-white dark:bg-[#0f1011] ${chatSidebarOpen ? "md:col-span-4 lg:col-span-2.5" : "md:col-span-3 lg:col-span-3.5"}`}>
          {/* Twitter / X Engine */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
              Twitter
            </h3>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-950 dark:text-white">Polsia @polsia</span>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold underline uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  CONNECT X ACCOUNT
                </a>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold pt-1">
                NO TWEETS POSTED YET
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] pt-1">
              <button
                type="button"
                onClick={() => {
                  setFeed((prev) => [
                    ...prev,
                    {
                      id: `tw-${Date.now()}`,
                      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                      text: "🐦 Generated product launch draft: 'VerifiQ KYC engine is live with 420ms verification latency across Bangladesh identity registries.' Queued for your review.",
                    },
                  ]);
                }}
                className={beveledBtnClass}
              >
                <SendHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>TWEET</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeed((prev) => [
                    ...prev,
                    {
                      id: `tw-auto-${Date.now()}`,
                      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                      text: "⚡ Auto-Tweet enabled. Polsia will post verified milestone threads directly to connected social accounts.",
                    },
                  ]);
                }}
                className={beveledBtnClass}
              >
                <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>AUTO-TWEET</span>
              </button>
            </div>
          </div>

          {/* Email / Cold Outreach Engine */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
              Email
            </h3>

            <div className="space-y-1.5 font-mono text-xs">
              <p className="text-zinc-800 dark:text-zinc-200 font-bold">
                verifiq-3@polsia.app
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold pt-1">
                NO EMAILS YET
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] pt-1">
              <button
                type="button"
                onClick={() => {
                  setFeed((prev) => [
                    ...prev,
                    {
                      id: `em-${Date.now()}`,
                      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                      text: "✉️ Cold Outreach campaign prepared: 25 target CTOs at Bangladesh FinTechs imported. Review draft before dispatch.",
                    },
                  ]);
                }}
                className={beveledBtnClass}
              >
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>COLD OUTREACH</span>
              </button>
              <button
                type="button"
                onClick={() => setAutoColdOutreachOpen(true)}
                className={beveledBtnClass}
              >
                <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>AUTO COLD OUTREACH</span>
              </button>
            </div>
          </div>

          {/* Ads Module */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
              Ads
            </h3>

            <button
              type="button"
              onClick={() => {
                setFeed((prev) => [
                  ...prev,
                  {
                    id: `ads-${Date.now()}`,
                    time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                    text: "📊 Meta Ads campaign scaffolded: Targeting FinTech founders in South Asia with $50/day test budget.",
                  },
                ]);
              }}
              className={beveledBtnClass}
            >
              <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>RUN ADS</span>
            </button>
          </div>
        </section>

        {/* ── Right Column: Daily Standup Timeline & Chat Sidebar (2.5 cols) ── */}
        {chatSidebarOpen && (
          <section className="md:col-span-12 lg:col-span-2.5 flex flex-col bg-white dark:bg-[#111] border-t md:border-t-0 border-zinc-200 dark:border-zinc-800 min-h-[500px] relative">
            {/* Top Close Button (Black Circular X matching screenshot) */}
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setChatSidebarOpen(false)}
                className="w-6 h-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 flex items-center justify-center text-xs transition-all cursor-pointer shadow-xs"
                title="Collapse Sidebar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Standup Timeline */}
            <div
              ref={feedScrollRef}
              className="flex-1 p-5 pt-8 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]"
            >
              {feed.map((msg, index) => (
                <div key={msg.id} className="space-y-2">
                  {/* Centered TODAY / Date Divider */}
                  {msg.dayHeader && (
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-zinc-300 dark:border-zinc-800" />
                      <span className="shrink-0 px-3 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                        {msg.dayHeader}
                      </span>
                      <div className="flex-grow border-t border-zinc-300 dark:border-zinc-800" />
                    </div>
                  )}

                  {/* Red NEW Divider Line */}
                  {msg.isNewDivider && (
                    <div className="relative flex items-center py-1">
                      <div className="flex-grow border-t border-red-500" />
                      <span className="shrink-0 pl-2 font-mono text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
                        NEW
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div
                      className={`font-serif text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:border [&_code]:border-zinc-300 dark:[&_code]:border-zinc-800 rounded-md ${
                        msg.fromUser
                          ? "p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-white"
                          : ""
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>

                    <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Universal Bottom Input (Screenshot Parity) */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0e0f10]">
              <div className="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 shadow-xs rounded-md">
                <button
                  type="button"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Polsia anything..."
                  className="flex-1 bg-transparent font-serif text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 outline-none min-w-0"
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-mono font-bold text-[10px] uppercase tracking-wider disabled:opacity-40 transition-all cursor-pointer shrink-0 rounded shadow-xs"
                >
                  SEND
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Floating Toggle Button when Sidebar is Closed */}
      {!chatSidebarOpen && (
        <button
          type="button"
          onClick={() => setChatSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xl border border-zinc-700 transition-all cursor-pointer active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>OPEN STANDUP FEED</span>
        </button>
      )}

      {/* ── Modals ── */}
      <AutoModeModal
        open={autoModeOpen}
        onOpenChange={setAutoModeOpen}
        onStartAutoMode={handleStartAutoMode}
      />

      <NightshiftModal
        open={nightshiftOpen}
        onOpenChange={setNightshiftOpen}
        onSave={(mode) => setNightshiftMode(mode)}
      />

      <AddCreditsModal
        open={addCreditsOpen}
        onOpenChange={setAddCreditsOpen}
        onSuccess={(plan, price) => {
          setCredits((c) => c + 15);
          setFeed((prev) => [
            ...prev,
            {
              id: `cred-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `💳 Successfully subscribed to ${plan}. 15 Credits added to ${companyName} workspace balance.`,
            },
          ]);
        }}
      />

      <DocumentsListModal
        open={docsListOpen}
        onOpenChange={setDocsListOpen}
        onSelectDoc={(doc) => {
          setActiveDoc({
            id: doc.id,
            title: doc.title,
            timeAgo: doc.timeAgo,
            kind: doc.type === "report" ? "CEO Report" : "Document",
            content: doc.content,
          });
        }}
      />

      <CompanyLimitModal
        open={companyLimitOpen}
        onOpenChange={setCompanyLimitOpen}
        onAddSlot={() => {
          setFeed((prev) => [
            ...prev,
            {
              id: `slot-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `🏢 New Company Slot provisioned (+ $20/mo). You can now launch an additional autonomous company from your account.`,
            },
          ]);
        }}
      />

      <CompanySettingsModal
        open={companySettingsOpen}
        onOpenChange={setCompanySettingsOpen}
        companyName={companyName}
        onSaveCompanyName={(newName) => {
          setCompanyName(newName);
          setFeed((prev) => [
            ...prev,
            {
              id: `rename-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `📝 Company renamed to "${newName}". Workspace and domain metadata synchronized.`,
            },
          ]);
        }}
        onTogglePause={(paused) => {
          setFeed((prev) => [
            ...prev,
            {
              id: `pause-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: paused
                ? `⏸️ ${companyName} daily work paused temporarily. Autonomous queue suspended.`
                : `▶️ ${companyName} daily work resumed. Autonomous tasks restored.`,
            },
          ]);
        }}
        onDeleteCompany={() => {
          setFeed((prev) => [
            ...prev,
            {
              id: `del-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `⚠️ ${companyName} deletion requested. Purging containers and workspace records.`,
            },
          ]);
        }}
      />

      <ManageDomainsModal
        open={manageDomainsOpen}
        onOpenChange={setManageDomainsOpen}
        polsiaUrl="https://verifiq-3.polsia.app"
        customDomain="shothikaddress.com"
        onReleaseDomain={() => {
          setFeed((prev) => [
            ...prev,
            {
              id: `rel-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: "🌐 Custom domain released. SSL certificate detached and DNS bindings purged.",
            },
          ]);
        }}
        onConnectDomain={(domain) => {
          setFeed((prev) => [
            ...prev,
            {
              id: `dom-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `🌐 Custom domain "${domain}" attached. Generating AWS ACM SSL certificate validation CNAME records.`,
            },
          ]);
        }}
      />

      <VersionsModal
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
        onRevertCommit={handleRevertCommit}
      />

      <WebsiteHubModal
        open={websiteHubOpen}
        onOpenChange={setWebsiteHubOpen}
        onOpenManageDomains={() => setManageDomainsOpen(true)}
        onOpenVersions={() => setVersionsOpen(true)}
        onOpenSecrets={() => setSecretsOpen(true)}
        onOpenRedeploy={() => setRedeployOpen(true)}
      />

      <AppSecretsModal
        open={secretsOpen}
        onOpenChange={setSecretsOpen}
        onSecretChange={() => {
          setFeed((prev) => [
            ...prev,
            {
              id: `sec-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: "🔒 App Secrets updated. Trigger a redeployment for new environment variables to take effect.",
            },
          ]);
        }}
      />

      <RedeployModal
        open={redeployOpen}
        onOpenChange={setRedeployOpen}
        onStartRedeploy={() => {
          setTerminalLogs([
            "> Initializing zero-downtime container rebuild...",
            "> Injecting updated runtime environment variables...",
            "> Building Vite/PostgREST production bundle...",
            "> Dokploy VPS container rolled over: https://shothikaddress.com [HTTP 200 OK]",
          ]);
          setFeed((prev) => [
            ...prev,
            {
              id: `redep-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: "🚀 Site successfully rebuilt and redeployed from latest commit. All environment variable changes are live.",
            },
          ]);
        }}
      />

      <AutoColdOutreachModal
        open={autoColdOutreachOpen}
        onOpenChange={setAutoColdOutreachOpen}
        onStartOutreach={(freq) => {
          setTerminalLogs([
            "> Provisioning Polsia outbound SMTP proxy (verifiq-3@polsia.app)...",
            "> Scraping South Asian FinTech executive directories...",
            `> Schedule active: ${freq.toUpperCase()}. Auto-dispatching 10 pitches per run.`,
          ]);
          setFeed((prev) => [
            ...prev,
            {
              id: `outreach-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `✉️ Auto Cold Outreach activated (${freq.toUpperCase()}). Polsia will send tailored pitches to target CTOs from verifiq-3@polsia.app.`,
            },
          ]);
        }}
      />

      {/* Manage Tasks Modal */}
      <Dialog open={manageTasksOpen} onOpenChange={setManageTasksOpen}>
        <DialogContent className="sm:max-w-2xl bg-white text-slate-900 border border-slate-300 p-6 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2">
            <DialogTitle className="text-xl font-bold font-serif text-black dark:text-white">
              Task Lifecycle Manager
            </DialogTitle>
            <DialogClose asChild>
              <button type="button" className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </DialogClose>
          </div>
          <DialogDescription className="text-xs text-zinc-500 font-sans">
            Review, promote, or execute queued founder tasks.
          </DialogDescription>

          <div className="space-y-3 mt-4">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-black dark:text-white">{t.title}</h4>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {t.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="font-serif text-xs text-zinc-600 dark:text-zinc-400">{t.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white text-slate-900 border border-slate-300 p-6 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between pb-2">
            <DialogTitle className="text-xl font-bold font-serif text-black dark:text-white">
              Add Collaborator
            </DialogTitle>
            <DialogClose asChild>
              <button type="button" className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">Invite a team member to this company</DialogDescription>

          {inviteSent ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-serif text-sm font-semibold">Invite dispatched to {inviteEmail}</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4 font-sans text-xs">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@fintech.com"
                className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-none outline-none font-serif text-sm"
              />

              <p className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                *This invite only grants access to {companyName}. It does not grant access to your other companies.*
              </p>

              <button
                type="button"
                disabled={!inviteEmail.includes("@")}
                onClick={() => setInviteSent(true)}
                className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer"
              >
                SEND INVITE
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Reader / Markdown Detail Modal */}
      <Dialog open={!!activeDoc} onOpenChange={(v) => !v && setActiveDoc(null)}>
        <DialogContent className="sm:max-w-2xl bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <DialogTitle className="text-2xl font-bold font-serif text-black dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-500" />
              <span>{activeDoc?.title}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <SendToWritingStudioButton
                text={activeDoc?.content || activeDoc?.title || ""}
                title={activeDoc?.title}
                source="twin"
                label="Edit in Studio ➔"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
              />
              <DialogClose asChild>
                <button type="button" className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </DialogClose>
            </div>
          </div>
          <DialogDescription className="sr-only">Document contents</DialogDescription>
          <div className="prose prose-sm dark:prose-invert max-w-none font-serif pt-2 leading-relaxed [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:text-xs [&_p]:text-slate-700 dark:[&_p]:text-zinc-300 [&_ul]:space-y-2 [&_li]:text-xs [&_code]:font-mono [&_code]:text-[11px] [&_code]:bg-slate-100 dark:[&_code]:bg-zinc-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:border [&_code]:border-slate-200 dark:[&_code]:border-zinc-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeDoc?.content ?? ""}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu / Account Drawer Modal */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border border-slate-300 p-6 rounded-none shadow-2xl font-mono dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between pb-2">
            <DialogTitle className="text-lg font-bold uppercase tracking-wider text-black dark:text-white">
              Founder System Menu
            </DialogTitle>
            <DialogClose asChild>
              <button type="button" className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </DialogClose>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            Access advanced platform connectors and sub-modules.
          </DialogDescription>

          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <button
              onClick={() => { setMenuOpen(false); setSecondMeMemoryOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer bg-purple-500/5 font-semibold text-purple-600 dark:text-purple-400"
            >
              🧠 SecondMe Memory
            </button>
            <button
              onClick={() => { setMenuOpen(false); setCompanySettingsOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer"
            >
              ⚙️ Company Settings
            </button>
            <button
              onClick={() => { setMenuOpen(false); setVersionsOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer"
            >
              🔄 Version Rollbacks
            </button>
            <button
              onClick={() => { setMenuOpen(false); setDailyDigestOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer"
            >
              📑 CEO Daily Digest
            </button>
            <button
              onClick={() => { setMenuOpen(false); setVoiceCommanderOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer"
            >
              🎙️ Voice Commander
            </button>
            <button
              onClick={() => { setMenuOpen(false); setDokployOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer"
            >
              🐳 Dokploy / VPS Containers
            </button>
            <button
              onClick={() => { setMenuOpen(false); setMfsGatewayOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer"
            >
              💳 bKash / Nagad MFS
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Supporting Modals */}
      <SecondMeMemoryModal isOpen={secondMeMemoryOpen} onClose={() => setSecondMeMemoryOpen(false)} twinName={companyName} />
      <MfsGatewayModal open={mfsGatewayOpen} onOpenChange={setMfsGatewayOpen} />
      <ConnectExistingCompanyModal open={connectCompanyOpen} onOpenChange={setConnectCompanyOpen} />
      <VoiceCommanderModal open={voiceCommanderOpen} onOpenChange={setVoiceCommanderOpen} />
      <DailyDigestModal open={dailyDigestOpen} onOpenChange={setDailyDigestOpen} />
      <DokployMicroContainersModal open={dokployOpen} onOpenChange={setDokployOpen} />
    </div>
  );
}
