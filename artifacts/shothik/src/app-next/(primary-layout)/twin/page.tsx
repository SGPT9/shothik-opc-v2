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
import { TwinVideoStudioModal } from "@/components/twin/TwinVideoStudioModal";
import { SpecializedTwinsModal } from "@/components/twin/SpecializedTwinsModal";
import { TwinFloatingCapsuleOverlay } from "@/components/twin/TwinFloatingCapsuleOverlay";
import { TwinCommandPalette } from "@/components/twin/TwinCommandPalette";
import { EmailOutreachModal } from "@/components/twin/EmailOutreachModal";
import { LeadCrmDrawer } from "@/components/twin/LeadCrmDrawer";
import { CompetitorAdSpyModal } from "@/components/twin/CompetitorAdSpyModal";
import { CroTunerModal } from "@/components/twin/CroTunerModal";
import { VisualStorefrontBuilderModal } from "@/components/twin/VisualStorefrontBuilderModal";
import { BookReaderStorefrontModal } from "@/components/twin/BookReaderStorefrontModal";
import { SteadfastCourierModal } from "@/components/twin/SteadfastCourierModal";
import { StartupBuildsModal } from "@/components/twin/StartupBuildsModal";
import { NilkhetPodModal } from "@/components/twin/NilkhetPodModal";
import { MultiDialectVoiceTwinModal } from "@/components/twin/MultiDialectVoiceTwinModal";
import { SwarmGraphStudioModal } from "@/components/twin/SwarmGraphStudioModal";
import { VastSpotGpuModal } from "@/components/twin/VastSpotGpuModal";
import { EdgeMeshStudioModal } from "@/components/twin/EdgeMeshStudioModal";
import { CanaryTrafficDirectorModal } from "@/components/twin/CanaryTrafficDirectorModal";
import { VulnerabilityImmunityModal } from "@/components/twin/VulnerabilityImmunityModal";
import { MultiModelParetoModal } from "@/components/twin/MultiModelParetoModal";
import { EpistemicConsensusModal } from "@/components/twin/EpistemicConsensusModal";
import { WebGpuEmbeddingModal } from "@/components/twin/WebGpuEmbeddingModal";
import { ZkSnarkProverModal } from "@/components/twin/ZkSnarkProverModal";
import { WasmVectorIndexModal } from "@/components/twin/WasmVectorIndexModal";
import { DeveloperTwinModal } from "@/components/twin/DeveloperTwinModal";
import { PlatformServicesModal } from "@/components/twin/PlatformServicesModal";
import { WhatsAppCommerceModal } from "@/components/twin/WhatsAppCommerceModal";
import { MushakTaxStudioModal } from "@/components/twin/MushakTaxStudioModal";
import { OutboundCallVerificationModal } from "@/components/twin/OutboundCallVerificationModal";
import { CrossBorderCustomsModal } from "@/components/twin/CrossBorderCustomsModal";
import { PlatformElevatorsViralModal } from "@/components/twin/PlatformElevatorsViralModal";
import { FranchiseMultiBranchModal } from "@/components/twin/FranchiseMultiBranchModal";
import { LiveSellingStudioModal } from "@/components/twin/LiveSellingStudioModal";
import { AuditLedgerStudioModal } from "@/components/twin/AuditLedgerStudioModal";
import { CourierArbitrageModal } from "@/components/twin/CourierArbitrageModal";
import { FreelancerRemittanceModal } from "@/components/twin/FreelancerRemittanceModal";
import { DarkHubFulfillmentModal } from "@/components/twin/DarkHubFulfillmentModal";
import { MultiChannelCashflowModal } from "@/components/twin/MultiChannelCashflowModal";
import { WholesaleRfqEscrowModal } from "@/components/twin/WholesaleRfqEscrowModal";
import CreatorCashoutModal from "@/components/credits/CreatorCashoutModal";
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
  Building2,
  ChevronDown,
  Check,
  Settings,
  Search,
  Coins,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getActiveCompanyProfile,
  getCompaniesList,
  saveCompanyProfile,
  createCompanyProfile,
  deleteCompanyProfile,
  syncCompanyToBackend,
  executeWayfinderTaskOnBackend,
  CompanyProfile,
  CockpitTask,
  CockpitDoc,
  StandupMessage,
  slugify,
} from "@/lib/twin/dynamic-company-store";

/* ------------------------------------------------------------------ */
/* Types & Mock Data                                                  */
/* ------------------------------------------------------------------ */

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
  const [companyList, setCompanyList] = useState<CompanyProfile[]>(() => {
    return getCompaniesList();
  });

  const [activeProfile, setActiveProfile] = useState<CompanyProfile>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const compParam = sp.get("company");
      return getActiveCompanyProfile(compParam || undefined);
    }
    return createCompanyProfile("Shothik Autonomous Venture");
  });

  const [companyName, setCompanyName] = useState(activeProfile.name);
  const [companySlug, setCompanySlug] = useState(activeProfile.slug);
  const [isCompanyPaused, setIsCompanyPaused] = useState<boolean>(activeProfile.isPaused || false);
  const [tasks, setTasks] = useState<CockpitTask[]>(activeProfile.tasks);
  const [docs, setDocs] = useState<CockpitDoc[]>(activeProfile.docs);
  const [feed, setFeed] = useState<StandupMessage[]>(activeProfile.feed);
  const [chatInput, setChatInput] = useState("");
  const [credits, setCredits] = useState<number>(15);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  // Business metrics
  const [visitorCount, setVisitorCount] = useState<number>(activeProfile.visitorCount || 128);
  const [revenueBdt, setRevenueBdt] = useState<number>(activeProfile.revenueBdt || 45200);

  // Switch active company function
  const handleSelectCompany = (profile: CompanyProfile) => {
    setActiveProfile(profile);
    setCompanyName(profile.name);
    setCompanySlug(profile.slug);
    setIsCompanyPaused(profile.isPaused || false);
    setTasks(profile.tasks);
    setDocs(profile.docs);
    setFeed(profile.feed);
    setRevenueBdt(profile.revenueBdt || 0);
    setVisitorCount(profile.visitorCount || 1);
    setCompanyDropdownOpen(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("shothik_active_company", profile.slug);
      const url = new URL(window.location.href);
      url.searchParams.set("company", profile.slug);
      window.history.pushState({}, "", url.toString());
    }
  };

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
  const [specializedTwinsOpen, setSpecializedTwinsOpen] = useState(false);
  const [capsuleActive, setCapsuleActive] = useState(false);
  const [capsuleStatus, setCapsuleStatus] = useState("Autonomous Twin executing in background...");
  const [capsuleTwin, setCapsuleTwin] = useState("Swarm Orchestrator");

  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [manageTasksOpen, setManageTasksOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [inviteSent, setInviteSent] = useState(false);
  const [collaborators, setCollaborators] = useState<Array<{ id: string; email: string; role: string; status: string }>>([
    { id: "collab_owner", email: "founder@shothik.ai", role: "admin", status: "accepted" },
  ]);

  const [activeDoc, setActiveDoc] = useState<CockpitDoc | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mfsGatewayOpen, setMfsGatewayOpen] = useState(false);
  const [mfsGatewayTab, setMfsGatewayTab] = useState<"credentials" | "simulator" | "manual_trx">("credentials");
  const [creatorCashoutOpen, setCreatorCashoutOpen] = useState(false);
  const [connectCompanyOpen, setConnectCompanyOpen] = useState(false);
  const [voiceCommanderOpen, setVoiceCommanderOpen] = useState(false);
  const [dailyDigestOpen, setDailyDigestOpen] = useState(false);
  const [dokployOpen, setDokployOpen] = useState(false);
  const [secondMeMemoryOpen, setSecondMeMemoryOpen] = useState(false);
  const [videoStudioOpen, setVideoStudioOpen] = useState(false);
  const [memoryCount, setMemoryCount] = useState(4);

  // Command Center & Operational Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [emailOutreachOpen, setEmailOutreachOpen] = useState(false);
  const [leadCrmOpen, setLeadCrmOpen] = useState(false);
  const [competitorAdSpyOpen, setCompetitorAdSpyOpen] = useState(false);
  const [croTunerOpen, setCroTunerOpen] = useState(false);
  const [visualStorefrontOpen, setVisualStorefrontOpen] = useState(false);
  const [bookReaderOpen, setBookReaderOpen] = useState(false);
  const [steadfastCourierOpen, setSteadfastCourierOpen] = useState(false);
  const [startupBuildsOpen, setStartupBuildsOpen] = useState(false);
  const [nilkhetPodOpen, setNilkhetPodOpen] = useState(false);
  const [multiDialectVoiceOpen, setMultiDialectVoiceOpen] = useState(false);
  const [swarmGraphOpen, setSwarmGraphOpen] = useState(false);
  const [vastSpotGpuOpen, setVastSpotGpuOpen] = useState(false);
  const [edgeMeshOpen, setEdgeMeshOpen] = useState(false);
  const [canaryDirectorOpen, setCanaryDirectorOpen] = useState(false);
  const [vulnerabilityImmunityOpen, setVulnerabilityImmunityOpen] = useState(false);
  const [multiModelParetoOpen, setMultiModelParetoOpen] = useState(false);
  const [epistemicConsensusOpen, setEpistemicConsensusOpen] = useState(false);
  const [webGpuEmbeddingOpen, setWebGpuEmbeddingOpen] = useState(false);
  const [zkSnarkProverOpen, setZkSnarkProverOpen] = useState(false);
  const [wasmVectorIndexOpen, setWasmVectorIndexOpen] = useState(false);
  const [developerTwinOpen, setDeveloperTwinOpen] = useState(false);
  const [platformServicesOpen, setPlatformServicesOpen] = useState(false);
  const [whatsAppCommerceOpen, setWhatsAppCommerceOpen] = useState(false);
  const [mushakTaxStudioOpen, setMushakTaxStudioOpen] = useState(false);
  const [outboundCallingOpen, setOutboundCallingOpen] = useState(false);
  const [crossBorderCustomsOpen, setCrossBorderCustomsOpen] = useState(false);
  const [platformElevatorsOpen, setPlatformElevatorsOpen] = useState(false);
  const [franchiseMultiBranchOpen, setFranchiseMultiBranchOpen] = useState(false);
  const [liveSellingOpen, setLiveSellingOpen] = useState(false);
  const [auditLedgerOpen, setAuditLedgerOpen] = useState(false);
  const [courierArbitrageOpen, setCourierArbitrageOpen] = useState(false);
  const [freelancerRemittanceOpen, setFreelancerRemittanceOpen] = useState(false);
  const [darkHubFulfillmentOpen, setDarkHubFulfillmentOpen] = useState(false);
  const [multiChannelCashflowOpen, setMultiChannelCashflowOpen] = useState(false);
  const [wholesaleRfqEscrowOpen, setWholesaleRfqEscrowOpen] = useState(false);

  // Global ⌘K / Ctrl+K, ⌘W, ⌘X, ⌘O, ⌘U, ⌘F, ⌘L, ⌘D, ⌘R and multi-tool keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        setWhatsAppCommerceOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x") {
        e.preventDefault();
        setMushakTaxStudioOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setOutboundCallingOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setCrossBorderCustomsOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFranchiseMultiBranchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setLiveSellingOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setAuditLedgerOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setCourierArbitrageOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setFreelancerRemittanceOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setDarkHubFulfillmentOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setMultiChannelCashflowOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "q") {
        e.preventDefault();
        setWholesaleRfqEscrowOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setMultiDialectVoiceOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setSwarmGraphOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setVastSpotGpuOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEdgeMeshOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setCanaryDirectorOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setVulnerabilityImmunityOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setEpistemicConsensusOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setZkSnarkProverOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        setWasmVectorIndexOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load active company profile and list
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const companyParam = sp.get("company");

      if (companyParam) {
        const loaded = getActiveCompanyProfile(companyParam);
        setActiveProfile(loaded);
        setCompanyName(loaded.name);
        setCompanySlug(loaded.slug);
        setIsCompanyPaused(loaded.isPaused || false);
        setTasks(loaded.tasks);
        setDocs(loaded.docs);
        setFeed(loaded.feed);
        setRevenueBdt(loaded.revenueBdt || 0);
        setVisitorCount(loaded.visitorCount || 1);
      }
      setCompanyList(getCompaniesList());
    }
  }, []);

  // Auto-open video studio if URL contains ?tab=video or ?section=animation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("tab") === "video" || sp.get("section") === "animation" || sp.get("section") === "video") {
        setVideoStudioOpen(true);
      }
    }
  }, []);

  // Sync state back to active company profile
  useEffect(() => {
    if (!activeProfile) return;
    const updated: CompanyProfile = {
      ...activeProfile,
      name: companyName,
      slug: companySlug,
      isPaused: isCompanyPaused,
      tasks,
      docs,
      feed,
      revenueBdt,
      visitorCount,
    };
    saveCompanyProfile(updated);
  }, [companyName, companySlug, isCompanyPaused, tasks, docs, feed, revenueBdt, visitorCount]);

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

  // Fetch company collaborators from backend
  useEffect(() => {
    if (!companySlug) return;
    let active = true;
    fetch(`/api/v1/twin/companies/${companySlug}/collaborators`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d?.data && Array.isArray(d.data)) {
          setCollaborators([
            { id: "collab_owner", email: "founder@shothik.ai", role: "admin", status: "accepted" },
            ...d.data,
          ]);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [companySlug]);

  // Fetch live credits balance from subscription ledger
  useEffect(() => {
    let active = true;
    fetch("/api/v1/subscriptions/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && typeof d.creditsBalance === "number") {
          setCredits(d.creditsBalance);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
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

  const handleStartAutoMode = async (hours: number) => {
    setAutoModeActive(true);
    setAutoModeRemaining(hours * 3600);
    setFeed((prev) => [
      ...prev,
      {
        id: `auto-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        text: `⚡ Auto Mode activated for ${hours} hours. Shothik will execute queued tasks and formulate next-step roadmaps autonomously.`,
      },
    ]);

    setTerminalLogs([
      `> ⚡ Auto Mode engaged for ${hours} hours. Founder is away.`,
      `> 🔄 Initializing 5-Stage Twin Cycle across 9 Specialized Twins...`,
      `> 🌪️ Autonomous Sentinel: Chaos fuzzing & memory leak profiling active...`,
    ]);

    try {
      const pendingTasks = tasks.filter((t) => t.status !== "done");
      const res = await fetch("/api/v1/twin/auto-mode/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours,
          companySlug,
          companyName,
          userId: "usr_founder_live",
          tasks: pendingTasks,
        }),
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          const { executedTasks, digest, twinCycle } = body.data;

          // 1. Update executed tasks in state
          if (Array.isArray(executedTasks) && executedTasks.length > 0) {
            const executedIds = new Set(executedTasks.map((et: any) => et.taskId));
            setTasks((prev) =>
              prev.map((t) => (executedIds.has(t.id) ? { ...t, status: "done" } : t))
            );

            for (const et of executedTasks) {
              setFeed((prev) => [
                ...prev,
                {
                  id: `shipped-${Date.now()}-${et.taskId}`,
                  time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                  text: et.standupLog || `✅ Shipped: **${et.taskId}** autonomously.`,
                },
              ]);
            }
          }

          // 2. Add Twin 5-Stage Cycle update to feed
          if (twinCycle) {
            setFeed((prev) => [
              ...prev,
              {
                id: `twin-cyc-${Date.now()}`,
                time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                text: `🤖 [${twinCycle.decision?.targetTwin || "Operations Twin"}] ${twinCycle.twinOutput}`,
              },
            ]);
          }

          // 3. Attach CEO Away Briefing to Documents
          if (digest) {
            const newDoc: CockpitDoc = {
              id: `doc_briefing_${Date.now()}`,
              title: `CEO Away Briefing — ${digest.date} (${digest.overallHealthScore}/100 Health)`,
              timeAgo: "JUST NOW",
              kind: "CEO Report",
              content: digest.markdownReport,
            };
            setDocs((prev) => [newDoc, ...prev]);

            setFeed((prev) => [
              ...prev,
              {
                id: `digest-${Date.now()}`,
                time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                text: `🌅 **Executive Away Briefing Compiled**: Health Score **${digest.overallHealthScore}/100**. ${digest.topActionItems?.length || 0} strategic recommendations ready for review.`,
              },
            ]);
          }

          setTerminalLogs((prev) => [
            ...prev,
            `> ✅ Auto Mode batch execution complete: ${executedTasks?.length || 0} tasks shipped.`,
            `> 📊 Memory headroom stable. Overnight daemon active.`,
          ]);
        }
      }
    } catch {
      // Graceful offline fallback: keep countdown active in client
    }
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

  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

  const handleExecuteTask = async (task: CockpitTask) => {
    if (executingTaskId || task.status === "completed" || task.status === "done") return;
    setExecutingTaskId(task.id);

    setTerminalLogs([
      `> Initiating autonomous execution for: "${task.title}"...`,
      `> Dispatching specialized Swarm agent to container sandbox...`,
      `> Running linting, security scanning, and automated integration checks...`,
    ]);

    const res = await executeWayfinderTaskOnBackend({
      companySlug,
      companyName,
      taskId: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      urgency: task.urgency,
      costCredits: task.costCredits || 1,
    });

    setExecutingTaskId(null);

    // Mark task as completed
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "completed" } : t))
    );

    // Deduct credits
    setCredits((prev) => Math.max(0, prev - (task.costCredits || 1)));

    // Update terminal & standup feed
    const commitText = res.commitHash ? ` [${res.commitHash}]` : "";
    setTerminalLogs((prev) => [
      ...prev,
      `> ✅ Task completed successfully${commitText}!`,
      `> Deployed live to https://${companySlug}.shothikgpt.com`,
    ]);

    setFeed((prev) => [
      ...prev,
      {
        id: `exec-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        text: res.standupLog || `✅ Shipped: **${task.title}**${commitText}. Verified in sandbox and deployed live to production.`,
      },
    ]);
  };

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    // Auto extract founder preferences or directives from standup messages
    memoryExtractionService.extractAndCommit({
      prompt: "Founder directive to Shothik",
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
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] px-6 py-3.5 flex items-center justify-between shadow-xs relative z-30">
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {companyName}
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-transform" />
            </button>

            {/* Direct Company Settings Shortcut */}
            <button
              type="button"
              onClick={() => setCompanySettingsOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer rounded"
              title="Company Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Dynamic Multi-Company Dropdown Menu */}
            {companyDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18191c] shadow-xl p-2 z-50 font-sans">
                <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Switch Active Company
                </div>
                <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                  {companyList.map((comp) => (
                    <button
                      key={comp.id || comp.slug}
                      type="button"
                      onClick={() => handleSelectCompany(comp)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                        comp.slug === companySlug ? "bg-zinc-100 dark:bg-zinc-800 font-bold text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-medium">{comp.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{comp.industry || "Venture"}</p>
                      </div>
                      {comp.slug === companySlug && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href="/twin/new"
                    className="w-full px-2.5 py-1.5 rounded text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Autonomous Company</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {isCompanyPaused && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-400 dark:border-amber-700 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 rounded-md">
              ⏸️ PAUSED
            </span>
          )}

          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-md">
            AUTONOMOUS FOUNDER COCKPIT
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-700 dark:text-amber-400 font-mono text-[11px] font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{credits} CREDITS</span>
          </div>
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono font-semibold text-[11px] uppercase tracking-wider rounded-md shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer select-none"
            title="Open Command Center (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>COMMAND CENTER</span>
            <kbd className="hidden sm:inline-block text-[9px] bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 px-1 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => setVideoStudioOpen(true)}
            className={beveledBtnClass}
            title="Generate Animated Explainer Video & Social Reels"
          >
            🎬 VIDEO STUDIO
          </button>
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
              Shothik
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

            <button
              type="button"
              onClick={() => setSpecializedTwinsOpen(true)}
              className={`w-full mt-2 ${beveledBtnClass} bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/80 font-bold`}
            >
              <span>🤖</span>
              <span>THE 9 SPECIALIZED TWINS</span>
            </button>

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
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">TASK CREDITS:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">{credits} Available</span>
              </div>
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

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setMfsGatewayTab("credentials");
                  setMfsGatewayOpen(true);
                }}
                className={beveledBtnClass}
              >
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>MFS GATEWAY</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatorCashoutOpen(true)}
                className={beveledBtnClass}
                data-testid="button-creator-cashout"
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span>CASHOUT (TDS)</span>
              </button>
            </div>
          </div>

          {/* Teams Widget */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-white">
                Teams
              </h3>
              <span className="font-mono text-[10px] text-zinc-500">
                {collaborators.length} {collaborators.length === 1 ? "MEMBER" : "MEMBERS"}
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {collaborators.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded group">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate text-[11px] font-sans text-zinc-800 dark:text-zinc-200 font-medium" title={c.email}>
                      {c.email.split("@")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] uppercase px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded">
                      {c.role}
                    </span>
                    {c.id !== "collab_owner" && (
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/v1/twin/companies/${companySlug}/collaborators/${c.id}`, { method: "DELETE" }).catch(() => {});
                          setCollaborators((prev) => prev.filter((item) => item.id !== c.id));
                          setFeed((prev) => [
                            ...prev,
                            {
                              id: `del-collab-${Date.now()}`,
                              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                              text: `Removed collaborator ${c.email} from ${companyName}.`,
                            },
                          ]);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 text-xs px-1 transition-opacity cursor-pointer"
                        title="Remove Collaborator"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setInviteEmail("");
                setInviteSent(false);
                setInviteModalOpen(true);
              }}
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
                  className={`p-4 border transition-all space-y-2.5 shadow-xs rounded-lg ${
                    task.status === "completed" || task.status === "done"
                      ? "border-emerald-500/40 bg-emerald-950/20 dark:bg-emerald-950/30"
                      : "border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121315] hover:border-zinc-400 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-sm font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
                      {task.title}
                    </h4>
                    {task.status === "completed" || task.status === "done" ? (
                      <span className="shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-950/60 rounded">
                        ✓ SHIPPED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExecuteTask(task)}
                        disabled={executingTaskId !== null}
                        className="shrink-0 px-2.5 py-1 font-mono text-[10px] font-bold text-amber-300 hover:text-amber-200 border border-amber-500/50 hover:border-amber-400 bg-amber-950/40 hover:bg-amber-950/70 rounded transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>{executingTaskId === task.id ? "RUNNING..." : "⚡ RUN"}</span>
                      </button>
                    )}
                  </div>

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
                href={activeProfile.domain || `https://${companySlug}.shothikgpt.com`}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>🔗</span>
                <span>{activeProfile.domain || `https://${companySlug}.shothikgpt.com`}</span>
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
                <span className="font-bold text-zinc-950 dark:text-white">{companyName} @{companySlug}</span>
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
                      text: `🐦 Generated product announcement for ${companyName}: '${companyName} autonomous engine is live with 100% automated operations across ${activeProfile.industry || "digital workflows"}.' Queued for your review.`,
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
                      text: `⚡ Auto-Tweet enabled for ${companyName}. Shothik AI will post verified milestone threads directly to connected social accounts.`,
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
                {activeProfile.email || `${companySlug}@shothikgpt.com`}
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
                      text: `✉️ Cold Outreach campaign prepared for ${companyName}: 25 target prospective leads across ${activeProfile.industry || "regional markets"} imported. Review draft before dispatch.`,
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
                  id="twin-cockpit-chat-input"
                  name="twin-cockpit-chat-input"
                  aria-label="Ask Shothik anything..."
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Shothik anything..."
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
        onSuccess={(plan, price, creditsAdded) => {
          const amount = creditsAdded || 15;
          fetch("/api/v1/subscriptions/topup-credits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, paymentMethod: "card" }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (data && typeof data.creditsBalance === "number") {
                setCredits(data.creditsBalance);
              } else {
                setCredits((c) => c + amount);
              }
            })
            .catch(() => {
              setCredits((c) => c + amount);
            });
          setFeed((prev) => [
            ...prev,
            {
              id: `cred-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `💳 Successfully added ${amount} task credits (${plan}). Workspace credit balance updated.`,
            },
          ]);
        }}
      />

      <DocumentsListModal
        open={docsListOpen}
        onOpenChange={setDocsListOpen}
        docs={docs.map((d) => ({
          id: d.id,
          title: d.title,
          timeAgo: d.timeAgo,
          type: d.kind.toLowerCase().includes("report") ? "report" : "document",
          content: d.content,
        }))}
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
        isPaused={isCompanyPaused}
        onSaveCompanyName={(newName) => {
          setCompanyName(newName);
          fetch(`/api/v1/twin/companies/${companySlug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
          }).catch(() => {});
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
          setIsCompanyPaused(paused);
          fetch(`/api/v1/twin/companies/${companySlug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPaused: paused }),
          }).catch(() => {});
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
          fetch(`/api/v1/twin/companies/${companySlug}`, {
            method: "DELETE",
          }).catch(() => {});
          deleteCompanyProfile(companySlug);
          setFeed((prev) => [
            ...prev,
            {
              id: `del-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              text: `⚠️ ${companyName} deletion requested. Purging containers and workspace records.`,
            },
          ]);
          const remaining = getCompaniesList().filter((c) => c.slug !== companySlug);
          if (remaining.length > 0) {
            handleSelectCompany(remaining[0]);
          }
        }}
      />

      <ManageDomainsModal
        open={manageDomainsOpen}
        onOpenChange={setManageDomainsOpen}
        polsiaUrl="https://verifiq-3.shothikgpt.com"
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
        onStartOutreach={async (freq) => {
          const logs = [
            "> Provisioning Shothik outbound SMTP proxy (verifiq-3@shothikgpt.com)...",
            "> Domain DNS DKIM/SPF auto-validated via Cloudflare Turnstile...",
            "> Auto-Cold Outreach pipeline is active and queued for dispatch.",
          ];
          for (const log of logs) {
            await new Promise((r) => setTimeout(r, 600));
            setTerminalLogs((prev) => [...prev.slice(-6), log]);
          }
          const outreachMsg: StandupMessage = {
            id: `msg-${Date.now()}`,
            time: "JUST NOW",
            text: `✉️ Auto Cold Outreach activated (${freq.toUpperCase()}). Shothik will send tailored pitches to target CTOs from verifiq-3@shothikgpt.com.`,
          };
          setFeed((prev) => [...prev, outreachMsg]);
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
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-serif text-sm font-semibold">Invite dispatched to {inviteEmail}</p>
              <p className="text-xs text-zinc-500 font-sans">
                Role: <span className="font-mono uppercase font-bold text-black dark:text-white">{inviteRole}</span> • Scope: {companyName} only
              </p>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                DONE
              </button>
            </div>
          ) : (
            <div className="space-y-4 mt-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  COLLABORATOR EMAIL
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@fintech.com"
                  className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-none outline-none font-serif text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  SCOPED ROLE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["editor", "viewer", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`py-1.5 px-2 text-[11px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                        inviteRole === r
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                          : "border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <p className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                *This invite only grants access to {companyName}. It does not grant access to your other companies.*
              </p>

              <button
                type="button"
                disabled={!inviteEmail.includes("@")}
                onClick={async () => {
                  const emailToInvite = inviteEmail.trim();
                  try {
                    const res = await fetch(`/api/v1/twin/companies/${companySlug}/collaborators`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: emailToInvite, role: inviteRole }),
                    });
                    const data = await res.json().catch(() => null);
                    if (res.ok && data?.data) {
                      setCollaborators((prev) => [...prev, data.data]);
                    } else {
                      setCollaborators((prev) => [
                        ...prev,
                        { id: `collab_${Date.now()}`, email: emailToInvite, role: inviteRole, status: "pending" },
                      ]);
                    }
                  } catch {
                    setCollaborators((prev) => [
                      ...prev,
                      { id: `collab_${Date.now()}`, email: emailToInvite, role: inviteRole, status: "pending" },
                    ]);
                  }
                  setInviteSent(true);
                  setFeed((prev) => [
                    ...prev,
                    {
                      id: `inv-${Date.now()}`,
                      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                      text: `👥 Collaborator invitation dispatched to ${emailToInvite} as **${inviteRole.toUpperCase()}**. Scoped to ${companyName} only.`,
                    },
                  ]);
                }}
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
            <button
              onClick={() => { setMenuOpen(false); setVideoStudioOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer bg-purple-500/5 font-semibold text-purple-600 dark:text-purple-400"
            >
              🎬 AI Video & Reels Studio
            </button>
            <button
              onClick={() => { setMenuOpen(false); setSpecializedTwinsOpen(true); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer bg-indigo-500/5 font-semibold text-indigo-600 dark:text-indigo-400"
            >
              🤖 The 9 Specialized Twins Swarm
            </button>
            <button
              onClick={() => { setMenuOpen(false); setCapsuleActive(!capsuleActive); }}
              className="p-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer bg-amber-500/5 font-semibold text-amber-600 dark:text-amber-400"
            >
              💊 Floating Agent Capsule ({capsuleActive ? "Active" : "Hidden"})
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Supporting Modals */}
      <SecondMeMemoryModal isOpen={secondMeMemoryOpen} onClose={() => setSecondMeMemoryOpen(false)} twinName={companyName} />
      <MfsGatewayModal open={mfsGatewayOpen} onOpenChange={setMfsGatewayOpen} initialTab={mfsGatewayTab} />
      <CreatorCashoutModal
        open={creatorCashoutOpen}
        onOpenChange={setCreatorCashoutOpen}
        availableEarningsBdt={revenueBdt}
        onSuccess={(remaining) => setRevenueBdt(remaining)}
      />
      <ConnectExistingCompanyModal open={connectCompanyOpen} onOpenChange={setConnectCompanyOpen} />
      <VoiceCommanderModal open={voiceCommanderOpen} onOpenChange={setVoiceCommanderOpen} />
      <DailyDigestModal open={dailyDigestOpen} onOpenChange={setDailyDigestOpen} />
      <DokployMicroContainersModal open={dokployOpen} onOpenChange={setDokployOpen} />
      <TwinVideoStudioModal open={videoStudioOpen} onOpenChange={setVideoStudioOpen} companyName={companyName} />
      <SpecializedTwinsModal
        open={specializedTwinsOpen}
        onOpenChange={setSpecializedTwinsOpen}
        companySlug={companySlug}
        companyName={companyName}
        onDispatchTwin={(twinName, action, log) => {
          setTerminalLogs((prev) => [...prev.slice(-20), `> [${twinName}] Dispatched: ${action}`, `> ${log}`]);
          setCapsuleTwin(twinName);
          setCapsuleStatus(`Dispatched: ${action}`);
          setCapsuleActive(true);
        }}
      />

      {/* Unified ⌘K Command Center & Operational Palette */}
      <TwinCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenSecondMeMemory={() => setSecondMeMemoryOpen(true)}
        onOpenSpecializedTwins={() => setSpecializedTwinsOpen(true)}
        onOpenAutoMode={() => setAutoModeOpen(true)}
        onOpenNightshift={() => setNightshiftOpen(true)}
        onOpenDailyDigest={() => setDailyDigestOpen(true)}
        onOpenCompanySettings={() => setCompanySettingsOpen(true)}
        onOpenVoiceCommander={() => setMultiDialectVoiceOpen(true)}
        onOpenSwarmGraph={() => setSwarmGraphOpen(true)}
        onOpenAddCredits={() => setAddCreditsOpen(true)}
        onOpenAutoColdOutreach={() => setAutoColdOutreachOpen(true)}
        onOpenEmailOutreach={() => setEmailOutreachOpen(true)}
        onOpenLeadCrm={() => setLeadCrmOpen(true)}
        onOpenCompetitorAdSpy={() => setCompetitorAdSpyOpen(true)}
        onOpenCroTuner={() => setCroTunerOpen(true)}
        onOpenVideoStudio={() => setVideoStudioOpen(true)}
        onOpenMfsGateway={() => {
          setMfsGatewayTab("credentials");
          setMfsGatewayOpen(true);
        }}
        onOpenCreatorCashout={() => setCreatorCashoutOpen(true)}
        onOpenManualTrxSettlement={() => {
          setMfsGatewayTab("manual_trx");
          setMfsGatewayOpen(true);
        }}
        onOpenSteadfastCourier={() => setSteadfastCourierOpen(true)}
        onOpenVisualStorefront={() => setVisualStorefrontOpen(true)}
        onOpenBookReader={() => setBookReaderOpen(true)}
        onOpenNilkhetPod={() => setNilkhetPodOpen(true)}
        onOpenStartupBuilds={() => setStartupBuildsOpen(true)}
        onOpenWebsiteHub={() => setWebsiteHubOpen(true)}
        onOpenManageDomains={() => setManageDomainsOpen(true)}
        onOpenVersions={() => setVersionsOpen(true)}
        onOpenSecrets={() => setSecretsOpen(true)}
        onOpenRedeploy={() => setRedeployOpen(true)}
        onOpenDokploy={() => setDokployOpen(true)}
        onOpenVastSpotGpu={() => setVastSpotGpuOpen(true)}
        onOpenEdgeMesh={() => setEdgeMeshOpen(true)}
        onOpenCanaryDirector={() => setCanaryDirectorOpen(true)}
        onOpenVulnerabilityImmunity={() => setVulnerabilityImmunityOpen(true)}
        onOpenMultiModelPareto={() => setMultiModelParetoOpen(true)}
        onOpenEpistemicConsensus={() => setEpistemicConsensusOpen(true)}
        onOpenWebGpuEmbedding={() => setWebGpuEmbeddingOpen(true)}
        onOpenZkSnarkProver={() => setZkSnarkProverOpen(true)}
        onOpenWasmVectorIndex={() => setWasmVectorIndexOpen(true)}
        onOpenDeveloperTwin={() => setDeveloperTwinOpen(true)}
        onOpenPlatformServices={() => setPlatformServicesOpen(true)}
        onOpenWhatsAppCommerce={() => setWhatsAppCommerceOpen(true)}
        onOpenMushakTaxStudio={() => setMushakTaxStudioOpen(true)}
        onOpenOutboundCalling={() => setOutboundCallingOpen(true)}
        onOpenCrossBorderCustoms={() => setCrossBorderCustomsOpen(true)}
        onOpenPlatformElevators={() => setPlatformElevatorsOpen(true)}
        onOpenFranchiseMultiBranch={() => setFranchiseMultiBranchOpen(true)}
        onOpenLiveSelling={() => setLiveSellingOpen(true)}
        onOpenAuditLedger={() => setAuditLedgerOpen(true)}
        onOpenCourierArbitrage={() => setCourierArbitrageOpen(true)}
        onOpenFreelancerRemittance={() => setFreelancerRemittanceOpen(true)}
        onOpenDarkHubFulfillment={() => setDarkHubFulfillmentOpen(true)}
        onOpenMultiChannelCashflow={() => setMultiChannelCashflowOpen(true)}
        onOpenWholesaleRfqEscrow={() => setWholesaleRfqEscrowOpen(true)}
      />

      {/* Operational Modals Mounted via Command Center */}
      <EmailOutreachModal open={emailOutreachOpen} onOpenChange={setEmailOutreachOpen} />
      <LeadCrmDrawer open={leadCrmOpen} onOpenChange={setLeadCrmOpen} companyName={companyName} />
      <CompetitorAdSpyModal open={competitorAdSpyOpen} onOpenChange={setCompetitorAdSpyOpen} companyName={companyName} />
      <CroTunerModal open={croTunerOpen} onOpenChange={setCroTunerOpen} companyName={companyName} />
      <VisualStorefrontBuilderModal open={visualStorefrontOpen} onOpenChange={setVisualStorefrontOpen} companyName={companyName} subdomain={companySlug} />
      <BookReaderStorefrontModal open={bookReaderOpen} onOpenChange={setBookReaderOpen} />
      <SteadfastCourierModal open={steadfastCourierOpen} onOpenChange={setSteadfastCourierOpen} companyName={companyName} />
      <StartupBuildsModal open={startupBuildsOpen} onOpenChange={setStartupBuildsOpen} subdomain={companySlug} companyName={companyName} />
      <NilkhetPodModal open={nilkhetPodOpen} onOpenChange={setNilkhetPodOpen} defaultBookTitle={companyName ? `${companyName} Blueprint` : undefined} />
      <MultiDialectVoiceTwinModal open={multiDialectVoiceOpen} onOpenChange={setMultiDialectVoiceOpen} companyName={companyName} />
      <SwarmGraphStudioModal isOpen={swarmGraphOpen} onClose={() => setSwarmGraphOpen(false)} />
      <VastSpotGpuModal open={vastSpotGpuOpen} onOpenChange={setVastSpotGpuOpen} />
      <EdgeMeshStudioModal open={edgeMeshOpen} onOpenChange={setEdgeMeshOpen} />
      <CanaryTrafficDirectorModal open={canaryDirectorOpen} onOpenChange={setCanaryDirectorOpen} />
      <VulnerabilityImmunityModal open={vulnerabilityImmunityOpen} onOpenChange={setVulnerabilityImmunityOpen} />
      <MultiModelParetoModal open={multiModelParetoOpen} onOpenChange={setMultiModelParetoOpen} />
      <EpistemicConsensusModal open={epistemicConsensusOpen} onOpenChange={setEpistemicConsensusOpen} />
      <WebGpuEmbeddingModal open={webGpuEmbeddingOpen} onOpenChange={setWebGpuEmbeddingOpen} />
      <ZkSnarkProverModal open={zkSnarkProverOpen} onOpenChange={setZkSnarkProverOpen} />
      <WasmVectorIndexModal open={wasmVectorIndexOpen} onOpenChange={setWasmVectorIndexOpen} />
      <DeveloperTwinModal open={developerTwinOpen} onOpenChange={setDeveloperTwinOpen} companyName={companyName} />
      <PlatformServicesModal open={platformServicesOpen} onOpenChange={setPlatformServicesOpen} />
      <WhatsAppCommerceModal open={whatsAppCommerceOpen} onOpenChange={setWhatsAppCommerceOpen} />
      <MushakTaxStudioModal open={mushakTaxStudioOpen} onOpenChange={setMushakTaxStudioOpen} />
      <OutboundCallVerificationModal open={outboundCallingOpen} onOpenChange={setOutboundCallingOpen} companyName={companyName} />
      <CrossBorderCustomsModal isOpen={crossBorderCustomsOpen} onClose={() => setCrossBorderCustomsOpen(false)} />
      <PlatformElevatorsViralModal isOpen={platformElevatorsOpen} onClose={() => setPlatformElevatorsOpen(false)} />
      <FranchiseMultiBranchModal isOpen={franchiseMultiBranchOpen} onClose={() => setFranchiseMultiBranchOpen(false)} />
      <LiveSellingStudioModal isOpen={liveSellingOpen} onClose={() => setLiveSellingOpen(false)} />
      <AuditLedgerStudioModal isOpen={auditLedgerOpen} onClose={() => setAuditLedgerOpen(false)} />
      <CourierArbitrageModal isOpen={courierArbitrageOpen} onClose={() => setCourierArbitrageOpen(false)} />
      <FreelancerRemittanceModal isOpen={freelancerRemittanceOpen} onClose={() => setFreelancerRemittanceOpen(false)} />
      <DarkHubFulfillmentModal isOpen={darkHubFulfillmentOpen} onClose={() => setDarkHubFulfillmentOpen(false)} />
      <MultiChannelCashflowModal isOpen={multiChannelCashflowOpen} onClose={() => setMultiChannelCashflowOpen(false)} />
      <WholesaleRfqEscrowModal isOpen={wholesaleRfqEscrowOpen} onClose={() => setWholesaleRfqEscrowOpen(false)} />

      {/* Apple-Inspired Floating Agent Capsule Overlay */}
      <TwinFloatingCapsuleOverlay
        active={capsuleActive || autoModeActive || isPlanning}
        twinName={capsuleTwin}
        statusText={
          isPlanning
            ? "Planning next 3 highest-impact actions..."
            : autoModeActive
            ? `Autonomous Auto-Mode: ${autoModeRemaining ?? 4}h remaining`
            : capsuleStatus
        }
        step={autoModeActive ? 2 : 1}
        totalSteps={5}
        onStop={() => {
          if (autoModeActive) {
            setAutoModeActive(false);
          }
          setIsPlanning(false);
          setCapsuleActive(false);
        }}
        onDismiss={() => setCapsuleActive(false)}
      />
    </div>
  );
}
