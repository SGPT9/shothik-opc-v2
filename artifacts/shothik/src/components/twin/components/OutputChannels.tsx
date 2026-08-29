import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Zap,
  Twitter,
  Mail,
  BookOpen,
  Share2,
  Globe,
  Clock,
  CheckCircle2,
  ChevronRight,
  Send,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function PanelCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-4', className)}>
      {children}
    </div>
  );
}

export function OutputChannels() {
  const [distributeOn, setDistributeOn] = useState(false);
  const [adDailyBudget, setAdDailyBudget] = useState(50);
  const [adRunning, setAdRunning] = useState(false);

  // Twitter state
  const [isTwitterConnected, setIsTwitterConnected] = useState(true);
  const [twitterCadence, setTwitterCadence] = useState<'daily' | 'weekdays' | 'off'>('daily');
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);
  const [tweetDraft, setTweetDraft] = useState('');

  // Cold Email state
  const [emailCadence, setEmailCadence] = useState<'daily' | 'weekdays' | 'weekly'>('daily');
  const [targetIcp, setTargetIcp] = useState('Founders & CTOs');
  const [isColdEmailActive, setIsColdEmailActive] = useState(true);

  const adInventory = Math.round(adDailyBudget * 0.85);
  const polsiaFee = Math.round(adDailyBudget * 0.15);
  const estImpressions = (adDailyBudget * 280).toLocaleString();
  const estClicks = (adDailyBudget * 8.4).toFixed(0);

  return (
    <div className="space-y-3">
      <SectionLabel>Distribution & Growth Channels</SectionLabel>

      {/* 1. Meta Ads Autonomous Growth Loop */}
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
            <div>Shothik Fee: <strong className="text-foreground">${polsiaFee}</strong></div>
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

      {/* 2. Twitter / X Autopilot Card */}
      <PanelCard className="p-3.5 border-sky-500/30 bg-gradient-to-br from-background to-sky-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
              <Twitter className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Twitter / X Autopilot</p>
              <p className="text-[10px] font-mono text-sky-400">@verifiq_ai · Connected</p>
            </div>
          </div>
          <Badge variant="outline" className="border-sky-500/40 text-[10px] text-sky-400">
            Auto-Tweet Active
          </Badge>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Autonomous product changelogs, book quotes, and launch updates published automatically.
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <select
            value={twitterCadence}
            onChange={(e) => setTwitterCadence(e.target.value as any)}
            className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-mono text-foreground"
          >
            <option value="daily">Daily (~30 tweets/mo)</option>
            <option value="weekdays">Weekdays Only</option>
            <option value="off">Off (Manual Only)</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsTweetModalOpen(true)}
            className="text-xs h-7 gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Tweet</span>
          </Button>
        </div>
      </PanelCard>

      {/* 3. Cold Email Outreach Engine */}
      <PanelCard className="p-3.5 border-purple-500/30 bg-gradient-to-br from-background to-purple-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Cold Email Outreach</p>
              <p className="text-[10px] font-mono text-purple-400">1 Credit / run · ~200 sends/mo</p>
            </div>
          </div>
          <Switch
            checked={isColdEmailActive}
            onCheckedChange={setIsColdEmailActive}
            aria-label="Toggle Cold Email"
          />
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Target ICP:</span>
            <select
              value={targetIcp}
              onChange={(e) => setTargetIcp(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-0.5 text-[11px] text-foreground font-mono"
            >
              <option value="Founders & CTOs">Founders & CTOs</option>
              <option value="E-commerce Merchants">E-commerce Merchants</option>
              <option value="Publishers & Authors">Publishers & Authors</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cadence:</span>
            <select
              value={emailCadence}
              onChange={(e) => setEmailCadence(e.target.value as any)}
              className="rounded-lg border border-border bg-background px-2 py-0.5 text-[11px] text-foreground font-mono"
            >
              <option value="daily">Daily (~200 sends/mo)</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly (~50 sends/mo)</option>
            </select>
          </div>
        </div>
      </PanelCard>

      {/* 4. Publishing & Sharing Channels */}
      <PanelCard className="p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-500 bg-emerald-500/10">
            <BookOpen className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-foreground">Publish</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Push finished chapters or products to Books, Marketplace, and Nilkhet POD network.
        </p>
        <a
          href="/writing-studio?intent=book"
          className="mt-2.5 inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Open Publishing Suite <ChevronRight className="ml-1 h-3 w-3" />
        </a>
      </PanelCard>

      {/* Manual Tweet Modal */}
      <Dialog open={isTweetModalOpen} onOpenChange={setIsTweetModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0b101b] border-slate-800 text-slate-200">
          <DialogTitle className="flex items-center gap-2 text-sm text-slate-100">
            <Twitter className="w-4 h-4 text-sky-400" />
            <span>Compose Tweet (@verifiq_ai)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Send an instant update to your company Twitter audience.
          </DialogDescription>
          <div className="space-y-3 my-2">
            <textarea
              value={tweetDraft}
              onChange={(e) => setTweetDraft(e.target.value)}
              placeholder="What's happening in your startup today? Twin auto-formats hashtags."
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{280 - tweetDraft.length} characters remaining</span>
              <span>1 Credit</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsTweetModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!tweetDraft.trim()}
              onClick={() => {
                setIsTweetModalOpen(false);
                setTweetDraft('');
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            >
              Post Tweet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
