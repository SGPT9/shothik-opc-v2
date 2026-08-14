/**
 * Polsia Column 3 — Growth / Distribution Channels & Coolify/Dokploy PaaS Deployment Engine.
 * Agent-run marketing & automated cloud deployments.
 *
 * Controls per spec & infrastructure (coolify-deployer.ts):
 *  - Coolify / Dokploy / Hostinger VPS PaaS Engine:
 *    • One-click deployment provider selector (Coolify, Dokploy, Hostinger VPS)
 *    • Auto-injected Stripe/OKX monetization toggle
 *    • Auto-generated OpenAPI 3.0 Swagger docs (/docs)
 *    • Auto SSL (Let's Encrypt / ACM Live status)
 *    • Live deployment stdout/stderr container logs modal
 *    • Environment secrets manager (KEY=VALUE)
 *  - Twitter (Connect X Account OAuth, Tweet manual, Auto-Tweet recurring)
 *  - Email (Cold Outreach manual, Auto Cold Outreach frequency-based: Daily/Weekdays/Weekly, ~N sends/mo, 1 credit per run)
 *  - Ads (Run Ads: Meta Ads with a daily budget slider $10–$1000/day, split between ad spend and platform fee)
 *  - Website (Auto-assigned Polsia subdomain {company-slug}.polsia.app, Edit URL, Custom Domain with CNAME/ALIAS & ACM SSL-validation status "Live", Versions deployment history, "..." menu with Secrets & Redeploy)
 */
import { useState } from "react";
import {
  Share2,
  Mail,
  Zap,
  Globe,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Lock,
  RotateCcw,
  History,
  Sliders,
  DollarSign,
  Send,
  Plus,
  Server,
  Code,
  Terminal,
  FileCode,
  ShieldCheck,
  Cpu,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SectionLabel, PanelCard } from "./shared";
import { EmailOutreachModal } from "@/components/twin/EmailOutreachModal";
import { StartupBuildsModal } from "@/components/twin/StartupBuildsModal";
import { VisualStorefrontBuilderModal } from "@/components/twin/VisualStorefrontBuilderModal";
import {
  MOCK_TWITTER_CHANNEL,
  MOCK_EMAIL_CHANNEL,
  MOCK_META_ADS,
  MOCK_WEBSITE_DOMAIN,
} from "../data/mock-data";

export function GrowthChannels() {
  /* Channel States */
  const [twitter, setTwitter] = useState(MOCK_TWITTER_CHANNEL);
  const [email, setEmail] = useState(MOCK_EMAIL_CHANNEL);
  const [ads, setAds] = useState(MOCK_META_ADS);
  const [website, setWebsite] = useState(MOCK_WEBSITE_DOMAIN);

  /* PaaS Deployment Provider State (Coolify / Dokploy / Hostinger) */
  const [provider, setProvider] = useState<"coolify" | "dokploy" | "hostinger">("coolify");
  const [enableMonetization, setEnableMonetization] = useState(true);
  const [enableOpenApiDocs, setEnableOpenApiDocs] = useState(true);

  /* Modal States */
  const [showConnectXModal, setShowConnectXModal] = useState(false);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [showMenuPopover, setShowMenuPopover] = useState(false);

  return (
    <div className="space-y-3">
      <SectionLabel>Growth & Deployment Channels</SectionLabel>

      {/* 1. Coolify / Dokploy PaaS Website Deployment Engine */}
      <PanelCard className="p-3.5 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Server className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground truncate">Cloud Deployment</p>
                <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/40 text-emerald-400 py-0 px-1.5 uppercase font-bold">
                  {provider}
                </Badge>
              </div>
              <p className="text-[10px] font-mono text-emerald-400 truncate">
                {website.customDomain || website.subdomain}
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg text-[11px] font-semibold px-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 font-mono gap-1"
              onClick={() => setShowBuilderModal(true)}
              data-testid="button-open-visual-builder"
            >
              <Layout className="h-3 w-3" />
              <span>Builder</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg text-[11px] font-medium px-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              onClick={() => setShowVersionsModal(true)}
              data-testid="button-view-builds"
            >
              Builds
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg text-[11px] font-medium px-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              onClick={() => setShowDomainModal(true)}
            >
              Domain
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setShowMenuPopover((prev) => !prev)}
            >
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>

            {/* "..." Options Menu (Logs, Secrets, Redeploy) */}
            {showMenuPopover && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    setShowMenuPopover(false);
                    setShowLogsModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/60"
                >
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" /> Container Logs
                </button>
                <button
                  onClick={() => {
                    setShowMenuPopover(false);
                    setShowVersionsModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/60"
                >
                  <History className="h-3.5 w-3.5 text-indigo-400" /> Versions History
                </button>
                <button
                  onClick={() => {
                    setShowMenuPopover(false);
                    setShowSecretsModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/60"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" /> Secrets & Env
                </button>
                <button
                  onClick={() => setShowMenuPopover(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/10 font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Trigger Redeploy
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PaaS Injection Indicators */}
        <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="h-3 w-3" /> Auto-SSL (Live)
          </span>
          <span className="flex items-center gap-1 text-indigo-300">
            <FileCode className="h-3 w-3" /> OpenAPI /docs
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <Zap className="h-3 w-3" /> Stripe/OKX Injected
          </span>
        </div>
      </PanelCard>

      {/* 2. Twitter / X Channel */}
      <PanelCard className="p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Twitter / X</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {twitter.connected ? twitter.handle : "Not connected"}
              </p>
            </div>
          </div>
          {twitter.connected ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-lg text-[11px] font-medium"
              onClick={() => setShowTweetModal(true)}
              data-testid="polsia-tweet-btn"
            >
              Tweet
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-7 rounded-lg text-[11px] font-medium bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowConnectXModal(true)}
            >
              Connect X
            </Button>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Auto-Tweet (recurring)</span>
          <Switch
            checked={twitter.autoTweet}
            onCheckedChange={(val) => setTwitter((prev) => ({ ...prev, autoTweet: val }))}
            aria-label="Toggle Auto Tweet"
          />
        </div>
      </PanelCard>

      {/* 3. Email Outreach Channel */}
      <PanelCard className="p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Cold Email</p>
              <p className="text-[10px] text-indigo-400 font-mono underline truncate max-w-[130px]">
                {email.emailAddress}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-lg text-[11px] font-medium"
            onClick={() => setShowEmailModal(true)}
          >
            Outreach
          </Button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-foreground">Auto Cold Outreach</p>
            <p className="text-[9px] text-muted-foreground font-mono">
              {email.frequency} · ~{email.sendsPerMonth} sends/mo (1 credit/run)
            </p>
          </div>
          <Switch
            checked={email.autoOutreach}
            onCheckedChange={(val) => setEmail((prev) => ({ ...prev, autoOutreach: val }))}
            aria-label="Toggle Auto Cold Outreach"
          />
        </div>
      </PanelCard>

      {/* 4. Meta Ads Channel */}
      <PanelCard className="p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Meta Ads</p>
              <p className="text-[10px] font-mono text-amber-400 font-semibold">
                ${ads.dailyBudget}/day budget
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="h-7 rounded-lg text-[11px] font-semibold bg-amber-500 hover:bg-amber-600 text-black"
            onClick={() => setShowAdsModal(true)}
            data-testid="polsia-run-ads-btn"
          >
            Run Ads
          </Button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>Ad Spend: {ads.adSpendPercent}%</span>
          <span>Platform Fee: {ads.platformFeePercent}%</span>
        </div>
      </PanelCard>

      {/* Coolify / Dokploy Container Logs Modal */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Terminal className="h-5 w-5 text-emerald-400" /> Container Stdout Logs ({provider})
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-mono">
            Live stdout/stderr stream from {provider.toUpperCase()} runner container.
          </DialogDescription>
          <div className="mt-2 rounded-xl border border-border/80 bg-black/90 p-3 font-mono text-[11px] text-emerald-400 space-y-1 max-h-64 overflow-y-auto">
            <p>[coolify-deployer] Initializing build context for {website.subdomain}...</p>
            <p>[coolify-deployer] Pulling base image node:20-alpine...</p>
            <p>[coolify-deployer] Auto-injecting Stripe / OKX monetization routes (/api/checkout)...</p>
            <p>[coolify-deployer] Auto-generating OpenAPI 3.0 Swagger docs at /docs...</p>
            <p>[coolify-deployer] Issuing Let's Encrypt SSL certificate via Traefik reverse proxy...</p>
            <p className="text-emerald-300 font-bold">[coolify-deployer] Container deployed successfully! Status: 200 OK (3.4s)</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Environment Secrets Modal */}
      <Dialog open={showSecretsModal} onOpenChange={setShowSecretsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-400" /> Environment Secrets ({provider})
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Encrypted KEY=VALUE secrets passed to your application container during deployment.
          </DialogDescription>
          <div className="space-y-2 mt-2 font-mono text-xs">
            <div className="rounded-xl border border-border bg-muted/40 p-2 flex justify-between">
              <span className="text-indigo-400">STRIPE_SECRET_KEY</span>
              <span className="text-muted-foreground">sk_live_••••••••</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-2 flex justify-between">
              <span className="text-indigo-400">POSTGRES_URL</span>
              <span className="text-muted-foreground">postgres://insforge:••••</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-2 flex justify-between">
              <span className="text-indigo-400">OPENROUTER_API_KEY</span>
              <span className="text-muted-foreground">sk-or-••••••••</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meta Ads Budget Slider Modal ($10 - $1000/day) */}
      <Dialog open={showAdsModal} onOpenChange={setShowAdsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" /> Run Meta Ad Campaign
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure daily Meta ad spend ($10–$1000/day). Billed as 85% direct ad spend and 15% platform management fee.
          </DialogDescription>
          <div className="space-y-4 mt-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span>Daily Budget:</span>
                <span className="text-amber-400 font-mono text-base">${ads.dailyBudget} / day</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={ads.dailyBudget}
                onChange={(e) => setAds((prev) => ({ ...prev, dailyBudget: Number(e.target.value) }))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                <span>$10/day</span>
                <span>$500/day</span>
                <span>$1000/day</span>
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Direct Ad Spend (85%):</span>
                <span className="text-foreground font-bold">${(ads.dailyBudget * 0.85).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (15%):</span>
                <span className="text-muted-foreground">${(ads.dailyBudget * 0.15).toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold">
              Launch Ad Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Domain & SSL Modal */}
      <Dialog open={showDomainModal} onOpenChange={setShowDomainModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-emerald-400" /> Manage Domain & PaaS Deployment Provider
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select PaaS deployment provider (Coolify / Dokploy / Hostinger) and custom domain DNS.
          </DialogDescription>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">PaaS Deployment Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {(["coolify", "dokploy", "hostinger"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={cn(
                      "rounded-xl border p-2 text-xs font-bold font-mono uppercase transition",
                      provider === p
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Auto-assigned Subdomain</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={website.subdomain}
                  onChange={(e) => setWebsite((prev) => ({ ...prev, subdomain: e.target.value }))}
                  className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button size="sm" variant="outline" className="rounded-xl text-xs">Edit URL</Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Custom Domain</label>
              <input
                type="text"
                value={website.customDomain || ""}
                onChange={(e) => setWebsite((prev) => ({ ...prev, customDomain: e.target.value }))}
                placeholder="e.g. mycompany.com"
                className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs leading-relaxed text-emerald-300">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> DNS & ACM SSL Status: Live (Verified)
              </p>
              <p className="text-[10px] mt-1 text-emerald-300/80 font-mono">
                CNAME record points to `cname.shothikgpt.com`.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cold Email Outreach Sequence Modal */}
      <EmailOutreachModal open={showEmailModal} onOpenChange={setShowEmailModal} />

      {/* Startup Container Builds & Releases Modal */}
      <StartupBuildsModal
        open={showVersionsModal}
        onOpenChange={setShowVersionsModal}
        subdomain={website.subdomain}
        companyName="VerifiQ AI"
      />

      {/* Visual No-Code Storefront & Landing Page Builder Modal */}
      <VisualStorefrontBuilderModal
        open={showBuilderModal}
        onOpenChange={setShowBuilderModal}
        companyName="VerifiQ AI"
        subdomain={website.subdomain}
      />
    </div>
  );
}
