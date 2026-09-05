"use client";

import React from "react";
import {
  Brain,
  Users,
  Zap,
  Moon,
  Sun,
  Settings,
  Mic,
  CreditCard,
  Mail,
  Send,
  Building2,
  TrendingUp,
  Video,
  Wallet,
  Truck,
  Layout,
  BookOpen,
  Monitor,
  Globe,
  History,
  Lock,
  RefreshCw,
  Server,
  Sparkles,
  Cpu,
  GitFork,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

export interface TwinCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Category 1: Founder Cockpit
  onOpenSecondMeMemory?: () => void;
  onOpenSpecializedTwins?: () => void;
  onOpenAutoMode?: () => void;
  onOpenNightshift?: () => void;
  onOpenDailyDigest?: () => void;
  onOpenCompanySettings?: () => void;
  onOpenVoiceCommander?: () => void;
  onOpenSwarmGraph?: () => void;
  onOpenAddCredits?: () => void;
  // Category 2: Growth & Revenue
  onOpenAutoColdOutreach?: () => void;
  onOpenEmailOutreach?: () => void;
  onOpenLeadCrm?: () => void;
  onOpenCompetitorAdSpy?: () => void;
  onOpenCroTuner?: () => void;
  onOpenVideoStudio?: () => void;
  // Category 3: Commerce & Logistics
  onOpenMfsGateway?: () => void;
  onOpenSteadfastCourier?: () => void;
  onOpenVisualStorefront?: () => void;
  onOpenBookReader?: () => void;
  onOpenNilkhetPod?: () => void;
  // Category 4: DevOps & Cloud
  onOpenStartupBuilds?: () => void;
  onOpenWebsiteHub?: () => void;
  onOpenManageDomains?: () => void;
  onOpenVersions?: () => void;
  onOpenSecrets?: () => void;
  onOpenRedeploy?: () => void;
  onOpenDokploy?: () => void;
  onOpenWasmCrdtSync?: () => void;
}

export function TwinCommandPalette({
  open,
  onOpenChange,
  onOpenSecondMeMemory,
  onOpenSpecializedTwins,
  onOpenAutoMode,
  onOpenNightshift,
  onOpenDailyDigest,
  onOpenCompanySettings,
  onOpenVoiceCommander,
  onOpenSwarmGraph,
  onOpenAddCredits,
  onOpenAutoColdOutreach,
  onOpenEmailOutreach,
  onOpenLeadCrm,
  onOpenCompetitorAdSpy,
  onOpenCroTuner,
  onOpenVideoStudio,
  onOpenMfsGateway,
  onOpenSteadfastCourier,
  onOpenVisualStorefront,
  onOpenBookReader,
  onOpenNilkhetPod,
  onOpenStartupBuilds,
  onOpenWebsiteHub,
  onOpenManageDomains,
  onOpenVersions,
  onOpenSecrets,
  onOpenRedeploy,
  onOpenDokploy,
  onOpenWasmCrdtSync,
}: TwinCommandPaletteProps) {
  const handleSelect = (callback?: () => void) => {
    onOpenChange(false);
    callback?.();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Shothik OPC Command Center"
      description="Search actions, specialized twins, commerce tools, or deployment settings..."
      className="sm:max-w-[620px] bg-white/95 dark:bg-[#0c0d0e]/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl overflow-hidden font-sans"
    >
      <CommandInput
        placeholder="Type a command or search tools (e.g. Memory, Outreach, bKash, Preview)..."
        className="h-12 text-sm font-sans"
      />
      <CommandList className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
        <CommandEmpty className="py-6 text-center text-xs text-zinc-500 font-mono">
          No matching tools found. Try searching for 'memory', 'email', 'bKash', or 'preview'.
        </CommandEmpty>

        {/* ── Category 1: Founder Cockpit & Intelligence ── */}
        <CommandGroup
          heading={
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-bold py-1">
              <span>👔 1. Founder Cockpit & Intelligence</span>
            </div>
          }
        >
          <CommandItem
            onSelect={() => handleSelect(onOpenSecondMeMemory)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">SecondMe Memory Vault</span>
                <span className="text-[11px] text-zinc-500">Learned founder preferences, voice & business policies</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘M</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenSpecializedTwins)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">The 9 Specialized Twins Swarm</span>
                <span className="text-[11px] text-zinc-500">Marketing, Sales, Finance, Support & Ops 1-tap dispatch</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 font-mono">9 Twins</Badge>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenAutoMode)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Auto Mode (24h Autonomous Loop)</span>
                <span className="text-[11px] text-zinc-500">Continuous unattended execution with hardware checks</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘A</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenNightshift)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Nightshift Mode</span>
                <span className="text-[11px] text-zinc-500">Autonomous overnight coding runs & CEO digests</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘N</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenDailyDigest)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Sun className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Daily CEO Briefing Digest</span>
                <span className="text-[11px] text-zinc-500">Morning executive breakdown of completed work</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenCompanySettings)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Settings className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Company Settings & Collaborators</span>
                <span className="text-[11px] text-zinc-500">Business registration, trade license, and team access</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenVoiceCommander)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Multi-Dialect Voice Studio (Kokoro & VITS)</span>
                <span className="text-[11px] text-zinc-500">Dhakaiya, Chatgaya, Sylheti conversational audio with VAD & barge-in</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘V</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenSwarmGraph)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <GitFork className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Swarm Task DAG Graph Studio</span>
                <span className="text-[11px] text-zinc-500">Kahn's topological sort, cycle detection, & parallel wave scheduler</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘G</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenAddCredits)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Add Autonomous Credits</span>
                <span className="text-[11px] text-zinc-500">Instant 1-Tap bKash / Nagad credit top-up</span>
              </div>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1 border-zinc-200 dark:border-zinc-800" />

        {/* ── Category 2: Go-to-Market & Growth ── */}
        <CommandGroup
          heading={
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-purple-500 dark:text-purple-400 font-bold py-1">
              <span>🚀 2. Go-to-Market & Growth</span>
            </div>
          }
        >
          <CommandItem
            onSelect={() => handleSelect(onOpenAutoColdOutreach)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Auto Cold Outreach Autopilot</span>
                <span className="text-[11px] text-zinc-500">Autonomous B2B lead discovery & daily email sending</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘O</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenEmailOutreach)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Send className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">3-Step Email Sequence Cadence</span>
                <span className="text-[11px] text-zinc-500">Lead prospect queue & live deliverability tracking</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenLeadCrm)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Lead Qualification CRM</span>
                <span className="text-[11px] text-zinc-500">Pipeline stages, intent scoring & founder handoff</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenCompetitorAdSpy)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Meta Ad Library Spy</span>
                <span className="text-[11px] text-zinc-500">Scrape competitor Facebook/IG creatives & copy hooks</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenCroTuner)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">CRO Friction Tuner</span>
                <span className="text-[11px] text-zinc-500">Automated checkout A/B testing & drop-off reduction</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenVideoStudio)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Video className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Twin Video Studio</span>
                <span className="text-[11px] text-zinc-500">Automated 9:16 vertical reels & product promo generator</span>
              </div>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1 border-zinc-200 dark:border-zinc-800" />

        {/* ── Category 3: Commerce & Local Logistics ── */}
        <CommandGroup
          heading={
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-bold py-1">
              <span>🚚 3. Commerce & Local Logistics</span>
            </div>
          }
        >
          <CommandItem
            onSelect={() => handleSelect(onOpenMfsGateway)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">bKash & Nagad MFS Hub</span>
                <span className="text-[11px] text-zinc-500">PGW webhooks, 1.85% fee accounting & TrxID reconciliation</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-mono">1-Tap MFS</Badge>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenSteadfastCourier)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Steadfast Courier Logistics</span>
                <span className="text-[11px] text-zinc-500">Automated COD booking, tracking generation & parcel sync</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenVisualStorefront)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Layout className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Visual Storefront Builder</span>
                <span className="text-[11px] text-zinc-500">Drag-and-drop F-Commerce landing page publisher</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenBookReader)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Boi Mela Book Storefront & POD</span>
                <span className="text-[11px] text-zinc-500">Ekushey reader preview & Nilkhet POD order dispatch</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenNilkhetPod)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Nilkhet POD Direct Press Hub</span>
                <span className="text-[11px] text-zinc-500">CMYK imposition, spine calculation & commercial press dispatch</span>
              </div>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1 border-zinc-200 dark:border-zinc-800" />

        {/* ── Category 4: DevOps & Cloud Infrastructure ── */}
        <CommandGroup
          heading={
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-500 dark:text-amber-400 font-bold py-1">
              <span>🛠️ 4. DevOps, Domains & Cloud</span>
            </div>
          }
        >
          <CommandItem
            onSelect={() => handleSelect(onOpenStartupBuilds)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Sandboxed Live Preview (Builds)</span>
                <span className="text-[11px] text-zinc-500">1200px Desktop & 375px Mobile responsive iframe preview</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘P</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenWebsiteHub)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Website & Domain Settings Hub</span>
                <span className="text-[11px] text-zinc-500">Routing, custom domains, secrets & redeploys</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenManageDomains)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Custom Domains & SSL</span>
                <span className="text-[11px] text-zinc-500">Configure CNAME/ALIAS records with ACM validation</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenVersions)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <History className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Commit History & Rollbacks</span>
                <span className="text-[11px] text-zinc-500">Instant rolling rollbacks to prior production builds</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenSecrets)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">App Secrets & Environment Keys</span>
                <span className="text-[11px] text-zinc-500">Server-side runtime credentials & API tokens</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenRedeploy)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Trigger Rolling Redeploy</span>
                <span className="text-[11px] text-zinc-500">Rebuild container from HEAD with zero downtime</span>
              </div>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenDokploy)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Server className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Dokploy Micro-Containers</span>
                <span className="text-[11px] text-zinc-500">Docker container memory, CPU & port allocation monitor</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘D</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenWasmCrdtSync)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">WebAssembly Edge CRDT Sync</span>
                <span className="text-[11px] text-zinc-500">Zero-copy binary state vector & multi-master delta mesh</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘W</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
