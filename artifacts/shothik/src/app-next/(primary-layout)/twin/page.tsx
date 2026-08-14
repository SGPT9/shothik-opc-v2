/**
 * Twin dashboard — Polsia-adapted 4-column workspace.
 * Frontend-only with realistic mock states (Phase 2 of the Shothik blueprint).
 *
 * Columns:
 *  - Left: agent status widget, Auto Mode toggle, progress stats, Team, subscription card
 *  - Center-left: task queue (state tabs) + Documents library with version history
 *  - Center-right: output channels (Publish / Share / Distribute)
 *  - Right: persistent first-person narrative feed + always-visible composer
 */
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SeededWorkspace from "@/components/twin/SeededWorkspace";
import { loadServerSeed, type SavedSeed } from "@/lib/twin/seed-client";
import { useSearchParams } from "@/lib/navigation";
import { useTwinData, type TwinTask, type TwinDoc, type TwinFeedEntry } from "@/hooks/useTwin";
import { saveOfflineTask, listOfflineTasks } from "@/lib/offline/offline-storage";
import { AutonomousDeliveryLoop } from "@/lib/autonomous/autonomous-delivery-loop";
import { DailyDigestModal } from "@/components/twin/DailyDigestModal";
import { ConnectExistingCompanyModal } from "@/components/twin/ConnectExistingCompanyModal";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, CheckCircle } from "lucide-react";
import {
  Sparkles,
  Plus,
  Send,
  Search,
  PenLine,
  FileText,
  BookOpen,
  Share2,
  Globe,
  Mail,
  Clock,
  RefreshCcw,
  Users,
  ChevronRight,
  GitBranch,
  History,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ListChecks,
  Zap,
  CreditCard,
  Mic,
  RotateCcw,
  Compass,
  TrendingUp,
  Play,
  Menu,
  Layers,
  Settings,
  HelpCircle,
  Gift,
  User,
  Download,
  LogOut,
  Building2,
  ExternalLink,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { WayfinderBoard } from "@/components/chat/WayfinderBoard";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

type TaskStatus = "todo" | "in_progress" | "completed" | "rejected" | "failed";
type TaskCategory = "Research" | "Draft" | "Edit" | "Publish";

interface TwinTaskMock {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  schedule?: string;
  cost: string;
  status: TaskStatus;
  failureReason?: string;
}

const MOCK_TASKS: TwinTaskMock[] = [
  {
    id: "t1",
    title: "Verify sources for Chapter 4",
    description: "Cross-check the 9 citations flagged during last night's research pass.",
    category: "Research",
    schedule: "Tonight",
    cost: "~12 credits",
    status: "todo",
  },
  {
    id: "t2",
    title: "Outline Part II — 'The Turn'",
    description: "Draft a 3-act outline from your margin notes and the approved synopsis.",
    category: "Draft",
    schedule: "Tonight",
    cost: "~20 credits",
    status: "todo",
  },
  {
    id: "t3",
    title: "Weekly progress report",
    description: "Summarize what shipped this week in plain English plus the numbers.",
    category: "Edit",
    schedule: "Recurring · Sun",
    cost: "~4 credits",
    status: "todo",
  },
  {
    id: "t4",
    title: "Drafting Chapter 3 — second pass",
    description: "Tightening dialogue in scenes 2 and 5, keeping your voice profile.",
    category: "Draft",
    cost: "~25 min left",
    status: "in_progress",
  },
  {
    id: "t5",
    title: "Researching comparable titles",
    description: "Scanning 2024–2026 releases in your genre for positioning notes.",
    category: "Research",
    cost: "~10 min left",
    status: "in_progress",
  },
  {
    id: "t6",
    title: "Chapter 2 line edit",
    description: "Fixed 41 style inconsistencies, preserved all flagged passages.",
    category: "Edit",
    cost: "18 credits",
    status: "completed",
  },
  {
    id: "t7",
    title: "Source verification — Chapter 3",
    description: "Verified 12 of 12 sources; replaced one dead link with an archived copy.",
    category: "Research",
    cost: "9 credits",
    status: "completed",
  },
  {
    id: "t8",
    title: "Day 6 — Progress Report",
    description: "What shipped: 4,120 words. The math: 2 chapters at 92% confidence.",
    category: "Edit",
    cost: "3 credits",
    status: "completed",
  },
  {
    id: "t9",
    title: "Auto-post excerpt to socials",
    description: "You rejected this — Distribute stays off until you turn it on.",
    category: "Publish",
    cost: "—",
    status: "rejected",
  },
  {
    id: "t10",
    title: "Import notes from old drive folder",
    description: "The folder link expired before I could finish syncing. Want me to retry?",
    category: "Research",
    cost: "0 credits charged",
    status: "failed",
    failureReason: "Source link expired",
  },
];

interface TwinDocMock {
  id: string;
  title: string;
  kind: "Research Report" | "Chapter Draft" | "Outline" | "Progress Report" | "Business Plan";
  updated: string;
  versions: { id: string; message: string; time: string; current?: boolean }[];
  /** Markdown body for real (server-persisted) documents. */
  content?: string;
}

const MOCK_DOCS: TwinDocMock[] = [
  {
    id: "d1",
    title: "Chapter 3 — Draft",
    kind: "Chapter Draft",
    updated: "14m ago",
    versions: [
      { id: "v4", message: "Second pass: tightened dialogue in scenes 2 & 5", time: "14m ago", current: true },
      { id: "v3", message: "Applied your margin notes from Tuesday", time: "Yesterday, 11:42 PM" },
      { id: "v2", message: "First full draft from approved outline", time: "Aug 3, 10:15 PM" },
      { id: "v1", message: "Initial scaffold from Chapter 3 outline", time: "Aug 2, 9:03 PM" },
    ],
  },
  {
    id: "d2",
    title: "Comparable Titles — Research Report",
    kind: "Research Report",
    updated: "1h ago",
    versions: [
      { id: "v2", message: "Added 6 titles from 2026 releases, updated positioning notes", time: "1h ago", current: true },
      { id: "v1", message: "First scan: 14 comparable titles with verified sales data", time: "Aug 4, 2:20 AM" },
    ],
  },
  {
    id: "d3",
    title: "Part II Outline — Now / Next / Later",
    kind: "Outline",
    updated: "Yesterday",
    versions: [
      { id: "v3", message: "Moved the reveal from Next to Now per your note", time: "Yesterday, 8:12 PM", current: true },
      { id: "v2", message: "Split act two into two beats", time: "Aug 3, 7:44 PM" },
      { id: "v1", message: "Initial Now/Next/Later roadmap", time: "Aug 2, 11:58 PM" },
    ],
  },
  {
    id: "d4",
    title: "Day 6 — Progress Report",
    kind: "Progress Report",
    updated: "Yesterday",
    versions: [
      { id: "v1", message: "What Shipped + The Math for Aug 4", time: "Yesterday, 6:00 AM", current: true },
    ],
  },
];

interface FeedEntry {
  id: string;
  time: string;
  text: string;
  fromUser?: boolean;
}

const MOCK_FEED: FeedEntry[] = [
  {
    id: "f1",
    time: "9:14 PM",
    text: "Finished verifying 12 sources for Chapter 3. One link was dead, so I swapped in an archived copy — flagged it in the research report if you want to double-check.",
  },
  {
    id: "f2",
    time: "9:31 PM",
    text: "Started the second pass on Chapter 3. I'm tightening dialogue in scenes 2 and 5 and leaving everything you marked \"keep\" untouched.",
  },
  {
    id: "f3",
    time: "10:02 PM",
    text: "While that runs, I scanned this year's releases in your genre. Found 6 new comparable titles — the full breakdown is in the research report.",
  },
  {
    id: "f4",
    time: "10:05 PM",
    fromUser: true,
    text: "Great — hold the outline for Part II until I send you my notes tomorrow.",
  },
  {
    id: "f5",
    time: "10:06 PM",
    text: "Got it. I've moved the Part II outline to tonight's queue but paused it until your notes arrive. Chapter 3's second pass should be done in about 25 minutes — want me to start the line edit right after, or wait for you?",
  },
];

const MOCK_TEAM = [
  { name: "Nadia Rahman", role: "Editor", initials: "NR" },
  { name: "Sam Osei", role: "Reviewer", initials: "SO" },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

const CATEGORY_STYLES: Record<TaskCategory, string> = {
  Research: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Draft: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Edit: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Publish: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const CATEGORY_ICONS: Record<TaskCategory, React.ElementType> = {
  Research: Search,
  Draft: PenLine,
  Edit: ListChecks,
  Publish: Globe,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function PanelCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/80 bg-card p-4", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Left column                                                         */
/* ------------------------------------------------------------------ */

function AgentStatusWidget({ autoMode }: { autoMode: boolean }) {
  const [activeTaskLabel] = useState("Shipping v2.5.0 auth & billing engine to Dokploy…");
  return (
    <PanelCard className="border-indigo-500/30 bg-gradient-to-br from-background to-indigo-950/20">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
          <Sparkles className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-60",
                autoMode ? "animate-ping bg-emerald-400" : "bg-muted-foreground/40"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-3 w-3 rounded-full border-2 border-card",
                autoMode ? "bg-emerald-500" : "bg-muted-foreground/50"
              )}
            />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Polsia AI Co-Founder</p>
            <Badge variant="outline" className={cn("text-[9px] font-mono px-1.5 py-0", autoMode ? "border-emerald-500/40 text-emerald-400" : "text-muted-foreground")}>
              {autoMode ? "Online · 24/7" : "Idle"}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground mt-0.5" data-testid="text-twin-status">
            {autoMode ? activeTaskLabel : "Standing by — prompt me to code, fix, or grow."}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <a
          href="/live"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-1.5 text-xs font-semibold text-indigo-400 transition-colors hover:bg-indigo-500/20"
        >
          <Radio className="h-3 w-3 animate-pulse text-indigo-400" /> Watch Live Feed
        </a>
        <a
          href="https://verifiq.polsia.app"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Globe className="h-3 w-3 text-emerald-400" /> Open App
        </a>
      </div>
    </PanelCard>
  );
}

function AutoModeCard({
  autoMode,
  onToggle,
}: {
  autoMode: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [duration, setDuration] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [nightshift, setNightshift] = useState(true);

  return (
    <PanelCard className="border-border/80">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-xs font-semibold text-foreground">God Mode Autonomy</p>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {autoMode
              ? `Uninterrupted autonomous delivery for ${duration}.`
              : "Pauses when founder is offline."}
          </p>
        </div>
        <Switch
          checked={autoMode}
          onCheckedChange={onToggle}
          aria-label="Toggle Auto Mode"
          data-testid="switch-auto-mode"
        />
      </div>

      {autoMode && (
        <div className="mt-3 space-y-2.5 pt-2.5 border-t border-border/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Autonomy Duration:</span>
            <div className="flex gap-1">
              {(["1h", "6h", "24h", "7d"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition",
                    duration === d
                      ? "bg-indigo-600 text-white"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-muted-foreground">🌙 Nightshift Worker:</span>
            <button
              onClick={() => setNightshift(!nightshift)}
              className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded border transition",
                nightshift
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  : "border-border text-muted-foreground bg-muted/40"
              )}
            >
              {nightshift ? "Execute 1 Task / Night" : "Reporting Only"}
            </button>
          </div>
        </div>
      )}
    </PanelCard>
  );
}

const STARTUP_TRACTION_STATS = [
  { label: "Tasks Shipped", value: "42" },
  { label: "Live Visitors", value: "1,420" },
  { label: "System Uptime", value: "99.98%" },
];

function ProgressStatsCard() {
  return (
    <PanelCard>
      <div className="flex items-center justify-between">
        <SectionLabel>Startup Traction</SectionLabel>
        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {STARTUP_TRACTION_STATS.map((s) => (
          <div key={s.label} className="min-w-0">
            <p className="text-base font-semibold tabular-nums text-foreground">{s.value}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" /> Updated 2m ago via Dokploy PaaS
      </p>
    </PanelCard>
  );
}

function TeamCard({ onInvite }: { onInvite: () => void }) {
  return (
    <PanelCard>
      <div className="flex items-center justify-between">
        <SectionLabel>Team · This project</SectionLabel>
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-3 space-y-2">
        {MOCK_TEAM.map((m) => (
          <div key={m.name} className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-medium text-foreground">
              {m.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{m.name}</p>
              <p className="text-[11px] text-muted-foreground">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full rounded-xl text-xs"
        onClick={onInvite}
        data-testid="button-add-collaborator"
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Collaborator
      </Button>
    </PanelCard>
  );
}

function InviteModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setSent(false);
          setEmail("");
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogTitle>Add Collaborator</DialogTitle>
        <DialogDescription className="sr-only">Invite a collaborator to this project</DialogDescription>
        {sent ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm text-foreground">Invite sent to {email}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborator@email.com"
              className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="input-invite-email"
            />
            <p className="rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              This invite only grants access to <span className="font-medium text-foreground">this project</span>.
              It does not grant access to your other books or research spaces.
            </p>
            <Button
              className="w-full rounded-xl"
              disabled={!email.includes("@")}
              onClick={() => setSent(true)}
              data-testid="button-send-invite"
            >
              <Mail className="mr-1.5 h-4 w-4" /> Send Invite
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionCard() {
  return (
    <PanelCard className="border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Your plan lapsed 2 days ago</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Everything here stays visible and your drafts are safe — but Twin has paused new work.
          </p>
          <div className="mt-3 space-y-1.5">
            <Button size="sm" className="w-full rounded-xl text-xs" data-testid="button-resubscribe">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Resubscribe to keep Twin working
            </Button>
            <Button variant="ghost" size="sm" className="w-full rounded-xl text-xs text-muted-foreground">
              Keep drafts saved — $2/mo
            </Button>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

function CashFlowPnlCard({ onOpenDailyDigest }: { onOpenDailyDigest?: () => void }) {
  return (
    <PanelCard className="border-emerald-500/30 bg-gradient-to-br from-background to-emerald-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Cash Flow & P&L</p>
            <p className="text-[10px] font-mono text-emerald-400">65.2% Net Margin · Live</p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-[10px] text-emerald-400">
          Profitable
        </Badge>
      </div>

      <div className="mt-3 space-y-1.5 font-mono text-[11px]">
        <div className="flex justify-between text-muted-foreground">
          <span>Gross Revenue:</span>
          <span className="font-bold text-foreground">৳45,000</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>bKash Fee (1.85%):</span>
          <span className="text-rose-400">-৳832.50</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Meta Ads ($50/day):</span>
          <span className="text-rose-400">-৳6,000</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Dokploy Hosting:</span>
          <span className="text-rose-400">-৳120</span>
        </div>
        <div className="pt-1.5 border-t border-border flex justify-between font-bold text-xs">
          <span className="text-foreground">Net Monthly Profit:</span>
          <span className="text-emerald-400">৳38,047.50</span>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenDailyDigest}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
            data-testid="button-open-daily-digest"
          >
            <Mail className="h-3 w-3" />
            <span>Daily CEO Briefing (08:00 AM)</span>
          </button>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/* Center-left: task queue + documents                                 */
/* ------------------------------------------------------------------ */

const STATUS_TABS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "failed", label: "Failed" },
];

function TaskCard({ task, onRun }: { task: TwinTaskMock; onRun?: (task: TwinTaskMock) => void }) {
  const Icon = CATEGORY_ICONS[task.category];
  return (
    <div
      className="rounded-xl border border-border/80 bg-background p-3 transition-colors hover:border-muted-foreground/30"
      data-testid={`card-task-${task.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
        {task.status === "in_progress" && (
          <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-indigo-500" />
        )}
        {task.status === "completed" && (
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
        )}
        {task.status === "rejected" && (
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        {task.status === "failed" && (
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{task.description}</p>
      {task.failureReason && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
          <AlertTriangle className="h-3 w-3" /> {task.failureReason}
        </p>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px]",
            CATEGORY_STYLES[task.category]
          )}
        >
          <Icon className="h-2.5 w-2.5" /> {task.category}
        </span>
        {task.schedule && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {task.schedule.startsWith("Recurring") ? (
              <RefreshCcw className="h-2.5 w-2.5" />
            ) : (
              <Clock className="h-2.5 w-2.5" />
            )}
            {task.schedule}
          </span>
        )}
        <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {task.cost}
        </span>
        {task.status !== "completed" && (
          <button
            type="button"
            onClick={() => onRun?.(task)}
            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold hover:bg-indigo-500/20 transition"
            data-testid={`button-run-now-${task.id}`}
          >
            <Zap className="h-2.5 w-2.5" /> Run Now
          </button>
        )}
        {task.status === "failed" && (
          <button className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-indigo-500 hover:bg-indigo-500/10">
            <RotateCcw className="h-2.5 w-2.5" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

function NewTaskModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (t: TwinTaskMock) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Research");
  const [tonight, setTonight] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>New Task</DialogTitle>
        <DialogDescription className="sr-only">Queue a new goal for your Twin</DialogDescription>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">What should Twin work on?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Research publishers for my genre"
              className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="input-new-task-title"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_ICONS) as TaskCategory[]).map((c) => {
                const Icon = CATEGORY_ICONS[c];
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      category === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/40"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm text-foreground">Run tonight</span>
            <Switch checked={tonight} onCheckedChange={setTonight} />
          </label>
          <Button
            className="w-full rounded-xl"
            disabled={!title.trim()}
            onClick={() => {
              onCreate({
                id: `t-${Date.now()}`,
                title: title.trim(),
                description: "Queued by you — Twin will pick this up next.",
                category,
                schedule: tonight ? "Tonight" : undefined,
                cost: "~10 credits",
                status: "todo",
              });
              setTitle("");
              onOpenChange(false);
            }}
            data-testid="button-create-task"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add to queue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ManageTasksModal({
  open,
  onOpenChange,
  tasks,
  onRun,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tasks: TwinTaskMock[];
  onRun?: (task: TwinTaskMock) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle>Manage Tasks</DialogTitle>
        <DialogDescription className="sr-only">Full lifecycle view of all Twin tasks</DialogDescription>
        <div className="space-y-5">
          {STATUS_TABS.map((tab) => {
            const group = tasks.filter((t) => t.status === tab.key);
            if (group.length === 0) return null;
            return (
              <div key={tab.key}>
                <div className="mb-2 flex items-center gap-2">
                  <SectionLabel>{tab.label}</SectionLabel>
                  <span className="font-mono text-[10px] text-muted-foreground">{group.length}</span>
                </div>
                <div className="space-y-2">
                  {group.map((t) => (
                    <TaskCard key={t.id} task={t} onRun={onRun} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskQueue({
  tasks,
  onNewTask,
  onManage,
  onRun,
}: {
  tasks: TwinTaskMock[];
  onNewTask: () => void;
  onManage: () => void;
  onRun?: (task: TwinTaskMock) => void;
}) {
  const [tab, setTab] = useState<TaskStatus>("in_progress");
  const [viewMode, setViewMode] = useState<"queue" | "wayfinder">("queue");
  const visible = tasks.filter((t) => t.status === tab);

  return (
    <PanelCard className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <SectionLabel>Work Queue</SectionLabel>
          <div className="flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setViewMode("queue")}
              className={cn(
                "px-2 py-0.5 text-[10px] font-semibold rounded transition-colors",
                viewMode === "queue" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("wayfinder")}
              className={cn(
                "px-2 py-0.5 text-[10px] font-semibold rounded transition-colors flex items-center gap-1",
                viewMode === "wayfinder" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Compass className="w-3 h-3" />
              <span>Wayfinder</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-xs" onClick={onManage} data-testid="button-manage-tasks">
            <ListChecks className="mr-1 h-3.5 w-3.5" /> Manage
          </Button>
          <Button size="sm" className="h-7 rounded-lg px-2 text-xs" onClick={onNewTask} data-testid="button-new-task">
            <Plus className="mr-1 h-3.5 w-3.5" /> New Task
          </Button>
        </div>
      </div>

      {viewMode === "wayfinder" ? (
        <div className="mt-3">
          <WayfinderBoard
            destination="Autonomous Polsia OPC Revenue & Launch Frontier"
            initialTickets={tasks.map((t, idx) => ({
              id: t.id,
              title: t.title,
              type: t.category === "Research" ? "research" : t.category === "Publish" ? "prototype" : "task",
              status: t.status === "completed" ? "closed" : "open",
              resolution: t.status === "completed" ? "Executed by Nightshift" : undefined,
              blockedBy: idx > 0 && t.status !== "completed" ? [tasks[idx - 1].title] : [],
            }))}
          />
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1">
            {STATUS_TABS.map((t) => {
              const count = tasks.filter((x) => x.status === t.key).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "rounded-lg px-2 py-1 font-mono text-[10px] transition-colors",
                    tab === t.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                  data-testid={`tab-tasks-${t.key}`}
                >
                  {t.label} · {count}
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-2">
            {visible.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Nothing here right now.
              </p>
            ) : (
              visible.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </>
      )}
    </PanelCard>
  );
}

const DOC_ICONS: Record<TwinDocMock["kind"], React.ElementType> = {
  "Research Report": Search,
  "Chapter Draft": BookOpen,
  Outline: ListChecks,
  "Progress Report": FileText,
  "Business Plan": FileText,
};

function DocumentsLibrary({
  docs,
  onOpenVersions,
}: {
  docs: TwinDocMock[];
  onOpenVersions: (doc: TwinDocMock) => void;
}) {
  return (
    <PanelCard>
      <SectionLabel>Documents</SectionLabel>
      <div className="mt-3 space-y-1.5">
        {docs.map((doc) => {
          const Icon = DOC_ICONS[doc.kind];
          return (
            <button
              key={doc.id}
              onClick={() => onOpenVersions(doc)}
              className="flex w-full items-center gap-2.5 rounded-xl border border-border/80 bg-background p-2.5 text-left transition-colors hover:border-muted-foreground/30"
              data-testid={`card-doc-${doc.id}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{doc.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {doc.kind} · {doc.versions.length} version{doc.versions.length > 1 ? "s" : ""} · {doc.updated}
                </p>
              </div>
              <History className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </PanelCard>
  );
}

function VersionHistoryModal({
  doc,
  onClose,
}: {
  doc: TwinDocMock | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!doc} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" /> {doc?.title}
        </DialogTitle>
        <DialogDescription className="sr-only">Version history</DialogDescription>
        <div className="space-y-0">
          {doc?.versions.map((v, i) => (
            <div key={v.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < doc.versions.length - 1 && (
                <span className="absolute left-[7px] top-5 h-full w-px bg-border" />
              )}
              <span
                className={cn(
                  "mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2",
                  v.current ? "border-indigo-500 bg-indigo-500/20" : "border-border bg-background"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{v.message}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{v.time}</p>
              </div>
              {v.current ? (
                <Badge variant="secondary" className="h-5 shrink-0 rounded-md font-mono text-[10px]">
                  Current
                </Badge>
              ) : (
                <Button variant="ghost" size="sm" className="h-6 shrink-0 rounded-md px-2 font-mono text-[10px] text-muted-foreground">
                  <RotateCcw className="mr-1 h-2.5 w-2.5" /> Revert
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Center-right: output channels                                       */
/* ------------------------------------------------------------------ */

const OUTPUT_CHANNELS = [
  {
    id: "publish",
    title: "Publish",
    icon: BookOpen,
    accent: "text-emerald-500 bg-emerald-500/10",
    description: "Push a finished chapter or manuscript to Books, Marketplace & PublishDrive.",
    status: "Chapter 2 published · Aug 3",
    action: "Open Publishing Suite",
    href: "/writing-studio?intent=book",
    ready: true,
  },
  {
    id: "share",
    title: "Share",
    icon: Share2,
    accent: "text-indigo-500 bg-indigo-500/10",
    description: "Send the latest manuscript draft to collaborators or reviewers.",
    status: "Draft sent to 2 reviewers · Yesterday",
    action: "Share Draft",
    href: "/writing-studio?projects=1",
    ready: true,
  },
  {
    id: "distribute",
    title: "Distribute",
    icon: Globe,
    accent: "text-cyan-500 bg-cyan-500/10",
    description: "Auto-post book excerpts and summaries to connected socials and community.",
    status: "Off — turn on when you're ready",
    action: "Turn on",
    ready: false,
  },
];

function OutputChannels() {
  const [distributeOn, setDistributeOn] = useState(false);
  const [adDailyBudget, setAdDailyBudget] = useState(50);
  const [adRunning, setAdRunning] = useState(false);

  const adInventory = Math.round(adDailyBudget * 0.85);
  const polsiaFee = Math.round(adDailyBudget * 0.15);
  const estImpressions = (adDailyBudget * 280).toLocaleString();
  const estClicks = (adDailyBudget * 8.4).toFixed(0);

  return (
    <div className="space-y-3">
      <SectionLabel>Distribution & Growth Channels</SectionLabel>

      {/* Meta Ads Autonomous Growth Loop Card */}
      <PanelCard className="p-3.5 border-indigo-500/30 bg-gradient-to-br from-background to-indigo-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Meta Ads Growth Loop</p>
              <p className="text-[10px] font-mono text-indigo-400">85/15 Fee Split · Auto-Optimized</p>
            </div>
          </div>
          <Badge variant={adRunning ? "default" : "outline"} className={adRunning ? "bg-emerald-600 text-white text-[10px]" : "text-[10px]"}>
            {adRunning ? "Campaign Active" : "Standby"}
          </Badge>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Daily Ad Spend:</span>
            <span className="font-mono font-bold text-foreground">${adDailyBudget}/day</span>
          </div>

          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={adDailyBudget}
            onChange={(e) => setAdDailyBudget(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-muted/40 p-2 rounded-lg border border-border/60">
            <div>Ad Spend: <strong className="text-foreground">${adInventory}</strong></div>
            <div>Polsia Fee: <strong className="text-foreground">${polsiaFee}</strong></div>
            <div>Est. Impressions: <strong className="text-indigo-400">{estImpressions}</strong></div>
            <div>Est. Clicks: <strong className="text-indigo-400">{estClicks}</strong></div>
          </div>

          <Button
            size="sm"
            onClick={() => setAdRunning(!adRunning)}
            className={cn(
              "w-full text-xs font-semibold mt-1",
              adRunning ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
          >
            {adRunning ? "Pause Campaign" : `Deploy $${adDailyBudget}/day Autonomous Growth`}
          </Button>
        </div>
      </PanelCard>

      {OUTPUT_CHANNELS.map((ch) => {
        const Icon = ch.icon;
        const isDistribute = ch.id === "distribute";
        return (
          <PanelCard key={ch.id} className="p-3.5">
            <div className="flex items-center gap-2.5">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", ch.accent)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">{ch.title}</p>
              {isDistribute && (
                <span className="ml-auto">
                  <Switch
                    checked={distributeOn}
                    onCheckedChange={setDistributeOn}
                    aria-label="Toggle Distribute"
                    data-testid="switch-distribute"
                  />
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ch.description}</p>
            <p className="mt-2 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              {ch.ready || (isDistribute && distributeOn) ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {isDistribute && distributeOn ? "On — Twin will ask before every post" : ch.status}
            </p>
            {!isDistribute && (
              <a
                href={ch.href}
                className="mt-2.5 inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                data-testid={`button-channel-${ch.id}`}
              >
                {ch.action} <ChevronRight className="ml-1 h-3 w-3" />
              </a>
            )}
          </PanelCard>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right column: narrative feed + composer                             */
/* ------------------------------------------------------------------ */

function NarrativeFeed({ feed = MOCK_FEED }: { feed?: FeedEntry[] }) {
  const [entries, setEntries] = useState<FeedEntry[]>(feed);
  const [draft, setDraft] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEntries(feed);
  }, [feed]);

  const send = (overrideText?: string) => {
    const text = (overrideText ?? draft).trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setEntries((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, time, text, fromUser: true },
      {
        id: `a-${Date.now()}`,
        time,
        text: `Acknowledged: "${text}". Running AST resolution & testing sandbox in background…`,
      },
    ]);
    if (!overrideText) setDraft("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const QUICK_PROMPTS = [
    "🚀 Deploy latest build",
    "🛡️ Run SRE self-heal",
    "📊 Audit P&L & Meta Ads",
    "🐦 Draft product tweet",
  ];

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border/80 bg-card">
      <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <SectionLabel>Polsia Live Stream</SectionLabel>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400">
            v2.5.0 OPC
          </span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Autopilot Working
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {entries.map((e) => (
          <div key={e.id} className={cn("flex flex-col gap-1", e.fromUser && "items-end")}>
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <span>{e.fromUser ? "Founder" : "Polsia Co-Founder"} · {e.time}</span>
              {!e.fromUser && (
                <span className="px-1.5 py-0.2 rounded bg-muted/60 text-[9px] text-emerald-400/90 font-mono">
                  THOUGHT 1.8s
                </span>
              )}
            </div>
            <p
              className={cn(
                "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                e.fromUser
                  ? "rounded-br-md bg-indigo-600 text-white font-medium shadow-sm"
                  : "rounded-bl-md bg-muted/50 border border-border/50 text-foreground"
              )}
            >
              {e.text}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border/80 p-3 space-y-2">
        {/* Quick action prompt pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => send(prompt)}
              className="shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/40">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Instruct or redirect Polsia Co-Founder…"
            className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            data-testid="input-twin-composer"
          />
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
              isRecording ? "bg-rose-500 text-white animate-pulse" : "text-muted-foreground hover:bg-muted"
            )}
            aria-label="Voice input"
            data-testid="button-twin-voice"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            onClick={() => send()}
            disabled={!draft.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-opacity disabled:opacity-40 hover:bg-indigo-500"
            aria-label="Send"
            data-testid="button-twin-send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function TwinLandingPage({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-12">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand/10 border border-brand/20 shadow-sm">
          <Brain className="h-12 w-12 text-brand" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
          Start your company with an AI Cofounder
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Twin turns ideas, research, and plans into a working company workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
        <Card className="border-border/50 bg-background shadow-sm hover:border-brand/30 transition-colors group">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/5 group-hover:bg-brand/10 transition-colors">
              <FileText className="h-6 w-6 text-brand" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Create your business plan
            </h3>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background shadow-sm hover:border-brand/30 transition-colors group">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/5 group-hover:bg-brand/10 transition-colors">
              <CheckCircle className="h-6 w-6 text-brand" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Get your first tasks
            </h3>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background shadow-sm hover:border-brand/30 transition-colors group">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/5 group-hover:bg-brand/10 transition-colors">
              <BookOpen className="h-6 w-6 text-brand" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Organize decisions and documents
            </h3>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
        <Button
          size="lg"
          className="w-full bg-brand hover:bg-brand/90 text-white font-medium text-base shadow-sm"
          onClick={onStart}
        >
          <Brain className="h-5 w-5 mr-2" />
          Start from this idea
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full font-medium text-base shadow-sm"
          onClick={() => { window.location.href = "/agents/chat"; }}
        >
          Import from chat
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground mt-2 sm:mt-0 font-medium"
          onClick={onSkip}
        >
          Open existing workspace
        </Button>
      </div>
    </div>
  );
}

export default function TwinPage() {
  const searchParams = useSearchParams();
  const fromChat = searchParams.get("fromChat");

  const [hasSeenLanding, setHasSeenLanding] = useState<boolean | null>(null);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("twin_landing_seen");
    const seededActive = localStorage.getItem("twin_seeded_active");

    if (fromChat || seededActive === "true") {
      setIsSeeded(true);
      setHasSeenLanding(true);
      localStorage.setItem("twin_seeded_active", "true");
      localStorage.setItem("twin_landing_seen", "true");
      if (fromChat) {
        // Remember the originating conversation, then strip the query so a
        // later revisit doesn't force the seeded overlay again.
        localStorage.setItem("twin_seed_from_chat", fromChat);
        window.history.replaceState(null, "", window.location.pathname);
      }
    } else {
      setHasSeenLanding(seen === "true");
    }
  }, [fromChat]);

  if (hasSeenLanding === false && !fromChat) {
    return (
      <TwinLandingPage
        onStart={() => {
          localStorage.setItem("twin_landing_seen", "true");
          localStorage.setItem("twin_seeded_active", "true");
          setIsSeeded(true);
          setHasSeenLanding(true);
        }}
        onSkip={() => {
          localStorage.setItem("twin_landing_seen", "true");
          setHasSeenLanding(true);
        }}
      />
    );
  }

  if (isSeeded) {
    return (
      <div className="min-h-[calc(100dvh-64px)] bg-background">
        <SeededWorkspace
          chatConversationId={fromChat || localStorage.getItem("twin_seed_from_chat") || undefined}
          onDismiss={() => {
            setIsSeeded(false);
            localStorage.removeItem("twin_seeded_active");
          }}
        />
      </div>
    );
  }

  return <TwinDashboardPage />;
}

function seedToTasks(seed: SavedSeed): TwinTaskMock[] {
  return seed.tasks.map((t) => ({
    id: `seed-${t.id}`,
    title: t.title,
    description: `Starter task for ${seed.companyName}, generated from your chat.`,
    category: "Draft" as TaskCategory,
    cost: "—",
    status: t.completed ? ("completed" as TaskStatus) : ("todo" as TaskStatus),
  }));
}

function seedToDoc(seed: SavedSeed): TwinDocMock {
  return {
    id: "seed-business-plan",
    title: `${seed.companyName} — Business Plan`,
    kind: "Business Plan",
    updated: new Date(seed.updatedAt).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
    versions: [
      {
        id: "v1",
        message: "Generated from your chat conversation",
        time: new Date(seed.updatedAt).toLocaleString(),
        current: true,
      },
    ],
    content: seed.businessPlan,
  };
}

const ACCOUNT_DRAWER_ITEMS = [
  { label: 'My Portfolio', icon: Layers, href: '/portfolio', badge: '3 Companies' },
  { label: 'New Company', icon: Building2, href: '/twin/new', badge: '$15/mo' },
  { label: 'Credits & Usage', icon: Zap, href: '/billing/credits', badge: '500 Left' },
  { label: 'Upgrade Plan', icon: TrendingUp, href: '/pricing', badge: 'Pro' },
  { label: 'Manage Billing', icon: CreditCard, href: '/billing' },
  { label: 'Company Settings', icon: Settings, href: '/settings/company' },
  { label: 'Profile Settings', icon: User, href: '/settings/profile' },
  { label: 'Email Preferences', icon: Mail, href: '/settings/email' },
  { label: 'About Shothik', icon: Brain, href: '/about' },
  { label: 'Giftshop', icon: Gift, href: '/giftshop' },
  { label: 'Doctrine', icon: BookOpen, href: '/doctrine' },
  { label: 'FAQ & Docs', icon: HelpCircle, href: '/docs' },
  { label: 'Download Code', icon: Download, href: '/export/code', badge: 'ZIP' },
  { label: 'Refer & Earn', icon: Share2, href: '/refer', badge: '30% RevShare' },
  { label: 'Logout', icon: LogOut, href: '/auth/logout' },
];

function AccountDrawerModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0b101b] border-slate-800 text-slate-200">
        <DialogTitle className="flex items-center justify-between text-base text-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Account & Doctrine (15 Items)</span>
          </div>
          <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-400">
            500 Credits Active
          </Badge>
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-400">
          Platform-wide account settings, billing, company slots, and developer doctrine.
        </DialogDescription>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 max-h-[60vh] overflow-y-auto pr-1">
          {ACCOUNT_DRAWER_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-200 font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlatformTopBar({
  onOpenAccountDrawer,
  onConnectWebsite,
}: {
  onOpenAccountDrawer: () => void;
  onConnectWebsite?: () => void;
}) {
  const [activeCompany, setActiveCompany] = useState('VerifiQ AI (Active)');
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80 px-1">
      <div className="flex items-center gap-3">
        <select
          value={activeCompany}
          onChange={(e) => {
            if (e.target.value === "+ New Company") {
              if (typeof window !== "undefined") {
                window.location.href = "/twin/new";
              }
            } else if (e.target.value === "+ Connect Website") {
              onConnectWebsite?.();
            } else {
              setActiveCompany(e.target.value);
            }
          }}
          className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm outline-none"
        >
          <option value="VerifiQ AI (Active)">🏢 VerifiQ AI (Active)</option>
          <option value="Acme SaaS">🏢 Acme SaaS</option>
          <option value="BookStudio">🏢 BookStudio</option>
          <option value="+ Connect Website">🌐 + Connect Existing Website (BYOW)</option>
          <option value="+ New Company">✨ + New Company Slot ($15/mo)</option>
        </select>
        <Button
          size="sm"
          variant="outline"
          onClick={onConnectWebsite}
          className="hidden md:flex h-8 rounded-xl text-xs gap-1.5 font-semibold border-cyan-500/30 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10"
          data-testid="button-connect-existing-website"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Connect Website</span>
        </Button>
        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Autonomous Co-Founder Online
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5 font-mono border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
          <Zap className="h-3.5 w-3.5" />
          <span>500 Credits</span>
        </Button>
        <Button size="sm" variant="outline" onClick={onOpenAccountDrawer} className="h-8 rounded-xl text-xs gap-1.5">
          <Menu className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Account (15)</span>
        </Button>
      </div>
    </div>
  );
}

function TwinDashboardPage() {
  const [autoMode, setAutoMode] = useState(true);
  const { tasks, docs, feed, setTasks, setDocs, setFeed } = useTwinData(
    MOCK_TASKS as TwinTask[],
    MOCK_DOCS as TwinDoc[],
    MOCK_FEED as TwinFeedEntry[]
  );
  const [showNewTask, setShowNewTask] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [showDailyDigest, setShowDailyDigest] = useState(false);
  const [showConnectCompany, setShowConnectCompany] = useState(false);
  const [versionDoc, setVersionDoc] = useState<TwinDocMock | null>(null);
  const [contentDoc, setContentDoc] = useState<TwinDocMock | null>(null);

  // Hydrate from Offline Storage / Server Seed
  useEffect(() => {
    let cancelled = false;
    const offlineTasks = listOfflineTasks();
    if (offlineTasks.length > 0) {
      setTasks(
        offlineTasks.map((t) => ({
          id: t.id,
          title: t.title,
          category: (t.category || "Research") as TaskCategory,
          status: (t.status || "todo") as TaskStatus,
          cost: t.cost || "5 credits",
        }))
      );
    } else {
      void loadServerSeed().then((seed) => {
        if (cancelled || !seed) return;
        if (seed.tasks.length) setTasks(seedToTasks(seed));
        if (seed.businessPlan) setDocs([seedToDoc(seed), ...MOCK_DOCS]);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateTask = (newTask: TwinTaskMock) => {
    saveOfflineTask({
      id: newTask.id,
      title: newTask.title,
      category: newTask.category,
      status: newTask.status,
      cost: newTask.cost,
      updatedAt: Date.now(),
    });
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleRunTask = async (taskToRun: TwinTaskMock) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskToRun.id ? { ...t, status: "in_progress" as TaskStatus } : t))
    );

    const deliveryResult = await AutonomousDeliveryLoop.runUnblockedTask({
      id: taskToRun.id,
      title: taskToRun.title,
      dependencies: [],
      priority: 1,
      creditCost: 5,
    });

    const completedTask: TwinTaskMock = {
      ...taskToRun,
      status: "completed" as TaskStatus,
    };

    saveOfflineTask({
      id: completedTask.id,
      title: completedTask.title,
      category: completedTask.category,
      status: "completed",
      cost: completedTask.cost,
      updatedAt: Date.now(),
    });

    setTasks((prev) =>
      prev.map((t) => (t.id === taskToRun.id ? completedTask : t))
    );

    setFeed((prev) => [
      ...prev,
      {
        id: `feed-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        text: `🚀 Polsia Co-Founder executed "${taskToRun.title}". Sandbox Vitest passed (100%), rolling container deployed in 420ms.`,
        fromUser: false,
      },
    ]);
  };

  const orderedTasks = useMemo(() => tasks, [tasks]);

  return (
    <div className="mx-auto h-full max-w-[1600px] px-4 py-5 lg:h-[calc(100dvh-4rem)]">
      <PlatformTopBar
        onOpenAccountDrawer={() => setShowAccountDrawer(true)}
        onConnectWebsite={() => setShowConnectCompany(true)}
      />
      <AccountDrawerModal open={showAccountDrawer} onOpenChange={setShowAccountDrawer} />

      <NewTaskModal
        open={showNewTask}
        onOpenChange={setShowNewTask}
        onCreate={handleCreateTask}
      />
      <ManageTasksModal
        open={showManage}
        onOpenChange={setShowManage}
        tasks={orderedTasks}
        onRun={handleRunTask}
      />
      <InviteModal open={showInvite} onOpenChange={setShowInvite} />
      <DailyDigestModal open={showDailyDigest} onOpenChange={setShowDailyDigest} />
      <ConnectExistingCompanyModal open={showConnectCompany} onOpenChange={setShowConnectCompany} />
      <VersionHistoryModal doc={versionDoc} onClose={() => setVersionDoc(null)} />
      <Dialog open={!!contentDoc} onOpenChange={(v) => !v && setContentDoc(null)}>
        <DialogContent
          className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"
          data-testid="dialog-doc-content"
        >
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" /> {contentDoc?.title}
          </DialogTitle>
          <DialogDescription className="sr-only">Document content</DialogDescription>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentDoc?.content ?? ""}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[260px_minmax(0,1fr)_280px_360px]">
        {/* Left column */}
        <div className="space-y-3 xl:overflow-y-auto xl:pr-1">
          <AgentStatusWidget autoMode={autoMode} />
          <AutoModeCard autoMode={autoMode} onToggle={setAutoMode} />
          <CashFlowPnlCard onOpenDailyDigest={() => setShowDailyDigest(true)} />
          <ProgressStatsCard />
          <TeamCard onInvite={() => setShowInvite(true)} />
          <SubscriptionCard />
        </div>

        {/* Center-left column */}
        <div className="space-y-3 xl:overflow-y-auto xl:pr-1">
          <TaskQueue
            tasks={orderedTasks}
            onNewTask={() => setShowNewTask(true)}
            onManage={() => setShowManage(true)}
            onRun={handleRunTask}
          />
          <DocumentsLibrary
            docs={docs}
            onOpenVersions={(doc) => (doc.content ? setContentDoc(doc) : setVersionDoc(doc))}
          />
        </div>

        {/* Center-right column */}
        <div className="space-y-3 xl:overflow-y-auto xl:pr-1">
          <OutputChannels />
        </div>

        {/* Right column */}
        <div className="min-h-[420px] md:col-span-2 xl:col-span-1 xl:min-h-0">
          <NarrativeFeed feed={feed} />
        </div>
      </div>
    </div>
  );
}
