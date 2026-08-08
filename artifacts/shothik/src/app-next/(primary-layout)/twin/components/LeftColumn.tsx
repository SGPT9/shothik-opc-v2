/**
 * Left column components for the Twin dashboard.
 * Preserves 100% of existing functionality (Progress stats, Auto Mode, Team, Subscription)
 * while introducing live search status and business metrics.
 */
import { useState } from "react";
import {
  Sparkles,
  Zap,
  Clock,
  Users,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Mail,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SectionLabel, PanelCard } from "./shared";
import { MOCK_TEAM, MOCK_PROGRESS_STATS } from "../data/mock-data";

/* ------------------------------------------------------------------ */
/* Agent Status Widget with Live Search Banner                         */
/* ------------------------------------------------------------------ */

export function AgentStatusWidget({ autoMode }: { autoMode: boolean }) {
  return (
    <div className="space-y-2">
      {/* Live web search status indicator */}
      <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3 py-1.5 text-xs text-cyan-300 shadow-sm animate-pulse">
        <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">LIVE</span>
        <span className="truncate">Running web search for YC application guidelines…</span>
      </div>

      <PanelCard>
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="h-5 w-5 text-indigo-400" />
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
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Your Twin</p>
            <p className="truncate text-xs text-muted-foreground" data-testid="twin-text-status">
              Analyzing market size — TAM/SAM/SOM…
            </p>
          </div>
        </div>
        <a
          href="/writing-studio?mode=3fold"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-500/20"
        >
          <BookOpen className="h-3.5 w-3.5" /> Open 3-Fold Writing Studio
        </a>
      </PanelCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auto Mode Card                                                      */
/* ------------------------------------------------------------------ */

export function AutoModeCard({
  autoMode,
  onToggle,
}: {
  autoMode: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <PanelCard>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <p className="text-sm font-medium text-foreground">Auto Mode</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {autoMode
              ? "I'll keep working overnight and leave you a briefing."
              : "I'll only act when you ask."}
          </p>
        </div>
        <Switch
          checked={autoMode}
          onCheckedChange={onToggle}
          aria-label="Toggle Auto Mode"
          data-testid="twin-switch-auto-mode"
        />
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/* Progress & Business Metrics Card                                   */
/* ------------------------------------------------------------------ */

export function ProgressStatsCard() {
  const stats = MOCK_PROGRESS_STATS;
  return (
    <PanelCard>
      <div className="flex items-center justify-between">
        <SectionLabel>Progress & Business</SectionLabel>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> Updated 4m ago
        </span>
      </div>

      {/* Book Progress Metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-b border-border/60 pb-3">
        <div className="min-w-0">
          <p className="text-base font-semibold tabular-nums text-foreground">{stats.wordsWritten}</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Words written</p>
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold tabular-nums text-foreground">{stats.sourcesVerified}</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Sources verified</p>
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold tabular-nums text-foreground">{stats.chaptersDrafted}</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Chapters drafted</p>
        </div>
      </div>

      {/* Startup Business Metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/40 p-1.5">
          <p className="text-xs text-muted-foreground">Visitors</p>
          <p className="text-sm font-bold text-foreground">{stats.visitors}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-1.5">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-sm font-bold text-emerald-400">{stats.revenue}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-1.5">
          <p className="text-[10px] text-muted-foreground">Setup Payments</p>
          <p className="text-[11px] font-semibold text-indigo-400 truncate">{stats.setupPayments}</p>
        </div>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/* Team Card                                                           */
/* ------------------------------------------------------------------ */

export function TeamCard({ onInvite }: { onInvite: () => void }) {
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
            <div className="min-w-0 flex-1">
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
        data-testid="twin-button-add-collaborator"
      >
        <UserPlus className="mr-1 h-3.5 w-3.5" /> Add Collaborator / Member
      </Button>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/* Invite Modal                                                        */
/* ------------------------------------------------------------------ */

export function InviteModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
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
        <DialogTitle>Add Collaborator / Member</DialogTitle>
        <DialogDescription className="sr-only">Invite a collaborator or team member to this project</DialogDescription>
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
              data-testid="twin-input-invite-email"
            />
            <p className="rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              This invite grants access to <span className="font-medium text-foreground">this workspace</span>.
            </p>
            <Button
              className="w-full rounded-xl"
              disabled={!email.includes("@") || !email.includes(".")}
              onClick={() => setSent(true)}
              data-testid="twin-button-send-invite"
            >
              <Mail className="mr-1.5 h-4 w-4" /> Send Invite
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Subscription Card                                                   */
/* ------------------------------------------------------------------ */

export function SubscriptionCard() {
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
            <Button size="sm" className="w-full rounded-xl text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold" data-testid="twin-button-resubscribe">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Resubscribe to keep Twin working
            </Button>
            <Button variant="ghost" size="sm" className="w-full rounded-xl text-xs text-muted-foreground">
              Keep workspace saved — $2/mo
            </Button>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}
