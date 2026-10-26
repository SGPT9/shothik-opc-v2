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
  FlaskConical,
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
  GitBranch,
  ShieldCheck,
  Sliders,
  Coins,
  QrCode,
  FileText,
  PhoneCall,
  Scale,
  DollarSign,
  Store,
  Wheat,
  Factory,
  ShieldAlert,
  Ship,
  Award,
  Package,
  Landmark,
  Layers,
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
  onOpenPlatformServices?: () => void;
  onOpenSecondMeMemory?: () => void;
  onOpenSpecializedTwins?: () => void;
  onOpenAutoMode?: () => void;
  onOpenNightshift?: () => void;
  onOpenDailyDigest?: () => void;
  onOpenDeepResearch?: () => void;
  onOpenCompanySettings?: () => void;
  onOpenVoiceCommander?: () => void;
  onOpenSwarmGraph?: () => void;
  onOpenAddCredits?: () => void;
  onConveneDaciMeeting?: () => void;
  onConveneThinkingHatsMeeting?: () => void;
  // Category 2: Growth & Revenue
  onOpenAutoColdOutreach?: () => void;
  onOpenEmailOutreach?: () => void;
  onOpenLeadCrm?: () => void;
  onOpenCompetitorAdSpy?: () => void;
  onOpenCroTuner?: () => void;
  onOpenVideoStudio?: () => void;
  // Category 3: Commerce & Logistics
  onOpenMfsGateway?: () => void;
  onOpenCreatorCashout?: () => void;
  onOpenManualTrxSettlement?: () => void;
  onOpenSteadfastCourier?: () => void;
  onOpenVisualStorefront?: () => void;
  onOpenBookReader?: () => void;
  onOpenNilkhetPod?: () => void;
  onOpenWhatsAppCommerce?: () => void;
  onOpenMushakTaxStudio?: () => void;
  onOpenOutboundCalling?: () => void;
  onOpenCrossBorderCustoms?: () => void;
  onOpenPlatformElevators?: () => void;
  onOpenFranchiseMultiBranch?: () => void;
  onOpenLiveSelling?: () => void;
  onOpenAuditLedger?: () => void;
  onOpenCourierArbitrage?: () => void;
  onOpenFreelancerRemittance?: () => void;
  onOpenDarkHubFulfillment?: () => void;
  onOpenMultiChannelCashflow?: () => void;
  onOpenWholesaleRfqEscrow?: () => void;
  onOpenAgriMandiRadar?: () => void;
  onOpenFieldAgentPos?: () => void;
  onOpenMushak43Declaration?: () => void;
  onOpenMultiCarrierWebhook?: () => void;
  onOpenExportCompliance?: () => void;
  onOpenFxHedging?: () => void;
  onOpenPayrollTax?: () => void;
  onOpenCorporateTax?: () => void;
  onOpenInvoiceFactoring?: () => void;
  onOpenDebtRecovery?: () => void;
  onOpenVoiceCommerce?: () => void;
  onOpenLegalContracts?: () => void;
  onOpenDutyDrawback?: () => void;
  onOpenHalalGovernance?: () => void;
  onOpenCollectiveBuying?: () => void;
  onOpenTenderBid?: () => void;
  // Category 4: DevOps & Cloud
  onOpenStartupBuilds?: () => void;
  onOpenWebsiteHub?: () => void;
  onOpenManageDomains?: () => void;
  onOpenVersions?: () => void;
  onOpenSecrets?: () => void;
  onOpenRedeploy?: () => void;
  onOpenDokploy?: () => void;
  onOpenWasmCrdtSync?: () => void;
  onOpenVastSpotGpu?: () => void;
  onOpenEdgeMesh?: () => void;
  onOpenCanaryDirector?: () => void;
  onOpenVulnerabilityImmunity?: () => void;
  onOpenMultiModelPareto?: () => void;
  onOpenEpistemicConsensus?: () => void;
  onOpenWebGpuEmbedding?: () => void;
  onOpenZkSnarkProver?: () => void;
  onOpenWasmVectorIndex?: () => void;
  onOpenDeveloperTwin?: () => void;
  // Category 5: Agentic Compute & Slices 56-60
  onOpenAgentComputer?: () => void;
  onOpenCustomsTariff?: () => void;
  onOpenInventoryMatrix?: () => void;
  onOpenCodIvr?: () => void;
  onOpenEarlyLiquidity?: () => void;
  onOpenMetaCapi?: () => void;
  onOpenKycOcr?: () => void;
  onOpenRtoFraudShield?: () => void;
  onOpenFlashInventory?: () => void;
  onOpenLandRegistry?: () => void;
  onOpenScenarioLab?: () => void;
  onOpenUnifiedVoice?: () => void;
  onOpenEmporium?: () => void;
  onOpenCommunity?: () => void;
  onOpenJuteExport?: () => void;
}

export function TwinCommandPalette({
  open,
  onOpenChange,
  onOpenSecondMeMemory,
  onOpenSpecializedTwins,
  onOpenAutoMode,
  onOpenNightshift,
  onOpenDailyDigest,
  onOpenDeepResearch,
  onOpenCompanySettings,
  onOpenVoiceCommander,
  onOpenSwarmGraph,
  onOpenAddCredits,
  onConveneDaciMeeting,
  onConveneThinkingHatsMeeting,
  onOpenAutoColdOutreach,
  onOpenEmailOutreach,
  onOpenLeadCrm,
  onOpenCompetitorAdSpy,
  onOpenCroTuner,
  onOpenVideoStudio,
  onOpenMfsGateway,
  onOpenCreatorCashout,
  onOpenManualTrxSettlement,
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
  onOpenVastSpotGpu,
  onOpenEdgeMesh,
  onOpenCanaryDirector,
  onOpenVulnerabilityImmunity,
  onOpenMultiModelPareto,
  onOpenEpistemicConsensus,
  onOpenWebGpuEmbedding,
  onOpenZkSnarkProver,
  onOpenWasmVectorIndex,
  onOpenDeveloperTwin,
  onOpenPlatformServices,
  onOpenWhatsAppCommerce,
  onOpenMushakTaxStudio,
  onOpenOutboundCalling,
  onOpenCrossBorderCustoms,
  onOpenPlatformElevators,
  onOpenFranchiseMultiBranch,
  onOpenLiveSelling,
  onOpenAuditLedger,
  onOpenCourierArbitrage,
  onOpenFreelancerRemittance,
  onOpenDarkHubFulfillment,
  onOpenMultiChannelCashflow,
  onOpenWholesaleRfqEscrow,
  onOpenAgriMandiRadar,
  onOpenFieldAgentPos,
  onOpenMushak43Declaration,
  onOpenMultiCarrierWebhook,
  onOpenExportCompliance,
  onOpenFxHedging,
  onOpenPayrollTax,
  onOpenCorporateTax,
  onOpenInvoiceFactoring,
  onOpenDebtRecovery,
  onOpenVoiceCommerce,
  onOpenLegalContracts,
  onOpenDutyDrawback,
  onOpenHalalGovernance,
  onOpenCollectiveBuying,
  onOpenTenderBid,
  onOpenAgentComputer,
  onOpenCustomsTariff,
  onOpenInventoryMatrix,
  onOpenCodIvr,
  onOpenEarlyLiquidity,
  onOpenMetaCapi,
  onOpenKycOcr,
  onOpenRtoFraudShield,
  onOpenFlashInventory,
  onOpenLandRegistry,
  onOpenScenarioLab,
  onOpenUnifiedVoice,
  onOpenEmporium,
  onOpenCommunity,
  onOpenJuteExport,
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
            onSelect={() => handleSelect(onOpenDeepResearch)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">DeerFlow 2.0 Deep Research Studio</span>
                <span className="text-[11px] text-zinc-500">Systematic literature reviews, citations & NBR sandbox math</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘R</CommandShortcut>
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
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">The 10 Specialized Twins Swarm</span>
                <span className="text-[11px] text-zinc-500">Marketing, Sales, Finance, Support & Ops 1-tap dispatch</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 font-mono">10 Twins</Badge>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenPlatformServices)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Platform Services Directory (12 Pillars)</span>
                <span className="text-[11px] text-zinc-500">Universal catalog across writing, creative & autonomous business ops</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 font-mono">12 Services</Badge>
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

          <CommandItem
            onSelect={() => handleSelect(onConveneDaciMeeting)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">DACI Resolution Meeting (AI-Company)</span>
                <span className="text-[11px] text-zinc-500">Driver/Approver/Contributor debate generating binding action tickets</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 font-mono">DACI</Badge>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onConveneThinkingHatsMeeting)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Six Thinking Hats Risk Audit</span>
                <span className="text-[11px] text-zinc-500">White/Red/Black/Yellow/Green/Blue stress-test on company strategy</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 font-mono">6 Hats</Badge>
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

          <CommandItem
            value="meta tiktok capi offline cod attribution event match quality pixel server emq"
            onSelect={() => handleSelect(onOpenMetaCapi)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Meta & TikTok Conversions API (CAPI)</span>
                <span className="text-[11px] text-zinc-500">Offline COD conversion attribution, EMQ scoring & postback sync</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 font-mono">CAPI</Badge>
          </CommandItem>

          <CommandItem
            value="platform elevators viral growth merchant health index mhi referral bkash cashback 1688 group sourcing trust badge"
            onSelect={() => handleSelect(onOpenPlatformElevators)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Platform Elevators & Viral Growth</span>
                <span className="text-[11px] text-zinc-500">MHI tier progression, bKash referral cashback & 1688 group import cohorts</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘G</CommandShortcut>
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
            value="creator cashout earnings withdraw bkash nagad tds mfs payout"
            onSelect={() => handleSelect(onOpenCreatorCashout)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Coins className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Creator Earnings Cash-Out</span>
                <span className="text-[11px] text-zinc-500">Withdraw marketplace & twin revenues to bKash/Nagad with 10% NBR TDS</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-mono">MFS Payout</Badge>
          </CommandItem>

          <CommandItem
            value="manual trxid verify settlement offline sms agent shop bkash nagad"
            onSelect={() => handleSelect(onOpenManualTrxSettlement)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Manual TrxID Settlement</span>
                <span className="text-[11px] text-zinc-500">Verify 10-char offline agent shop SMS TrxID & reconcile ledger</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-mono">TrxID</Badge>
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

          <CommandItem
            onSelect={() => handleSelect(onOpenWhatsAppCommerce)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">WhatsApp Multi-Dialect Bot & bKash QR</span>
                <span className="text-[11px] text-zinc-500">Autonomous conversational sales, instant bKash QR & Steadfast auto-booking</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘W
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="nbr mushak 6.3 vat tds tax invoice settlement return challan 9.1 bin"
            onSelect={() => handleSelect(onOpenMushakTaxStudio)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">NBR Mushak-6.3 Statutory VAT & TDS Studio</span>
                <span className="text-[11px] text-zinc-500">Bilingual tax invoicing (মূসক-৬.৩), 13-digit BIN validation & Mushak-9.1 return</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘X
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="outbound call voice phone ivr confirmation cod steadfast fraud btrc banglish dialect"
            onSelect={() => handleSelect(onOpenOutboundCalling)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI Outbound Phone Verification & COD</span>
                <span className="text-[11px] text-zinc-500">Autonomous voice IVR bot, Banglish dialect intent & Steadfast auto-booking</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘O
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="cross border sourcing customs declaration hs code 1688 taobao aliexpress nbr tariff cf clearing chittagong airport"
            onSelect={() => handleSelect(onOpenCrossBorderCustoms)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Cross-Border Sourcing & Customs Declaration</span>
                <span className="text-[11px] text-zinc-500">1688 landed cost calculator, NBR 8-digit HS code tariff & C&F clearance brief</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘U
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="franchise multi branch stock allocation rebalancing commission split ibst transfer otp bkash settlement"
            onSelect={() => handleSelect(onOpenFranchiseMultiBranch)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Multi-Tenant Franchise & Branch Stock</span>
                <span className="text-[11px] text-zinc-500">Multi-branch stock allocation, 3-way commission split & atomic IBST transfer with OTP</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘F
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="live selling facebook live tiktok stream comment to order parsing stock lock 15 min ttl 1 tap bkash payment shorts clip"
            onSelect={() => handleSelect(onOpenLiveSelling)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Video className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Live-Selling & Comment-to-Order Studio</span>
                <span className="text-[11px] text-zinc-500">Autonomous live comment parser, 15-min stock locks, 1-tap bKash links & 9:16 reels</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘L
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="nbr statutory audit dossier double entry general ledger trial balance chart of accounts 13 digit bin tax compliance"
            onSelect={() => handleSelect(onOpenAuditLedger)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Scale className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">NBR Statutory Audit Dossier & Double-Entry Ledger</span>
                <span className="text-[11px] text-zinc-500">Double-entry balancing, real-time trial balance & SHA-256 sealed NBR audit package</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘D
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="courier fleet arbitrage micro hub dispatcher steadfast pathao redx paperfly dsr dynamic rate rto prevention"
            onSelect={() => handleSelect(onOpenCourierArbitrage)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Autonomous Courier Fleet Arbitrage & Micro-Hub</span>
                <span className="text-[11px] text-zinc-500">Steadfast vs. Pathao vs. RedX vs. Paperfly dynamic routing & DSR % optimization</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘R
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="freelancer foreign inward remittance bangladesh bank 4% 10% ict export subsidy cash incentive form c prc ffc wise payoneer swift upwork"
            onSelect={() => handleSelect(onOpenFreelancerRemittance)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Freelancer Remittance & BB ICT Subsidy Ledger</span>
                <span className="text-[11px] text-zinc-500">4%-10% export cash incentive, Form-C generator & PRC/FFC reconciliation</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘I
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="dark store micro fulfillment hub dhaka dhanmondi uttara mirpur chittagong sylhet s curve bin pick path fefo lot expiry rebalance replenishment"
            onSelect={() => handleSelect(onOpenDarkHubFulfillment)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Autonomous Hyperlocal Dark Store & Micro-Hub</span>
                <span className="text-[11px] text-zinc-500">Dhaka/Chittagong/Sylhet geofencing, S-curve bin pick path & FEFO expiry radar</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘H
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="cashflow pnl working capital runway cod settlement bkash nagad steadfast pathao mfs fee rto loss discrepancy carrier underpayment"
            onSelect={() => handleSelect(onOpenMultiChannelCashflow)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Multi-Channel Cashflow & COD Settlement Reconciler</span>
                <span className="text-[11px] text-zinc-500">bKash/Nagad fees, Steadfast/Pathao COD reconciliation & 30-day runway forecast</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘M
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="wholesale supplier rfq b2b escrow chawkbazar islampur keraniganj tongi 1688 yiwu volume discount tier factory sourcing milestone agreement"
            onSelect={() => handleSelect(onOpenWholesaleRfqEscrow)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Wholesale Supplier RFQ & B2B Escrow Engine</span>
                <span className="text-[11px] text-zinc-500">Chawkbazar/Islampur/1688 price discovery, volume discount curves & milestone contracts</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘B
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="agri commodity sourcing wholesale mandi price radar khatunganj badamtoli karwan bazar bogra rajshahi maund mon shrinkage reefer cold chain farmer bkash advance"
            onSelect={() => handleSelect(onOpenAgriMandiRadar)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Wheat className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Agri-Commodity Sourcing & Mandi Price Radar</span>
                <span className="text-[11px] text-zinc-500">Khatunganj/Badamtoli/Karwan Bazar spot index, 1 Maund=40kg, shrinkage buffer & reefer dispatch</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘A
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="field agent pos bluetooth thermal print escpos 58mm 80mm roadside pop up bkash nagad dynamic qr offline crdt queue cash float balancing"
            onSelect={() => handleSelect(onOpenFieldAgentPos)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Field Agent POS & Bluetooth Thermal Print</span>
                <span className="text-[11px] text-zinc-500">Offline-first roadside POS, ESC/POS 58mm/80mm bytecode, bKash dynamic QR & float tally</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘P
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="nbr mushak 4.3 input output coefficient declarator factory costing bom raw material wastage value addition divisional vat office 7.5% refiling variance"
            onSelect={() => handleSelect(onOpenMushak43Declaration)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Factory className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">NBR Mushak-4.3 Factory Costing & BOM</span>
                <span className="text-[11px] text-zinc-500">Statutory input-output coefficient declaration (মূসক-৪.৩), BOM wastage % & 7.5% variance gate</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘4
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="carrier webhook logistics settlement reconciler steadfast pathao redx paperfly cod dispute underpayment double entry gl ledger"
            onSelect={() => handleSelect(onOpenMultiCarrierWebhook)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Multi-Carrier Webhooks & COD Reconciler</span>
                <span className="text-[11px] text-zinc-500">Steadfast/Pathao/RedX webhooks, automated double-entry GL ledger & underpayment claims</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘W
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="cross border export compliance bangladesh bank form exp erc registration asycuda customs manifest letter of credit lc repatriation swift prc"
            onSelect={() => handleSelect(onOpenExportCompliance)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Cross-Border Export Manifest & BB Form-EXP</span>
                <span className="text-[11px] text-zinc-500">Bangladesh Bank Form-EXP compiler, ERC statutory validator & 120-day FERA repatriation radar</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘E
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="cross border fx hedging forward contract rate lock bangladesh bank cirp sofr smart interest rate parity margin lien mark to market mtm"
            onSelect={() => handleSelect(onOpenFxHedging)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Cross-Border FX Hedging & Forward Rate Lock</span>
                <span className="text-[11px] text-zinc-500">BB FERA forward rate lock, CIRP pricing curve, 5% margin lien & MTM stress test</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘X
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="sme payroll statutory withholding income tax provident fund nbr bangladesh labour act section 50 ait salary payslip 108 return"
            onSelect={() => handleSelect(onOpenPayrollTax)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">SME Payroll, Tax & Provident Fund</span>
                <span className="text-[11px] text-zinc-500">NBR Income Tax Act 2023 progressive slabs, Section 50 salary withholding & Labour Act PF trustee</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘Y
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="corporate income tax nbr form 82c section 163 minimum turnover tax ait credit ledger vat mushak 9.1 sub-form 9.1 ites tax exemption return"
            onSelect={() => handleSelect(onOpenCorporateTax)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Corporate Tax & VAT Mushak-9.1</span>
                <span className="text-[11px] text-zinc-500">NBR Form 82C minimum tax floor, AIT withholding credit vault & Mushak-9.1 VAT adjustment</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘9
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="b2b invoice factoring bill discounting islamic murabaha cash advance mushak 6.3 pran square walton aarong escrow lien dscr"
            onSelect={() => handleSelect(onOpenInvoiceFactoring)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">B2B Invoice Factoring & Islamic Murabaha</span>
                <span className="text-[11px] text-zinc-500">85% instant cash advance, Mushak-6.3 verification, Shariah Murabaha vs SMART & escrow lien</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘I
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="b2b trade credit insurance debt recovery ni act 1881 section 138 bounced cheque dishonor legal notice artha rin adalat indemnity"
            onSelect={() => handleSelect(onOpenDebtRecovery)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Trade Credit Insurance & NI Act 138 Recovery</span>
                <span className="text-[11px] text-zinc-500">90% default indemnity bond, 30-day bounced cheque Section 138 notice & Artha Rin dossier</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘R
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="vernacular voice commerce webrtc banglish agent 1-click bkash payment link sms speech to intent sylheti chittagonian noakhali"
            onSelect={() => handleSelect(onOpenVoiceCommerce)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-500 border border-pink-500/20">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Vernacular Voice Commerce & WebRTC</span>
                <span className="text-[11px] text-zinc-500">Sub-150ms Banglish speech-to-intent, regional dialects & 1-click bKash payment SMS</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘V
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="ai legal contracts stamp duty act 1899 compliance bilingual non judicial stamp sha256 digital signature ict act 2006 vendor lease nda vesting"
            onSelect={() => handleSelect(onOpenLegalContracts)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Scale className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI Legal Contracts & Stamp Duty Act 1899 Studio</span>
                <span className="text-[11px] text-zinc-500">Bilingual contract generator, non-judicial e-stamp calculator & SHA-256 digital signature seal</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘L
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="nbr customs duty drawback dec export tariff refund dedo form a b dedo asycuda world form exp rmgs leather footwear"
            onSelect={() => handleSelect(onOpenDutyDrawback)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Ship className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">NBR Customs Duty Drawback & DEC Studio</span>
                <span className="text-[11px] text-zinc-500">Customs Act 2023 Sec 33/34 tariff refund, DEDO Form-A/B filing & Form-EXP cross-reconciler</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘B
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="halal certification islamic shariah governance bsti bds 1907 aaoifi 21 e-number food additive screener murabaha purification csbib"
            onSelect={() => handleSelect(onOpenHalalGovernance)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Halal Certification & Islamic Shariah Governance</span>
                <span className="text-[11px] text-zinc-500">BSTI BDS 1907 food & cosmetic compliance, E-number screener & AAOIFI 21 financial auditor</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘J
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="b2b collective buying bulk freight pooling 1688 yiwu khatunganj cbm volumetric tariff sharing moq escrow margin steadfast parcel splitter"
            onSelect={() => handleSelect(onOpenCollectiveBuying)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <Package className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Micro-Merchant Collective Buying & Freight Pooling</span>
                <span className="text-[11px] text-zinc-500">1688/Yiwu container pooling, CBM landed cost sharing & automated micro-hub parcel dispatch</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘P
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="government egp tender b2b corporate rfp cptu ppr 2008 ppa 2006 boq rate analysis bank guarantee tender security pg3 pw2"
            onSelect={() => handleSelect(onOpenTenderBid)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Government e-GP Tender & Corporate Bid Studio</span>
                <span className="text-[11px] text-zinc-500">CPTU STD PG3/PW2 bid generator, BOQ rate analysis & tender security bank guarantee tracker</span>
              </div>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
              ⌘T
            </CommandShortcut>
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
            value="developer twin code generation git ci cd deploy scaffold patch autonomous"
            onSelect={() => handleSelect(onOpenDeveloperTwin)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Developer Twin</span>
                <span className="text-[11px] text-zinc-500">Code Gen · Git Ops · CI/CD · Deploy · Dep Audit</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400 font-mono">10th</Badge>
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

          <CommandItem
            onSelect={() => handleSelect(onOpenVastSpotGpu)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Server className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Vast.ai Spot GPU Bursting</span>
                <span className="text-[11px] text-zinc-500">Dynamic cloud GPU containers with WebGPU hybrid fallback</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘B</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenEdgeMesh)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Multi-Region Edge Mesh</span>
                <span className="text-[11px] text-zinc-500">Sub-10ms localized reads across Dhaka, Singapore & Frankfurt</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘E</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenCanaryDirector)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Canary Traffic Director</span>
                <span className="text-[11px] text-zinc-500">Autonomous blue/green splitting & zero-downtime rollback</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘T</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenVulnerabilityImmunity)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Autonomous Penetration & Immunity Loop</span>
                <span className="text-[11px] text-zinc-500">Red-team security probing, virtual patch synthesis & zero-day immunity</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘P</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenMultiModelPareto)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Multi-Model Pareto Optimizer</span>
                <span className="text-[11px] text-zinc-500">Dynamic routing across Gemini, Claude, DeepSeek & Ollama</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘O</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenEpistemicConsensus)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Epistemic Consensus & Knowledge Vault</span>
                <span className="text-[11px] text-zinc-500">BFT peer verification & Merkle inclusion proofs for twin outputs</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘J</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(onOpenWebGpuEmbedding)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">WebGPU Local Embedding & Semantic Cache</span>
                <span className="text-[11px] text-zinc-500">Zero-latency cosine cache & BGE-m3 on-device tensor acceleration</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘U</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="zk snark prover zero knowledge groth16 alt-bn128 solvency merkle"
            onSelect={() => handleSelect(onOpenZkSnarkProver)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Epistemic Zero-Knowledge SNARK Prover</span>
                <span className="text-[11px] text-zinc-500">BN254 curve Groth16 zero-leakage solvency & Merkle proofs</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘Z</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="wasm linear crdt vector indices nearest neighbor zero copy 384d embedding benchmark"
            onSelect={() => handleSelect(onOpenWasmVectorIndex)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">WASM Linear CRDT Vector Indices</span>
                <span className="text-[11px] text-zinc-500">Zero-copy 384-d nearest-neighbor search & edge CRDT sync</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘Y</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1 border-zinc-200 dark:border-zinc-800" />

        {/* ── Category 5: Agentic Compute & Autonomous Operations (Slices 56-60) ── */}
        <CommandGroup
          heading={
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-purple-500 dark:text-purple-400 font-bold py-1">
              <span>🤖 5. Agentic Compute & Autonomous Ops</span>
            </div>
          }
        >
          <CommandItem
            value="agent computer openmuse browser takeover cas leased tasks action proposals pdf form filling asycuda form exp"
            onSelect={() => handleSelect(onOpenAgentComputer)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">OpenMuse Agentic Compute & Browser Takeover</span>
                <span className="text-[11px] text-zinc-500">CAS leased task worker, human approval gates & PDF form filler</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘U</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="customs tariff hs code classifier tti calculator commercial invoice cipl chittagong asycuda bangladesh customs"
            onSelect={() => handleSelect(onOpenCustomsTariff)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Ship className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">HS Code Tariff & Commercial Invoice Engine</span>
                <span className="text-[11px] text-zinc-500">8-digit HS Code classifier, Total Tax Incidence (TTI) & CIPL generator</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘N</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="multi-channel inventory matrix dark store rebalancer stock out prediction safety stock daraz facebook shop pos"
            onSelect={() => handleSelect(onOpenInventoryMatrix)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Multi-Channel Inventory Matrix & Rebalancer</span>
                <span className="text-[11px] text-zinc-500">Cross-channel buffer allocation, stock-out radar & dark store rebalancing</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘I</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="banglish voice ivr cod verification courier return minimizer steadfast pathao twilio fraud prevention otp"
            onSelect={() => handleSelect(onOpenCodIvr)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Banglish Voice IVR & COD Return Minimizer</span>
                <span className="text-[11px] text-zinc-500">Autonomous outbound calling, address verification & fraud deterrence</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘V</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="b2b micro factoring early liquidity radar invoice discounting bkash instant advance rfq supplier payout"
            onSelect={() => handleSelect(onOpenEarlyLiquidity)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Coins className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">B2B Micro-Factoring & Early Liquidity Radar</span>
                <span className="text-[11px] text-zinc-500">Automated invoice discount scoring, 80% advance disbursement & MFS settlement</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘L</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="kyc ocr smart nid national id trade license verification bangla extraction"
            onSelect={() => handleSelect(onOpenKycOcr)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Bengali KYC & NID / Trade License OCR</span>
                <span className="text-[11px] text-zinc-500">Autonomous Smart NID & municipal trade license extraction with SHA-256 seal</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘K</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="rto fraud shield courier blacklist steadfast pathao delivery success rate dsr bkash advance policy fake orders serial returners"
            onSelect={() => handleSelect(onOpenRtoFraudShield)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">RTO Fraud Shield & Courier Blacklist</span>
                <span className="text-[11px] text-zinc-500">Steadfast & Pathao DSR scoring, community blacklist & dynamic bKash advance</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌥F</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="flash sale inventory matrix leased reservation lock daraz woocommerce facebook live whatsapp eid 11.11 panic freeze"
            onSelect={() => handleSelect(onOpenFlashInventory)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Flash-Sale Inventory & Reservation Lock</span>
                <span className="text-[11px] text-zinc-500">15-min leased locks, multi-channel stock sync & anti-overselling guard</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌥I</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="land registry deed verification title search khatian porcha baya deed chain mutation stamp duty ac land"
            onSelect={() => handleSelect(onOpenLandRegistry)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Bengali Land Record & Title Search Studio</span>
                <span className="text-[11px] text-zinc-500">Khatian/Porcha verification, Baya deed chain audit & AC Land e-mutation</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌥D</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="jute export golden fiber raw jute grading baling press epb cash subsidy 12% nbr customs bonded warehouse djg hessian sacking cbc"
            onSelect={() => handleSelect(onOpenJuteExport)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-600/10 text-amber-600 border border-amber-600/20">
                <Wheat className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Golden Fiber Jute & DJG Export Studio</span>
                <span className="text-[11px] text-zinc-500">BJMC grading, moisture penalty, 12% cash subsidy & NBR bonded ledger</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌘J</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* ── Category 6: Labs, Voice Duplex & Ecosystem Hub ── */}
        <CommandGroup
          heading={
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-purple-500 dark:text-purple-400 font-bold py-1">
              <span>🚀 6. Labs, Voice Duplex & Ecosystem Hub</span>
            </div>
          }
        >
          <CommandItem
            value="scenario lab chaos engineering stress simulation reliability test unit economics financial tam sam som runway failure modes monte carlo"
            onSelect={() => handleSelect(onOpenScenarioLab)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Scenario Lab (Chaos & Stress Simulation)</span>
                <span className="text-[11px] text-zinc-500">30-scenario fault injection, SRE reliability & unit economics modeling</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌥S</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="unified voice studio orb avatar 3d speech duplex mic conversational audio assistant regional banglish dialects"
            onSelect={() => handleSelect(onOpenUnifiedVoice)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Unified 3D Voice Studio & Neural Orb</span>
                <span className="text-[11px] text-zinc-500">Full-duplex audio assistant with 4 dialect personas & 3D particle orb</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌥V</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="emporium marketplace skill providers agent store agentic books publishing creations templates plugins"
            onSelect={() => handleSelect(onOpenEmporium)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Skill Provider Emporium & Marketplace</span>
                <span className="text-[11px] text-zinc-500">Curated agent skills, verified plugins & agentic book creations</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌥E</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="community swarm forums developer discussions reviewer fund astryx personas bounties"
            onSelect={() => handleSelect(onOpenCommunity)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Developer Community & Agent Swarm</span>
                <span className="text-[11px] text-zinc-500">Developer channels, reviewer fund bounties & agent persona dispatches</span>
              </div>
            </div>
            <CommandShortcut className="font-mono text-[10px] text-zinc-400">⌥C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
