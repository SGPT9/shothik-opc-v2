import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import { resolveUserId } from "../middleware/auth.js";

export interface CompanyTask {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "todo" | "in_progress" | "completed" | "done";
  category?: string;
  urgency?: string;
  costCredits?: number;
}

export interface CompanyDoc {
  id: string;
  title: string;
  timeAgo: string;
  kind: string;
  content?: string;
}

export interface CompanyStandupMessage {
  id: string;
  time: string;
  dayHeader?: string;
  isNewDivider?: boolean;
  fromUser?: boolean;
  text: string;
}

export interface CompanyCollaborator {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  invitedAt: string;
  status: "pending" | "accepted";
}

export interface ServerCompanyProfile {
  id: string;
  userId: string;
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
  updatedAt: string;
  tasks: CompanyTask[];
  docs: CompanyDoc[];
  feed: CompanyStandupMessage[];
  collaborators: CompanyCollaborator[];
  externalSkills?: string[];
}

const IN_MEMORY_COMPANIES = new Map<string, ServerCompanyProfile>();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "venture";
}

function generateInitialTasks(companyName: string, industry: string): CompanyTask[] {
  const isCommerce = industry.toLowerCase().includes("commerce") || industry.toLowerCase().includes("retail");
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
      }
    ];
  }

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
    }
  ];
}

function generateInitialDocs(companyName: string, slug: string, industry: string, businessModel: string, problemStatement?: string): CompanyDoc[] {
  return [
    {
      id: `doc-prd-${slug}`,
      title: `${companyName} — Product Requirements Document (PRD)`,
      timeAgo: "JUST NOW",
      kind: "PRD",
      content: `# ${companyName} — Product Requirements Document (PRD)\n\n### 1. Executive Summary\n- **Subdomain:** \`https://${slug}.shothikgpt.com\`\n- **Industry:** ${industry}\n- **Monetization:** ${businessModel}\n\n### 2. Problem Statement\n${problemStatement || "Single-operator enterprises require 24/7 continuous autonomous execution across code, marketing, payments, and logistics."}\n\n### 3. Market Sizing (TAM / SAM / SOM)\n- **TAM:** $10.0B\n- **SAM:** $1.5B\n- **SOM:** $150M\n`
    },
    {
      id: `doc-roadmap-${slug}`,
      title: `${companyName} — Strategic Product Roadmap`,
      timeAgo: "15M AGO",
      kind: "Roadmap",
      content: `# ${companyName} — Strategic Product Roadmap\n\n### Current Sprint\n- Launch core autonomous micro-services on Dokploy PaaS container\n- Wire bKash & Nagad MFS direct checkout listener\n- Deploy automated customer onboarding flow\n`
    }
  ];
}

const router = Router();

/**
 * GET /api/v1/twin/companies
 * List all companies for the requesting user
 */
router.get("/v1/twin/companies", async (req: Request, res: Response) => {
  try {
    const userId = resolveUserId(req, "usr_default");
    const companies = Array.from(IN_MEMORY_COMPANIES.values()).filter(
      (c) => c.userId === userId || userId === "usr_default"
    );

    res.json({
      success: true,
      data: companies,
      count: companies.length,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to list companies");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/twin/companies/:slug
 * Retrieve specific company profile, tasks, and telemetry
 */
router.get("/v1/twin/companies/:slug", async (req: Request, res: Response) => {
  try {
    const rawSlug = String(req.params.slug || "");
    const slug = slugify(rawSlug);
    let company = IN_MEMORY_COMPANIES.get(slug);

    if (!company) {
      // Lazy auto-provision if requested
      const name = rawSlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
      company = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: resolveUserId(req, "usr_default"),
        name,
        slug,
        industry: "Technology & AI",
        businessModel: "SaaS & Commerce",
        domain: `https://${slug}.shothikgpt.com`,
        email: `founder@${slug}.shothik.ai`,
        revenueBdt: 0,
        visitorCount: 1,
        isPaused: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: generateInitialTasks(name, "Technology & AI"),
        docs: generateInitialDocs(name, slug, "Technology & AI", "SaaS"),
        collaborators: [],
        feed: [
          {
            id: `feed-init-1`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            dayHeader: "TODAY",
            text: `🚀 Autonomous workspace initialized for **${name}** at \`https://${slug}.shothikgpt.com\`. Ready for task execution!`,
          }
        ],
        externalSkills: ["youtube", "instagram"],
      };
      IN_MEMORY_COMPANIES.set(slug, company);
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to get company");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/twin/companies
 * Create new autonomous company
 */
router.post("/v1/twin/companies", async (req: Request, res: Response) => {
  try {
    const { name, industry = "Technology", businessModel = "SaaS", businessType, problemStatement, customDomain } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: "Company name is required" });
      return;
    }

    const slug = slugify(name);
    const userId = resolveUserId(req, "usr_default");

    const company: ServerCompanyProfile = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      name,
      slug,
      industry,
      businessModel,
      businessType,
      problemStatement,
      domain: customDomain || `https://${slug}.shothikgpt.com`,
      email: `founder@${slug}.shothik.ai`,
      revenueBdt: 0,
      visitorCount: 1,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: generateInitialTasks(name, industry),
      docs: generateInitialDocs(name, slug, industry, businessModel, problemStatement),
      collaborators: [],
      feed: [
        {
          id: `feed-init-1`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dayHeader: "TODAY",
          text: `🚀 Welcome to **${name}**! Autonomous co-founder engine synthesized your PRD, configured SRE budget, and queued Wayfinder execution tickets.`,
        }
      ],
      externalSkills: ["youtube", "instagram"],
      // End of company initialization
    };
    IN_MEMORY_COMPANIES.set(slug, company);

    // Dual-write to PostgreSQL companies table
    try {
      const { db, companiesTable } = await import("@workspace/db");
      await db.insert(companiesTable).values({
        userId,
        name,
        slug,
        industry,
        businessModel,
        businessType,
        problemStatement: problemStatement || "",
        domain: company.domain,
        email: company.email,
        revenueBdt: 0,
        visitorCount: 1,
        isPaused: false,
        tasks: company.tasks as any,
        docs: company.docs as any,
        feed: company.feed as any,
      }).onConflictDoNothing();
    } catch (dbErr: any) {
      logger.debug({ error: dbErr?.message }, "[companies] PostgreSQL dual-write notice (active in memory)");
    }

    logger.info({ slug, name, userId }, "Created autonomous company workspace");
    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to create company");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/twin/companies/:slug
 * Update company profile, rename, or toggle pause
 */
router.patch("/v1/twin/companies/:slug", async (req: Request, res: Response) => {
  try {
    const slug = slugify(String(req.params.slug || ""));
    const company = IN_MEMORY_COMPANIES.get(slug);

    if (!company) {
      res.status(404).json({ success: false, error: "Company not found" });
      return;
    }

    const { name, isPaused, revenueBdt, visitorCount, domain, tasks, docs, feed } = req.body;

    if (name !== undefined) company.name = name;
    if (isPaused !== undefined) company.isPaused = Boolean(isPaused);
    if (revenueBdt !== undefined) company.revenueBdt = Number(revenueBdt);
    if (visitorCount !== undefined) company.visitorCount = Number(visitorCount);
    if (domain !== undefined) company.domain = domain;
    if (tasks && Array.isArray(tasks)) company.tasks = tasks;
    if (docs && Array.isArray(docs)) company.docs = docs;
    if (feed && Array.isArray(feed)) company.feed = feed;
    company.updatedAt = new Date().toISOString();

    IN_MEMORY_COMPANIES.set(slug, company);

    res.json({
      success: true,
      data: company,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to update company");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/twin/companies/:slug
 * Delete company workspace
 */
router.delete("/v1/twin/companies/:slug", async (req: Request, res: Response) => {
  try {
    const slug = slugify(String(req.params.slug || ""));
    const existed = IN_MEMORY_COMPANIES.delete(slug);

    if (!existed) {
      res.status(404).json({ success: false, error: "Company not found" });
      return;
    }

    res.json({
      success: true,
      message: `Company ${slug} deleted successfully`,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to delete company");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/twin/companies/:slug/sync
 * Two-way client/server synchronization
 */
router.post("/v1/twin/companies/:slug/sync", async (req: Request, res: Response) => {
  try {
    const slug = slugify(String(req.params.slug || ""));
    const clientState = req.body;

    let company = IN_MEMORY_COMPANIES.get(slug);
    if (!company) {
      company = {
        id: clientState.id || `comp_${Date.now()}`,
        userId: resolveUserId(req, "usr_default"),
        name: clientState.name || slug,
        slug,
        industry: clientState.industry || "General",
        businessModel: clientState.businessModel || "SaaS",
        domain: clientState.domain || `https://${slug}.shothikgpt.com`,
        email: clientState.email || `founder@${slug}.shothik.ai`,
        revenueBdt: clientState.revenueBdt || 0,
        visitorCount: clientState.visitorCount || 1,
        isPaused: clientState.isPaused || false,
        createdAt: clientState.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: clientState.tasks || [],
        docs: clientState.docs || [],
        feed: clientState.feed || [],
        collaborators: clientState.collaborators || [],
      };
    } else {
      if (clientState.tasks) company.tasks = clientState.tasks;
      if (clientState.docs) company.docs = clientState.docs;
      if (clientState.feed) company.feed = clientState.feed;
      if (clientState.collaborators) company.collaborators = clientState.collaborators;
      if (clientState.revenueBdt !== undefined) company.revenueBdt = clientState.revenueBdt;
      if (clientState.visitorCount !== undefined) company.visitorCount = clientState.visitorCount;
      company.updatedAt = new Date().toISOString();
    }

    IN_MEMORY_COMPANIES.set(slug, company);

    res.json({
      success: true,
      syncedAt: company.updatedAt,
      data: company,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to sync company");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/twin/companies/:slug/collaborators
 * List all collaborators for a company
 */
router.get(["/v1/twin/companies/:slug/collaborators", "/api/v1/twin/companies/:slug/collaborators"], (req: Request, res: Response) => {
  try {
    const slug = slugify(String(req.params.slug || ""));
    const company = IN_MEMORY_COMPANIES.get(slug);

    if (!company) {
      res.json({ success: true, data: [] });
      return;
    }

    res.json({
      success: true,
      data: company.collaborators || [],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/twin/companies/:slug/collaborators
 * Invite a collaborator to a company with scoped access
 */
router.post(["/v1/twin/companies/:slug/collaborators", "/api/v1/twin/companies/:slug/collaborators"], (req: Request, res: Response) => {
  try {
    const slug = slugify(String(req.params.slug || ""));
    const company = IN_MEMORY_COMPANIES.get(slug);

    if (!company) {
      res.status(404).json({ success: false, error: "Company not found" });
      return;
    }

    const { email, role = "editor" } = req.body || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ success: false, error: "Valid email is required" });
      return;
    }

    if (!company.collaborators) {
      company.collaborators = [];
    }

    const existing = company.collaborators.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ success: false, error: "Collaborator already invited to this company" });
      return;
    }

    const collaborator: CompanyCollaborator = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.trim().toLowerCase(),
      role: ["admin", "editor", "viewer"].includes(role) ? role : "editor",
      invitedAt: new Date().toISOString(),
      status: "pending",
    };

    company.collaborators.push(collaborator);
    company.updatedAt = new Date().toISOString();
    IN_MEMORY_COMPANIES.set(slug, company);

    logger.info({ slug, email: collaborator.email, role: collaborator.role }, "Invited company collaborator");

    res.status(201).json({
      success: true,
      data: collaborator,
      message: `Invitation dispatched to ${collaborator.email} with scoped access to ${company.name}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/twin/companies/:slug/collaborators/:id
 * Remove a collaborator from a company
 */
router.delete(["/v1/twin/companies/:slug/collaborators/:id", "/api/v1/twin/companies/:slug/collaborators/:id"], (req: Request, res: Response) => {
  try {
    const slug = slugify(String(req.params.slug || ""));
    const company = IN_MEMORY_COMPANIES.get(slug);

    if (!company) {
      res.status(404).json({ success: false, error: "Company not found" });
      return;
    }

    const { id } = req.params;
    const initialLen = company.collaborators?.length || 0;
    company.collaborators = (company.collaborators || []).filter((c) => c.id !== id);

    if (company.collaborators.length === initialLen) {
      res.status(404).json({ success: false, error: "Collaborator not found" });
      return;
    }

    company.updatedAt = new Date().toISOString();
    IN_MEMORY_COMPANIES.set(slug, company);

    res.json({
      success: true,
      message: "Collaborator removed successfully",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
