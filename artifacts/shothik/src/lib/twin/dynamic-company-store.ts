export interface CockpitTask {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "todo" | "completed" | "in_progress" | "done";
  category?: "Code" | "Design" | "Marketing" | "Research" | "Finance" | "Ops";
  urgency?: "P0" | "P1" | "P2";
  costCredits?: number;
}

export interface CockpitDoc {
  id: string;
  title: string;
  timeAgo: string;
  kind: string;
  content?: string;
}

export interface StandupMessage {
  id: string;
  time: string;
  dayHeader?: string;
  isNewDivider?: boolean;
  fromUser?: boolean;
  text: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  industry: string;
  businessModel: string;
  businessType?: string;
  problemStatement?: string;
  domain: string;
  email: string;
  revenueBdt: number;
  visitorCount: number;
  isPaused: boolean;
  createdAt: string;
  tasks: CockpitTask[];
  docs: CockpitDoc[];
  feed: StandupMessage[];
}

const STORAGE_COMPANIES_KEY = "shothik_companies_list";
const STORAGE_ACTIVE_KEY = "shothik_active_company";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "venture";
}

export function generateDynamicTasks(companyName: string, industry: string, businessType?: string): CockpitTask[] {
  const isCommerce = businessType?.toLowerCase().includes("commerce") || 
                     industry.toLowerCase().includes("commerce") || 
                     industry.toLowerCase().includes("retail") ||
                     industry.toLowerCase().includes("clothing") ||
                     industry.toLowerCase().includes("grocery");

  const isFintech = industry.toLowerCase().includes("fintech") || 
                    industry.toLowerCase().includes("bank") || 
                    industry.toLowerCase().includes("payment");

  const isEdTech = industry.toLowerCase().includes("edtech") || 
                   industry.toLowerCase().includes("education") || 
                   industry.toLowerCase().includes("academic");

  if (isCommerce) {
    return [
      {
        id: "task-1",
        title: `Configure Steadfast & Pathao Courier API webhooks for ${companyName}`,
        description: `Implement auto-dispatch webhook handlers for instant tracking code generation and automated Cash-on-Delivery (COD) 1% remittance tracking.`,
        tags: ["FEATURE", "TONIGHT", "1 CREDIT"],
        status: "todo",
        category: "Ops",
        urgency: "P0",
        costCredits: 1,
      },
      {
        id: "task-2",
        title: `Wire 1-Tap bKash & Nagad MFS TrxID Listener into Checkout Funnel`,
        description: `Connect Bangladesh merchant payment listeners to automatically verify 10-character transaction IDs and instantly unlock order fulfillment.`,
        tags: ["PAYMENTS", "1 CREDIT"],
        status: "todo",
        category: "Finance",
        urgency: "P0",
        costCredits: 1,
      },
      {
        id: "task-3",
        title: `Deploy Banglish NLP automated customer support bot on WhatsApp`,
        description: `Deploy autonomous conversational AI supporting natural phonetic Bengali and English mixed queries with real-time inventory queries.`,
        tags: ["AI", "2 CREDITS"],
        status: "todo",
        category: "Code",
        urgency: "P1",
        costCredits: 2,
      },
      {
        id: "task-4",
        title: `Launch automated Meta Ads copy & audience retargeting engine`,
        description: `Set up automated A/B product visual generation and high-conversion Bengali copywriting tailored to Dhaka Metro and divisional hubs.`,
        tags: ["GROWTH", "1 CREDIT"],
        status: "todo",
        category: "Marketing",
        urgency: "P1",
        costCredits: 1,
      },
      {
        id: "task-5",
        title: `Conduct InsForge inventory sync & low-bandwidth 3G speed audit`,
        description: `Audit product catalogue payload under 3G network simulation and optimize asset loading under 88MB memory threshold.`,
        tags: ["PERF", "1 CREDIT"],
        status: "todo",
        category: "Research",
        urgency: "P2",
        costCredits: 1,
      }
    ];
  }

  if (isFintech) {
    return [
      {
        id: "task-1",
        title: `Deploy Surepass NID & Smart Card verification adapter`,
        description: `Integrate secure NID OCR and Bangladesh national election commission validation endpoints with zero stubs.`,
        tags: ["SECURITY", "TONIGHT", "1 CREDIT"],
        status: "todo",
        category: "Code",
        urgency: "P0",
        costCredits: 1,
      },
      {
        id: "task-2",
        title: `Implement OpenSanctions AML screening with server-side secrets custody`,
        description: `Screen PEP and international sanctions lists with rate-limit fallback and audit trail persistence.`,
        tags: ["COMPLIANCE", "1 CREDIT"],
        status: "todo",
        category: "Finance",
        urgency: "P0",
        costCredits: 1,
      },
      {
        id: "task-3",
        title: `Add Bangladesh Bank e-KYC compliance CSV export endpoint`,
        description: `Stream encrypted CSV audits matching regulatory reporting standards with API-key authenticated access.`,
        tags: ["AUDIT", "1 CREDIT"],
        status: "todo",
        category: "Ops",
        urgency: "P1",
        costCredits: 1,
      },
      {
        id: "task-4",
        title: `Configure multi-tenant webhook redelivery & HMAC signature engine`,
        description: `Ensure idempotent transaction notifications with automatic exponential backoff retry policies.`,
        tags: ["CORE", "2 CREDITS"],
        status: "todo",
        category: "Code",
        urgency: "P1",
        costCredits: 2,
      }
    ];
  }

  if (isEdTech) {
    return [
      {
        id: "task-1",
        title: `Integrate Nilkhet Print-on-Demand (POD) automated book binding`,
        description: `Wire automated page calculation, 70gsm offset spine calculation, and courier dispatch for educational courseware.`,
        tags: ["LOGISTICS", "TONIGHT", "1 CREDIT"],
        status: "todo",
        category: "Ops",
        urgency: "P0",
        costCredits: 1,
      },
      {
        id: "task-2",
        title: `Ingest national curriculum textbooks into RAG Vector Knowledge Base`,
        description: `Chunk, embed, and index textbook materials for instant multi-agent citation and syllabus quiz generation.`,
        tags: ["RAG", "1 CREDIT"],
        status: "todo",
        category: "Research",
        urgency: "P0",
        costCredits: 1,
      },
      {
        id: "task-3",
        title: `Build student micro-billing subscription funnel via bKash TrxID`,
        description: `Implement 10-day pass and monthly course subscription tiers with zero setup barriers.`,
        tags: ["GROWTH", "1 CREDIT"],
        status: "todo",
        category: "Finance",
        urgency: "P1",
        costCredits: 1,
      }
    ];
  }

  // General Deep-Tech / AI SaaS default
  return [
    {
      id: "task-1",
      title: `Bootstrap Next.js standalone container on Dokploy PaaS (<88MB RAM)`,
      description: `Provision high-efficiency container with automatic SSL certificates and automated zero-downtime rolling updates.`,
      tags: ["FEATURE", "TONIGHT", "1 CREDIT"],
      status: "todo",
      category: "Code",
      urgency: "P0",
      costCredits: 1,
    },
    {
      id: "task-2",
      title: `Configure InsForge BaaS database schema & RLS security policies for ${companyName}`,
      description: `Establish multi-tenant isolation, encrypted custody tables, and high-speed Postgres indexing.`,
      tags: ["DATABASE", "1 CREDIT"],
      status: "todo",
      category: "Code",
      urgency: "P0",
      costCredits: 1,
    },
    {
      id: "task-3",
      title: `Wire automated 1-Tap bKash & Nagad MFS payment webhooks`,
      description: `Listen for transaction settlements with 1.85% fee calculation and automatic credit allocation.`,
      tags: ["PAYMENTS", "1 CREDIT"],
      status: "todo",
      category: "Finance",
      urgency: "P1",
      costCredits: 1,
    },
    {
      id: "task-4",
      title: `Establish Twitter/X & LinkedIn autonomous product announcement pipeline`,
      description: `Activate autonomous marketing agents to publish daily feature release digests and technical thought leadership.`,
      tags: ["MARKETING", "1 CREDIT"],
      status: "todo",
      category: "Marketing",
      urgency: "P1",
      costCredits: 1,
    },
    {
      id: "task-5",
      title: `Run ScenarioLab 2GB low-end RAM hardware audit & 3G latency injection`,
      description: `Test application performance under memory pressure and simulate bandwidth constraints.`,
      tags: ["RESEARCH", "1 CREDIT"],
      status: "todo",
      category: "Research",
      urgency: "P2",
      costCredits: 1,
    }
  ];
}

export function generateDynamicDocs(company: CompanyProfile): CockpitDoc[] {
  const prdDoc: CockpitDoc = {
    id: `doc-prd-${company.slug}`,
    title: `${company.name} — Product Requirements Document (PRD)`,
    timeAgo: "JUST NOW",
    kind: "PRD",
    content: `# ${company.name} — Product Requirements Document (PRD)

### 1. Executive Overview
- **Venture Name:** ${company.name}
- **Industry & Vertical:** ${company.industry || "AI & Autonomous SaaS"}
- **Business Model:** ${company.businessModel || "Subscription & Transaction-based"}
- **Live Subdomain:** \`https://${company.slug}.shothikgpt.com\`
- **Autonomous Support Email:** \`${company.email}\`

### 2. Core Problem & Market Opportunity
${company.problemStatement || "Modern single-operator enterprises require 24/7 continuous autonomous execution across engineering, marketing, payment collection, and customer operations without headcount friction."}

### 3. Target Market Sizing (TAM / SAM / SOM)
- **Total Addressable Market (TAM):** $10.0B (Global Emerging Digital Ecosystems)
- **Serviceable Addressable Market (SAM):** $1.5B (South Asia & MENA SME Landscape)
- **Serviceable Obtainable Market (SOM):** $150M (Initial 18-Month Operational Capture)

### 4. Technical Infrastructure & SRE Budget
- **Runtime:** Standalone Node/Next.js Container (<88MB RAM budget)
- **BaaS Engine:** InsForge Database + Row-Level Security
- **MFS Payment Gateway:** bKash & Nagad 10-char TrxID Verification Listener
- **Logistics Integration:** Steadfast & Pathao Courier Auto-Dispatch
`
  };

  const roadmapDoc: CockpitDoc = {
    id: `doc-roadmap-${company.slug}`,
    title: `${company.name} — Strategic Product Roadmap`,
    timeAgo: "15M AGO",
    kind: "Roadmap",
    content: `# ${company.name} — Strategic Product Roadmap

### Now (Current Sprint)
- Launch core autonomous micro-services on Dokploy PaaS container
- Wire bKash & Nagad MFS direct checkout listener
- Deploy automated customer onboarding flow

### Next (Upcoming Milestones)
- Activate Steadfast COD courier automated remittance ledger
- Scale autonomous multi-agent marketing pipeline across X and LinkedIn
- Enable zero-downtime database replication

### Later (Expansion Horizon)
- Cross-border multi-currency settlement gateway
- Multi-agent swarm predictive inventory optimization
`
  };

  const ceoReportDoc: CockpitDoc = {
    id: `doc-report-${company.slug}`,
    title: `Day 1 — Autonomous Co-Founder Standup Report`,
    timeAgo: "1H AGO",
    kind: "CEO Report",
    content: `# Day 1 — Autonomous Co-Founder Standup Report

### Overview
- **Company Status:** Active & Autonomous
- **Domain Connected:** \`https://${company.slug}.shothikgpt.com\`
- **Daily Budget:** 50 Autonomous Task Credits
- **Active Workers:** 4 AI Personas (Product Lead, Tech Lead, Marketing Operator, SRE Agent)

### Shipped Systems
1. Automated domain DNS mapping & SSL verification.
2. Initial Wayfinder roadmap tickets queued in the execution backlog.
3. Telemetry ledger initialized for COD settlements and digital payments.
`
  };

  return [prdDoc, roadmapDoc, ceoReportDoc];
}

export function generateDynamicFeed(company: CompanyProfile): StandupMessage[] {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return [
    {
      id: "feed-init-1",
      time: timeStr,
      dayHeader: "TODAY",
      text: `🚀 Welcome to the autonomous cockpit for **${company.name}**! I am your AI Co-Founder. I've synthesized your TAM/SAM/SOM market analysis, formulated your PRD, and queued unblocked Wayfinder execution tickets across Code, Marketing, Logistics, and MFS.`,
    },
    {
      id: "feed-init-2",
      time: timeStr,
      text: `Your production domain is assigned to \`https://${company.slug}.shothikgpt.com\` with automated Let's Encrypt SSL and Dokploy container orchestration under an 88MB RAM budget. Ready for autonomous task execution!`,
    },
  ];
}

export function createCompanyProfile(name: string, industry = "Technology", businessModel = "SaaS & Commerce", businessType = "Digital Venture", problemStatement = ""): CompanyProfile {
  const slug = slugify(name);
  const profile: CompanyProfile = {
    id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    slug,
    industry,
    businessModel,
    businessType,
    problemStatement,
    domain: `https://${slug}.shothikgpt.com`,
    email: `founder@${slug}.shothik.ai`,
    revenueBdt: 0,
    visitorCount: 12,
    isPaused: false,
    createdAt: new Date().toISOString(),
    tasks: [],
    docs: [],
    feed: [],
  };

  profile.tasks = generateDynamicTasks(name, industry, businessType);
  profile.docs = generateDynamicDocs(profile);
  profile.feed = generateDynamicFeed(profile);

  return profile;
}

export function getCompaniesList(): CompanyProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_COMPANIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCompanyProfile(company: CompanyProfile): void {
  if (typeof window === "undefined") return;
  try {
    const list = getCompaniesList();
    const existingIndex = list.findIndex((c) => c.id === company.id || c.slug === company.slug);
    if (existingIndex >= 0) {
      list[existingIndex] = company;
    } else {
      list.push(company);
    }
    localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(list));
    localStorage.setItem(STORAGE_ACTIVE_KEY, company.slug);
  } catch (err) {
    console.error("Failed to save company profile:", err);
  }
}

export function getActiveCompanyProfile(requestedSlugOrName?: string): CompanyProfile {
  if (typeof window === "undefined") {
    return createCompanyProfile("Shothik Autonomous Venture");
  }

  const list = getCompaniesList();
  const activeSlug = requestedSlugOrName || localStorage.getItem(STORAGE_ACTIVE_KEY);

  if (activeSlug) {
    const found = list.find((c) => c.slug === slugify(activeSlug) || c.name.toLowerCase() === activeSlug.toLowerCase());
    if (found) return found;

    // If slug requested but not found in list, dynamically instantiate it
    const newComp = createCompanyProfile(activeSlug);
    saveCompanyProfile(newComp);
    return newComp;
  }

  if (list.length > 0) {
    return list[0];
  }

  // Default initial company if brand new
  const defaultComp = createCompanyProfile("Shothik Commerce & Venture OS", "Commerce & AI", "Hybrid", "F-Commerce");
  saveCompanyProfile(defaultComp);
  return defaultComp;
}

export function deleteCompanyProfile(slugOrId: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getCompaniesList().filter((c) => c.id !== slugOrId && c.slug !== slugOrId);
    localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(list));
    if (list.length > 0) {
      localStorage.setItem(STORAGE_ACTIVE_KEY, list[0].slug);
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
    }
  } catch (err) {
    console.error("Failed to delete company profile:", err);
  }
}

/**
 * Asynchronously synchronizes the company state with the backend API
 */
export async function syncCompanyToBackend(company: CompanyProfile): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/twin/companies/${company.slug}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });
    return res.ok;
  } catch {
    // Offline or unreachable — local store remains source of truth
    return false;
  }
}

/**
 * Triggers autonomous task execution on the backend
 */
export async function executeWayfinderTaskOnBackend(params: {
  companySlug: string;
  companyName: string;
  taskId: string;
  title: string;
  description: string;
  category?: string;
  urgency?: string;
  costCredits?: number;
}): Promise<{ success: boolean; standupLog?: string; commitHash?: string }> {
  try {
    const res = await fetch("/api/v1/twin/tasks/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        standupLog: data.data?.standupLog,
        commitHash: data.data?.commitHash,
      };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}
